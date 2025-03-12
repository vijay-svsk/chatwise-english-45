
class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

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

  // Find best English voice available
  getBestEnglishVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices();
    }
    
    // Check for specific high-quality voices first
    const preferredVoices = [
      'Google UK English Female',
      'Microsoft Zira',
      'Samantha',
      'Karen'
    ];
    
    for (const voiceName of preferredVoices) {
      const match = this.voices.find(v => v.name.includes(voiceName));
      if (match) return match;
    }
    
    // Fall back to any female English voice
    const femaleEnglishVoice = this.voices.find(v => 
      v.lang.includes('en') && 
      (v.name.includes('Female') || v.name.toLowerCase().includes('female'))
    );
    
    if (femaleEnglishVoice) return femaleEnglishVoice;
    
    // Fall back to any English voice
    return this.voices.find(v => v.lang.includes('en')) || null;
  }

  // Speak text using Web Speech API with enhanced settings
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
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      
      // Set voice if specified
      if (options.voice) {
        const selectedVoice = this.voices.find(v => v.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Default to best English voice
        const bestVoice = this.getBestEnglishVoice();
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      // Set other options
      utterance.rate = options.rate ?? 0.95; // Slightly slower for better clarity
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
      
      // Fix for Chrome bug where speech sometimes stops
      // Create a watchdog timer to restart speech if it stalls
      this.startSpeechWatchdog();
    });
  }
  
  // Fix for Chrome bug where speech synthesis sometimes stalls
  private startSpeechWatchdog() {
    const watchdog = setInterval(() => {
      // If we're supposed to be speaking but synthesis is paused or has stopped
      if (this.currentUtterance && !window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(this.currentUtterance);
      } else if (!this.currentUtterance) {
        // If we're done speaking, clear the interval
        clearInterval(watchdog);
      }
    }, 5000);
    
    // Clear watchdog after 30 seconds to prevent leaks
    setTimeout(() => clearInterval(watchdog), 30000);
  }

  // Stop speaking
  stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
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
  
  // Play a subtle attention sound
  playAttentionSound() {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}

export const audioService = AudioService.getInstance();
