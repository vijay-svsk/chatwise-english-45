
class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  private constructor() {
    this.initAudioContext();
    this.loadVoices();
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      console.log('Audio context initialized successfully');
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  }

  private loadVoices() {
    // Load available voices
    this.voices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for the onvoiceschanged event
    if (this.voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.voices = window.speechSynthesis.getVoices();
        console.log(`Loaded ${this.voices.length} voices`);
      });
    } else {
      console.log(`Loaded ${this.voices.length} voices`);
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Speak text using Web Speech API
  speak(text: string, options: {
    voice?: string, 
    rate?: number,
    pitch?: number,
    volume?: number
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if specified
      if (options.voice) {
        const selectedVoice = this.voices.find(v => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Default to first English voice
        const englishVoice = this.voices.find(v => v.lang.includes('en-'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      // Set other options
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // Play a sound file
  async playSound(url: string): Promise<void> {
    if (!this.audioContext) {
      console.error('Audio context not initialized');
      return;
    }

    try {
      // Resume audio context if it's suspended (autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Play success sound effect
  playSuccessSound() {
    // Using a tone generator for a simple success sound
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, this.audioContext.currentTime); // D5
    oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Play error/failure sound effect
  playErrorSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(466.16, this.audioContext.currentTime); // Bb4
    oscillator.frequency.setValueAtTime(369.99, this.audioContext.currentTime + 0.2); // F#4
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }
}

export const audioService = AudioService.getInstance();
