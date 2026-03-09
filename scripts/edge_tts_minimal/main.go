package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Simplified Go port of edge-tts for generating WAV/MP3 files directly
// This completely bypasses Node/Python package manager EPERM issues on this machine

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: edge_tts_minimal <text> <output.mp3>")
		os.Exit(1)
	}

	text := os.Args[1]
	outputFile := os.Args[2]

	err := Synthesize(text, outputFile)
	if err != nil {
		log.Fatalf("TTS Failed: %v", err)
	}
	fmt.Printf("✅ Generated %s\n", outputFile)
}

func Synthesize(text, outputFile string) error {
	// Connect to Microsoft Edge TTS WebSocket
	reqId := strings.ReplaceAll(uuid.New().String(), "-", "")
	
	dialer := websocket.DefaultDialer
	wsURL := fmt.Sprintf("wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=%s", reqId)
	
	header := http.Header{}
	header.Set("Origin", "chrome-extension://jdiccldimpdaibmpdkjnbokgoagepkem")
	header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.50")

	conn, _, err := dialer.Dial(wsURL, header)
	if err != nil {
		return fmt.Errorf("dial error: %w", err)
	}
	defer conn.Close()

	// 1. Send Speech config
	configMsg := "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{\"sentenceBoundaryEnabled\":false,\"wordBoundaryEnabled\":false},\"outputFormat\":\"audio-24khz-48kbitrate-mono-mp3\"}}}}"
	if err := conn.WriteMessage(websocket.TextMessage, []byte(configMsg)); err != nil {
		return err
	}

	// 2. Send SSML payload
	// Voice: en-US-AnaNeural (child-like, cheerful)
	ssml := fmt.Sprintf(
		"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>" +
		"<voice name='en-US-AnaNeural'><prosody pitch='+0Hz' rate='0%%' volume='100%%'>%s</prosody></voice></speak>",
		EscapeXML(text),
	)

	reqIDRaw := make([]byte, 16)
	rand.Read(reqIDRaw)
	reqIDHex := hex.EncodeToString(reqIDRaw)

	payload := fmt.Sprintf("X-RequestId:%s\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n%s", reqIDHex, ssml)
	if err := conn.WriteMessage(websocket.TextMessage, []byte(payload)); err != nil {
		return err
	}

	// 3. Receive Audio stream
	out, err := os.Create(outputFile)
	if err != nil {
		return err
	}
	defer out.Close()

	for {
		msgType, msg, err := conn.ReadMessage()
		if err != nil {
			if err == io.EOF || websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				break
			}
			return fmt.Errorf("read error: %w", err)
		}

		if msgType == websocket.TextMessage {
			textMsg := string(msg)
			if strings.Contains(textMsg, "Path:turn.end") {
				break // audio stream finished
			}
		} else if msgType == websocket.BinaryMessage {
			// Binary messages have a text header we need to strip
			// The header ends with \r\n\r\n, then the raw MP3 audio follows
			headerEnd := bytes.Index(msg, []byte("\r\n\r\n"))
			if headerEnd != -1 {
				audioData := msg[headerEnd+4:]
				out.Write(audioData)
			}
		}
	}

	return nil
}

func EscapeXML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}
