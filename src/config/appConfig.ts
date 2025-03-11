
/**
 * Application configuration
 * This file centralizes all environment variables and configuration settings
 */

// API Keys
export const API_KEYS = {
  GEMINI: process.env.GEMINI_API_KEY || "AIzaSyDvpbV34TFp2hGXWF5Hl9zONjlKeKoAuv8",
};

// API Endpoints
export const API_ENDPOINTS = {
  GEMINI: "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
};

// Application Settings
export const APP_SETTINGS = {
  DEFAULT_LANGUAGE: "english",
  MAX_AUDIO_DURATION_SECONDS: 60,
  TRANSCRIPTION_CONFIDENCE_THRESHOLD: 0.75,
  DEFAULT_VOICE_RATE: 1.0,
  DEFAULT_VOICE_PITCH: 1.0,
};

// Feature Flags
export const FEATURES = {
  ENABLE_VOICE_LOGIN: true,
  ENABLE_AI_FEEDBACK: true,
  ENABLE_COMMUNITY_FEATURES: true,
};

/**
 * Get a configuration value with type safety
 * @param key The configuration key path (e.g., "API_KEYS.GEMINI")
 * @returns The configuration value or undefined if not found
 */
export function getConfig(key: string): any {
  const parts = key.split('.');
  let result: any = { API_KEYS, API_ENDPOINTS, APP_SETTINGS, FEATURES };
  
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      return undefined;
    }
  }
  
  return result;
}

export default {
  API_KEYS,
  API_ENDPOINTS,
  APP_SETTINGS,
  FEATURES,
  getConfig,
};
