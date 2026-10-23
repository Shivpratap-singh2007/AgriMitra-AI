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
  AlertCircle,
  Sparkles,
  ShieldCheck
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

  // Suggested questions based on active crop and polyhouse context
  const suggestedQuestions =
    selectedCrop === 'Tomato'
      ? [
          language === 'hi' ? 'क्या मुझे अभी सिंचाई करनी चाहिए?' : 'Should I irrigate my polyhouse tomatoes now?',
          language === 'hi' ? 'टमाटर की पत्तियां पीली क्यों हो रही हैं?' : 'What causes yellow leaves on tomatoes?',
          language === 'hi' ? 'टमाटर में खाद (NPK) कब और कितनी दें?' : 'Which fertilizer schedule is best for tomato?',
          language === 'hi' ? 'अगेती झुलसा (Early Blight) से बचाव कैसे करें?' : 'How can I prevent tomato early blight?'
        ]
      : [
          language === 'hi' ? 'आलू में पछेती झुलसा (Late Blight) से कैसे बचें?' : 'How can I prevent potato late blight?',
          language === 'hi' ? 'कंद बड़ा करने के लिए सिंचाई कब करें?' : 'How often should I water during tuber bulking?',
          language === 'hi' ? 'आलू की बुवाई का सही समय कब है?' : 'When should I plant potatoes in India?',
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
        ? `नमस्ते किसान भाई! 🙏 मैं आपका कृषिमित्र AI चौपाल सलाहकार हूँ। मैं पॉलीहाउस के ताजा तापमान, नमी और ICAR कृषि अनुसंधान से जुड़ा हूँ। ${
            selectedCrop === 'Tomato' ? 'टमाटर' : 'आलू'
          } की सिंचाई, पत्ती रोग या खाद के बारे में कोई भी सवाल पूछें!`
        : `Hello Farmer! 🙏 I am your AgriMitra AI Assistant. I am connected to your live polyhouse sensors and ICAR research. Ask me anything about irrigation, disease management, or fertilizer for ${selectedCrop}!`;

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
        ? `चैट इतिहास मिटा दिया गया है। ${selectedCrop === 'Tomato' ? 'टमाटर' : 'आलू'} के बारे में नया सवाल पूछें!`
        : `Chat history cleared. Ask a new question about ${selectedCrop}!`;

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
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[850px] bg-white rounded-xl border border-[#E4E9F0] overflow-hidden">
      
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-[#E4E9F0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold">
            <Bot className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-[#142B4A] tracking-tight leading-none">
              {t.title}
            </h1>
            <p className="text-[11px] text-[#506680] mt-1">
              {language === 'hi'
                ? `सक्रिय संदर्भ: ${selectedCrop === 'Tomato' ? 'टमाटर' : 'आलू'} • लाइव सेंसर लिंक्ड`
                : `Context: ${selectedCrop} • Live sensor linked`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          className="touch-target p-2 rounded-lg text-[#506680] hover:text-[#142B4A] hover:bg-[#F1F4F8] transition-colors cursor-pointer"
          title={t.clearChatBtn}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* API Key Alert if not configured */}
      {!hasGeminiKey && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="line-clamp-1">{t.keyAlert}</span>
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="font-bold underline text-amber-900 ml-2 whitespace-nowrap cursor-pointer"
          >
            Settings
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#F8FAFC]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2 max-w-[88%] sm:max-w-[78%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#142B4A] text-white'
                    : 'bg-[#2E7D32] text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#142B4A] text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                    : 'bg-white text-[#1E293B] border border-[#E4E9F0] shadow-2xs rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span
                  className={`text-[9px] mt-1.5 block text-right font-medium ${
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
          <div className="flex gap-2 max-w-[75%] mr-auto items-center">
            <div className="w-7 h-7 rounded-full bg-[#2E7D32] text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-[#E4E9F0] p-3 rounded-xl rounded-tl-none text-xs text-[#506680] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2E7D32]" />
              <span>{language === 'hi' ? 'AI सलाह तैयार कर रहा है...' : 'Formulating agricultural advice...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-2 bg-white border-t border-[#E4E9F0] overflow-x-auto scroll-touch-x flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-[#506680] whitespace-nowrap pl-1">
          {language === 'hi' ? 'सुझाव:' : 'Quick:'}
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="touch-target px-2.5 py-1 rounded-full bg-[#F1F4F8] hover:bg-[#E4E9F0] text-[11px] font-semibold text-[#142B4A] whitespace-nowrap border border-[#E4E9F0] transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar with Voice Support */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 sm:p-3 bg-white border-t border-[#E4E9F0] flex items-center gap-2"
      >
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`touch-target p-2 rounded-lg border transition-colors cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-[#F1F4F8] text-[#506680] hover:text-[#142B4A] border-[#E4E9F0]'
            }`}
            title={t.voiceBtn}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? t.listening : t.placeholder}
          disabled={loading}
          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#142B4A] focus:outline-none focus:border-[#142B4A]"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="touch-target px-4 py-2 rounded-lg bg-[#142B4A] hover:bg-[#1B3B64] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{t.sendBtn}</span>
        </button>
      </form>

    </div>
  );
};
