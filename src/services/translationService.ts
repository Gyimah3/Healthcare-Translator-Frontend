// WebSocket connection to the translation server
export class TranslationService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private isListening: boolean = false;
  private reconnectInterval: number = 3000;
  private pingInterval: NodeJS.Timeout | null = null;
  private serverUrl: string = 'wss://healthcare-translation-web-app-with-ibvg.onrender.com/ws/medical-translator';
  private currentTranslation: string = '';
  private localAccumulatedTranslation: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private useFallback: boolean = false;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private sourceLanguage: string = 'en-US';
  private targetLanguage: string = 'es-ES';
  
  // Callbacks for different events
  private onStatusChange: (message: string, isConnected: boolean) => void = () => {};
  private onTranscriptUpdate: (text: string, isFinal: boolean) => void = () => {};
  private onTranslationUpdate: (text: string, fullTranslation: string) => void = () => {};
  private onListeningStateChange: (isListening: boolean) => void = () => {};
  private onAudioReceived: (audioData: string) => void = () => {};
  private onAudioCompleted: () => void = () => {};
  
  constructor() {
    // Initialize with default values
    this.initFallbackSpeechRecognition();
  }
  
  // Initialize the fallback speech recognition
  private initFallbackSpeechRecognition(): void {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.onListeningStateChange(true);
        this.onStatusChange('Listening (Browser API)...', true);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.onListeningStateChange(false);
        
        // If we were supposed to be listening but it ended, try to restart
        if (this.isListening && this.useFallback) {
          try {
            this.recognition?.start();
          } catch (error) {
            this.onStatusChange('Browser speech recognition error. Please try again.', false);
          }
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        this.onStatusChange(`Browser speech recognition error: ${(event as any).error}`, false);
      };
      
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update original transcript
        if (interimTranscript) {
          this.onTranscriptUpdate(interimTranscript, false);
        }
        
        if (finalTranscript) {
          this.onTranscriptUpdate(finalTranscript, true);
          
          // Simulate translation (in a real app, you would call a translation API)
          this.simulateTranslation(finalTranscript);
        }
      };
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }
  
  // Simulate translation for fallback mode
  private simulateTranslation(text: string): void {
    // Simple mock translation for demo purposes
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
    
    // Simulate API call delay
    setTimeout(() => {
      // Simple word-by-word translation for demo purposes
      let translated = text.toLowerCase();
      
      // Check if we have mock translations for this language pair
      if (mockTranslations[this.sourceLanguage] && mockTranslations[this.sourceLanguage][this.targetLanguage]) {
        const dictionary = mockTranslations[this.sourceLanguage][this.targetLanguage];
        
        // Replace known words/phrases
        Object.entries(dictionary).forEach(([original, translation]) => {
          const regex = new RegExp(`\\b${original}\\b`, 'gi');
          translated = translated.replace(regex, translation);
        });
      }
      
      // For languages we don't have in our mock, just append a language indicator
      if (!mockTranslations[this.sourceLanguage] || !mockTranslations[this.sourceLanguage][this.targetLanguage]) {
        translated = `[${this.targetLanguage}] ${text}`;
      }
      
      this.localAccumulatedTranslation += translated + " ";
      this.currentTranslation = this.localAccumulatedTranslation;
      
      this.onTranslationUpdate(translated, this.currentTranslation);
    }, 1000);
  }
  
  // Set up event handlers
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
  
  // Connect to the WebSocket server
  public connect(): void {
    if (this.useFallback) {
      this.onStatusChange('Using browser speech recognition (server unavailable)', true);
      return;
    }
    
    this.onStatusChange('Connecting to translation server...', false);
    
    try {
      this.socket = new WebSocket(this.serverUrl);
      
      this.socket.onopen = this.handleSocketOpen.bind(this);
      this.socket.onclose = this.handleSocketClose.bind(this);
      this.socket.onerror = this.handleSocketError.bind(this);
      this.socket.onmessage = this.handleSocketMessage.bind(this);
      
      // Set up ping interval to keep connection alive
      this.pingInterval = setInterval(() => this.sendPing(), 30000);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.handleConnectionFailure();
    }
  }
  
  // Handle connection failure
  private handleConnectionFailure(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.useFallback = true;
      this.onStatusChange('Server unavailable. Using browser speech recognition instead.', true);
    } else {
      this.onStatusChange(`Connection error. Trying to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`, false);
      this.scheduleReconnect();
    }
  }
  
  // Disconnect from the WebSocket server
  public disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition', error);
      }
    }
    
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    
    this.isConnected = false;
    this.isListening = false;
  }
  
  // Start listening for speech
  public startListening(): void {
    if (this.useFallback) {
      if (this.recognition) {
        try {
          this.recognition.lang = this.sourceLanguage;
          this.recognition.start();
          this.clearTranslations();
        } catch (error) {
          console.error('Error starting browser speech recognition:', error);
          this.onStatusChange('Error starting speech recognition. Please try again.', false);
        }
      } else {
        this.onStatusChange('Speech recognition not supported in this browser', false);
      }
      return;
    }
    
    if (!this.isConnected) {
      this.onStatusChange('Not connected. Reconnecting...', false);
      this.connect();
      return;
    }
    
    this.sendCommand('start_listening');
    this.clearTranslations();
  }
  
  // Stop listening for speech
  public stopListening(): void {
    if (this.useFallback) {
      if (this.recognition) {
        try {
          this.recognition.stop();
          this.isListening = false;
          this.onListeningStateChange(false);
          this.onStatusChange('Stopped listening', true);
        } catch (error) {
          console.error('Error stopping browser speech recognition:', error);
        }
      }
      return;
    }
    
    if (this.isConnected) {
      this.sendCommand('stop_listening');
    }
  }
  
  // Update the source and target languages
  public updateLanguages(sourceLanguage: string, targetLanguage: string): void {
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    
    if (this.useFallback) {
      if (this.recognition) {
        this.recognition.lang = sourceLanguage;
      }
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
  
  // Speak the translated text
  public speakTranslation(): void {
    if (this.useFallback) {
      if (this.synthesis && this.currentTranslation) {
        const utterance = new SpeechSynthesisUtterance(this.currentTranslation);
        utterance.lang = this.targetLanguage;
        
        utterance.onstart = () => {
          this.onStatusChange('Speaking...', true);
        };
        
        utterance.onend = () => {
          this.onStatusChange('Finished speaking', true);
          this.onAudioCompleted();
          
          // Reset status after a delay
          setTimeout(() => {
            if (this.isListening) {
              this.onStatusChange('Listening...', true);
            } else {
              this.onStatusChange('Ready', true);
            }
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
    
    this.sendCommand('speak', {
      text: this.currentTranslation
    });
  }
  
  // Clear the accumulated translations
  private clearTranslations(): void {
    this.currentTranslation = '';
    this.localAccumulatedTranslation = '';
  }
  
  // Send a command to the server
  private sendCommand(command: string, additionalData: Record<string, any> = {}): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Socket is not open');
      return;
    }
    
    const message = {
      command,
      ...additionalData
    };
    
    this.socket.send(JSON.stringify(message));
  }
  
  // Send a ping to keep the connection alive
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
  
    // Send initial language settings without a command field:
    this.socket!.send(JSON.stringify({
      source_language: this.sourceLanguage,
      target_language: this.targetLanguage
    }));
  }
  
  // Handle socket close event
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
  
  // Handle socket error event
  private handleSocketError(error: Event): void {
    console.error('WebSocket error:', error);
    this.onStatusChange('Connection error', false);
    this.handleConnectionFailure();
  }
  
  // Handle socket message event
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
            // If server sent full_translation, use it; otherwise accumulate locally
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
          
          // Reset status after a delay
          setTimeout(() => {
            if (this.isListening) {
              this.onStatusChange('Listening...', true);
            } else {
              this.onStatusChange('Ready', true);
            }
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
          // Ignore pong responses
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
  
  // Schedule a reconnection attempt
  private scheduleReconnect(): void {
    setTimeout(() => {
      if (!this.isConnected && !this.useFallback) {
        this.connect();
      }
    }, this.reconnectInterval);
  }
}

export default new TranslationService();
