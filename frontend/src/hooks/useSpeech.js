import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel(); // Stop any current speech
    
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const setVoiceAndSpeak = () => {
      const voices = synthRef.current.getVoices();
      // Try to find a premium/natural French voice if available
      const frVoices = voices.filter(v => v.lang.startsWith('fr'));
      const preferredVoice = frVoices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural')) || frVoices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    };

    if (synthRef.current.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      synthRef.current.onvoiceschanged = setVoiceAndSpeak;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const startListening = useCallback((onResultCallback) => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Google Chrome.");
      return;
    }
    
    stopSpeaking(); // Prevent echo
    
    recognitionRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (onResultCallback) {
        onResultCallback(transcript);
      }
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
    }
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    isSpeaking,
    isListening,
    speakText,
    stopSpeaking,
    startListening,
    stopListening
  };
};
