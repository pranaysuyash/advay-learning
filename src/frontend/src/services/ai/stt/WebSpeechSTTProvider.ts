/**
 * WebSpeechSTTProvider - Browser-native Speech Recognition
 *
 * Uses the Web Speech API (SpeechRecognition) for speech-to-text.
 * Supported in Chrome, Safari, Edge. Firefox requires prefix.
 */

import type { STTProvider, STTProviderOptions, STTTranscript, STTProviderStatus } from './STTProvider';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

type SpeechRecognitionType = {
    new (): SpeechRecognition;
    prototype: SpeechRecognition;
} & {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onspeechstart: (() => void) | null;
    onspeechend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
};

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onspeechstart: (() => void) | null;
    onspeechend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

const CHILD_VOICE_CONFIG = {
    minConfidence: 0.6,
    maxSilenceDuration: 2000,
    promptOnSilence: true,
    repeatThreshold: 2,
};

export class WebSpeechSTTProvider implements STTProvider {
    readonly name = 'WebSpeech';

    private recognition: SpeechRecognition | null = null;
    private _isReady = false;
    private _isListening = false;
    private _status: STTProviderStatus = 'inactive';
    private transcriptCallback: ((transcript: STTTranscript) => void) | null = null;
    private statusChangeCallback: ((status: STTProviderStatus) => void) | null = null;
    private errorCallback: ((error: Error) => void) | null = null;
    private currentOptions: STTProviderOptions = {};
    private silenceTimer: ReturnType<typeof setTimeout> | null = null;
    private lowConfidenceCount = 0;

    constructor() {
        this.initRecognition();
    }

    private initRecognition(): void {
        const win = window as unknown as {
            SpeechRecognition?: SpeechRecognitionType;
            webkitSpeechRecognition?: SpeechRecognitionType;
        };

        const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            console.warn('[WebSpeechSTT] Speech Recognition not supported in this browser');
            this._isReady = false;
            return;
        }

        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this._isReady = true;
            this.setStatus('listening');
            console.log('[WebSpeechSTT] Recognition started');
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.resultIndex];
            const transcript: STTTranscript = {
                text: result[0].transcript,
                isFinal: result.isFinal,
                confidence: result[0].confidence,
            };

            this.resetSilenceTimer();

            if (transcript.confidence < CHILD_VOICE_CONFIG.minConfidence) {
                this.lowConfidenceCount++;
                if (this.lowConfidenceCount >= CHILD_VOICE_CONFIG.repeatThreshold && CHILD_VOICE_CONFIG.promptOnSilence) {
                    this.transcriptCallback?.({
                        text: '__LOW_CONFIDENCE__',
                        isFinal: true,
                        confidence: transcript.confidence,
                    });
                }
            } else {
                this.lowConfidenceCount = 0;
            }

            this.transcriptCallback?.(transcript);
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[WebSpeechSTT] Recognition error:', event.error);
            this.setStatus('error');
            this.errorCallback?.(new Error(`Speech recognition error: ${event.error}`));
        };

        this.recognition.onend = () => {
            this._isListening = false;
            if (this._status === 'listening') {
                this.setStatus('inactive');
            }
            console.log('[WebSpeechSTT] Recognition ended');

            if (this._isListening) {
                this.startListening(this.currentOptions);
            }
        };

        this.recognition.onspeechstart = () => {
            this.setStatus('listening');
        };

        this.recognition.onspeechend = () => {
            this.setStatus('processing');
        };

        this._isReady = true;
    }

    async init(): Promise<boolean> {
        if (!this.recognition) {
            this.initRecognition();
        }
        return this._isReady;
    }

    isReady(): boolean {
        return this._isReady;
    }

    getStatus(): STTProviderStatus {
        return this._status;
    }

    private setStatus(status: STTProviderStatus): void {
        this._status = status;
        this.statusChangeCallback?.(status);
    }

    startListening(options?: STTProviderOptions): void {
        if (!this.recognition) {
            this.errorCallback?.(new Error('Speech recognition not initialized'));
            return;
        }

        this.currentOptions = options || {};

        if (options?.language) {
            this.recognition.lang = options.language;
        }

        this.recognition.continuous = options?.continuous ?? false;
        this.recognition.interimResults = options?.interimResults ?? true;

        this._isListening = true;
        this.lowConfidenceCount = 0;

        try {
            this.recognition.start();
            this.resetSilenceTimer();
        } catch (e) {
            if (e instanceof Error && e.message.includes('already started')) {
                console.log('[WebSpeechSTT] Recognition already started');
            } else {
                console.error('[WebSpeechSTT] Failed to start:', e);
                this._isListening = false;
            }
        }
    }

    stopListening(): void {
        this._isListening = false;
        this.clearSilenceTimer();

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('[WebSpeechSTT] Stop recognition:', e);
            }
        }

        this.setStatus('inactive');
    }

    isListening(): boolean {
        return this._isListening;
    }

    onTranscript(callback: (transcript: STTTranscript) => void): void {
        this.transcriptCallback = callback;
    }

    onStatusChange(callback: (status: STTProviderStatus) => void): void {
        this.statusChangeCallback = callback;
    }

    onError(callback: (error: Error) => void): void {
        this.errorCallback = callback;
    }

    private resetSilenceTimer(): void {
        this.clearSilenceTimer();

        const maxSilence = this.currentOptions.maxSilenceDuration ?? CHILD_VOICE_CONFIG.maxSilenceDuration;

        this.silenceTimer = setTimeout(() => {
            if (this._isListening) {
                console.log('[WebSpeechSTT] Silence timeout, stopping');
                this.stopListening();
            }
        }, maxSilence);
    }

    private clearSilenceTimer(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    dispose(): void {
        this.stopListening();
        this.transcriptCallback = null;
        this.statusChangeCallback = null;
        this.errorCallback = null;
        this.recognition = null;
        this._isReady = false;
    }
}
