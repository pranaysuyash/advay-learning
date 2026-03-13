export class KokoroTTS {
  static async from_pretrained() {
    throw new Error(
      'Kokoro local TTS is disabled for the March beta build. Re-enable local AI to use this provider.',
    );
  }
}
