import React, { useState, useEffect } from "react";
import { 
  BarChart, Users, MessageSquare, Clipboard, FileText, CheckCircle2, 
  Trash2, Plus, Ban, Eye, Search, AlertCircle, RefreshCw, Cpu, 
  Database, Activity, Calendar, Award, UserCheck, ShieldAlert, Clock,
  Lock, Mail, Shield, ChevronRight, Edit3, PlusCircle, Check, FileSpreadsheet,
  Layers, GraduationCap, FileCheck, HelpCircle, AlertTriangle, BookOpen
} from "lucide-react";

// Types corresponding to Backend API
interface Department {
  id: string;
  name: string;
  hod: string;
  facultyMembers: string[];
  coursesOffered: string[];
  laboratories: string[];
  research: string;
  contactDetails: string;
  officeTiming: string;
  description: string;
  photos: string[];
  pdfLinks: string[];
}

interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  pdf: string;
  deadline?: string;
}

interface AdmissionDetail {
  id: string;
  name: string;
  eligibility: string;
  fees: string;
  documents: string[];
  applicationDates: string;
  meritListUrl?: string;
  importantLinks: { label: string; url: string }[];
}

interface ExaminationDetail {
  id: string;
  name: string;
  routine: string;
  results: string;
  admitCards: string;
  internalExams: string;
  semesterExams: string;
}

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  qualification: string;
  designation: string;
  email: string;
  phone: string;
  office: string;
}

interface StudentService {
  id: string;
  name: string;
  description: string;
  details: string;
}

interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  category: "Working Days" | "Holidays" | "Government Holidays" | "Restricted Holidays" | "Academic Events" | "Examination Schedule" | "Admission Schedule" | "Orientation" | "Freshers" | "Seminars" | "Workshops" | "Conferences" | "Festivals" | "Vacation" | "Internal Assessments" | "Practical Exams" | "University Events" | string;
  date: string;
  startTime?: string;
  endTime?: string;
  department?: string;
  venue: string;
  pdfAttachment?: string;
  organizer: string;
  status: "Upcoming" | "Ongoing" | "Completed" | string;
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

export default function AdminPortal() {
  // Authentication states
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("dc_admin_token"));
  const [authRole, setAuthRole] = useState<string | null>(localStorage.getItem("dc_admin_role"));
  const [authName, setAuthName] = useState<string | null>(localStorage.getItem("dc_admin_name"));
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"Admin" | "Faculty" | "Staff">("Admin");
  const [loginError, setLoginError] = useState<string | null>(null);

  // General dashboard navigation
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "departments" | "faculty" | "notices" | "admissions" | "examinations" | "services" | "events" | "chats" | "blocked" | "import" | "performance"
  >("dashboard");

  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  
  // Database entity lists
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionDetail[]>([]);
  const [examinations, setExaminations] = useState<ExaminationDetail[]>([]);
  const [services, setServices] = useState<StudentService[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD Editing states
  const [editingId, setEditingId] = useState<string | null>(null);

  // Entity modal Form states
  const [deptForm, setDeptForm] = useState({
    name: "", hod: "", facultyMembers: "", coursesOffered: "", laboratories: "",
    research: "", contactDetails: "", officeTiming: "", description: "", photos: "", pdfLinks: ""
  });
  
  const [facultyForm, setFacultyForm] = useState({
    name: "", department: "Physics", qualification: "", designation: "Assistant Professor", email: "", phone: "", office: ""
  });

  const [noticeForm, setNoticeForm] = useState({
    title: "", description: "", date: "", category: "General", pdf: "", deadline: ""
  });

  const [admissionForm, setAdmissionForm] = useState({
    name: "", eligibility: "", fees: "", documents: "", applicationDates: "", meritListUrl: "", importantLinks: ""
  });

  const [examForm, setExamForm] = useState({
    name: "", routine: "", results: "", admitCards: "", internalExams: "", semesterExams: ""
  });

  const [serviceForm, setServiceForm] = useState({
    name: "", description: "", details: ""
  });

  const [eventForm, setEventForm] = useState({
    title: "", description: "", category: "Academic Events", date: "", startTime: "", endTime: "", department: "", venue: "", pdfAttachment: "", organizer: "", status: "Upcoming"
  });

  const [blockUserId, setBlockUserId] = useState("");

  // Bulk Import forms
  const [importTable, setImportTable] = useState<"departments" | "notices" | "faculty" | "events">("departments");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  // Reset notifications helper
  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Verify Role restrictions if selected role differs
      if (data.role !== loginRole) {
        throw new Error(`Your institutional credentials correspond to role '${data.role}', not '${loginRole}'.`);
      }

      // Store Auth context
      setAuthToken(data.token);
      setAuthRole(data.role);
      setAuthName(data.name);
      localStorage.setItem("dc_admin_token", data.token);
      localStorage.setItem("dc_admin_role", data.role);
      localStorage.setItem("dc_admin_name", data.name);
      showNotification(`Welcome back, ${data.name}! Login secured.`);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setAuthToken(null);
    setAuthRole(null);
    setAuthName(null);
    localStorage.removeItem("dc_admin_token");
    localStorage.removeItem("dc_admin_role");
    localStorage.removeItem("dc_admin_name");
  };

  // Fetch all tables from dynamic backend database
  const fetchAllDatabaseTables = async () => {
    try {
      const headers = authToken ? { "Authorization": `Bearer ${authToken}` } : {};
      
      const [
        deptsRes, facRes, noticesRes, admRes, examsRes, servsRes, eventsRes,
        blockedRes, analyticsRes, performanceRes, chatsRes, logsRes
      ] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/faculty"),
        fetch("/api/admin/notices"),
        fetch("/api/admin/admissions"),
        fetch("/api/admin/examinations"),
        fetch("/api/admin/services"),
        fetch("/api/admin/events"),
        fetch("/api/admin/users/blocked"),
        fetch("/api/admin/analytics"),
        fetch("/api/admin/performance"),
        fetch(`/api/admin/conversations/search?q=${encodeURIComponent(searchQuery)}`),
        fetch("/api/admin/logs")
      ]);

      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (facRes.ok) setFaculty(await facRes.json());
      if (noticesRes.ok) setNotices(await noticesRes.json());
      if (admRes.ok) setAdmissions(await admRes.json());
      if (examsRes.ok) setExaminations(await examsRes.json());
      if (servsRes.ok) setServices(await servsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (blockedRes.ok) setBlockedUsers(await blockedRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (performanceRes.ok) setPerformance(await performanceRes.json());
      if (chatsRes.ok) setConversations(await chatsRes.json());
      if (logsRes.ok) setErrorLogs(await logsRes.json());

    } catch (err) {
      console.error("Failed to retrieve dynamic database records:", err);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchAllDatabaseTables();
    }
  }, [authToken, searchQuery, activeTab]);

  // Telemetry refresh loop
  useEffect(() => {
    if (!authToken) return;
    const interval = setInterval(() => {
      fetch("/api/admin/performance")
        .then(r => r.ok && r.json().then(setPerformance))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [authToken]);

  // API Call helper under authentication protection
  const executeSecureAction = async (endpoint: string, method: "POST" | "DELETE" | "PUT", body?: any) => {
    if (!authToken) {
      alert("Session expired. Please log in again.");
      return null;
    }

    try {
      setIsLoading(true);
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Execution failed.");
      }
      return data;
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 1. DEPARTMENT OPERATIONS
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingId || undefined,
      name: deptForm.name,
      hod: deptForm.hod,
      facultyMembers: deptForm.facultyMembers.split(";").map(x => x.trim()).filter(Boolean),
      coursesOffered: deptForm.coursesOffered.split(";").map(x => x.trim()).filter(Boolean),
      laboratories: deptForm.laboratories.split(";").map(x => x.trim()).filter(Boolean),
      research: deptForm.research,
      contactDetails: deptForm.contactDetails,
      officeTiming: deptForm.officeTiming,
      description: deptForm.description,
      photos: deptForm.photos.split(";").map(x => x.trim()).filter(Boolean),
      pdfLinks: deptForm.pdfLinks.split(";").map(x => x.trim()).filter(Boolean)
    };

    const res = await executeSecureAction("/api/admin/departments", "POST", payload);
    if (res) {
      setDeptForm({
        name: "", hod: "", facultyMembers: "", coursesOffered: "", laboratories: "",
        research: "", contactDetails: "", officeTiming: "", description: "", photos: "", pdfLinks: ""
      });
      setEditingId(null);
      showNotification("Department record indexed successfully!");
      fetchAllDatabaseTables();
    }
  };

  const handleEditDept = (dept: Department) => {
    setEditingId(dept.id);
    setDeptForm({
      name: dept.name,
      hod: dept.hod,
      facultyMembers: dept.facultyMembers.join("; "),
      coursesOffered: dept.coursesOffered.join("; "),
      laboratories: dept.laboratories.join("; "),
      research: dept.research,
      contactDetails: dept.contactDetails,
      officeTiming: dept.officeTiming,
      description: dept.description,
      photos: dept.photos.join("; "),
      pdfLinks: dept.pdfLinks.join("; ")
    });
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    const res = await executeSecureAction(`/api/admin/departments/${id}`, "DELETE");
    if (res) {
      showNotification("Department record deleted.");
      fetchAllDatabaseTables();
    }
  };

  // 2. FACULTY OPERATIONS
  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: editingId || undefined, ...facultyForm };
    const res = await executeSecureAction("/api/admin/faculty", "POST", payload);
    if (res) {
      setFacultyForm({ name: "", department: "Physics", qualification: "", designation: "Assistant Professor", email: "", phone: "", office: "" });
      setEditingId(null);
      showNotification("Faculty profile synchronized successfully!");
      fetchAllDatabaseTables();
    }
  };

  const handleEditFaculty = (fac: FacultyMember) => {
    setEditingId(fac.id);
    setFacultyForm({
      name: fac.name,
      department: fac.department,
      qualification: fac.qualification,
      designation: fac.designation,
      email: fac.email,
      phone: fac.phone,
      office: fac.office
    });
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm("Remove this faculty profile?")) return;
    const res = await executeSecureAction(`/api/admin/faculty/${id}`, "DELETE");
    if (res) {
      showNotification("Faculty profile removed.");
      fetchAllDatabaseTables();
    }
  };

  // 3. NOTICE OPERATIONS
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: editingId || undefined, ...noticeForm };
    const res = await executeSecureAction("/api/admin/notices", "POST", payload);
    if (res) {
      setNoticeForm({ title: "", description: "", date: "", category: "General", pdf: "", deadline: "" });
      setEditingId(null);
      showNotification("Institution Notice published!");
      fetchAllDatabaseTables();
    }
  };

  const handleEditNotice = (n: Notice) => {
    setEditingId(n.id);
    setNoticeForm({
      title: n.title,
      description: n.description,
      date: n.date,
      category: n.category,
      pdf: n.pdf,
      deadline: n.deadline || ""
    });
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm("Retract this notice circular?")) return;
    const res = await executeSecureAction(`/api/admin/notices/${id}`, "DELETE");
    if (res) {
      showNotification("Notice retracted.");
      fetchAllDatabaseTables();
    }
  };

  // 4. ADMISSIONS OPERATIONS
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLinks = admissionForm.importantLinks.split(";").map(chunk => {
      const parts = chunk.split("|");
      return { label: parts[0]?.trim() || "Link", url: parts[1]?.trim() || "" };
    }).filter(l => l.url);

    const payload = {
      id: editingId || undefined,
      name: admissionForm.name,
      eligibility: admissionForm.eligibility,
      fees: admissionForm.fees,
      documents: admissionForm.documents.split(";").map(x => x.trim()).filter(Boolean),
      applicationDates: admissionForm.applicationDates,
      meritListUrl: admissionForm.meritListUrl || undefined,
      importantLinks: parsedLinks
    };

    const res = await executeSecureAction("/api/admin/admissions", "POST", payload);
    if (res) {
      setAdmissionForm({ name: "", eligibility: "", fees: "", documents: "", applicationDates: "", meritListUrl: "", importantLinks: "" });
      setEditingId(null);
      showNotification("Admission guidelines cataloged.");
      fetchAllDatabaseTables();
    }
  };

  const handleEditAdmission = (adm: AdmissionDetail) => {
    setEditingId(adm.id);
    setAdmissionForm({
      name: adm.name,
      eligibility: adm.eligibility,
      fees: adm.fees,
      documents: adm.documents.join("; "),
      applicationDates: adm.applicationDates,
      meritListUrl: adm.meritListUrl || "",
      importantLinks: adm.importantLinks.map(l => `${l.label}|${l.url}`).join("; ")
    });
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm("Remove this admission guideline?")) return;
    const res = await executeSecureAction(`/api/admin/admissions/${id}`, "DELETE");
    if (res) {
      showNotification("Admission guideline removed.");
      fetchAllDatabaseTables();
    }
  };

  // 5. EXAMINATIONS OPERATIONS
  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: editingId || undefined, ...examForm };
    const res = await executeSecureAction("/api/admin/examinations", "POST", payload);
    if (res) {
      setExamForm({ name: "", routine: "", results: "", admitCards: "", internalExams: "", semesterExams: "" });
      setEditingId(null);
      showNotification("Examination framework configured.");
      fetchAllDatabaseTables();
    }
  };

  const handleEditExam = (exam: ExaminationDetail) => {
    setEditingId(exam.id);
    setExamForm({
      name: exam.name,
      routine: exam.routine,
      results: exam.results,
      admitCards: exam.admitCards,
      internalExams: exam.internalExams,
      semesterExams: exam.semesterExams
    });
  };

  const handleDeleteExam = async (id: string) => {
    if (!window.confirm("Remove this examination category?")) return;
    const res = await executeSecureAction(`/api/admin/examinations/${id}`, "DELETE");
    if (res) {
      showNotification("Examination record removed.");
      fetchAllDatabaseTables();
    }
  };

  // 6. STUDENT SERVICES OPERATIONS
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: editingId || undefined, ...serviceForm };
    const res = await executeSecureAction("/api/admin/services", "POST", payload);
    if (res) {
      setServiceForm({ name: "", description: "", details: "" });
      setEditingId(null);
      showNotification("Student service cataloged.");
      fetchAllDatabaseTables();
    }
  };

  const handleEditService = (serv: StudentService) => {
    setEditingId(serv.id);
    setServiceForm({
      name: serv.name,
      description: serv.description,
      details: serv.details
    });
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Delete this student service record?")) return;
    const res = await executeSecureAction(`/api/admin/services/${id}`, "DELETE");
    if (res) {
      showNotification("Student service record deleted.");
      fetchAllDatabaseTables();
    }
  };

  // 7. ACADEMIC CALENDAR & EVENTS OPERATIONS
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: editingId || undefined, ...eventForm };
    const res = await executeSecureAction("/api/admin/events", "POST", payload);
    if (res) {
      setEventForm({
        title: "", description: "", category: "Academic Events", date: "", startTime: "", endTime: "", department: "", venue: "", pdfAttachment: "", organizer: "", status: "Upcoming"
      });
      setEditingId(null);
      showNotification("Calendar event added to scheduler.");
      fetchAllDatabaseTables();
    }
  };

  const handleEditEvent = (ev: AcademicEvent) => {
    setEditingId(ev.id);
    setEventForm({
      title: ev.title,
      description: ev.description,
      category: ev.category,
      date: ev.date,
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      department: ev.department || "",
      venue: ev.venue,
      pdfAttachment: ev.pdfAttachment || "",
      organizer: ev.organizer,
      status: ev.status
    });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Cancel this calendar event?")) return;
    const res = await executeSecureAction(`/api/admin/events/${id}`, "DELETE");
    if (res) {
      showNotification("Calendar event canceled.");
      fetchAllDatabaseTables();
    }
  };

  // 8. CONSTRAINTS (BLOCKING USERS)
  const handleBlockToggle = async (userId: string, shouldBlock: boolean) => {
    const res = await executeSecureAction("/api/admin/users/block", "POST", { userId, block: shouldBlock });
    if (res) {
      setBlockUserId("");
      showNotification(shouldBlock ? "Student portal ID blocked from AI desk." : "Student portal ID unblocked.");
      fetchAllDatabaseTables();
    }
  };

  // 9. BULK EXCEL/CSV IMPORT PARSER
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);

    if (!importText.trim()) {
      setImportError("Please paste some valid CSV rows to parse.");
      return;
    }

    try {
      const lines = importText.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV must include at least 1 Header row and 1 Data row.");
      }

      // Read Header Row
      const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
      const parsedRows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // CSV Regex to handle quotes and commas safely
        const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
        const values = matches.map(v => v.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n"));
        
        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header] = values[idx] || "";
        });
        parsedRows.push(rowObj);
      }

      const res = await executeSecureAction("/api/admin/import", "POST", { table: importTable, data: parsedRows });
      if (res) {
        setImportText("");
        showNotification(`Bulk upload complete! ${parsedRows.length} rows integrated.`);
        fetchAllDatabaseTables();
      }
    } catch (err: any) {
      setImportError(err.message || "CSV parse error. Ensure standard column comma format.");
    }
  };

  // Chat conversation delete
  const handleDeleteChatLog = async (sid: string) => {
    if (!window.confirm("Permanently wipe session conversation logs?")) return;
    const res = await executeSecureAction("/api/admin/conversations/delete", "POST", { sessionId: sid });
    if (res) {
      setSelectedSession(null);
      showNotification("Conversation log purged from secretariat memory.");
      fetchAllDatabaseTables();
    }
  };


  // ---------------- UI RENDERING ROUTINE ----------------

  if (!authToken) {
    // SECURITY LOGIN INTERCEPTOR VIEW
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-800">
        <div className="bg-slate-900 text-white px-6 py-8 text-center select-none border-b border-yellow-500/20">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 mb-3">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="font-serif font-bold text-xl text-white">AI Secretariat Portal</h1>
          <p className="text-[11px] font-mono text-amber-400 uppercase mt-1 tracking-widest">Institutional Verification Node</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Institutional Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Admin", "Faculty", "Staff"] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setLoginRole(role)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                    loginRole === role 
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Institutional Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="e.g. admin@dhemajicollege.edu.in"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Institutional Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Institutional password key"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all shadow cursor-pointer border border-yellow-500/20 disabled:opacity-50"
          >
            {isLoading ? "Validating security token..." : "Authenticate Workspace Access"}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
            <p>Institutional Staff credentials are secured under AES-256 RAG standard encryption.</p>
          </div>
        </form>
      </div>
    );
  }

  // SECURE WORKSPACE MANAGER UI VIEW
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg text-slate-800">
      
      {/* SUCCESS POPUP ALERT NOTIFICATION */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl border border-amber-500/30 flex items-center gap-2.5 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Brand Header Banner */}
      <div className="bg-slate-950 text-white px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none border-b border-amber-500/25">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base text-white">AI Desk Administrative Secretariat</h1>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                Role: {authRole}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Active Session: {authName} | Database Mode: Local JSON</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="animate-pulse">●</span> Server Synchronized
          </span>

          <button 
            onClick={handleLogout}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Lock Terminal
          </button>
        </div>
      </div>

      {/* Sidebar Navigation & Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Sidebar navigation */}
        <aside className="lg:col-span-3 border-r border-slate-200 p-4 bg-slate-50 space-y-1.5 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3 block mb-1">Operational Views</span>
          
          {[
            { label: "Overview Insights", value: "dashboard", icon: BarChart },
            { label: "Academic Departments", value: "departments", icon: Layers },
            { label: "Faculty Directory", value: "faculty", icon: Users },
            { label: "Circular Notices", value: "notices", icon: FileText },
            { label: "Admission Guidelines", value: "admissions", icon: GraduationCap },
            { label: "Examinations Setup", value: "examinations", icon: FileCheck },
            { label: "Student Services", value: "services", icon: BookOpen },
            { label: "Academic Calendar", value: "events", icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => { setActiveTab(item.value as any); setEditingId(null); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-all cursor-pointer text-left text-xs font-semibold ${
                  isActive 
                    ? "bg-slate-900 text-white font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3 block mt-4 mb-1">Tools & Security</span>

          {[
            { label: "User Chat History", value: "chats", icon: MessageSquare },
            { label: "Flagged Accounts", value: "blocked", icon: Ban },
            { label: "Bulk Excel/CSV Import", value: "import", icon: FileSpreadsheet },
            { label: "System Monitor", value: "performance", icon: Cpu }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => { setActiveTab(item.value as any); setEditingId(null); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-all cursor-pointer text-left text-xs font-semibold ${
                  isActive 
                    ? "bg-slate-900 text-white font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-6 border-t border-slate-200 mt-6 space-y-2 text-[10px] text-slate-500 pl-2">
            <span className="font-bold uppercase tracking-wider block text-slate-700">Dynamic Updating</span>
            <p className="leading-relaxed">All changes submitted to this panel persist to <code>db.json</code> on the server-side, immediately updating the sessional AI RAG chatbot logic without any redeployments.</p>
          </div>
        </aside>

        {/* Center Panel Work Area */}
        <main className="lg:col-span-9 p-6 min-w-0">
          
          {/* TAB 1: OVERVIEW INSIGHTS */}
          {activeTab === "dashboard" && analytics && (
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-slate-900 text-lg">Administrative Summary</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-xl text-amber-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Conversations</span>
                    <span className="font-mono text-base font-bold text-slate-900">{analytics.chatAnalytics.totalConversations}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-xl text-amber-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Helpful Ratings</span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      {analytics.chatAnalytics.helpfulRatings} positive / {analytics.chatAnalytics.unhelpfulRatings} negative
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-xl text-amber-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Response Latency</span>
                    <span className="font-mono text-base font-bold text-slate-900">{analytics.chatAnalytics.averageResponseTimeMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Counts Breakdown metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                <div className="text-center py-2">
                  <span className="text-xl font-bold text-slate-950 font-mono">{departments.length}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Departments</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-xl font-bold text-slate-950 font-mono">{faculty.length}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Faculty members</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-xl font-bold text-slate-950 font-mono">{notices.length}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Notices</span>
                </div>
                <div className="text-center py-2">
                  <span className="text-xl font-bold text-slate-950 font-mono">{events.length}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Calendar Events</span>
                </div>
              </div>

              {/* Sub grid: Charts, Top queries */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Visual Chart - CSS Progress Bars */}
                <div className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Chat Volume Role Share</span>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">Student Portal Logged Users</span>
                        <span className="font-mono text-slate-900 font-bold">{analytics.chatAnalytics.usageByRole.student} sessions</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-900 h-full rounded-full" 
                          style={{ width: `${(analytics.chatAnalytics.usageByRole.student / (analytics.chatAnalytics.usageByRole.student + analytics.chatAnalytics.usageByRole.guest || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">Guest Visitors</span>
                        <span className="font-mono text-slate-900 font-bold">{analytics.chatAnalytics.usageByRole.guest} sessions</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${(analytics.chatAnalytics.usageByRole.guest / (analytics.chatAnalytics.usageByRole.student + analytics.chatAnalytics.usageByRole.guest || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top queries */}
                <div className="p-5 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Top Grounded Inquiries</span>
                  <div className="divide-y divide-slate-200">
                    {analytics.chatAnalytics.topQueries.map((q: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-2 text-xs">
                        <span className="text-slate-700 font-medium truncate pr-4">{q.query}</span>
                        <span className="bg-slate-200 text-slate-900 font-mono px-2 py-0.5 rounded text-[10px] font-bold shrink-0">{q.count} times</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 2: DEPARTMENTS MANAGEMENT */}
          {activeTab === "departments" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">College Departments ({departments.length})</h2>
                  <p className="text-xs text-slate-500">Add or edit department profiles, courses, labs, and photos.</p>
                </div>
              </div>

              {/* Dept Form */}
              <form onSubmit={handleDeptSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {editingId ? "Edit Department Record" : "Add Department Record"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Department Name</label>
                    <input
                      type="text"
                      value={deptForm.name}
                      onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                      placeholder="e.g. Physics, Commerce"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Head of Department (HOD)</label>
                    <input
                      type="text"
                      value={deptForm.hod}
                      onChange={e => setDeptForm({ ...deptForm, hod: e.target.value })}
                      placeholder="e.g. Dr. Nabajit Kalita"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Faculty Members (Separate with ;)</label>
                    <input
                      type="text"
                      value={deptForm.facultyMembers}
                      onChange={e => setDeptForm({ ...deptForm, facultyMembers: e.target.value })}
                      placeholder="Dr. Nath; Dr. Gogoi"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Courses Offered (Separate with ;)</label>
                    <input
                      type="text"
                      value={deptForm.coursesOffered}
                      onChange={e => setDeptForm({ ...deptForm, coursesOffered: e.target.value })}
                      placeholder="B.Sc Honours; M.Sc"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Laboratories (Separate with ;)</label>
                    <input
                      type="text"
                      value={deptForm.laboratories}
                      onChange={e => setDeptForm({ ...deptForm, laboratories: e.target.value })}
                      placeholder="General Optics Lab; Nanotech Cell"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Office Timing</label>
                    <input
                      type="text"
                      value={deptForm.officeTiming}
                      onChange={e => setDeptForm({ ...deptForm, officeTiming: e.target.value })}
                      placeholder="e.g. 09:30 AM - 04:00 PM"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Contact Details</label>
                    <input
                      type="text"
                      value={deptForm.contactDetails}
                      onChange={e => setDeptForm({ ...deptForm, contactDetails: e.target.value })}
                      placeholder="physics@dhemajicollege.edu.in"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Syllabus PDF Links (Separate with ;)</label>
                    <input
                      type="text"
                      value={deptForm.pdfLinks}
                      onChange={e => setDeptForm({ ...deptForm, pdfLinks: e.target.value })}
                      placeholder="https://...pdf"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Photos (Image URLs separate with ;)</label>
                  <input
                    type="text"
                    value={deptForm.photos}
                    onChange={e => setDeptForm({ ...deptForm, photos: e.target.value })}
                    placeholder="https://unsplash.com/..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Research Projects Summary</label>
                  <input
                    type="text"
                    value={deptForm.research}
                    onChange={e => setDeptForm({ ...deptForm, research: e.target.value })}
                    placeholder="e.g. DST research project on Thin Film nanomaterials studies."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Department Description</label>
                  <textarea
                    value={deptForm.description}
                    onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                    placeholder="Historical profile overview..."
                    rows={2}
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{editingId ? "Update Department" : "Save Department"}</span>
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-300 cursor-pointer font-bold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>

              {/* Depts list */}
              <div className="space-y-3">
                {departments.map(dept => (
                  <div key={dept.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex justify-between gap-4 items-start shadow-sm">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">DEPT</span>
                        <h4 className="font-serif font-bold text-slate-900 text-sm">{dept.name}</h4>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">HOD: <strong className="text-slate-900">{dept.hod}</strong></p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{dept.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                        <div>⏱️ Timing: {dept.officeTiming}</div>
                        <div>🎓 Courses: {dept.coursesOffered.length}</div>
                        <div>🧪 Labs: {dept.laboratories.length}</div>
                        <div>👥 Faculty: {dept.facultyMembers.length}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleEditDept(dept)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded border border-slate-200 bg-white"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(dept.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded border border-red-200 bg-white"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 3: FACULTY DIRECTORY */}
          {activeTab === "faculty" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">Faculty Directory ({faculty.length})</h2>
                  <p className="text-xs text-slate-500">Manage individual profiles of college teachers.</p>
                </div>
              </div>

              {/* Faculty Form */}
              <form onSubmit={handleFacultySubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {editingId ? "Edit Faculty Profile" : "Register Faculty Profile"}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={facultyForm.name}
                      onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                      placeholder="e.g. Prof. Ranjan Borah"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Department</label>
                    <select
                      value={facultyForm.department}
                      onChange={e => setFacultyForm({ ...facultyForm, department: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Botany">Botany</option>
                      <option value="Zoology">Zoology</option>
                      <option value="Commerce">Commerce</option>
                      <option value="English">English</option>
                      <option value="Assamese">Assamese</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Designation</label>
                    <select
                      value={facultyForm.designation}
                      onChange={e => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="HOD & Professor">HOD & Professor</option>
                      <option value="Visiting Lecturer">Visiting Lecturer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Academic Qualification</label>
                    <input
                      type="text"
                      value={facultyForm.qualification}
                      onChange={e => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                      placeholder="e.g. Ph.D. in Nanotechnology (IITG)"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Contact Email</label>
                    <input
                      type="email"
                      value={facultyForm.email}
                      onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })}
                      placeholder="email@dhemajicollege.edu.in"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={facultyForm.phone}
                      onChange={e => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                      placeholder="+91..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Office / Chamber Location</label>
                  <input
                    type="text"
                    value={facultyForm.office}
                    onChange={e => setFacultyForm({ ...facultyForm, office: e.target.value })}
                    placeholder="e.g. Physics Department, Block A, Room 102"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{editingId ? "Update Profile" : "Register Profile"}</span>
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Faculty Grid List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {faculty.map(f => (
                  <div key={f.id} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-2 relative shadow-sm hover:border-slate-300 transition-all">
                    <div className="space-y-1 pr-12">
                      <span className="bg-amber-500/10 text-amber-600 text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        {f.department}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">{f.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{f.designation}</p>
                      <p className="text-[11px] text-slate-700 font-mono italic">🎓 {f.qualification}</p>
                      <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                        <p>📧 {f.email || "No email linked"}</p>
                        <p>📞 {f.phone || "No phone linked"}</p>
                        <p>🏢 Office: {f.office}</p>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <button
                        onClick={() => handleEditFaculty(f)}
                        className="p-1 hover:bg-slate-100 border border-slate-200 rounded text-slate-600"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(f.id)}
                        className="p-1 hover:bg-red-50 border border-red-100 rounded text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 4: CIRCULAR NOTICES */}
          {activeTab === "notices" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">Official Notice Circulars ({notices.length})</h2>
                  <p className="text-xs text-slate-500">Publish notice board posts with PDF links.</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleNoticeSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {editingId ? "Edit Notice" : "Publish Notice Board Circular"}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Notice Title</label>
                    <input
                      type="text"
                      value={noticeForm.title}
                      onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      placeholder="e.g. Sessional Exam Routine 4th Sem"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Category</label>
                    <select
                      value={noticeForm.category}
                      onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Admission">Admission</option>
                      <option value="Examination">Examination</option>
                      <option value="Academic">Academic</option>
                      <option value="Placement">Placement</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Publication Date</label>
                    <input
                      type="date"
                      value={noticeForm.date}
                      onChange={e => setNoticeForm({ ...noticeForm, date: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Deadline / Event Date (Optional)</label>
                    <input
                      type="date"
                      value={noticeForm.deadline}
                      onChange={e => setNoticeForm({ ...noticeForm, deadline: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Document PDF Attachment Link</label>
                    <input
                      type="text"
                      value={noticeForm.pdf}
                      onChange={e => setNoticeForm({ ...noticeForm, pdf: e.target.value })}
                      placeholder="https://dhemajicollege.edu.in/..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Detailed Circular Message</label>
                  <textarea
                    value={noticeForm.description}
                    onChange={e => setNoticeForm({ ...noticeForm, description: e.target.value })}
                    placeholder="Provide full description context so chatbot understands specific details..."
                    rows={3}
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingId ? "Update Circular Notice" : "Publish Circular Notice"}</span>
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Notice listings */}
              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex justify-between gap-4 items-start shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                          {n.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">📅 Published: {n.date}</span>
                        {n.deadline && <span className="text-[10px] font-mono font-bold text-red-500">⏳ Target: {n.deadline}</span>}
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-xs mt-1">{n.title}</h4>
                      <p className="text-[11px] text-slate-700 leading-relaxed">{n.description}</p>
                      {n.pdf && (
                        <p className="text-[10px] font-mono font-bold text-amber-600 underline pt-1">
                          🔗 Attached File: <a href={n.pdf} target="_blank" rel="noopener noreferrer">{n.pdf}</a>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => handleEditNotice(n)} className="p-1 hover:bg-slate-200 border border-slate-200 rounded text-slate-600 bg-white">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteNotice(n.id)} className="p-1 hover:bg-red-50 border border-red-200 rounded text-red-500 bg-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 5: ADMISSION GUIDELINES */}
          {activeTab === "admissions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">Admission Programs ({admissions.length})</h2>
                  <p className="text-xs text-slate-500">Store eligibility criteria, fee structures, and application links.</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAdmissionSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  {editingId ? "Edit Admission Guideline" : "Add Admission Guideline"}
                </span>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Admission Program Name</label>
                  <input
                    type="text"
                    value={admissionForm.name}
                    onChange={e => setAdmissionForm({ ...admissionForm, name: e.target.value })}
                    placeholder="e.g. FYUGP Arts, B.Sc Science, BCA"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Eligibility Criteria</label>
                    <input
                      type="text"
                      value={admissionForm.eligibility}
                      onChange={e => setAdmissionForm({ ...admissionForm, eligibility: e.target.value })}
                      placeholder="Passed HS/12th class with 45% aggregate..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Application Dates</label>
                    <input
                      type="text"
                      value={admissionForm.applicationDates}
                      onChange={e => setAdmissionForm({ ...admissionForm, applicationDates: e.target.value })}
                      placeholder="e.g. Registration June 15 to July 25, 2026"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Fee Structure Description</label>
                    <input
                      type="text"
                      value={admissionForm.fees}
                      onChange={e => setAdmissionForm({ ...admissionForm, fees: e.target.value })}
                      placeholder="e.g. ₹5,600 per year for B.Sc Science"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Merit List PDF Link</label>
                    <input
                      type="text"
                      value={admissionForm.meritListUrl}
                      onChange={e => setAdmissionForm({ ...admissionForm, meritListUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Required Documents (Separate with ;)</label>
                    <input
                      type="text"
                      value={admissionForm.documents}
                      onChange={e => setAdmissionForm({ ...admissionForm, documents: e.target.value })}
                      placeholder="Class 10 Admit Card; HS Marksheet; Caste Cert"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Important Links (Format: Name|URL ; Name|URL)</label>
                    <input
                      type="text"
                      value={admissionForm.importantLinks}
                      onChange={e => setAdmissionForm({ ...admissionForm, importantLinks: e.target.value })}
                      placeholder="Samarth Assam Portal|https://assamsamarth.ac.in"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                    <span>Index Guidelines</span>
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg">Cancel</button>
                  )}
                </div>
              </form>

              {/* Admission listings */}
              <div className="space-y-3">
                {admissions.map(adm => (
                  <div key={adm.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex justify-between gap-4 items-start shadow-sm">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-serif font-bold text-slate-900 text-sm">🎓 {adm.name}</h4>
                      <div className="text-[11px] space-y-1 text-slate-700">
                        <p>🔹 **Eligibility**: {adm.eligibility}</p>
                        <p>🔹 **Dates**: {adm.applicationDates}</p>
                        <p>🔹 **Fees**: {adm.fees}</p>
                        <p>🔹 **Documents**: {adm.documents.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditAdmission(adm)} className="p-1 hover:bg-slate-200 border border-slate-200 rounded text-slate-600 bg-white">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteAdmission(adm.id)} className="p-1 hover:bg-red-50 border border-red-200 rounded text-red-500 bg-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 6: EXAMINATIONS CONFIG */}
          {activeTab === "examinations" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">Examinations Systems ({examinations.length})</h2>
                  <p className="text-xs text-slate-500">Configure routine, results, admit cards, sessional internal guidelines.</p>
                </div>
              </div>

              <form onSubmit={handleExamSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Configure Exam Stream details</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Stream Category Name</label>
                  <input
                    type="text"
                    value={examForm.name}
                    onChange={e => setExamForm({ ...examForm, name: e.target.value })}
                    placeholder="e.g. Sessional Internal Assessments, End-Semester University Exams"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Routine Schedule Details</label>
                    <input
                      type="text"
                      value={examForm.routine}
                      onChange={e => setExamForm({ ...examForm, routine: e.target.value })}
                      placeholder="Commencing from Sept 24, 2026. Hall tickets issued at department."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Results Publication Details</label>
                    <input
                      type="text"
                      value={examForm.results}
                      onChange={e => setExamForm({ ...examForm, results: e.target.value })}
                      placeholder="Results declared on departmental boards and uploaded to student portal."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Admit Card Protocol</label>
                    <input
                      type="text"
                      value={examForm.admitCards}
                      onChange={e => setExamForm({ ...examForm, admitCards: e.target.value })}
                      placeholder="Admit card is generated only upon 75% attendance verification."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Sessional Internal Exam Weight (e.g. 20%)</label>
                    <input
                      type="text"
                      value={examForm.internalExams}
                      onChange={e => setExamForm({ ...examForm, internalExams: e.target.value })}
                      placeholder="20% continuous internal evaluations score weight."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Semester University Exam details</label>
                    <input
                      type="text"
                      value={examForm.semesterExams}
                      onChange={e => setExamForm({ ...examForm, semesterExams: e.target.value })}
                      placeholder="End semester exams conducted twice yearly under Dibrugarh University."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                    <span>Store Configuration</span>
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg">Cancel</button>
                  )}
                </div>
              </form>

              <div className="space-y-3">
                {examinations.map(exam => (
                  <div key={exam.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex justify-between gap-4 items-start shadow-sm">
                    <div className="space-y-1.5 flex-1 text-slate-700 text-xs">
                      <h4 className="font-bold text-slate-900 text-sm">📅 {exam.name}</h4>
                      <p>🔹 **Routine schedule**: {exam.routine}</p>
                      <p>🔹 **Results mechanism**: {exam.results}</p>
                      <p>🔹 **Admit card check**: {exam.admitCards}</p>
                      <p>🔹 **Sessional Internal rules**: {exam.internalExams}</p>
                      <p>🔹 **Semester End rules**: {exam.semesterExams}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditExam(exam)} className="p-1 hover:bg-slate-200 border border-slate-200 rounded text-slate-600 bg-white">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteExam(exam.id)} className="p-1 hover:bg-red-50 border border-red-200 rounded text-red-500 bg-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 7: STUDENT SERVICES */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">Student Services & Facilities ({services.length})</h2>
                  <p className="text-xs text-slate-500">Configure NCC, NSS, Sports, Central Library rules, and hostel facilities.</p>
                </div>
              </div>

              <form onSubmit={handleServiceSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Add / Edit College Service</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Service/Facility Name</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="e.g. Hostel, NCC, Scholarship, Library"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Brief Subtitle/Description</label>
                  <input
                    type="text"
                    value={serviceForm.description}
                    onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="e.g. Modern reading room with 40,000 physical volumes."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Complete Facilities details (Grounded chatbot rules)</label>
                  <textarea
                    value={serviceForm.details}
                    onChange={e => setServiceForm({ ...serviceForm, details: e.target.value })}
                    placeholder="Provide full hostel accommodation fees (₹8,500), seat allotments, library library timings, scholarship Ishan Uday requirements, etc..."
                    rows={4}
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                    <span>Index Facility</span>
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg">Cancel</button>
                  )}
                </div>
              </form>

              <div className="space-y-3">
                {services.map(serv => (
                  <div key={serv.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex justify-between gap-4 items-start shadow-sm">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-serif font-bold text-slate-900 text-sm">🏨 {serv.name}</h4>
                      <p className="text-xs text-slate-700 font-medium italic">"{serv.description}"</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">{serv.details}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEditService(serv)} className="p-1 hover:bg-slate-200 border border-slate-200 rounded text-slate-600 bg-white">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteService(serv.id)} className="p-1 hover:bg-red-50 border border-red-200 rounded text-red-500 bg-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 8: ACADEMIC CALENDAR & EVENTS */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h2 className="font-serif font-bold text-slate-900 text-lg">Academic Calendar Events ({events.length})</h2>
                  <p className="text-xs text-slate-500">Categorize sessional dates, restricted and government holidays, and seminar sessions.</p>
                </div>
              </div>

              <form onSubmit={handleEventSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Schedule New Calendar Event</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Event / Holiday Title</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="e.g. Srimanta Sankardeva Tithi, Independence Day, Physics Seminar"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Category</label>
                    <select
                      value={eventForm.category}
                      onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="Working Days">Working Days</option>
                      <option value="Holidays">Holidays</option>
                      <option value="Government Holidays">Government Holidays</option>
                      <option value="Restricted Holidays">Restricted Holidays</option>
                      <option value="Academic Events">Academic Events</option>
                      <option value="Examination Schedule">Examination Schedule</option>
                      <option value="Admission Schedule">Admission Schedule</option>
                      <option value="Orientation">Orientation</option>
                      <option value="Freshers">Freshers</option>
                      <option value="Seminars">Seminars</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Conferences">Conferences</option>
                      <option value="Festivals">Festivals</option>
                      <option value="Vacation">Vacation</option>
                      <option value="Internal Assessments">Internal Assessments</option>
                      <option value="Practical Exams">Practical Exams</option>
                      <option value="University Events">University Events</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Scheduled Date</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Start Time (Optional)</label>
                    <input
                      type="text"
                      value={eventForm.startTime}
                      onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                      placeholder="e.g. 09:30 AM"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">End Time (Optional)</label>
                    <input
                      type="text"
                      value={eventForm.endTime}
                      onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })}
                      placeholder="e.g. 04:00 PM"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Status</label>
                    <select
                      value={eventForm.status}
                      onChange={e => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Department Specific tag</label>
                    <input
                      type="text"
                      value={eventForm.department}
                      onChange={e => setEventForm({ ...eventForm, department: e.target.value })}
                      placeholder="e.g. Physics, Chemistry, All"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Venue Location</label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                      placeholder="e.g. Science Hall 102"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Nodal Organizer</label>
                    <input
                      type="text"
                      value={eventForm.organizer}
                      onChange={e => setEventForm({ ...eventForm, organizer: e.target.value })}
                      placeholder="e.g. IQAC Cell"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Detailed Description</label>
                  <input
                    type="text"
                    value={eventForm.description}
                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Provide full description of the holiday or workshop event..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Event</span>
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs rounded-lg">Cancel</button>
                  )}
                </div>
              </form>

              {/* Event items listings */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                {events.map(ev => (
                  <div key={ev.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex justify-between gap-4 items-start shadow-sm">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                          {ev.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">📅 Date: {ev.date}</span>
                        {ev.department && <span className="text-[10px] text-slate-600 bg-slate-200 font-bold px-1.5 py-0.2 rounded">{ev.department}</span>}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase border ${
                          ev.status === "Upcoming" ? "text-blue-600 border-blue-500/20 bg-blue-500/5" : "text-emerald-600 border-emerald-500/20 bg-emerald-500/5"
                        }`}>
                          {ev.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-slate-900 text-xs mt-1">{ev.title}</h4>
                      <p className="text-[11px] text-slate-500">{ev.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-500 pt-1">
                        <div>⏰ Time: {ev.startTime || "All day"} - {ev.endTime || "All day"}</div>
                        <div>🏛️ Venue: {ev.venue}</div>
                        <div>👥 Organizer: {ev.organizer}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => handleEditEvent(ev)} className="p-1.5 hover:bg-slate-200 border border-slate-200 rounded text-slate-600 bg-white">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteEvent(ev.id)} className="p-1.5 hover:bg-red-50 border border-red-200 rounded text-red-500 bg-white">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 9: USER CHAT LOGS */}
          {activeTab === "chats" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              
              {/* Session list */}
              <div className="lg:col-span-5 border-r border-slate-100 pr-4 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase block">Active Conversations</span>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search query histories..."
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none"
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
                            ? "bg-slate-100 border-slate-900 shadow-sm" 
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-500 uppercase">{sess.user.role}</span>
                          <span className="font-mono text-slate-400">{new Date(sess.timestamp).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-xs truncate">{sess.user.name}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="truncate max-w-[140px] italic">"{sess.messages[sess.messages.length - 1]?.text}"</span>
                          {sess.rating && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
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
                        <h4 className="text-xs font-bold text-slate-900">{selectedSession.user.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{selectedSession.id}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteChatLog(selectedSession.id)}
                        className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded text-xs flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Logs</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl max-h-[300px]">
                      {selectedSession.messages.map((m, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl text-xs ${
                          m.role === "user" 
                            ? "bg-slate-900 text-white ml-6" 
                            : "bg-white border border-slate-200 text-slate-800 mr-6"
                        }`}>
                          <p className="font-bold text-[9px] mb-0.5 text-amber-500">
                            {m.role === "user" ? "STUDENT QUERY" : "SECRETARIAT ASSISTANT"}
                          </p>
                          <p>{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <MessageSquare className="w-8 h-8 mb-2" />
                    <p className="text-xs">Select a student conversation from the left side panel to review chat history logs.</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* TAB 10: FLAGGED & BLOCKED STUDENT ACCOUNTS */}
          {activeTab === "blocked" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg">Flagged & Blocked Students</h2>
                <p className="text-xs text-slate-500">Restrict access for abusive student ID parameters dynamically.</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (blockUserId) handleBlockToggle(blockUserId, true);
                }} 
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-end"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Student Registration ID to Block</label>
                  <input
                    type="text"
                    value={blockUserId}
                    onChange={(e) => setBlockUserId(e.target.value)}
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
                  <span>Block Account ID</span>
                </button>
              </form>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Blocked Register ({blockedUsers.length})</span>
                {blockedUsers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No blocked student IDs on record.</p>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {blockedUsers.map((id) => (
                      <div key={id} className="p-3 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                          <span className="font-mono font-bold text-slate-800">{id}</span>
                        </div>
                        <button
                          onClick={() => handleBlockToggle(id, false)}
                          className="px-2.5 py-1 text-[10px] text-emerald-600 border border-emerald-500/20 hover:bg-emerald-50 rounded-lg font-bold cursor-pointer"
                        >
                          Revoke block
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* TAB 11: BULK EXCEL/CSV IMPORT TOOL */}
          {activeTab === "import" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg">Bulk Data CSV Import Workspace</h2>
                <p className="text-xs text-slate-500">Paste raw comma-separated CSV values parsed directly from Excel to batch sync records.</p>
              </div>

              <form onSubmit={handleBulkImport} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                {importError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    ⚠️ {importError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Database Table</label>
                  <select
                    value={importTable}
                    onChange={(e) => setImportTable(e.target.value as any)}
                    className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="departments">Departments Table</option>
                    <option value="faculty">Faculty Table</option>
                    <option value="notices">Circular Notices Table</option>
                    <option value="events">Calendar Events Table</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-950 text-slate-200 text-[10px] rounded-xl font-mono leading-relaxed space-y-1">
                  <span className="font-bold text-amber-400 uppercase">Required CSV Column Header Template</span>
                  {importTable === "departments" && (
                    <p>name,hod,description,officeTiming,contactDetails,facultyMembers,coursesOffered,laboratories,research,photos,pdfLinks</p>
                  )}
                  {importTable === "faculty" && (
                    <p>name,department,designation,qualification,email,phone,office</p>
                  )}
                  {importTable === "notices" && (
                    <p>title,description,date,category,pdf,deadline</p>
                  )}
                  {importTable === "events" && (
                    <p>title,description,category,date,startTime,endTime,department,venue,organizer,status</p>
                  )}
                  <p className="text-slate-500 italic mt-1">*Separate multiple values inside a cell using semicolon (;)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Paste CSV Row Data (Include Header row)</label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="e.g. name,hod,description,officeTiming,contactDetails&#10;Sociology,Dr. Bora,Study of society,09:30 AM - 04:00 PM,socio@dhemajicollege.edu.in"
                    rows={8}
                    className="w-full text-xs p-3 font-mono bg-white border border-slate-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer border border-amber-500/10 shadow"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  <span>Execute Bulk Data Integration</span>
                </button>
              </form>
            </div>
          )}


          {/* TAB 12: SYSTEM MONITOR & SERVER DIAGNOSTICS */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-lg">Server Health & Telemetry Metrics</h2>
                <p className="text-xs text-slate-500">Real-time status monitor of sandboxed container processes.</p>
              </div>

              {performance && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 shadow-sm">
                    <Cpu className="w-5 h-5 text-slate-900" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">CPU Load</span>
                      <span className="font-mono text-sm font-bold text-slate-900">{performance.cpuUsagePercent}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 shadow-sm">
                    <Database className="w-5 h-5 text-slate-900" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Memory RSS</span>
                      <span className="font-mono text-sm font-bold text-slate-900">{performance.memoryUsageMb} MB</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 shadow-sm">
                    <Users className="w-5 h-5 text-slate-900" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Query Cache</span>
                      <span className="font-mono text-sm font-bold text-slate-900">{performance.cachedQueriesRatio} items</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 shadow-sm">
                    <Activity className="w-5 h-5 text-slate-900" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">API Latency</span>
                      <span className="font-mono text-sm font-bold text-slate-900">{performance.apiLatencyMs}ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error logs terminal */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase block">Terminal Output Logging Monitor</span>
                <div className="p-4 bg-slate-950 text-slate-200 font-mono text-[10px] rounded-2xl overflow-x-auto max-h-[220px] overflow-y-auto space-y-1.5 shadow-2xl">
                  {errorLogs.length === 0 ? (
                    <p className="text-emerald-400">● Secretariat Database System healthy. Sessional RAG and calendar pipelines running with 0 warnings.</p>
                  ) : (
                    errorLogs.map((log, idx) => (
                      <div key={idx} className={log.level === "ERROR" ? "text-red-400" : "text-amber-400"}>
                        [{log.timestamp}] {log.level}: {log.message}
                        {log.stack && <p className="text-slate-400 pl-4 whitespace-pre">{log.stack}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
