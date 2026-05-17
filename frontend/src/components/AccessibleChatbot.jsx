import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { studentsAPI, aiAPI } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import { 
  FaMicrophone, FaStop, FaPaperPlane, FaTimes, 
  FaRobot, FaVolumeUp, FaAdjust, FaUniversalAccess 
} from 'react-icons/fa';

const AccessibleChatbot = () => {
  const { user, isStudent, isAdmin, isProf } = useAuth();
  const { theme: globalTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { 
    isSpeaking, 
    isListening, 
    speakText, 
    stopSpeaking, 
    startListening, 
    stopListening 
  } = useSpeech();

  useEffect(() => { 
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        const welcomeMsg = `Bonjour ${user?.username} ! Je suis votre assistant EduCRM. Posez-moi une question ou cliquez sur le microphone pour parler.`;
        const welcome = { role: 'assistant', content: welcomeMsg };
        setMessages([welcome]);
        speakText(welcomeMsg);
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen, user, messages.length, speakText, stopSpeaking, stopListening]);

  const handleSpeechResult = (transcript) => {
    setInput(transcript);
    setTimeout(() => {
      sendMessage(transcript);
    }, 500);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(handleSpeechResult);
    }
  };

  const buildSystemContext = async () => {
    let ctx = `Tu es un assistant IA intégré dans EduCRM, une plateforme de gestion éducative.
Utilisateur connecté: ${user?.username}, rôle: ${user?.role}.
Réponds TOUJOURS en français de manière claire et structurée. Sois concis (3-4 phrases maximum). 
Tes réponses seront lues à voix haute pour des utilisateurs malvoyants, évite les caractères spéciaux compliqués.
`;
    try {
      if (isStudent && isStudent()) {
        const res = await studentsAPI.getAll();
        const me = res.data.find(s =>
          s.email?.toLowerCase().includes(user?.username?.toLowerCase()) ||
          s.firstName?.toLowerCase() === user?.username?.toLowerCase()
        );
        if (me) {
          ctx += `\nÉtudiant: ${me.firstName} ${me.lastName}, Niveau: ${me.level}.`;
          try {
            const gr = await studentsAPI.getGrades(me.id);
            if (gr.data.length > 0) {
              const avg = (gr.data.reduce((s, g) => s + g.value, 0) / gr.data.length).toFixed(2);
              ctx += ` Moyenne: ${avg}/20 sur ${gr.data.length} notes.`;
            }
          } catch (e) { console.error("Error fetching grades", e); }
        }
      }
      if ((isAdmin && isAdmin()) || (isProf && isProf())) {
        try {
          const al = await aiAPI.getAlerts();
          const alerts = al.data;
          const critical = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
          const total = alerts.length;
          ctx += `\nIl y a ${total} étudiants à risque, dont ${critical} critiques.`;
        } catch (e) { console.error("Error fetching alerts", e); }
      }
    } catch (e) {
      console.error("Error building context", e);
    }
    return ctx;
  };

  // ── Appel via aiAPI (axios avec JWT automatique) ──
  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const systemContext = await buildSystemContext();
      const chatMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // ✅ aiAPI.chat envoie automatiquement le token JWT → plus de 401 !
      const response = await aiAPI.chat({
        systemContext: systemContext,
        messages: chatMessages,
      });

      const reply = response.data?.reply || "Je n'ai pas pu obtenir une réponse.";

      const assistantMsg = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(reply);

    } catch (err) {
      console.error("Chat error:", err);
      const errMsg = `Erreur : ${err.response?.data?.message || err.message || "Connexion au service IA impossible."}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    }
  };

  const quickQs = (isStudent && isStudent())
    ? ["Quelle est ma moyenne ?", "Suis-je en risque ?", "Aide accessibilité"]
    : ["Combien d'étudiants à risque ?", "Résumé du tableau de bord", "Aide accessibilité"];

  const fsMap = { normal: '15px', large: '18px', xlarge: '22px' };
  const fs = fsMap[fontSize];
  
  const theme = highContrast 
    ? {
        bgMain: '#000000', bgSub: '#111111', textMain: '#FFFFFF', textSub: '#CCCCCC',
        border: '#444444', accent: '#FFFFFF', accentHover: '#CCCCCC', accentText: '#000000',
        userBubble: '#333333', botBubble: '#111111'
      }
    : globalTheme === 'light'
      ? {
          bgMain: '#ffffff', bgSub: '#f8fafc', textMain: '#0f172a', textSub: '#475569',
          border: '#e2e8f0', accent: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          accentHover: 'linear-gradient(135deg, #4f46e5, #7c3aed)', accentText: '#ffffff',
          userBubble: 'linear-gradient(135deg, #6366f1, #8b5cf6)', botBubble: '#f1f5f9'
        }
      : {
          bgMain: '#0f172a', bgSub: '#1e293b', textMain: '#f8fafc', textSub: '#94a3b8',
          border: '#334155', accent: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          accentHover: 'linear-gradient(135deg, #4f46e5, #7c3aed)', accentText: '#ffffff',
          userBubble: 'linear-gradient(135deg, #6366f1, #8b5cf6)', botBubble: '#1e293b'
        };

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes chat-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        .typing-dot {
          width: 8px; height: 8px; border-radius: 50%; background: ${theme.textSub};
          animation: chat-bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }
      `}</style>

      <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        
        {/* Floating Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer l'assistant" : "Ouvrir l'assistant vocal"}
          aria-expanded={isOpen}
          style={{ 
            width: 65, height: 65, borderRadius: '50%', 
            background: theme.accent, border: highContrast ? '2px solid #fff' : 'none', 
            cursor: 'pointer', color: theme.accentText, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, transition: 'transform 0.2s',
            animation: !isOpen && !highContrast ? 'pulse-ring 3s infinite' : 'none',
            transform: isOpen ? 'scale(0.9)' : 'scale(1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'}
        >
          {isOpen ? <FaTimes /> : <FaUniversalAccess />}
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div 
            role="dialog" 
            aria-label="Assistant vocal EduCRM"
            aria-modal="true"
            style={{ 
              position: 'absolute', bottom: 85, right: 0, 
              width: 400, height: 600, maxHeight: 'calc(100vh - 120px)',
              borderRadius: 20, background: theme.bgMain, 
              border: `1px solid ${theme.border}`, 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
              display: 'flex', flexDirection: 'column', overflow: 'hidden', 
              fontSize: fs, color: theme.textMain 
            }}
          >
            {/* Header */}
            <div style={{ 
              background: theme.accent, color: theme.accentText, 
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: `1px solid ${theme.border}`
            }}>
              <FaRobot size={24} />
              <h2 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 600 }}>Assistant IA</h2>
              {isSpeaking && (
                <button 
                  onClick={stopSpeaking}
                  aria-label="Arrêter la lecture vocale"
                  style={{ 
                    background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', 
                    borderRadius: 8, padding: '6px 10px', cursor: 'pointer', 
                    fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                >
                  <FaStop /> Stop
                </button>
              )}
            </div>

            {/* Accessibility Toolbar */}
            <div 
              role="toolbar" 
              aria-label="Outils d'accessibilité"
              style={{ 
                background: theme.bgSub, borderBottom: `1px solid ${theme.border}`, 
                padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'
              }}
            >
              <span style={{ fontSize: 12, color: theme.textSub, fontWeight: 500 }} aria-hidden="true">Texte:</span>
              {['normal', 'large', 'xlarge'].map(sz => (
                <button 
                  key={sz} 
                  onClick={() => setFontSize(sz)} 
                  aria-pressed={fontSize === sz}
                  aria-label={`Taille de texte ${sz}`}
                  style={{ 
                    padding: '4px 12px', borderRadius: 12, cursor: 'pointer', fontSize: 12,
                    fontWeight: fontSize === sz ? 600 : 400,
                    border: `1px solid ${fontSize === sz ? (highContrast ? '#fff' : '#6366f1') : theme.border}`, 
                    background: fontSize === sz ? (highContrast ? '#fff' : 'rgba(99,102,241,0.2)') : 'transparent', 
                    color: fontSize === sz ? (highContrast ? '#000' : '#818cf8') : theme.textSub,
                    transition: 'all 0.2s'
                  }}
                >
                  {sz === 'normal' ? 'A' : sz === 'large' ? 'AA' : 'AAA'}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button 
                onClick={() => setHighContrast(!highContrast)} 
                aria-pressed={highContrast}
                aria-label="Activer le mode contraste élevé"
                style={{ 
                  padding: '4px 12px', borderRadius: 12, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  border: `1px solid ${highContrast ? '#fff' : theme.border}`, 
                  background: highContrast ? '#fff' : 'transparent', 
                  color: highContrast ? '#000' : theme.textSub,
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.2s'
                }}
              >
                <FaAdjust /> Contraste
              </button>
            </div>

            {/* Messages Area */}
            <div 
              className="chat-scroll"
              role="log" 
              aria-live="polite"
              style={{ 
                flex: 1, overflowY: 'auto', padding: '20px', 
                display: 'flex', flexDirection: 'column', gap: 16, 
                background: theme.bgMain 
              }}
            >
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                    <div 
                      aria-label={`${isUser ? 'Vous avez dit' : 'Assistant a répondu'}: ${msg.content}`}
                      style={{ 
                        maxWidth: '85%', padding: '12px 16px', lineHeight: 1.5, 
                        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                        background: isUser ? theme.userBubble : theme.botBubble, 
                        color: isUser ? theme.accentText : theme.textMain, 
                        border: isUser ? 'none' : `1px solid ${theme.border}`,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {msg.content}
                    </div>
                    {!isUser && (
                      <button 
                        onClick={() => speakText(msg.content)} 
                        aria-label="Relire ce message à voix haute"
                        title="Relire à voix haute"
                        style={{ 
                          background: 'transparent', border: 'none', cursor: 'pointer', 
                          padding: '4px 8px', fontSize: 12, color: theme.textSub, 
                          marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
                          transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = theme.textMain}
                        onMouseOut={(e) => e.currentTarget.style.color = theme.textSub}
                      >
                        <FaVolumeUp /> Relire
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Indicateur de chargement */}
              {isLoading && (
                <div style={{ 
                  display: 'flex', gap: 6, padding: '14px 18px', 
                  background: theme.botBubble, borderRadius: '18px 18px 18px 4px', 
                  alignSelf: 'flex-start', border: `1px solid ${theme.border}` 
                }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div 
              role="group" 
              aria-label="Questions rapides"
              style={{ 
                padding: '12px 16px', borderTop: `1px solid ${theme.border}`, 
                display: 'flex', gap: 8, flexWrap: 'wrap', background: theme.bgSub 
              }}
            >
              {quickQs.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(q)} 
                  aria-label={`Poser la question: ${q}`}
                  disabled={isLoading}
                  style={{ 
                    padding: '6px 12px', borderRadius: 16, cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: 13, border: `1px solid ${theme.border}`, 
                    background: 'transparent', color: theme.textMain,
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                      e.currentTarget.style.borderColor = '#6366f1';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div style={{ 
              padding: '16px', borderTop: `1px solid ${theme.border}`, 
              display: 'flex', gap: 10, background: theme.bgMain 
            }}>
              <input 
                ref={inputRef}
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} 
                placeholder="Posez votre question..."
                disabled={isLoading} 
                aria-label="Champ de saisie du message"
                style={{ 
                  flex: 1, padding: '12px 16px', borderRadius: 12, 
                  border: `1px solid ${theme.border}`, background: theme.bgSub, 
                  color: theme.textMain, fontSize: fs, outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
              <button 
                onClick={toggleListening}
                aria-pressed={isListening}
                aria-label={isListening ? "Arrêter l'enregistrement" : "Parler au microphone"}
                title={isListening ? "Arrêter" : "Parler"}
                style={{ 
                  width: 46, height: 46, borderRadius: '50%', cursor: 'pointer', 
                  background: isListening ? '#ef4444' : theme.bgSub, 
                  color: isListening ? '#fff' : theme.textMain, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 18, flexShrink: 0,
                  border: `1px solid ${isListening ? '#ef4444' : theme.border}`,
                  transition: 'all 0.2s',
                  animation: isListening ? 'pulse-ring 1.5s infinite' : 'none'
                }}
                onMouseOver={(e) => { if (!isListening) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseOut={(e) => { if (!isListening) e.currentTarget.style.background = theme.bgSub; }}
              >
                {isListening ? <FaStop /> : <FaMicrophone />}
              </button>
              <button 
                onClick={() => sendMessage()} 
                disabled={isLoading || !input.trim()}
                aria-label="Envoyer le message"
                title="Envoyer"
                style={{ 
                  width: 46, height: 46, borderRadius: '50%', border: 'none', 
                  cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', 
                  background: (isLoading || !input.trim()) ? theme.border : theme.accent, 
                  color: (isLoading || !input.trim()) ? theme.textSub : theme.accentText, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 18, flexShrink: 0,
                  transition: 'all 0.2s', opacity: (isLoading || !input.trim()) ? 0.6 : 1
                }}
                onMouseOver={(e) => { if (!isLoading && input.trim()) e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={(e) => { if (!isLoading && input.trim()) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <FaPaperPlane />
              </button>
            </div>

          </div>
        )}
      </div>
    </>
  );
};

export default AccessibleChatbot;