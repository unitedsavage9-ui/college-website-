import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, X, Minimize2, Maximize2, Send, Trash2, 
  Copy, Check, ThumbsUp, ThumbsDown, Sparkles, Download, 
  Volume2, VolumeX, RefreshCw, Moon, Sun, ShieldAlert,
  ArrowRight, Landmark, BookOpen, Clock, Award
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
  rating?: "positive" | "negative";
}

const IMMEDIATE_ANSWERS: Record<string, string> = {
  "Instant Admit Card Status": "Your Admit Card for the upcoming FYUGP 4th Semester Examination is fully approved and generated. \n\n- **Student Name**: student_name_placeholder\n- **Admit Card Status**: ACTIVE & APPROVED\n- **Examination Center**: Dhemaji College, Main Block A\n- **Academic Year**: 2026",
  "Instant Sessional Schedule": "The sessional examination tests for FYUGP 4th Semester are scheduled to commence from **September 24, 2026**. \n\n- **Daily Session Timings**: 10:00 AM - 12:30 PM\n- **Seating Room Layouts**: Published outside the Administrative Block bulletin board.\n- **Mandatory Requirements**: 75% class attendance is strictly required to sit for examinations.",
  "Instant Hostel Facilities": "Dhemaji College offers separate, fully-furnished boys and girls hostel facilities right on-campus:\n\n- **Hostel Seats Allocation**: Purely merit-based according to semesters sessional GPA score.\n- **Sessional Fee**: ₹6,500 per academic session.\n- **Amenities**: Clean drinking water, reading room recreation area, and 24/7 security guard patrol.",
  "Instant Digital Library Rules": "The Dhemaji College Digital Library is open from **9:00 AM to 5:00 PM** on all working college days:\n\n- **Borrowing Limit**: Up to 3 books can be issued concurrently using your student RFID library identity card.\n- **Return Period**: 15 days from the date of issue. (Late returns incur a sessional fine of ₹2/day).",
  "Instant Admission Helpline": "For FYUGP Undergraduate Bachelor Degree admissions under Dhemaji College, follow this protocol:\n\n1. Register online on the official Samarth Assam portals at **https://assamyugp.samarth.ac.in**\n2. Select **Dhemaji College** as your primary preferred institution.\n3. For direct admissions helpdesk, contact our college cell at **+91 3753 224356** or email **admission@dhemajicollege.edu.in**."
};

interface ChatbotWidgetProps {
  studentProfile?: {
    name: string;
    id: string;
    department: string;
  };
}

export default function ChatbotWidget({ studentProfile }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Initialize with welcome message and check local storage history
  useEffect(() => {
    const savedHistory = localStorage.getItem("dc_chat_history");
    const savedSession = localStorage.getItem("dc_chat_session_id");
    const savedDarkMode = localStorage.getItem("dc_chat_dark_mode");

    if (savedDarkMode === "true") {
      setIsDarkMode(true);
    }

    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
        if (savedSession) setSessionId(savedSession);
      } catch (e) {
        localStorage.removeItem("dc_chat_history");
        setWelcomeMessage();
      }
    } else {
      setWelcomeMessage();
    }
  }, []);

  // Set default welcome message based on profile
  const setWelcomeMessage = () => {
    const name = studentProfile?.name || "Visitor";
    const welcomeText = `Hello, **${name}**! Welcome to the official Dhemaji College AI Secretariat Desk. 🌟
    
How can I assist you with your academic matters today? You can ask me about:
- 🏛️ **College Profile** (Estd 1965, NAAC Grade 'A')
- 📝 **FYUGP admissions** via the Samarth Assam portal
- 📅 **Sessional tests**, attendance rules, and academic schedules
- 💳 **Tuition & Exam Fees** details
- 📚 **Digital Library** resources and books rules
- 🏡 **Hostel facilities** and accommodation costs

*Please type a question or select one of the quick triggers below!*`;
    setMessages([
      {
        role: "model",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Save history to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("dc_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clean TTS speaking when widget closes
  useEffect(() => {
    if (!isOpen && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(null);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setChatError(null);

    const userMessage: Message = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    // Immediate Local Answer Interceptor for snappy responsiveness
    if (IMMEDIATE_ANSWERS[textToSend]) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let replyText = IMMEDIATE_ANSWERS[textToSend];
      replyText = replyText.replace("student_name_placeholder", studentProfile?.name || "Visitor");

      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
      
      if (ttsEnabled) {
        speakText(replyText, updatedMessages.length);
      }
      return;
    }

    const apiUser = studentProfile 
      ? { id: studentProfile.id, name: studentProfile.name, role: "student" as const }
      : { id: "guest", name: "Guest Visitor", role: "guest" as const };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text })),
          stream: true,
          user: apiUser,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      // Read chunk-by-chunk for streaming
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read streaming response stream.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let botResponseText = "";

      // Append temporary bot message
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          text: "",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ")) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                botResponseText += parsed.text;
                // Update the last message in array with streaming text
                setMessages(prev => {
                  const copy = [...prev];
                  if (copy.length > 0) {
                    copy[copy.length - 1] = {
                      ...copy[copy.length - 1],
                      text: botResponseText
                    };
                  }
                  return copy;
                });
              }
              if (parsed.sessionId && !sessionId) {
                setSessionId(parsed.sessionId);
                localStorage.setItem("dc_chat_session_id", parsed.sessionId);
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      // Text to Speech if enabled
      if (ttsEnabled && botResponseText) {
        speakText(botResponseText, updatedMessages.length);
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setChatError("API connection interrupted. Attempting sessional auto-recovery...");
      
      // Call local fallback endpoint as a final assurance
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({ role: m.role, text: m.text })),
            stream: false,
            user: apiUser,
            sessionId: sessionId
          })
        });
        const fallbackData = await fallbackRes.json();
        
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: fallbackData.text || "I was unable to retrieve a response from Dhemaji College records right now.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setChatError(null);
      } catch (fallbackErr) {
        // Display full failure gracefully
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: "⚠️ **System Offline**: I am unable to connect to the college servers right now. Please ensure your network is running and try again, or visit the Administrative Secretariat Office.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  };

  const handleCopyText = (text: string, index: number) => {
    // Strip markdown tags to copy clean text
    const cleanText = text.replace(/[*#`_\-]/g, "");
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleRateResponse = async (index: number, rating: "positive" | "negative") => {
    if (!sessionId) return;
    
    // Optimistic state update
    setMessages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], rating };
      return copy;
    });

    try {
      await fetch('/api/admin/conversations/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rating })
      });
    } catch (err) {
      console.error("Rating failed:", err);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      if (synthRef.current) synthRef.current.cancel();
      localStorage.removeItem("dc_chat_history");
      localStorage.removeItem("dc_chat_session_id");
      setSessionId(null);
      setWelcomeMessage();
    }
  };

  const handleDownloadHistory = () => {
    const header = `DHEMAJI COLLEGE AI ASSISTANT CONVERSATION LOG\nDate: ${new Date().toLocaleDateString()}\nSession: ${sessionId || "Guest"}\nStudent Profile: ${studentProfile ? `${studentProfile.name} (${studentProfile.id})` : "Guest Visitor"}\n=========================================\n\n`;
    
    const body = messages.map(m => {
      const sender = m.role === "user" ? "USER" : "AI ASSISTANT";
      const cleanMsg = m.text.replace(/[*#`_\-]/g, "");
      return `[${m.timestamp}] ${sender}:\n${cleanMsg}\n\n`;
    }).join("");

    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dhemaji_college_chat_${sessionId || "guest"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const speakText = (text: string, index: number) => {
    if (!synthRef.current) return;

    if (isSpeaking === index) {
      synthRef.current.cancel();
      setIsSpeaking(null);
      return;
    }

    synthRef.current.cancel();
    
    // Strip markdown formatting for cleaner speech synthesis
    const speechText = text
      .replace(/[*#`_\-]/g, "")
      .replace(/\[Notice Board\]/g, "Referencing notice board")
      .replace(/\[Admissions Brochure\]/g, "Referencing admissions brochure")
      .replace(/\[FAQs\]/g, "According to FAQ records");

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.onend = () => {
      setIsSpeaking(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(index);
    synthRef.current.speak(utterance);
  };

  const toggleDarkMode = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem("dc_chat_dark_mode", String(nextVal));
  };

  const sampleTriggers = [
    { text: "NAAC Accreditation", query: "What is Dhemaji College's NAAC accreditation grade and CGPA score?" },
    { text: "FYUGP Admission", query: "How do I apply for FYUGP undergraduate admissions on Samarth portal?" },
    { text: "Tuition Fees", query: "How much are the sessional tuition fees and exam fees for B.Sc Physics Semester 4?" },
    { text: "Attendance Rule", query: "What is the minimum attendance required to sit in the end-semester exams?" }
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isDarkMode ? "dark" : ""}`}>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chatbot-trigger-btn"
            layoutId="chatbot-window"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-5 py-3.5 bg-oxford-navy text-white rounded-full shadow-2xl hover:bg-oxford-navy/95 border border-prestige-gold/40 cursor-pointer z-50"
          >
            <div className="relative">
              <MessageSquare className="w-5.5 h-5.5 text-prestige-gold animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-oxford-navy"></span>
            </div>
            <span className="font-serif font-bold text-sm tracking-wide text-white">Ask DC Assistant</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Chatbot Interface Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window-container"
            layoutId="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "68px" : isDarkMode ? "600px" : "600px",
              width: isMinimized ? "320px" : "400px"
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className={`flex flex-col bg-white dark:bg-slate-900 border ${
              isDarkMode ? "border-slate-800" : "border-outline-variant/50"
            } rounded-2xl shadow-3xl overflow-hidden z-50 max-w-[calc(100vw-32px)]`}
            style={{ maxHeight: "calc(100vh - 48px)" }}
          >
            {/* Header Area */}
            <header className="flex items-center justify-between px-4 py-3.5 bg-oxford-navy text-white border-b border-prestige-gold/20 select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <Sparkles className="w-4.5 h-4.5 text-prestige-gold" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-oxford-navy"></span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm tracking-wide leading-tight text-white truncate">Dhemaji College AI</h3>
                  <p className="text-[10px] text-prestige-gold font-mono leading-none flex items-center gap-1 mt-0.5">
                    <span>●</span> Core Secretariat Desk
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 text-white/80">
                <button
                  id="chat-toggle-dark"
                  onClick={toggleDarkMode}
                  title="Toggle dark/light mode inside chatbot"
                  className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-prestige-gold" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  id="chat-minimize-btn"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Maximize window" : "Minimize window"}
                  className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>

                <button
                  id="chat-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close AI Desk"
                  className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </header>

            {/* Chat Body & Input Section (Hidden if minimized) */}
            <AnimatePresence>
              {!isMinimized && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
                  
                  {/* Top utility helper bar */}
                  <div className="flex items-center justify-between px-4 py-1.5 bg-white dark:bg-slate-900 border-b border-outline-variant/20 dark:border-slate-850 text-[10px] text-slate-gray select-none">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-oxford-navy/5 dark:bg-white/5 px-2 py-0.5 rounded-full dark:text-slate-300 text-oxford-navy font-bold">
                        {studentProfile ? `ID: ${studentProfile.id}` : "GUEST VISITOR"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        title={ttsEnabled ? "Disable TTS voice" : "Enable TTS read outloud"}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer ${
                          ttsEnabled ? "text-prestige-gold font-bold" : ""
                        }`}
                      >
                        {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                        <span>Voice Output</span>
                      </button>

                      <button
                        onClick={handleDownloadHistory}
                        title="Download conversation transcripts"
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Save Chat</span>
                      </button>

                      <button
                        onClick={handleClearHistory}
                        title="Clear logs history"
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages Scroll Panel */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 select-text">
                    {messages.map((msg, index) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={index}
                          className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2 max-w-[92%] ${
                            isUser ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          {/* Bot Avatar in message */}
                          {!isUser && (
                            <div className="w-7 h-7 rounded-lg bg-oxford-navy border border-prestige-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                              <Sparkles className="w-3.5 h-3.5 text-prestige-gold" />
                            </div>
                          )}

                          <div className="space-y-1">
                            {/* Speech Bubble */}
                            <div
                              className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed border ${
                                isUser
                                  ? "bg-oxford-navy text-white rounded-tr-none border-oxford-navy"
                                  : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border-outline-variant/30 dark:border-slate-800"
                              }`}
                            >
                              {/* Simple Markdown Formatter inline */}
                              <div className="space-y-1.5 break-words">
                                {msg.text.split("\n").map((line, lIdx) => {
                                  // Bold markdown parse
                                  let formattedLine = line;
                                  
                                  // Bullet points
                                  const isBullet = formattedLine.trim().startsWith("-");
                                  if (isBullet) {
                                    formattedLine = formattedLine.trim().slice(1).trim();
                                  }

                                  // Check for bold matches
                                  const boldRegex = /\*\*(.*?)\*\*/g;
                                  const parts = [];
                                  let lastIndex = 0;
                                  let match;

                                  while ((match = boldRegex.exec(formattedLine)) !== null) {
                                    parts.push(formattedLine.substring(lastIndex, match.index));
                                    parts.push(<strong key={match.index} className="font-bold text-prestige-gold dark:text-amber-400">{match[1]}</strong>);
                                    lastIndex = boldRegex.lastIndex;
                                  }
                                  parts.push(formattedLine.substring(lastIndex));

                                  return (
                                    <p key={lIdx} className={`${isBullet ? "pl-3 flex items-start gap-1.5" : ""}`}>
                                      {isBullet && <span className="text-prestige-gold shrink-0">•</span>}
                                      <span>
                                        {parts.length > 1 ? parts : formattedLine}
                                      </span>
                                    </p>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Timestamp, Copy, rate, audio actions */}
                            <div
                              className={`flex items-center gap-2.5 text-[10px] text-slate-400 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span className="font-mono">{msg.timestamp}</span>

                              {!isUser && msg.text && (
                                <>
                                  <button
                                    onClick={() => handleCopyText(msg.text, index)}
                                    title="Copy text answers"
                                    className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    {copiedIndex === index ? (
                                      <Check className="w-3 h-3 text-green-500 font-bold" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => speakText(msg.text, index)}
                                    title="Listen to response"
                                    className={`hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ${
                                      isSpeaking === index ? "text-prestige-gold animate-bounce" : ""
                                    }`}
                                  >
                                    <Volume2 className="w-3 h-3" />
                                  </button>

                                  <div className="flex items-center gap-1 border-l border-outline-variant/30 dark:border-slate-800 pl-1.5">
                                    <button
                                      onClick={() => handleRateResponse(index, "positive")}
                                      title="Helpful response"
                                      className={`hover:text-green-500 cursor-pointer ${
                                        msg.rating === "positive" ? "text-green-500 font-bold" : ""
                                      }`}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleRateResponse(index, "negative")}
                                      title="Unhelpful response"
                                      className={`hover:text-red-500 cursor-pointer ${
                                        msg.rating === "negative" ? "text-red-500 font-bold" : ""
                                      }`}
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing and processing indicators */}
                    {isTyping && (
                      <div className="flex justify-start items-center gap-2 max-w-[80%]">
                        <div className="w-7 h-7 rounded-lg bg-oxford-navy flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-prestige-gold animate-spin" />
                        </div>
                        <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl rounded-tl-none border border-outline-variant/20 dark:border-slate-800 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 bg-prestige-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-1.5 h-1.5 bg-prestige-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-1.5 h-1.5 bg-prestige-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    )}

                    {/* Sessional System Warning banner if error */}
                    {chatError && (
                      <div className="p-3 bg-red-550/15 text-red-700 dark:text-red-300 rounded-xl border border-red-500/30 text-[11px] flex items-start gap-2 animate-pulse">
                        <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-semibold">Connection Flagged</p>
                          <p>{chatError}</p>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                   {/* Sample Trigger Quick-Suggestions Drawer */}
                   <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-outline-variant/15 dark:border-slate-850 space-y-2">
                     {/* Immediate Option Section */}
                     <div>
                       <span className="text-[9px] font-extrabold text-prestige-gold dark:text-amber-400 flex items-center gap-1 uppercase tracking-wider mb-1 select-none">
                         <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                         ⚡ Immediate Options (No Network Delay)
                       </span>
                       <div className="flex flex-wrap gap-1">
                         {Object.keys(IMMEDIATE_ANSWERS).map((key, idx) => (
                           <button
                             key={idx}
                             onClick={() => handleSendMessage(key)}
                             className="text-[10px] px-2 py-1 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/45 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200/50 dark:border-amber-900/40 font-bold cursor-pointer transition-all text-left flex items-center gap-1 shrink-0"
                           >
                             <span>{key.replace("Instant ", "")}</span>
                           </button>
                         ))}
                       </div>
                     </div>

                     {messages.length < 3 && (
                       <div>
                         <span className="text-[9px] font-bold text-slate-gray block mb-1 uppercase tracking-wider select-none">AI Inquiries</span>
                         <div className="flex flex-wrap gap-1">
                           {sampleTriggers.map((trig, idx) => (
                             <button
                               key={idx}
                               onClick={() => handleSendMessage(trig.query)}
                               className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg border border-outline-variant/15 dark:border-slate-800 font-semibold cursor-pointer transition-colors text-left"
                             >
                               {trig.text}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>

                  {/* Message Input Box Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(inputValue);
                    }}
                    className="p-3 bg-white dark:bg-slate-900 border-t border-outline-variant/20 dark:border-slate-850 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about admissions, fees, grades..."
                      disabled={isTyping}
                      className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-outline-variant/30 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-prestige-gold disabled:opacity-70"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2.5 bg-oxford-navy text-white rounded-xl hover:bg-oxford-navy/95 border border-prestige-gold/25 transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-prestige-gold" />
                    </button>
                  </form>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
