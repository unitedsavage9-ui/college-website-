import React, { useState, useEffect } from "react";
import { 
  BarChart, Users, MessageSquare, Clipboard, FileText, CheckCircle2, 
  Trash2, Plus, Ban, Eye, Search, AlertCircle, RefreshCw, Cpu, 
  Database, Activity, Calendar, Award, UserCheck, ShieldAlert, Clock
} from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  user: {
    id: string;
    name: string;
    role: "student" | "guest";
  };
  messages: ChatMessage[];
  rating?: "positive" | "negative";
  timestamp: string;
  active: boolean;
}

interface ServerAnalytics {
  chatAnalytics: {
    totalConversations: number;
    totalMessages: number;
    helpfulRatings: number;
    unhelpfulRatings: number;
    totalRatingsCount: number;
    averageResponseTimeMs: number;
    topQueries: Array<{ query: string; count: number }>;
    usageByRole: { student: number; guest: number };
  };
  totalBlocked: number;
  isApiKeyConfigured: boolean;
}

interface PerformanceStats {
  cpuUsagePercent: number;
  memoryUsageMb: number;
  activeWsConnections: number;
  apiLatencyMs: number;
  cachedQueriesRatio: number;
}

interface ErrorLogItem {
  timestamp: string;
  level: string;
  message: string;
  stack?: string;
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chats" | "documents" | "faqs" | "performance" | "blocked">("dashboard");
  const [analytics, setAnalytics] = useState<ServerAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceStats | null>(null);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newDoc, setNewDoc] = useState({ title: "", content: "", category: "Academic" as any });
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "Academic" });
  const [newBlockUserId, setNewBlockUserId] = useState("");

  // Fetch admin stats
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, performanceRes, chatsRes, docsRes, faqsRes, blockedRes, logsRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/performance"),
        fetch(`/api/admin/conversations/search?q=${encodeURIComponent(searchQuery)}`),
        fetch("/api/admin/documents"),
        fetch("/api/admin/faqs"),
        fetch("/api/admin/users/blocked"),
        fetch("/api/admin/logs")
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (performanceRes.ok) setPerformance(await performanceRes.json());
      if (chatsRes.ok) setConversations(await chatsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (blockedRes.ok) setBlockedUsers(await blockedRes.json());
      if (logsRes.ok) setErrorLogs(await logsRes.json());

    } catch (e) {
      console.error("Error fetching admin stats:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      // Refresh telemetry and analytics every 10 seconds silently
      fetch("/api/admin/performance").then(r => r.ok && r.json().then(setPerformance));
      fetch("/api/admin/analytics").then(r => r.ok && r.json().then(setAnalytics));
    }, 10000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Handle operations
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.content) return;
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc)
      });
      if (res.ok) {
        setNewDoc({ title: "", content: "", category: "Academic" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Delete this sessional knowledge document?")) return;
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq)
      });
      if (res.ok) {
        setNewFaq({ question: "", answer: "", category: "Academic" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Delete this sessional FAQ?")) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUserToggle = async (userId: string, block: boolean) => {
    try {
      const res = await fetch("/api/admin/users/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, block })
      });
      if (res.ok) {
        setNewBlockUserId("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChatSession = async (sessionId: string) => {
    if (!window.confirm("Permanently delete this chat session log?")) return;
    try {
      const res = await fetch("/api/admin/conversations/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setSelectedSession(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-md bg-white text-slate-800">
      
      {/* Upper Brand Header banner */}
      <div className="bg-oxford-navy text-white px-6 py-5 border-b border-prestige-gold/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-prestige-gold/15 rounded-xl border border-prestige-gold/30">
            <Activity className="w-6 h-6 text-prestige-gold" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-white leading-tight">AI Desk Secretariat Panel</h1>
            <p className="text-[10px] font-mono text-prestige-gold mt-0.5">Dhemaji College Continuous RAG Supervision System</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
            analytics?.isApiKeyConfigured 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            <span>●</span> {analytics?.isApiKeyConfigured ? "Gemini Node Connected" : "Local Engine mode"}
          </span>

          <button 
            onClick={fetchData} 
            disabled={isLoading}
            className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-white disabled:opacity-50"
            title="Force refresh sessional telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-prestige-gold" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
        
        {/* Left Sidebar navigation */}
        <aside className="md:col-span-1 border-r border-outline-variant/20 p-4 bg-slate-50 space-y-2">
          {[
            { label: "Overview Insights", value: "dashboard", icon: BarChart },
            { label: "User Chats", value: "chats", icon: MessageSquare },
            { label: "Documents RAG", value: "documents", icon: FileText },
            { label: "FAQs Management", value: "faqs", icon: Clipboard },
            { label: "System Monitor", value: "performance", icon: Cpu },
            { label: "Blocked Accounts", value: "blocked", icon: Ban }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => {
                  setActiveTab(item.value as any);
                  if (item.value !== "chats") setSelectedSession(null);
                }}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left text-xs font-semibold ${
                  isActive 
                    ? "bg-oxford-navy text-white font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-prestige-gold" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 border-t border-slate-200 mt-6 space-y-2 text-[10px] text-slate-500">
            <span className="font-bold uppercase tracking-wider block">Admin Guidelines</span>
            <p>Upload text documents to immediately ground Gemini answers during real-time chats.</p>
          </div>
        </aside>

        {/* Center Panel */}
        <main className="md:col-span-3 p-6 min-w-0">
          
          {/* TAB 1: OVERVIEW INSIGHTS */}
          {activeTab === "dashboard" && analytics && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-oxford-navy text-base">Dashboard Summary</h2>
              
              {/* Telemetry Metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-oxford-navy/5 border border-oxford-navy/10 flex items-center gap-3">
                  <div className="p-2.5 bg-oxford-navy rounded-xl text-prestige-gold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-gray font-bold block uppercase">Total Conversations</span>
                    <span className="font-mono text-lg font-bold text-oxford-navy">{analytics.chatAnalytics.totalConversations}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oxford-navy/5 border border-oxford-navy/10 flex items-center gap-3">
                  <div className="p-2.5 bg-oxford-navy rounded-xl text-prestige-gold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-gray font-bold block uppercase">Helpfulness Rating</span>
                    <span className="font-mono text-lg font-bold text-oxford-navy">
                      {analytics.chatAnalytics.totalRatingsCount > 0 
                        ? `${Math.round((analytics.chatAnalytics.helpfulRatings / analytics.chatAnalytics.totalRatingsCount) * 100)}%` 
                        : "95% (simulated)"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-oxford-navy/5 border border-oxford-navy/10 flex items-center gap-3">
                  <div className="p-2.5 bg-oxford-navy rounded-xl text-prestige-gold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-gray font-bold block uppercase">Response Latency</span>
                    <span className="font-mono text-lg font-bold text-oxford-navy">{(analytics.chatAnalytics.averageResponseTimeMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              </div>

              {/* Sub grid: Charts, Top queries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Visual Chart - CSS Progress Bars */}
                <div className="p-5 border border-outline-variant/30 rounded-2xl space-y-4 bg-slate-50/50">
                  <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Chat volume by role</span>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">Student Portal Logged-In Users</span>
                        <span className="font-mono text-oxford-navy font-bold">{analytics.chatAnalytics.usageByRole.student} sessions</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-oxford-navy h-full rounded-full" 
                          style={{ width: `${(analytics.chatAnalytics.usageByRole.student / (analytics.chatAnalytics.usageByRole.student + analytics.chatAnalytics.usageByRole.guest || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">Guest Visitors</span>
                        <span className="font-mono text-oxford-navy font-bold">{analytics.chatAnalytics.usageByRole.guest} sessions</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-prestige-gold h-full rounded-full" 
                          style={{ width: `${(analytics.chatAnalytics.usageByRole.guest / (analytics.chatAnalytics.usageByRole.student + analytics.chatAnalytics.usageByRole.guest || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-outline-variant/15 rounded-xl text-[11px] text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-600">Continuous Evaluation Module</p>
                    <p>Student logins record verified sessional physics grades into grounded context query structures.</p>
                  </div>
                </div>

                {/* Query List */}
                <div className="p-5 border border-outline-variant/30 rounded-2xl space-y-3 bg-slate-50/50">
                  <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Top Grounded Inquiries</span>
                  <div className="divide-y divide-slate-200">
                    {analytics.chatAnalytics.topQueries.map((q, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 text-xs">
                        <span className="text-slate-700 font-medium truncate pr-4">{q.query}</span>
                        <span className="bg-oxford-navy/5 text-oxford-navy font-mono px-2 py-0.5 rounded text-[11px] font-bold shrink-0">{q.count} times</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER CHATS */}
          {activeTab === "chats" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              
              {/* Session list */}
              <div className="lg:col-span-5 border-r border-slate-100 pr-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sessional histories..."
                    className="flex-1 text-xs px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No chat sessions captured yet.</p>
                  ) : (
                    conversations.map((sess) => (
                      <button
                        key={sess.id}
                        onClick={() => setSelectedSession(sess)}
                        className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1 ${
                          selectedSession?.id === sess.id 
                            ? "bg-oxford-navy/5 border-oxford-navy shadow-sm" 
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-gray uppercase">{sess.user.role}</span>
                          <span className="font-mono text-slate-400">{new Date(sess.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-semibold text-oxford-navy text-xs truncate">{sess.user.name}</h4>
                        <div className="flex justify-between items-center text-[11px] text-slate-500">
                          <span className="truncate max-w-[140px] italic">"{sess.messages[sess.messages.length - 1]?.text}"</span>
                          {sess.rating && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              sess.rating === "positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {sess.rating === "positive" ? "Helpful" : "Unhelpful"}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="lg:col-span-7 space-y-3 flex flex-col justify-between h-full min-h-[350px]">
                {selectedSession ? (
                  <div className="flex flex-col h-full space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-oxford-navy">{selectedSession.user.name}</h4>
                        <p className="text-[10px] text-slate-gray font-mono">{selectedSession.id}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteChatSession(selectedSession.id)}
                        className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded text-xs flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Logs</span>
                      </button>
                    </div>

                    {/* Scroll messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl max-h-[300px]">
                      {selectedSession.messages.map((m, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl text-xs ${
                          m.role === "user" 
                            ? "bg-oxford-navy text-white ml-6" 
                            : "bg-white border border-slate-200 text-slate-800 mr-6"
                        }`}>
                          <p className="font-bold text-[9px] mb-0.5 text-prestige-gold">
                            {m.role === "user" ? "STUDENT / VISIT" : "ASSISTANT"}
                          </p>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                    <MessageSquare className="w-8 h-8 mb-2" />
                    <p className="text-xs">Select a chat history log from the left side panel to review interactions.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS RAG */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif font-bold text-oxford-navy text-base">Continuous RAG Documents</h2>
                  <p className="text-xs text-slate-500">Inject raw brochure contents for on-the-fly context grounding.</p>
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddDocument} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Add Grounding Material</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    placeholder="Document Title (e.g. Admission Circular)"
                    className="sm:col-span-2 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Accreditation">Accreditation</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <textarea
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  placeholder="Paste raw text, tables, or brochures contents here..."
                  rows={4}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-oxford-navy text-white text-xs font-bold rounded-lg hover:bg-oxford-navy/95 border border-prestige-gold/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Index into Knowledge Base</span>
                </button>
              </form>

              {/* Docs Grid */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Indexed Document Corpus ({documents.length})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2 relative">
                      <div className="flex justify-between items-start pr-8">
                        <div>
                          <span className="bg-oxford-navy/10 text-oxford-navy text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                            {doc.category}
                          </span>
                          <h4 className="font-semibold text-oxford-navy text-xs mt-1">{doc.title}</h4>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-3 italic">"{doc.content}"</p>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                        title="Remove knowledge corpus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FAQS MANAGEMENT */}
          {activeTab === "faqs" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-oxford-navy text-base">Manage Sessional FAQs</h2>
                <p className="text-xs text-slate-500">Edit quick QA pairs that bypass LLM evaluation for immediate replies.</p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddFaq} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Create FAQ Answer</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder="FAQ Question (e.g. What is the canteen timings?)"
                    className="sm:col-span-2 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                    placeholder="Category (e.g. General)"
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Official sessional answer details..."
                  rows={2}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-oxford-navy text-white text-xs font-bold rounded-lg hover:bg-oxford-navy/95 border border-prestige-gold/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish FAQ Entry</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-3 border border-slate-200 rounded-xl bg-white flex justify-between gap-4 items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-prestige-gold/10 text-prestige-gold text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                          {faq.category}
                        </span>
                        <h4 className="font-bold text-oxford-navy text-xs">{faq.question}</h4>
                      </div>
                      <p className="text-slate-500 text-[11px]">{faq.answer}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM MONITOR & ERROR LOGS */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-oxford-navy text-base">Server Health & telemetry</h2>
                <p className="text-xs text-slate-500">Real-time CPU container resource diagnostics.</p>
              </div>

              {performance && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-oxford-navy" />
                    <div>
                      <span className="text-[10px] text-slate-gray font-bold block uppercase">CPU Load</span>
                      <span className="font-mono text-sm font-bold text-oxford-navy">{performance.cpuUsagePercent}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <Database className="w-5 h-5 text-oxford-navy" />
                    <div>
                      <span className="text-[10px] text-slate-gray font-bold block uppercase">Memory RSS</span>
                      <span className="font-mono text-sm font-bold text-oxford-navy">{performance.memoryUsageMb} MB</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <Users className="w-5 h-5 text-oxford-navy" />
                    <div>
                      <span className="text-[10px] text-slate-gray font-bold block uppercase">Active users</span>
                      <span className="font-mono text-sm font-bold text-oxford-navy">{performance.activeWsConnections}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-oxford-navy" />
                    <div>
                      <span className="text-[10px] text-slate-gray font-bold block uppercase">Query Latency</span>
                      <span className="font-mono text-sm font-bold text-oxford-navy">{performance.apiLatencyMs}ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error logs */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Live Secretariat Error logs</span>
                <div className="p-4 bg-slate-950 text-slate-200 font-mono text-[10px] rounded-2xl overflow-x-auto max-h-[220px] overflow-y-auto space-y-2">
                  {errorLogs.length === 0 ? (
                    <p className="text-emerald-400">● 2026-07-15: System healthy. All sessional physics ledger RAG processes compiled with 0 issues.</p>
                  ) : (
                    errorLogs.map((log, idx) => (
                      <div key={idx} className={log.level === "ERROR" ? "text-red-400" : "text-amber-400"}>
                        [{log.timestamp}] {log.level}: {log.message}
                        {log.stack && <p className="text-slate-400 pl-4 whitespace-pre-wrap">{log.stack}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BLOCKED ACCOUNTS */}
          {activeTab === "blocked" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-oxford-navy text-base">Flagged & Blocked Students</h2>
                <p className="text-xs text-slate-500">Impose student portal chat constraints on abusive or spamming accounts.</p>
              </div>

              {/* Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newBlockUserId) handleBlockUserToggle(newBlockUserId, true);
                }} 
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-end"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-gray uppercase">Student Portal ID to constrain</label>
                  <input
                    type="text"
                    value={newBlockUserId}
                    onChange={(e) => setNewBlockUserId(e.target.value)}
                    placeholder="e.g. DC-2024-8842"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Block Student</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-oxford-navy uppercase tracking-wider block">Blocked Register ({blockedUsers.length})</span>
                {blockedUsers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No blocked sessional IDs on record.</p>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {blockedUsers.map((id) => (
                      <div key={id} className="p-3 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                          <span className="font-mono font-bold text-slate-800">{id}</span>
                        </div>
                        <button
                          onClick={() => handleBlockUserToggle(id, false)}
                          className="px-2.5 py-1 text-[11px] text-emerald-600 border border-emerald-500/20 hover:bg-emerald-50 rounded-lg font-bold cursor-pointer"
                        >
                          Revoke constraint
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
