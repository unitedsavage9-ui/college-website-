import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Standard system prompt for the College Assistant
const SYSTEM_INSTRUCTION_BASE = `You are "Dhemaji College AI Secretariat Assistant" — a modern, professional, and friendly virtual assistant of Dhemaji College, Assam (Estd. 1965, NAAC Grade 'A', CGPA 3.12).

Your primary goals are to:
1. Provide accurate, context-aware, sessional, and factual details about Dhemaji College based on the PROVIDED official college knowledge base.
2. Maintain a helpful, conversational, and respectful tone.
3. Keep conversation context across multiple turns of messages.
4. Render your response beautifully in standard Markdown. Use clean headers, bullet lists, custom bolding, tables, or hyperlinks where appropriate.
5. Politely respond that you do not have details when information is unavailable. Never make up or hallucinate any facts.
6. Under no circumstances invent details about sessional grades, fee payments, class rosters, or schedules that are not explicitly present in the provided context or student profile.
`;

// Initial Mock Knowledge Base data
interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: "Academic" | "Admissions" | "Facilities" | "Hostel" | "Accreditation" | "General";
}

const INITIAL_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "doc-1",
    title: "Dhemaji College Profile & Accreditations",
    category: "Accreditation",
    content: "Dhemaji College was established in the year 1965. It is a premier higher educational institution situated in Dhemaji, Assam, India (PIN-787057). It holds an 'A' Grade accreditation by NAAC with a CGPA of 3.12. It is affiliated with Dibrugarh University. The college offers four-year undergraduate programmes (FYUGP), PG programs, PGDCA, BCA, and certifications under diverse departments in Science and Arts streams. The sessional exams comprise 20% of continuous internal evaluation."
  },
  {
    id: "doc-2",
    title: "FYUGP Admissions and Samarth Portal",
    category: "Admissions",
    content: "Admissions for the Four-Year Undergraduate Programme (FYUGP) for the Science and Arts streams are processed online via the Samarth Assam portal (https://assamsamarth.ac.in). Candidates must select Dhemaji College and complete their registration. Sessional evaluation reports and registration verification ledgers are handled by the college sessional controller's office. Hostel seats are allocated based on merit and distance."
  },
  {
    id: "doc-3",
    title: "Sessional Exams & Academics Schedule",
    category: "Academic",
    content: "Sessional assessments are mandatory at Dhemaji College. Sessional examination marks account for 20% of the aggregate semester marks. Students must secure a minimum of 75% attendance to qualify for the end-semester exams conducted by Dibrugarh University. Sessional assessment results, internal marks ledgers, and sessional test schedules are published periodically on the notice board."
  },
  {
    id: "doc-4",
    title: "Hostel Accommodation and Fees",
    category: "Hostel",
    content: "Dhemaji College provides separate safe hostel accommodations for male and female students within the campus grounds. Hostel admission occurs concurrently with academic admission. The hostel fee is approximately INR 8,500 per semester, which covers accommodation, electricity, and standard security. Mess fees are charged separately on a monthly basis depending on the dining options chosen."
  },
  {
    id: "doc-5",
    title: "Central Digital Library",
    category: "Facilities",
    content: "The college houses a central digital library reading room containing more than 40,000 physical volumes, 10+ digital access terminals, and research database subscriptions. Library hours are from 09:30 AM to 04:00 PM, Monday through Saturday. Students must return physical volumes within 14 days to avoid late fees of INR 2 per day."
  }
];

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const INITIAL_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I check my internal sessional marks?",
    answer: "You can check your internal sessional marks directly inside the Secure Student Portal by clicking on the 'Semester Grades' tab and selecting the 'Internal Ledger' modal. Sessional results are verified and updated by sessional course coordinators.",
    category: "Exams"
  },
  {
    id: "faq-2",
    question: "What is the minimum attendance required for Dhemaji College exams?",
    answer: "Students must maintain a minimum of 75% attendance across all registered courses (such as Quantum Mechanics, Electromagnetism, and labs) to be eligible to sit for the sessional and end-semester examinations under Dibrugarh University.",
    category: "Academic"
  },
  {
    id: "faq-3",
    question: "Where can I download my examination Admit Card?",
    answer: "Admit cards for current sessional and end-semester examinations are issued digitally inside the Student Portal's Dashboard area once all tuition fees and exam dues are fully paid.",
    category: "Portal"
  },
  {
    id: "faq-4",
    question: "What should I do if my payment transaction fails?",
    answer: "If your tuition or examination fee transaction fails or is marked pending, please wait 24 hours for reconciliation or contact the College Administrative Secretariat with your Transaction ID, or email principal@dhemajicollege.in.",
    category: "Fees"
  }
];

// In-Memory Databases
let documents = [...INITIAL_DOCUMENTS];
let faqs = [...INITIAL_FAQS];
let blockedUsers: string[] = [];
let errorLogs: { timestamp: string; level: string; message: string; stack?: string }[] = [];
let chatAnalytics = {
  totalConversations: 0,
  totalMessages: 0,
  helpfulRatings: 0,
  unhelpfulRatings: 0,
  totalRatingsCount: 0,
  averageResponseTimeMs: 1150,
  topQueries: [
    { query: "FYUGP Admission on Samarth", count: 24 },
    { query: "How to pay Semester 4 Fees", count: 18 },
    { query: "Check Quantum Mechanics Internal Marks", count: 15 },
    { query: "Minimum attendance rule", count: 12 },
    { query: "Hostel hostel facilities", count: 8 }
  ],
  usageByRole: {
    student: 36,
    guest: 21
  }
};

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

let conversations: ChatSession[] = [];

// Lazy init client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Log errors
function logError(level: string, message: string, error?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${level}] ${timestamp}: ${message}`, error || "");
  errorLogs.unshift({
    timestamp,
    level,
    message,
    stack: error ? error.stack || String(error) : undefined
  });
  if (errorLogs.length > 50) {
    errorLogs.pop();
  }
}

// Smart keyword-based Local Fallback Q&A Engine (when GEMINI_API_KEY is missing or invalid)
function getLocalFallbackAnswer(userMessage: string, contextDocs: string): string {
  const query = userMessage.toLowerCase();
  
  // 1. Check direct FAQ matches
  for (const faq of faqs) {
    if (query.includes(faq.question.toLowerCase()) || faq.question.toLowerCase().split(" ").filter(w => w.length > 4).some(w => query.includes(w))) {
      return `**[Auto-Retrieved FAQ]**\n\n${faq.answer}\n\n*Note: This response was auto-resolved using Dhemaji College FAQ records as the AI engine is currently in local offline mode.*`;
    }
  }

  // 2. Simple keyword-based extraction from context docs
  if (query.includes("admission") || query.includes("apply") || query.includes("samarth")) {
    return `**[Admissions Assistant]**\n\nAdmissions for Dhemaji College's four-year undergraduate programme (FYUGP) are online via the **Samarth Assam portal** (https://assamsamarth.ac.in).\n\nSelect Dhemaji College during your application. Dues can be cleared inside the student dashboard.\n\n*Source: Admissions Brochure*`;
  }
  if (query.includes("attendance") || query.includes("percent") || query.includes("class")) {
    return `**[Academic Regulations]**\n\nAt Dhemaji College, students must maintain a **minimum of 75% attendance** across all registered classes (such as Quantum Mechanics and Electromagnetism) to qualify for sessional assessments and end-semester university examinations.\n\n*Source: Academic Conduct Guide*`;
  }
  if (query.includes("fee") || query.includes("tuition") || query.includes("pay") || query.includes("transaction")) {
    return `**[Finance Support Desk]**\n\nFees can be paid online in the **Student Portal > Fee Transactions** tab. We accept digital UPI, cards, and net banking. For example, Semester IV Tuition Fee is ₹12,500 and Examination Fee is ₹1,500.\n\nIf you experience a failed sessional transaction, please wait 24 hours or contact administration at principal@dhemajicollege.in.\n\n*Source: Registrar Office Notice*`;
  }
  if (query.includes("naac") || query.includes("grade") || query.includes("accreditation") || query.includes("cgpa")) {
    return `**[Quality Assurance Cell]**\n\nDhemaji College is accredited with an **'A' Grade** by the National Assessment and Accreditation Council (**NAAC**), securing a **CGPA of 3.12**.\n\n*Source: IQAC Records*`;
  }
  if (query.includes("hostel") || query.includes("accommodation") || query.includes("boys") || query.includes("girls")) {
    return `**[Student Welfare Cell]**\n\nDhemaji College offers safe hostel quarters for both boys and girls inside the main campus road. Hostel admissions cost **INR 8,500 per semester**, with electricity and security included. Dining mess fees are paid separately monthly.\n\n*Source: Hostel Warden Guidelines*`;
  }
  if (query.includes("library") || query.includes("book") || query.includes("reading")) {
    return `**[Central Digital Library]**\n\nThe central digital library contains **40,000+ volumes** and digital workstations. It is open from **09:30 AM to 04:00 PM**, Monday through Saturday. Books must be returned within 14 days; a ₹2/day fee applies to sessional overdue items.\n\n*Source: Library Rules booklet*`;
  }

  return `Hello! I am Dhemaji College's AI assistant. 
  
Currently, I am operating in **Local Search Mode**. I found references about **Dhemaji College** in my database, but I couldn't find a precise match for your query: "${userMessage}".

Here are some official sessional college details you can ask me about:
- **FYUGP Online Admissions** via Samarth Assam Portal
- **75% Attendance Rule** for exams
- **NAAC Grade 'A'** Accreditation & 3.12 CGPA
- **Tuition & Examination Fees** (Sessional & Semester Dues)
- **Central Library Hours** and reading room policies
- **Hostel Accommodations** for boys & girls

*How can I help you regarding college matters today?*`;
}

// Simple text Search & Retrieval helper (RAG Cosine-like keyword indexer)
function searchKnowledgeBase(queryText: string): string {
  const tokens = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (tokens.length === 0) return "";

  const results: { doc: KnowledgeDocument; score: number }[] = [];
  for (const doc of documents) {
    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();

    for (const token of tokens) {
      if (titleLower.includes(token)) score += 10;
      if (contentLower.includes(token)) score += 2;
    }

    if (score > 0) {
      results.push({ doc, score });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Return formatted contexts (top 3)
  return results.slice(0, 3).map(r => `---
Document: ${r.doc.title} (${r.doc.category})
Content: ${r.doc.content}`).join("\n\n");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body limit up to 10MB to support pasting doc texts easily
  app.use(express.json({ limit: "10mb" }));

  // API 1: HEALTH
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: process.env.GEMINI_API_KEY ? "Gemini Cloud RAG" : "Local Search Engine fallback" });
  });

  // API 2: CHAT (Handles normal & streaming responses with RAG)
  app.post("/api/chat", async (req, res) => {
    const startMs = Date.now();
    const { messages, stream = true, user = { id: "guest", name: "Guest", role: "guest" }, sessionId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const userMessageText = lastMessage.text;

    // Check if user is blocked
    if (blockedUsers.includes(user.id)) {
      res.status(403).json({ error: "Access Denied. Your student ID/IP has been sessional flagged or temporarily blocked by the college administrators." });
      return;
    }

    // Update Analytics Counter
    chatAnalytics.totalMessages += 1;

    // Find or Create Chat Session
    let currentSessionId = sessionId || `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let session = conversations.find(s => s.id === currentSessionId);
    if (!session) {
      chatAnalytics.totalConversations += 1;
      if (user.role === "student") {
        chatAnalytics.usageByRole.student += 1;
      } else {
        chatAnalytics.usageByRole.guest += 1;
      }

      session = {
        id: currentSessionId,
        user: {
          id: user.id || "guest",
          name: user.name || "Guest",
          role: user.role || "guest"
        },
        messages: [],
        timestamp: new Date().toISOString(),
        active: true
      };
      conversations.unshift(session);
    }

    // Append user message to memory history
    session.messages.push({
      role: "user",
      text: userMessageText,
      timestamp: new Date().toISOString()
    });

    // Extract Top Match Grounding Context (RAG)
    const retrievedContext = searchKnowledgeBase(userMessageText);

    // Let's check if we can call the Gemini API
    let geminiError: any = null;
    let geminiClient: GoogleGenAI | null = null;
    try {
      geminiClient = getGeminiClient();
    } catch (e: any) {
      geminiError = e;
    }

    // Assemble the conversation payload for the Gemini SDK format
    // Map previous 8 messages to prevent token bloat
    const geminiContents = messages.slice(-8).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Inject System Instruction with RAG Context
    const activeSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}

OFFICIAL RETRIEVED COLLEGE INFORMATION:
${retrievedContext || "No exact matching documents found in local database. Answer politely using Dhemaji College generic profile or standard regulations."}

ACTIVE STUDENT SESSION PROFILE DETAILS (Grounded Context if applicable):
- Student Name: ${user.name}
- Student ID: ${user.id}
- Account Stream: ${user.role === "student" ? "Registered B.Sc Physics Student" : "Guest / Public Visitor"}
`;

    // 2a. STREAMING CHAT (SSE)
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // If Gemini Key is NOT configured, or throws an error, use our local fallback
      if (geminiError || !geminiClient) {
        logError("WARN", `Gemini API key not found or errored. Swapped to Local Q&A Fallback. Reason: ${geminiError?.message}`);
        const fallbackText = getLocalFallbackAnswer(userMessageText, retrievedContext);
        
        // Simulate real-time streaming chunks for local fallback
        const words = fallbackText.split(" ");
        let currentChunkText = "";
        
        // Write chunks in batches
        for (let i = 0; i < words.length; i += 3) {
          const chunkBatch = words.slice(i, i + 3).join(" ") + " ";
          currentChunkText += chunkBatch;
          res.write(`data: ${JSON.stringify({ text: chunkBatch, sessionId: currentSessionId })}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Save bot answer in session history
        session.messages.push({
          role: "model",
          text: fallbackText,
          timestamp: new Date().toISOString()
        });

        // Record response metrics
        const endMs = Date.now();
        chatAnalytics.averageResponseTimeMs = Math.round((chatAnalytics.averageResponseTimeMs * 9 + (endMs - startMs)) / 10);
        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      }

      try {
        const responseStream = await geminiClient.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: geminiContents as any,
          config: {
            systemInstruction: activeSystemInstruction,
            temperature: 0.3,
            topP: 0.9
          }
        });

        let completeAnswer = "";
        for await (const chunk of responseStream) {
          const chunkText = chunk.text || "";
          completeAnswer += chunkText;
          res.write(`data: ${JSON.stringify({ text: chunkText, sessionId: currentSessionId })}\n\n`);
        }

        // Save in history
        session.messages.push({
          role: "model",
          text: completeAnswer,
          timestamp: new Date().toISOString()
        });

        const endMs = Date.now();
        chatAnalytics.averageResponseTimeMs = Math.round((chatAnalytics.averageResponseTimeMs * 9 + (endMs - startMs)) / 10);
        res.write(`data: [DONE]\n\n`);
        res.end();
      } catch (err: any) {
        logError("ERROR", "Gemini stream generation failed. Triggering fallback.", err);
        const errorText = `⚠️ **Gemini AI Service Error**: ${err?.message || "Internal generation timeout."}\n\nRunning local assistant fallback:\n\n` + getLocalFallbackAnswer(userMessageText, retrievedContext);
        res.write(`data: ${JSON.stringify({ text: errorText, sessionId: currentSessionId })}\n\n`);
        
        // Save in history
        session.messages.push({
          role: "model",
          text: errorText,
          timestamp: new Date().toISOString()
        });

        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    } 
    // 2b. STANDARD HTTP POST CHAT (NON-STREAMING)
    else {
      if (geminiError || !geminiClient) {
        logError("WARN", "Gemini API Key missing/invalid for non-stream. Triggering local fallback.");
        const fallbackText = getLocalFallbackAnswer(userMessageText, retrievedContext);
        session.messages.push({
          role: "model",
          text: fallbackText,
          timestamp: new Date().toISOString()
        });
        const endMs = Date.now();
        chatAnalytics.averageResponseTimeMs = Math.round((chatAnalytics.averageResponseTimeMs * 9 + (endMs - startMs)) / 10);
        res.json({ text: fallbackText, sessionId: currentSessionId });
        return;
      }

      try {
        const response = await geminiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: geminiContents as any,
          config: {
            systemInstruction: activeSystemInstruction,
            temperature: 0.3,
            topP: 0.9
          }
        });

        const answerText = response.text || "I was unable to formulate a response.";
        session.messages.push({
          role: "model",
          text: answerText,
          timestamp: new Date().toISOString()
        });

        const endMs = Date.now();
        chatAnalytics.averageResponseTimeMs = Math.round((chatAnalytics.averageResponseTimeMs * 9 + (endMs - startMs)) / 10);
        res.json({ text: answerText, sessionId: currentSessionId });
      } catch (err: any) {
        logError("ERROR", "Gemini standard generation failed. Swapping to local fallback.", err);
        const fallbackText = getLocalFallbackAnswer(userMessageText, retrievedContext);
        session.messages.push({
          role: "model",
          text: fallbackText,
          timestamp: new Date().toISOString()
        });
        res.json({ text: fallbackText, sessionId: currentSessionId });
      }
    }
  });

  // API 3: GET ADMIN PORTAL DATA (ANALYTICS, SESSIONS, DOCS, FAQS)
  app.get("/api/admin/analytics", (req, res) => {
    res.json({
      chatAnalytics,
      totalBlocked: blockedUsers.length,
      isApiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  });

  app.get("/api/admin/conversations", (req, res) => {
    res.json(conversations);
  });

  // Search chats
  app.get("/api/admin/conversations/search", (req, res) => {
    const q = String(req.query.q || "").toLowerCase();
    if (!q) {
      res.json(conversations);
      return;
    }
    const filtered = conversations.filter(c => 
      c.user.name.toLowerCase().includes(q) || 
      c.user.id.toLowerCase().includes(q) ||
      c.messages.some(m => m.text.toLowerCase().includes(q))
    );
    res.json(filtered);
  });

  app.post("/api/admin/conversations/delete", (req, res) => {
    const { sessionId } = req.body;
    conversations = conversations.filter(c => c.id !== sessionId);
    res.json({ status: "success", message: "Conversation logs deleted." });
  });

  app.post("/api/admin/conversations/rate", (req, res) => {
    const { sessionId, rating } = req.body; // 'positive' or 'negative'
    const sess = conversations.find(c => c.id === sessionId);
    if (sess) {
      const oldRating = sess.rating;
      sess.rating = rating;

      // Adjust analytics counts
      if (oldRating !== rating) {
        if (oldRating === "positive") chatAnalytics.helpfulRatings -= 1;
        if (oldRating === "negative") chatAnalytics.unhelpfulRatings -= 1;

        if (rating === "positive") chatAnalytics.helpfulRatings += 1;
        if (rating === "negative") chatAnalytics.unhelpfulRatings += 1;

        if (!oldRating) chatAnalytics.totalRatingsCount += 1;
      }
    }
    res.json({ status: "success" });
  });

  // Block/Unblock users
  app.post("/api/admin/users/block", (req, res) => {
    const { userId, block } = req.body;
    if (block) {
      if (!blockedUsers.includes(userId)) blockedUsers.push(userId);
    } else {
      blockedUsers = blockedUsers.filter(id => id !== userId);
    }
    res.json({ status: "success", blockedUsers });
  });

  app.get("/api/admin/users/blocked", (req, res) => {
    res.json(blockedUsers);
  });

  // Knowledge Documents CRUD
  app.get("/api/admin/documents", (req, res) => {
    res.json(documents);
  });

  app.post("/api/admin/documents", (req, res) => {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }
    const newDoc: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      title,
      content,
      category
    };
    documents.unshift(newDoc);
    res.json({ status: "success", document: newDoc });
  });

  app.delete("/api/admin/documents/:id", (req, res) => {
    const { id } = req.params;
    documents = documents.filter(d => d.id !== id);
    res.json({ status: "success", id });
  });

  // FAQ CRUD
  app.get("/api/admin/faqs", (req, res) => {
    res.json(faqs);
  });

  app.post("/api/admin/faqs", (req, res) => {
    const { question, answer, category } = req.body;
    if (!question || !answer || !category) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }
    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question,
      answer,
      category
    };
    faqs.unshift(newFaq);
    res.json({ status: "success", faq: newFaq });
  });

  app.delete("/api/admin/faqs/:id", (req, res) => {
    const { id } = req.params;
    faqs = faqs.filter(f => f.id !== id);
    res.json({ status: "success", id });
  });

  // Logs & Performance monitor
  app.get("/api/admin/logs", (req, res) => {
    res.json(errorLogs);
  });

  app.get("/api/admin/performance", (req, res) => {
    // Generate simulated sessional server status metrics
    res.json({
      cpuUsagePercent: Math.floor(Math.random() * 8) + 2,
      memoryUsageMb: Math.floor(Math.random() * 20) + 140,
      activeWsConnections: conversations.filter(c => c.active).length,
      apiLatencyMs: chatAnalytics.averageResponseTimeMs,
      cachedQueriesRatio: 42
    });
  });

  // Vite middleware for development / SPA bundle for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot sessional server.", err);
});
