#!/usr/bin/env python3
import ssl
import socket
import uuid
import sys
import os
import binascii

# Pure Python 3 WebSocket client using standard library socket+ssl
# Bypasses all pip, npm, pnpm, and go package managers
# This guarantees it runs even on deeply corrupted macOS permissions environments

def encode_ws_frame(opcode, payload):
    frame = bytearray()
    frame.append(0x80 | opcode) 

    length = len(payload)
    if length <= 125:
        frame.append(0x80 | length)
    elif length >= 126 and length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, 'big'))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, 'big'))

    mask_key = os.urandom(4)
    frame.extend(mask_key)

    masked_payload = bytearray(payload)
    for i in range(len(masked_payload)):
        masked_payload[i] ^= mask_key[i % 4]
    
    frame.extend(masked_payload)
    return bytes(frame)

def recv_ws_frame(sock):
    header = sock.recv(2)
    if not header:
        return None, None
    
    opcode = header[0] & 0x0f
    
    length = header[1] & 0x7f
    if length == 126:
        ext = sock.recv(2)
        length = int.from_bytes(ext, 'big')
    elif length == 127:
        ext = sock.recv(8)
        length = int.from_bytes(ext, 'big')
    
    payload = bytearray()
    while len(payload) < length:
        chunk = sock.recv(length - len(payload))
        if not chunk:
            break
        payload.extend(chunk)
        
    return opcode, payload

def synthesize(text, output_file):
    host = "speech.platform.bing.com"
    req_id = uuid.uuid4().hex
    path = f"/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId={req_id}"
    
    key = binascii.b2a_base64(os.urandom(16))[:-1].decode()
    
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    s = socket.create_connection((host, 443))
    sock = context.wrap_socket(s, server_hostname=host)
    
    # Handshake
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        "Sec-WebSocket-Version: 13\r\n"
        "Origin: chrome-extension://jdiccldimpdaibmpdkjnbokgoagepkem\r\n"
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0\r\n\r\n"
    )
    sock.sendall(handshake.encode())
    
    resp = b""
    while b"\r\n\r\n" not in resp:
        resp += sock.recv(1024)
        
    if b"101 Switching Protocols" not in resp:
        print("Websocket handshake failed", resp)
        return
        
    # Send Config
    config_msg = "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{\"sentenceBoundaryEnabled\":false,\"wordBoundaryEnabled\":false},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}"
    sock.sendall(encode_ws_frame(1, config_msg.encode('utf-8')))
    
    # Send SSML
    # Using Ana, child-like cheerful voice
    text_xml = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    ssml = f"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='en-US-AnaNeural'><prosody pitch='+0Hz' rate='0%' volume='100%'>{text_xml}</prosody></voice></speak>"
    
    payload = f"X-RequestId:{uuid.uuid4().hex}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n{ssml}"
    sock.sendall(encode_ws_frame(1, payload.encode('utf-8')))
    
    # Receive Audio
    with open(output_file, 'wb') as f:
        while True:
            opcode, data = recv_ws_frame(sock)
            if opcode is None or opcode == 8: # Close
                break
                
            if opcode == 1: # Text
                if b"Path:turn.end" in data:
                    break
            elif opcode == 2: # Binary audio
                # Strip the HTTP-style header to get pure MP3
                idx = data.find(b"\r\n\r\n")
                if idx != -1:
                    f.write(data[idx+4:])

    sock.close()
    print(f"✅ Generated {output_file}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python edge_tts.py 'Text to speak' output.mp3")
        sys.exit(1)
    
    synthesize(sys.argv[1], sys.argv[2])
