import React, { useState, useRef, useEffect } from 'react';
import { Crop, Language, ChatMessage } from '../types';
import { translations } from '../data/translations';
import { sendChatMessage } from '../services/api';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface ChatbotProps {
  selectedCrop: Crop;
  setSelectedCrop: (crop: Crop) => void;
  language: Language;
  openSettings: () => void;
  hasGeminiKey: boolean;
  prefillQuestion?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  selectedCrop,
  setSelectedCrop,
  language,
  openSettings,
  hasGeminiKey,
  prefillQuestion,
}) => {
  const t = translations[language].chat;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested questions based on active crop
  const suggestedQuestions =
    selectedCrop === 'Tomato'
      ? [
          language === 'hi' ? 'टमाटर की फसल कितने दिन में तैयार होती है?' : 'How many days does tomato take to grow?',
          language === 'hi' ? 'टमाटर में पत्तियां पीली क्यों हो रही हैं?' : 'What causes yellow leaves on tomatoes?',
          language === 'hi' ? 'टमाटर में खाद (NPK) कब और कितनी दें?' : 'Which fertilizer schedule is best for tomato?',
          language === 'hi' ? 'अगेती झुलसा (Early Blight) से बचाव कैसे करें?' : 'How can I prevent tomato early blight?'
        ]
      : [
          language === 'hi' ? 'आलू की बुवाई का सही समय कब है?' : 'When should I plant potatoes in India?',
          language === 'hi' ? 'आलू में पछेती झुलसा (Late Blight) से कैसे बचें?' : 'How can I prevent potato late blight?',
          language === 'hi' ? 'कंद बड़ा करने के लिए सिंचाई कब करें?' : 'How often should I water during tuber bulking?',
          language === 'hi' ? 'आलू में मिट्टी चढ़ाने (Earthing Up) का क्या महत्व है?' : 'Why is earthing up important for potato?'
        ];

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Load chat history from localStorage or set initial greeting
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`agrimitra_chat_${selectedCrop}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load chat history:', e);
    }

    const greetingText =
      language === 'hi'
        ? `नमस्ते किसान भाई! 🙏 मैं आपका कृषिमित्र AI चौपाल सलाहकार हूँ। अभी हम ${
            selectedCrop === 'Tomato' ? 'टमाटर' : 'आलू'
          } की फसल पर बात कर रहे हैं। बुवाई, रोग, सिंचाई या खाद के बारे में कोई भी सवाल पूछें!`
        : `Hello Farmer! 🙏 I am your AgriMitra AI Assistant. We are currently discussing ${selectedCrop}. Ask me anything about sowing, diseases, irrigation, or fertilizer!`;

    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        crop: selectedCrop,
      },
    ]);
  }, [selectedCrop, language]);

  // Auto prefill from CropDoctor follow-up
  useEffect(() => {
    if (prefillQuestion) {
      const q =
        language === 'hi'
          ? `${selectedCrop} में ${prefillQuestion} रोग का उपचार और रोकथाम क्या है?`
          : `What is the treatment and prevention for ${prefillQuestion} in ${selectedCrop}?`;
      setInput(q);
    }
  }, [prefillQuestion, selectedCrop, language]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`agrimitra_chat_${selectedCrop}`, JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not save chat history:', e);
      }
    }
  }, [messages, selectedCrop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      crop: selectedCrop,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query, selectedCrop, language);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        crop: selectedCrop,
        isError: !res.success,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: language === 'hi'
          ? 'माफ़ कीजिये, AI सर्वर से संपर्क नहीं हो पाया। कृपया इंटरनेट जांचें।'
          : 'Unable to connect to AI server. Please check your network.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        crop: selectedCrop,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const clearChat = () => {
    localStorage.removeItem(`agrimitra_chat_${selectedCrop}`);
    const greetingText =
      language === 'hi'
        ? `नमस्ते किसान भाई! मैं आपका कृषिमित्र AI सलाहकार हूँ। ${selectedCrop} के बारे में कुछ भी पूछें।`
        : `Hello! I am your AgriMitra AI assistant. Ask me anything about ${selectedCrop}.`;
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        crop: selectedCrop,
      },
    ]);
  };

  return (
    <div className="space-y-3 pb-4">
      
      {/* 1. Chat Header & Crop Context */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0F2238] text-white flex items-center justify-center font-bold text-sm">
            🤖
          </div>
          <div>
            <h1 className="text-base font-black text-[#0F2238]">
              {t.title}
            </h1>
            <p className="text-xs text-[#506680]">
              {t.activeContext} <strong className="text-[#0F2238] font-extrabold">{selectedCrop}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Crop Switch */}
          <div className="flex items-center bg-[#F1F4F8] p-1 rounded-lg border border-[#E4E9F0]">
            <button
              type="button"
              onClick={() => setSelectedCrop('Tomato')}
              className={`min-h-[32px] px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                selectedCrop === 'Tomato' ? 'bg-white text-[#0F2238] border border-[#CBD5E1]' : 'text-[#506680]'
              }`}
              title="Tomato"
            >
              🍅
            </button>
            <button
              type="button"
              onClick={() => setSelectedCrop('Potato')}
              className={`min-h-[32px] px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                selectedCrop === 'Potato' ? 'bg-white text-[#0F2238] border border-[#CBD5E1]' : 'text-[#506680]'
              }`}
              title="Potato"
            >
              🥔
            </button>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="touch-target p-2 text-[#506680] hover:text-red-700 rounded-lg border border-[#E4E9F0] bg-white transition-colors cursor-pointer flex items-center justify-center"
            title={t.clearChatBtn}
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Missing Gemini Key Notification Banner */}
      {!hasGeminiKey && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{t.keyAlert}</span>
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="text-xs font-bold text-amber-950 underline whitespace-nowrap cursor-pointer ml-2 touch-target"
          >
            Settings
          </button>
        </div>
      )}

      {/* 2. Suggested Quick Questions (Horizontal momentum scroll) */}
      <section className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-[#506680] uppercase tracking-wide block px-1">
          {t.suggestedQuestions}
        </span>
        <div className="flex gap-2 scroll-touch-x pb-1">
          {suggestedQuestions.map((q, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSend(q)}
              className="touch-target bg-white hover:bg-[#F1F4F8] text-[#0F2238] border border-[#CBD5E1] rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Chat Messages Stream (Responsive container height, no clipping) */}
      <section className="bg-white rounded-xl border border-[#E4E9F0] flex flex-col h-[60vh] min-h-[380px] max-h-[560px] overflow-hidden">
        
        {/* Messages scroll box with overscroll containment */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-3 bg-[#F1F4F8]/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    isUser ? 'bg-[#0F2238] text-white' : 'bg-[#15803D] text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-xl max-w-[85%] text-xs leading-relaxed break-words ${
                    isUser
                      ? 'bg-[#0F2238] text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-950 rounded-tl-none'
                      : 'bg-white border border-[#CBD5E1] text-[#0F2238] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span
                    className={`text-[10px] block text-right mt-1.5 ${
                      isUser ? 'text-slate-300' : 'text-[#64748B]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#506680] bg-white p-3 rounded-xl border border-[#E4E9F0] max-w-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0F2238]" />
              <span>{language === 'hi' ? 'AI जवाब तैयार कर रहा है...' : 'AI is generating advice...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Fixed Composer Input Bar with 44px Touch Targets & 16px font to prevent mobile zoom */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-2.5 sm:p-3 bg-white border-t border-[#E4E9F0] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-[#F1F4F8] border border-[#CBD5E1] focus:border-[#0F2238] focus:bg-white rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-[#0F2238] outline-none transition-colors min-h-[44px]"
          />

          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`touch-target p-2.5 rounded-lg border transition-colors cursor-pointer flex-shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-red-600 text-white border-red-700 animate-pulse'
                  : 'bg-[#F1F4F8] hover:bg-[#E4E9F0] text-[#0F2238] border-[#CBD5E1]'
              }`}
              title={isListening ? 'Stop listening' : t.voiceBtn}
              aria-label="Voice Input"
            >
              {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="touch-target px-4 py-2.5 rounded-lg bg-[#0F2238] hover:bg-[#142C4C] active:bg-[#0B1C30] disabled:bg-slate-300 text-white text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span>{t.sendBtn}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </section>

    </div>
  );
};

