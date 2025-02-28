
import pcmProcessorUrl from './pcm-processor.js?url';

export class TranslationService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isListening: boolean = false;
  private reconnectInterval: number = 3000;
  private pingInterval: NodeJS.Timeout | null = null;
  private serverUrl: string = 'wss://healthcare-translation-web-app-with-ibvg.onrender.com/ws/medical-translator';
  private currentTranslation: string = '';
  private localAccumulatedTranslation: string = '';
  private useFallback: boolean = false;
  private synthesis: SpeechSynthesis | null = null;
  private sourceLanguage: string = 'en-US';
  private targetLanguage: string = 'es-ES';

  // New properties for AudioWorklet-based capture
  private _audioContext: AudioContext | null = null;
  private _audioWorkletNode: AudioWorkletNode | null = null;

  // Callbacks for different events
  private onStatusChange: (message: string, isConnected: boolean) => void = () => {};
  private onTranscriptUpdate: (text: string, isFinal: boolean) => void = () => {};
  private onTranslationUpdate: (text: string, fullTranslation: string) => void = () => {};
  private onListeningStateChange: (isListening: boolean) => void = () => {};
  private onAudioReceived: (audioData: string) => void = () => {};
  private onAudioCompleted: () => void = () => {};

  constructor() {
    // Initialize speech synthesis if available
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  // simulateTranslation remains unchanged
  private simulateTranslation(text: string): void {
    const mockTranslations: Record<string, Record<string, string>> = {
      'en-US': {
        'es-ES': {
          'hello': 'hola',
          'how are you': 'cómo estás',
          'thank you': 'gracias',
          'goodbye': 'adiós',
          'my name is': 'me llamo',
          'I need help': 'necesito ayuda',
          'doctor': 'médico',
          'hospital': 'hospital',
          'pain': 'dolor',
          'medicine': 'medicina',
          'prescription': 'receta',
          'appointment': 'cita',
          'emergency': 'emergencia',
          'symptoms': 'síntomas',
          'fever': 'fiebre',
          'headache': 'dolor de cabeza',
          'allergy': 'alergia',
          'blood pressure': 'presión arterial',
          'diabetes': 'diabetes',
          'heart': 'corazón'
        }
      }
    };

    setTimeout(() => {
      let translated = text.toLowerCase();
      if (mockTranslations[this.sourceLanguage] && mockTranslations[this.sourceLanguage][this.targetLanguage]) {
        const dictionary = mockTranslations[this.sourceLanguage][this.targetLanguage];
        Object.entries(dictionary).forEach(([original, translation]) => {
          const regex = new RegExp(`\\b${original}\\b`, 'gi');
          translated = translated.replace(regex, translation);
        });
      }
      if (!mockTranslations[this.sourceLanguage] || !mockTranslations[this.sourceLanguage][this.targetLanguage]) {
        translated = `[${this.targetLanguage}] ${text}`;
      }

      this.localAccumulatedTranslation += translated + " ";
      this.currentTranslation = this.localAccumulatedTranslation;
      this.onTranslationUpdate(translated, this.currentTranslation);
    }, 1000);
  }

  // Set up event handlers remains unchanged
  public setCallbacks(callbacks: {
    onStatusChange: (message: string, isConnected: boolean) => void;
    onTranscriptUpdate: (text: string, isFinal: boolean) => void;
    onTranslationUpdate: (text: string, fullTranslation: string) => void;
    onListeningStateChange: (isListening: boolean) => void;
    onAudioReceived?: (audioData: string) => void;
    onAudioCompleted?: () => void;
  }) {
    this.onStatusChange = callbacks.onStatusChange;
    this.onTranscriptUpdate = callbacks.onTranscriptUpdate;
    this.onTranslationUpdate = callbacks.onTranslationUpdate;
    this.onListeningStateChange = callbacks.onListeningStateChange;
    if (callbacks.onAudioReceived) {
      this.onAudioReceived = callbacks.onAudioReceived;
    }
    if (callbacks.onAudioCompleted) {
      this.onAudioCompleted = callbacks.onAudioCompleted;
    }
  }

  // Connect, disconnect, updateLanguages, speakTranslation, sendCommand, etc. remain largely unchanged.
  public connect(): void {
    if (this.useFallback) {
      this.onStatusChange('Using fallback (server unavailable)', true);
      return;
    }

    this.onStatusChange('Connecting to translation server...', false);
    try {
      this.socket = new WebSocket(this.serverUrl);
      this.socket.onopen = this.handleSocketOpen.bind(this);
      this.socket.onclose = this.handleSocketClose.bind(this);
      this.socket.onerror = this.handleSocketError.bind(this);
      this.socket.onmessage = this.handleSocketMessage.bind(this);
      this.pingInterval = setInterval(() => this.sendPing(), 30000);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleConnectionFailure();
    }
  }

  public disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this._audioWorkletNode) {
      this._audioWorkletNode.port.onmessage = null;
      this._audioWorkletNode.disconnect();
      this._audioWorkletNode = null;
    }
    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isConnected = false;
    this.isListening = false;
  }

  // Start listening using AudioWorklet for raw PCM capture
  public async startListening(): Promise<void> {
    if (!this.isConnected) {
      this.onStatusChange('Not connected. Reconnecting...', false);
      this.connect();
      return;
    }
    // Send start_listening command to the server
    this.sendCommand('start_listening');
    this.clearTranslations();

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Create an AudioContext with desired sample rate (16 kHz)
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);

      // Load the AudioWorklet module using the imported URL from Vite
      await audioContext.audioWorklet.addModule(pcmProcessorUrl);
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

      // When the AudioWorkletProcessor posts PCM data, send it via the WebSocket.
      workletNode.port.onmessage = (event) => {
        const buffer = event.data as ArrayBuffer;
        console.log(`AudioWorklet produced PCM data: ${buffer.byteLength} bytes`);
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(buffer);
        }
      };

      // Connect the microphone to the AudioWorkletNode.
      source.connect(workletNode);
      // (Optionally, do not connect to destination if you don’t want playback)
      // workletNode.connect(audioContext.destination);

      // Store the AudioContext and WorkletNode for cleanup later.
      this._audioContext = audioContext;
      this._audioWorkletNode = workletNode;

      this.isListening = true;
      this.onListeningStateChange(true);
      this.onStatusChange('Listening...', true);
    } catch (error) {
      console.error("Error capturing raw audio via AudioWorklet:", error);
      this.onStatusChange('Error capturing audio', false);
    }
  }

  // Stop listening: stop the AudioWorklet capture and close the AudioContext.
  public stopListening(): void {
    if (this._audioWorkletNode) {
      this._audioWorkletNode.port.onmessage = null;
      this._audioWorkletNode.disconnect();
      this._audioWorkletNode = null;
    }
    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }
    if (this.isConnected) {
      this.sendCommand('stop_listening');
    }
    this.isListening = false;
    this.onListeningStateChange(false);
    this.onStatusChange('Stopped listening', true);
  }

  public updateLanguages(sourceLanguage: string, targetLanguage: string): void {
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    if (this.useFallback) {
      this.clearTranslations();
      return;
    }
    if (this.isConnected) {
      this.sendCommand('update_languages', {
        source_language: sourceLanguage,
        target_language: targetLanguage
      });
      this.clearTranslations();
    }
  }

  public speakTranslation(): void {
    if (this.useFallback) {
      if (this.synthesis && this.currentTranslation) {
        const utterance = new SpeechSynthesisUtterance(this.currentTranslation);
        utterance.lang = this.targetLanguage;
        utterance.onstart = () => { this.onStatusChange('Speaking...', true); };
        utterance.onend = () => {
          this.onStatusChange('Finished speaking', true);
          this.onAudioCompleted();
          setTimeout(() => {
            this.onStatusChange(this.isListening ? 'Listening...' : 'Ready', true);
          }, 2000);
        };
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          this.onStatusChange('Error speaking translation', false);
        };
        this.synthesis.speak(utterance);
      } else {
        this.onStatusChange('Speech synthesis not supported or no translation available', false);
      }
      return;
    }
    
    if (!this.isConnected) {
      this.onStatusChange('Not connected', false);
      return;
    }
    
    if (!this.currentTranslation) {
      this.onStatusChange('No translation to speak', false);
      return;
    }
    
    this.sendCommand('speak', { text: this.currentTranslation });
  }

  private clearTranslations(): void {
    this.currentTranslation = '';
    this.localAccumulatedTranslation = '';
  }

  private sendCommand(command: string, additionalData: Record<string, any> = {}): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Socket is not open');
      return;
    }
    const message = { command, ...additionalData };
    this.socket.send(JSON.stringify(message));
  }

  private sendPing(): void {
    if (this.isConnected) {
      this.sendCommand('ping');
    }
  }

  private handleSocketOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.useFallback = false;
    this.onStatusChange('Connected to translation server', true);
    this.socket!.send(JSON.stringify({
      source_language: this.sourceLanguage,
      target_language: this.targetLanguage
    }));
  }

  private handleSocketClose(): void {
    console.log('WebSocket disconnected');
    this.isConnected = false;
    this.isListening = false;
    this.onStatusChange('Disconnected. Reconnecting...', false);
    this.onListeningStateChange(false);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.handleConnectionFailure();
  }

  private handleSocketError(error: Event): void {
    console.error('WebSocket error:', error);
    this.onStatusChange('Connection error', false);
    this.handleConnectionFailure();
  }

  private handleSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      switch (data.type) {
        case 'listening_started':
          this.isListening = true;
          this.onListeningStateChange(true);
          this.onStatusChange('Listening...', true);
          break;
        case 'listening_stopped':
          this.isListening = false;
          this.onListeningStateChange(false);
          this.onStatusChange('Stopped listening', true);
          break;
        case 'transcript':
          if (data.text) {
            this.onTranscriptUpdate(data.text, data.is_final);
          }
          break;
        case 'translation':
          if (data.text) {
            if (data.full_translation) {
              this.currentTranslation = data.full_translation;
            } else {
              this.localAccumulatedTranslation += data.text + " ";
              this.currentTranslation = this.localAccumulatedTranslation;
            }
            this.onTranslationUpdate(data.text, this.currentTranslation);
          }
          break;
        case 'audio_data':
          this.onAudioReceived(data.data);
          break;
        case 'audio_completed':
          this.onStatusChange('Audio completed', true);
          this.onAudioCompleted();
          setTimeout(() => {
            this.onStatusChange(this.isListening ? 'Listening...' : 'Ready', true);
          }, 2000);
          break;
        case 'error':
          console.error('Error from server:', data.message);
          this.onStatusChange(`Error: ${data.message}`, false);
          break;
        case 'languages_updated':
          console.log(`Languages updated: ${data.source_language} → ${data.target_language}`);
          break;
        case 'pong':
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  private scheduleReconnect(): void {
    setTimeout(() => {
      if (!this.isConnected && !this.useFallback) {
        this.connect();
      }
    }, this.reconnectInterval);
  }
}

export default new TranslationService();
