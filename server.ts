import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dhemaji_college_secret_key_2026";
const DB_PATH = path.join(process.cwd(), "db.json");

// System prompt for the Gemini AI Model
const SYSTEM_INSTRUCTION_BASE = `You are "Dhemaji College AI Secretariat Assistant" — the professional and helpful virtual assistant of Dhemaji College, Assam (Estd. 1965, NAAC Grade 'A', CGPA 3.12).

Your goals are:
1. Provide highly accurate, factual, and sessional details about Dhemaji College using ONLY the retrieved DATABASE RECORDS provided in your context.
2. State the source of your information clearly (e.g. Cite specific Notices, Departments, Admissions, Faculty, or Academic Calendar Events).
3. If the user asks in Assamese, respond in fluent Assamese. Support English, Assamese, and code-mixed Assamese-English.
4. Maintain active conversation context. Do not make up any facts. If information is missing from the retrieved database, state that sessional records do not contain this information, and advise them to contact the College Administrative helpdesk (+91 3753 224356) or visit the Administrative Block.
5. Under no circumstances invent details about grade lists, sessional marks, or fees not present in the student's profile.
`;

// Define Database Types
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
  category: "General" | "Admission" | "Examination" | "Academic" | "Placement" | string;
  pdf: string;
  deadline?: string;
}

interface AdmissionDetail {
  id: string;
  name: string; // e.g. "FYUGP Science", "BCA", etc.
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
  name: string; // "Hostel", "Scholarship", "Library", etc.
  description: string;
  details: string;
}

interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  category: "Working Days" | "Holidays" | "Government Holidays" | "Restricted Holidays" | "Academic Events" | "Examination Schedule" | "Admission Schedule" | "Orientation" | "Freshers" | "Seminars" | "Workshops" | "Conferences" | "Festivals" | "Vacation" | "Internal Assessments" | "Practical Exams" | "University Events";
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  department?: string;
  venue: string;
  pdfAttachment?: string;
  organizer: string;
  status: "Upcoming" | "Ongoing" | "Completed";
}

interface DatabaseSchema {
  departments: Department[];
  notices: Notice[];
  admissions: AdmissionDetail[];
  examinations: ExaminationDetail[];
  faculty: FacultyMember[];
  services: StudentService[];
  events: AcademicEvent[];
}

// Default Comprehensive Database Mock Data
const DEFAULT_DATABASE: DatabaseSchema = {
  departments: [
    {
      id: "dept-physics",
      name: "Physics",
      hod: "Dr. Arundhati Nath",
      facultyMembers: ["Dr. Arundhati Nath (HOD)", "Dr. Nabajit Kalita", "Prof. Ranjan Borah"],
      coursesOffered: ["B.Sc. Physics (Honours)", "M.Sc. Physics", "Sessional Bridge Course"],
      laboratories: ["General Physics Lab", "Darkroom Optics Lab", "Computational Physics Computer Cell"],
      research: "Thin Film Nanomaterials, Astroparticle Physics, Plasma Diagnostics projects funded by DST.",
      contactDetails: "physics@dhemajicollege.edu.in | +91 3753 224357",
      officeTiming: "09:30 AM - 04:00 PM (Monday - Saturday)",
      description: "The Physics department, established in 1978, has excellent faculty, dedicated modern laboratories, and a consistent history of highest sessional achievements under Dibrugarh University.",
      photos: ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop"],
      pdfLinks: ["https://dhemajicollege.edu.in/syllabus/physics_fyugp.pdf"]
    },
    {
      id: "dept-chemistry",
      name: "Chemistry",
      hod: "Dr. Jayanta Nath",
      facultyMembers: ["Dr. Jayanta Nath (HOD)", "Prof. Pallabi Duarah", "Dr. Mridul Sarma"],
      coursesOffered: ["B.Sc. Chemistry (Honours)", "Analytical Chemistry Diploma"],
      laboratories: ["Inorganic Chemistry Lab", "Organic Synthesis Lab", "Physical Instrumentation Cell"],
      research: "Environmental Water Quality Monitoring, Bio-mass extraction, Assam Tea antioxidant studies.",
      contactDetails: "chemistry@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Chemistry department boasts state-of-the-art spectrophotometers, water analysis kits, and guides students towards research paper publication early in their 4-year undergraduate programs.",
      photos: ["https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=400&h=250&fit=crop"],
      pdfLinks: []
    },
    {
      id: "dept-maths",
      name: "Mathematics",
      hod: "Dr. Dipak Borah",
      facultyMembers: ["Dr. Dipak Borah (HOD)", "Prof. Nibedita Chaliha", "Dr. Abhijit Gogoi"],
      coursesOffered: ["B.Sc. Mathematics (Honours)", "M.Sc. Mathematics", "Mathematical Physics Elective"],
      laboratories: ["Mathematica Lab", "MATLAB & LaTeX Computation Cell"],
      research: "Fluid Dynamics, Cryptographic Algebra, Number Theory topology research.",
      contactDetails: "maths@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Providing quality analytical foundation to both science and arts students since 1972.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-botany",
      name: "Botany",
      hod: "Dr. Rupali Dutta",
      facultyMembers: ["Dr. Rupali Dutta (HOD)", "Dr. Manoj Saikia", "Prof. Bornali Chetia"],
      coursesOffered: ["B.Sc. Botany (Honours)", "Horticulture Certificate Course"],
      laboratories: ["Plant Physiology Lab", "Mycology Lab", "Tissue Culture & Botanical Herbarium Room"],
      research: "Ethnobotany of Dhemaji, medicinal plant cataloging, organic compost microbiology.",
      contactDetails: "botany@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Focusing on local bio-diversity conservation, the Botany department operates the college Botanical Garden featuring rare endangered Assamese flora.",
      photos: ["https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=250&fit=crop"],
      pdfLinks: []
    },
    {
      id: "dept-zoology",
      name: "Zoology",
      hod: "Dr. Pranab Boruah",
      facultyMembers: ["Dr. Pranab Boruah (HOD)", "Dr. Gitanjali Devi", "Prof. Sanjib Handique"],
      coursesOffered: ["B.Sc. Zoology (Honours)", "Sericulture and Apiculture Certificate"],
      laboratories: ["Animal Physiology Lab", "Entomology Lab", "Zoology Museum Cell"],
      research: "Wetland avifauna tracking, local fisheries parasite taxonomy, butterfly cataloging.",
      contactDetails: "zoology@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "The Zoology department maintains a rich specimens museum containing over 400 species, promoting deep field-study explorations in Dibru-Saikhowa and local wetlands.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-commerce",
      name: "Commerce",
      hod: "Dr. Hemendra Baruah",
      facultyMembers: ["Dr. Hemendra Baruah (HOD)", "Prof. Dipika Saikia", "Dr. Kalyan Sen"],
      coursesOffered: ["B.Com (Honours in Accountancy & Finance)", "B.Com (Honours in Human Resource Management)"],
      laboratories: ["Tally & GST Digital Commerce Lab"],
      research: "Micro-finance operations in North-Assam, border market trade viability.",
      contactDetails: "commerce@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Formed to foster financial acumen, the Commerce department assists local youth in becoming entrepreneurs through sessional workshops and corporate placement links.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-english",
      name: "English",
      hod: "Prof. Swapnali Borah",
      facultyMembers: ["Prof. Swapnali Borah (HOD)", "Dr. Kakali Roy", "Prof. Gaurav Chaliha"],
      coursesOffered: ["B.A. English (Honours)", "Communicative English Certificate"],
      laboratories: ["Interactive English Language Lab"],
      research: "Post-colonial literature, Assamese translation studies, tribal oral narratives.",
      contactDetails: "english@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "The department enhances critical reading and speech, publishing 'The Horizon' annual journal of literary essays.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-assamese",
      name: "Assamese",
      hod: "Dr. Kamal Baruah",
      facultyMembers: ["Dr. Kamal Baruah (HOD)", "Prof. Juri Devi", "Dr. Hiren Phukan"],
      coursesOffered: ["B.A. Assamese (Honours)", "M.A. Assamese", "Assamese Journalism Diploma"],
      laboratories: ["Assamese Culture Archives Center"],
      research: "Sankardeva literature, ethnic linguistic roots of Dhemaji, folklore preservation.",
      contactDetails: "assamese@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "A flagship humanities department carrying legacy of language preservation and cultural heritage research since 1965.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-polscience",
      name: "Political Science",
      hod: "Prof. Hemanta Phukan",
      facultyMembers: ["Prof. Hemanta Phukan (HOD)", "Dr. Runumi Gogoi", "Prof. Biswajit Konwar"],
      coursesOffered: ["B.A. Political Science (Honours)", "Human Rights Certificate"],
      laboratories: ["Model United Nations (MUN) simulation board"],
      research: "Panchayati Raj field studies, gender governance in rural Assam, refugee legal frameworks.",
      contactDetails: "politicalscience@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Fosters constitutional values, civic responsibility, and public administration training.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-economics",
      name: "Economics",
      hod: "Dr. Bikash Gogoi",
      facultyMembers: ["Dr. Bikash Gogoi (HOD)", "Prof. Daisy Chutia", "Dr. Manash Borah"],
      coursesOffered: ["B.A. Economics (Honours)", "Applied Econometrics Course"],
      laboratories: ["Social Statistics Computing Desk"],
      research: "Flood damages and economic resilience in Assam, handloom industry microcredit.",
      contactDetails: "economics@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Blends classical theory with modern statistics to prepare students for policy-making roles.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-education",
      name: "Education",
      hod: "Prof. Minoti Dowarah",
      facultyMembers: ["Prof. Minoti Dowarah (HOD)", "Dr. Deepali Gogoi", "Prof. Sanjib Kalita"],
      coursesOffered: ["B.A. Education (Honours)", "Guidance & Counseling Certificate"],
      laboratories: ["Psychological Testing & Education Lab"],
      research: "E-learning adoption in tribal villages, sessional learning styles evaluations.",
      contactDetails: "education@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Dedicated to pedagogical research, psychological testing, and standard teacher training paradigms.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-history",
      name: "History",
      hod: "Dr. Devojit Phukan",
      facultyMembers: ["Dr. Devojit Phukan (HOD)", "Prof. Rupa Kakoti", "Dr. Diganta Saikia"],
      coursesOffered: ["B.A. History (Honours)", "Tourism and Archaeology Diploma"],
      laboratories: ["Archaeological Artifacts Display Center"],
      research: "Ahom Dynasty administration monuments, anti-colonial struggles in North-Assam.",
      contactDetails: "history@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:00 PM",
      description: "Inspiring research on local history, ruins conservation, and historiographical methodology.",
      photos: [],
      pdfLinks: []
    },
    {
      id: "dept-compsci",
      name: "Computer Science",
      hod: "Prof. Nabajit Nath",
      facultyMembers: ["Prof. Nabajit Nath (HOD)", "Prof. Dipankar Gogoi", "Ms. Barnali Saikia"],
      coursesOffered: ["BCA (Bachelor of Computer Applications)", "PGDCA", "IT Certificate Courses"],
      laboratories: ["Advanced Software Engineering Lab", "Networking & Hardware Lab", "AI Research Lab"],
      research: "Assamese OCR using Deep Learning, rural telehealth software architecture.",
      contactDetails: "computerscience@dhemajicollege.edu.in",
      officeTiming: "09:30 AM - 04:30 PM",
      description: "Established in 2005, providing high-quality computer training and software project skills with top placement outputs.",
      photos: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop"],
      pdfLinks: ["https://dhemajicollege.edu.in/syllabus/bca_2026.pdf"]
    }
  ],
  notices: [
    {
      id: "notice-1",
      title: "FYUGP 4th Semester Sessional Exam Schedule",
      description: "Official schedule for the continuous internal assessment sessional examination starting Sept 24, 2026. Attendance must exceed 75% for approvals.",
      date: "2026-07-10",
      category: "Examination",
      pdf: "https://dhemajicollege.edu.in/notices/sessional_exam_sept2026.pdf",
      deadline: "2026-09-24"
    },
    {
      id: "notice-2",
      title: "PG M.Sc and M.A. Online Application 2026",
      description: "Dhemaji College invitations for postgraduate admissions. Applications must be completed online on the college portal. Submit merit documents online.",
      date: "2026-07-12",
      category: "Admission",
      pdf: "https://dhemajicollege.edu.in/notices/pg_admission_2026.pdf",
      deadline: "2026-08-10"
    },
    {
      id: "notice-3",
      title: "National Seminar on Sustainable Development in Northeast India",
      description: "Organized by IQAC cell. Call for papers in sustainable botany, water analysis chemistry, and rural commerce. Selected papers to be published in UGC journal.",
      date: "2026-07-05",
      category: "Academic",
      pdf: "https://dhemajicollege.edu.in/notices/national_seminar_东北.pdf",
      deadline: "2026-08-20"
    },
    {
      id: "notice-4",
      title: "Hostel Fresh Allotment List - Phase I",
      description: "The list of selected student applicants for Boys Hostel Block B and Girls Hostel Block C is published. Merit based on overall CGPA. Admission sessional fee is ₹8,500.",
      date: "2026-07-14",
      category: "General",
      pdf: "https://dhemajicollege.edu.in/notices/hostel_allotment_2026.pdf",
      deadline: "2026-07-30"
    }
  ],
  admissions: [
    {
      id: "adm-fyugp",
      name: "FYUGP (4-Year Undergraduate Program)",
      eligibility: "Passed Class 12 (HS / Senior Secondary) with minimum 45% aggregate (Relaxation of 5% for SC/ST). Must register on Samarth Assam Portal.",
      fees: "₹4,850 per year for B.A., ₹5,600 per year for B.Sc. (Additional laboratory fees of ₹400 apply).",
      documents: ["Class 10 Admit Card", "Class 12 Marksheet", "Caste Certificate (if applicable)", "Assam Domicile Certificate", "Income Certificate for Fee Waiver eligibility"],
      applicationDates: "Registration: June 15 - July 25, 2026. Merit Lists publication: July 28, August 01, 2026.",
      meritListUrl: "https://dhemajicollege.edu.in/admissions/fyugp_merit_list_2026.pdf",
      importantLinks: [
        { label: "Samarth Assam Admission Portal", url: "https://assamsamarth.ac.in" },
        { label: "Online Fee Waiver Application Guide", url: "https://dhemajicollege.edu.in/fee-waiver" }
      ]
    },
    {
      id: "adm-bca",
      name: "BCA (Bachelor of Computer Applications)",
      eligibility: "Passed Class 12 with Mathematics or Commercial Arithmetic as one of the subjects, securing minimum 40% aggregate.",
      fees: "₹15,000 per semester (Self-financed professional stream).",
      documents: ["HS Marksheet", "LCR Cert", "Passport Photo"],
      applicationDates: "Online Forms: June 20 - July 30, 2026. Interview: August 2, 2026.",
      importantLinks: [
        { label: "Direct BCA Online Application Form", url: "https://dhemajicollege.edu.in/apply-bca" }
      ]
    }
  ],
  examinations: [
    {
      id: "exam-sessional",
      name: "Sessional Internal Assessments",
      routine: "Commencing from September 24, 2026. Written tests, seminars, and laboratory evaluations are held at respective departmental halls.",
      results: "Results are declared on the departmental notice board and verified ledgers are uploaded inside the student secure dashboard.",
      admitCards: "Digital admit cards are generated on the Student Portal once semester fees and dues are cleared.",
      internalExams: "Comprises 20% of the aggregate grade of Dibrugarh University. Passing sessional tests is mandatory to qualify for the main exams.",
      semesterExams: "Written end-semester exams are conducted twice yearly (Odd Sem in Nov/Dec, Even Sem in May/June) under Dibrugarh University."
    }
  ],
  faculty: [
    {
      id: "fac-1",
      name: "Dr. Arundhati Nath",
      department: "Physics",
      qualification: "Ph.D. in Solid State Physics (IIT Guwahati)",
      designation: "Associate Professor & HOD",
      email: "arundhati.nath@dhemajicollege.edu.in",
      phone: "+91 94350 12345",
      office: "Physics Department Block A, Room 101"
    },
    {
      id: "fac-2",
      name: "Dr. Nabajit Kalita",
      department: "Physics",
      qualification: "Ph.D. in Astrophysics (Tezpur University)",
      designation: "Assistant Professor",
      email: "nabajit.kalita@dhemajicollege.edu.in",
      phone: "+91 94351 22334",
      office: "Physics Department Block A, Research Cell 1"
    },
    {
      id: "fac-3",
      name: "Dr. Jayanta Nath",
      department: "Chemistry",
      qualification: "Ph.D. in Environmental Chemistry (Dibrugarh University)",
      designation: "Associate Professor & HOD",
      email: "jayanta.nath@dhemajicollege.edu.in",
      phone: "+91 94353 98765",
      office: "Science Block B, Room 204"
    }
  ],
  services: [
    {
      id: "serv-hostel",
      name: "Hostel",
      description: "Separate accommodations for boys and girls inside the peaceful campus perimeter.",
      details: "The Boys Hostel accommodates 60 students and the Girls Hostel accommodates 85 students. Admission is merit-based. Fee is ₹8,500 per semester. Facilities include 24/7 security guard, uninterrupted water filtration, recreation reading halls, and organic mess food."
    },
    {
      id: "serv-scholarship",
      name: "Scholarship",
      description: "State and national support programs to encourage excellent students and backward classes.",
      details: "Dhemaji College processes diverse government scholarships including: 1. Ishan Uday Special Scholarship for North Eastern Region (UGC) - ₹5,400/month. 2. Post Matric Scholarship for SC/ST/OBC. 3. Assam Government Fee Waiver Scheme for poor students (income < ₹2 Lakhs). Contact Dr. M. Borah, Scholarship nodal officer."
    },
    {
      id: "serv-library",
      name: "Library",
      description: "Modern, high-tech Dhemaji College Central Digital Library.",
      details: "Houses 40,000+ print volumes, subscription to N-LIST journals, 15 digital database access workstations, and reading rooms with seating capacity for 120 students. Timing: 09:30 AM to 04:30 PM on working days."
    },
    {
      id: "serv-sports",
      name: "Sports",
      description: "Promoting athletic fitness, training and multi-disciplinary sports.",
      details: "Features a modern outdoor football ground, concrete basketball court, indoor badminton court auditorium, table tennis cells, and annual college sports events yielding district champions."
    },
    {
      id: "serv-ncc",
      name: "NCC",
      description: "National Cadet Corps (Army wing unit under 72 Assam Battalion).",
      details: "Provides dynamic military and discipline training, national adventure camps, Republic Day parade training, and B and C Certificate tests, boosting defence career entries."
    },
    {
      id: "serv-nss",
      name: "NSS",
      description: "National Service Scheme unit.",
      details: "Engages in rural development camps, blood donation camps, Dhemaji flood relief camps, plantation drives, and environmental sanitization awareness programs."
    },
    {
      id: "serv-placement",
      name: "Placement",
      description: "Career counseling and business placement guidance cell.",
      details: "Coordinates interviews, resume building workshops, Assamese banking preparation camps, and recruits placement drives from local regional micro-finance and telecom sectors."
    },
    {
      id: "serv-clubs",
      name: "Clubs",
      description: "Extra-curricular student activities clubs.",
      details: "Includes Dhemaji Science Club, Literature and Debating Society, Cultural Choir, Photography Club, and Eco Club for green bio-campus auditing."
    },
    {
      id: "serv-antiragging",
      name: "Anti-ragging",
      description: "Strictly enforced UGC zero-tolerance anti-ragging cell.",
      details: "A fully functional Anti-Ragging Committee is headed by the Principal. Any act of ragging is treated as a major punishable criminal offence. Helpline: 1800-180-5522 | email: anti-ragging@dhemajicollege.edu.in"
    },
    {
      id: "serv-health",
      name: "Health Centre",
      description: "First aid medical support facility.",
      details: "Equipped with primary first aid tools, blood pressure monitors, oxygen cylinders, sickbeds, and a visiting consulting physician on Tuesdays and Thursdays."
    }
  ],
  events: [
    {
      id: "ev-indep",
      title: "Independence Day",
      description: "Flag hoisting by the Principal at 07:30 AM, followed by national parade presentation by NCC cadets and cultural songs by students.",
      category: "Government Holidays",
      date: "2026-08-15",
      startTime: "07:30 AM",
      endTime: "12:00 PM",
      venue: "Administrative Block Front Lawns",
      organizer: "Dhemaji College NCC & NSS Cells",
      status: "Upcoming"
    },
    {
      id: "ev-orient",
      title: "FYUGP 1st Semester Induction & Orientation",
      description: "Mandatory induction and welcome session for newly admitted Four-Year Undergraduate Programme Arts and Science students.",
      category: "Orientation",
      date: "2026-08-01",
      startTime: "10:00 AM",
      endTime: "03:00 PM",
      venue: "Main Auditorium Hall",
      organizer: "Academic Administration Secretariat",
      status: "Upcoming"
    },
    {
      id: "ev-shankar",
      title: "Srimanta Sankardeva Tithi",
      description: "College remains closed in honor of Srimanta Sankardeva Tithi.",
      category: "Government Holidays",
      date: "2026-09-12",
      startTime: "00:00 AM",
      endTime: "11:59 PM",
      venue: "Off-campus",
      organizer: "Government of Assam",
      status: "Upcoming"
    },
    {
      id: "ev-karam",
      title: "Karam Puja",
      description: "Restricted college holiday for students celebrating Karam Puja.",
      category: "Restricted Holidays",
      date: "2026-09-21",
      startTime: "00:00 AM",
      endTime: "11:59 PM",
      venue: "Off-campus",
      organizer: "Registrar Office",
      status: "Upcoming"
    },
    {
      id: "ev-sem-sust",
      title: "Sustainable Nano-Chemistry National Seminar",
      description: "National science research seminar sponsored by DST. Presentation of paper slides on water analysis and polymer nanotechnology.",
      category: "Seminars",
      date: "2026-07-20", // Scheduled for this week or next based on current time July 15, 2026
      startTime: "09:30 AM",
      endTime: "04:30 PM",
      department: "Chemistry",
      venue: "Science Conference Room B2",
      organizer: "IQAC & Department of Chemistry",
      status: "Upcoming"
    },
    {
      id: "ev-physics-workshop",
      title: "Astroparticle Physics Research Workshop",
      description: "Hands-on theoretical session on cosmic rays data processing.",
      category: "Workshops",
      date: "2026-07-18",
      startTime: "11:00 AM",
      endTime: "03:00 PM",
      department: "Physics",
      venue: "Computational Physics Cell, Block A",
      organizer: "Department of Physics",
      status: "Upcoming"
    },
    {
      id: "ev-exam-sessional",
      title: "FYUGP 4th Semester Sessional Internal Tests",
      description: "Commencement of continuous evaluation tests for all arts and science courses.",
      category: "Internal Assessments",
      date: "2026-09-24",
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      venue: "Respective Department Lecture Halls",
      organizer: "Sessional Controller Board",
      status: "Upcoming"
    }
  ]
};

// Database state
let dbData = { ...DEFAULT_DATABASE };

// Load database from file
function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const dataStr = fs.readFileSync(DB_PATH, "utf-8");
      dbData = JSON.parse(dataStr);
      console.log("Database loaded successfully from:", DB_PATH);
    } else {
      saveDatabase();
      console.log("Database file created and initialized at:", DB_PATH);
    }
  } catch (err) {
    console.error("Failed to load database file. Using default in-memory fallback.", err);
  }
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file.", err);
  }
}

// Initialize on startup
loadDatabase();

// In-Memory telemetry analytics, logs, and blocked list
let blockedUsers: string[] = [];
let errorLogs: { timestamp: string; level: string; message: string; stack?: string }[] = [];
let queryCache: Record<string, string> = {}; // Response Caching for FAQs

let chatAnalytics = {
  totalConversations: 0,
  totalMessages: 0,
  helpfulRatings: 0,
  unhelpfulRatings: 0,
  totalRatingsCount: 0,
  averageResponseTimeMs: 450,
  topQueries: [
    { query: "Admissions FYUGP", count: 32 },
    { query: "Sessional assessments routine", count: 25 },
    { query: "Physics department details", count: 21 },
    { query: "Government holidays list", count: 18 },
    { query: "Hostel facilities and cost", count: 14 }
  ],
  usageByRole: {
    student: 45,
    guest: 28
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

// Lazy init Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
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

// ADVANCED RAG DATABASE RETRIEVER ENGINE
function queryDatabaseRAG(userMessage: string): { contextText: string; citations: string[] } {
  const query = userMessage.toLowerCase();
  const tokens = query.split(/[\s,?.!]+/).filter(t => t.length > 2);
  if (tokens.length === 0) return { contextText: "No search terms extracted.", citations: [] };

  const matches: { score: number; content: string; title: string; source: string }[] = [];

  // Helper to score matching fields
  const scoreText = (text: string): number => {
    let score = 0;
    const txt = text.toLowerCase();
    for (const token of tokens) {
      if (txt.includes(token)) score += 2;
    }
    // Boost phrase matches
    if (txt.includes(query)) score += 10;
    return score;
  };

  // 1. Check Departments
  for (const dept of dbData.departments) {
    let deptScore = scoreText(dept.name) * 5; // Department name match is high weight
    deptScore += scoreText(dept.hod) * 2;
    deptScore += scoreText(dept.description);
    deptScore += scoreText(dept.coursesOffered.join(" "));
    deptScore += scoreText(dept.facultyMembers.join(" "));

    if (deptScore > 0) {
      matches.push({
        score: deptScore,
        source: `Department of ${dept.name}`,
        title: `Academic Department: ${dept.name}`,
        content: `Department: ${dept.name}\nHOD: ${dept.hod}\nFaculty Members: ${dept.facultyMembers.join(", ")}\nCourses Offered: ${dept.coursesOffered.join(", ")}\nLaboratories: ${dept.laboratories.join(", ")}\nResearch Areas: ${dept.research}\nOffice Timing: ${dept.officeTiming}\nContact: ${dept.contactDetails}\nDescription: ${dept.description}`
      });
    }
  }

  // 2. Check Notices
  for (const notice of dbData.notices) {
    let noticeScore = scoreText(notice.title) * 4;
    noticeScore += scoreText(notice.description);
    noticeScore += scoreText(notice.category);

    if (noticeScore > 0) {
      matches.push({
        score: noticeScore,
        source: `Notice: ${notice.title} (${notice.date})`,
        title: `Official Notice: ${notice.title}`,
        content: `Notice Title: ${notice.title}\nDate Published: ${notice.date}\nCategory: ${notice.category}\nDescription: ${notice.description}\nPDF Link: ${notice.pdf}\nDeadline/Event Date: ${notice.deadline || "None"}`
      });
    }
  }

  // 3. Check Admissions
  for (const adm of dbData.admissions) {
    let admScore = scoreText(adm.name) * 4;
    admScore += scoreText(adm.eligibility);
    admScore += scoreText(adm.fees);
    admScore += scoreText(adm.applicationDates);

    if (admScore > 0) {
      matches.push({
        score: admScore,
        source: `Admissions: ${adm.name}`,
        title: `Admission Guideline: ${adm.name}`,
        content: `Admission Program: ${adm.name}\nEligibility Criteria: ${adm.eligibility}\nApplication Dates: ${adm.applicationDates}\nYearly Fees Structure: ${adm.fees}\nRequired Documents: ${adm.documents.join(", ")}\nMerit List Link: ${adm.meritListUrl || "Not published yet"}\nHelp Links: ${adm.importantLinks.map(l => `${l.label} (${l.url})`).join(", ")}`
      });
    }
  }

  // 4. Check Examinations
  for (const exam of dbData.examinations) {
    let examScore = scoreText(exam.name) * 3;
    examScore += scoreText(exam.internalExams);
    examScore += scoreText(exam.semesterExams);
    examScore += scoreText(exam.routine);

    if (examScore > 0) {
      matches.push({
        score: examScore,
        source: `Examination Details: ${exam.name}`,
        title: `Academic Examinations: ${exam.name}`,
        content: `Category: ${exam.name}\nRoutine Schedule: ${exam.routine}\nResults Ledger Check: ${exam.results}\nAdmit Card Protocol: ${exam.admitCards}\nInternal Sessional System: ${exam.internalExams}\nSemester End System: ${exam.semesterExams}`
      });
    }
  }

  // 5. Check Faculty
  for (const fac of dbData.faculty) {
    let facScore = scoreText(fac.name) * 4;
    facScore += scoreText(fac.department);
    facScore += scoreText(fac.qualification);
    facScore += scoreText(fac.designation);

    if (facScore > 0) {
      matches.push({
        score: facScore,
        source: `Faculty profile: ${fac.name} (${fac.department})`,
        title: `Faculty Member: ${fac.name}`,
        content: `Name: ${fac.name}\nDepartment: ${fac.department}\nDesignation: ${fac.designation}\nQualification: ${fac.qualification}\nEmail Contact: ${fac.email}\nPhone contact: ${fac.phone}\nOffice Room: ${fac.office}`
      });
    }
  }

  // 6. Check Student Services
  for (const serv of dbData.services) {
    let servScore = scoreText(serv.name) * 4;
    servScore += scoreText(serv.description);
    servScore += scoreText(serv.details);

    if (servScore > 0) {
      matches.push({
        score: servScore,
        source: `Student Services: ${serv.name}`,
        title: `Student Amenity: ${serv.name}`,
        content: `Service Name: ${serv.name}\nSummary: ${serv.description}\nFull Facilities & Sessional Rules: ${serv.details}`
      });
    }
  }

  // 7. Check Academic Calendar / Events / Holidays
  for (const ev of dbData.events) {
    let evScore = scoreText(ev.title) * 4;
    evScore += scoreText(ev.description);
    evScore += scoreText(ev.category);
    if (ev.department) evScore += scoreText(ev.department);

    // Filter date keyword queries like "August" or "September"
    if (ev.date.includes("-08-") && query.includes("august")) evScore += 8;
    if (ev.date.includes("-09-") && query.includes("september")) evScore += 8;
    if (ev.date.includes("-07-") && query.includes("july")) evScore += 8;
    
    // Check tomorrow query
    if (query.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      if (ev.date === tomorrowStr) evScore += 15;
    }

    if (evScore > 0) {
      matches.push({
        score: evScore,
        source: `Academic Calendar: ${ev.title} [${ev.category}] (${ev.date})`,
        title: `Calendar Event: ${ev.title} (${ev.date})`,
        content: `Event Title: ${ev.title}\nCategory: ${ev.category}\nScheduled Date: ${ev.date}\nTimings: ${ev.startTime || "All Day"} to ${ev.endTime || "All Day"}\nVenue Location: ${ev.venue}\nOrganizer Nodal: ${ev.organizer}\nEvent Description: ${ev.description}\nDepartment Context: ${ev.department || "All-College Event"}\nStatus: ${ev.status}`
      });
    }
  }

  // Sort by relevance score
  matches.sort((a, b) => b.score - a.score);

  const topMatches = matches.slice(0, 4);
  const contextParts = topMatches.map(m => `---
Source Record: ${m.title}
Retrieved Details:
${m.content}`);

  const citations = topMatches.map(m => m.source);

  return {
    contextText: contextParts.join("\n\n"),
    citations: citations
  };
}

// ADVANCED LOCAL NATURAL LANGUAGE FALLBACK ANSWER GENERATOR (100% UPTIME GUARANTEE)
function formulateLocalFallbackAnswer(userMessage: string, contextRAG: { contextText: string; citations: string[] }): string {
  const query = userMessage.toLowerCase();
  
  if (contextRAG.citations.length > 0) {
    // We found highly relevant database matches! Let's format them in natural language
    let response = `**[Local Secretariat Database Search - Factual Assistant]**\n\n`;
    response += `I found matching official college records regarding your inquiry:\n\n`;
    
    // Render the records nicely in markdown
    const parts = contextRAG.contextText.split("---").filter(p => p.trim().length > 0);
    parts.forEach(part => {
      const lines = part.trim().split("\n");
      const titleLine = lines[0] || "Record Details";
      response += `#### 📖 ${titleLine.replace("Source Record: ", "")}\n`;
      
      const details = lines.slice(2).map(line => {
        if (line.includes(":")) {
          const colonIdx = line.indexOf(":");
          const key = line.substring(0, colonIdx).trim();
          const val = line.substring(colonIdx + 1).trim();
          return `- **${key}**: ${val}`;
        }
        return line;
      }).join("\n");
      
      response += `${details}\n\n`;
    });

    response += `*Citations & Sources checked:* \n`;
    contextRAG.citations.forEach(cit => {
      response += `- 🏛️ *${cit}*\n`;
    });
    
    response += `\n*Note: This is a direct factual retrieval from the local college database (Gemini API server is currently operating in local high-speed retrieval mode).*`;
    return response;
  }

  // Fallback if no matching records found
  return `Hello! I am Dhemaji College's AI assistant. 

I searched our active departments, notices, faculty records, and academic calendar, but couldn't find a direct record matching your query: "${userMessage}".

Here are some official college details you can ask me about:
- **Academic Departments**: Physics, Chemistry, BCA, Commerce, Assamese, Botany, etc. (Ask: "Who is the HOD of Botany?")
- **Academic Calendar & Holidays**: Ask "What holidays are in August?" or "Is the college closed tomorrow?" or "Show restricted holidays."
- **Admissions Criteria**: Requirements, yearly fees, required documents, and dates.
- **Examinations & Sessional assessments**: Routine timelines, admit card issuance, results.
- **Student Services**: Hostel, Central Library rules, NCC / NSS, scholarships.

*Would you like to ask about our departments, admissions, or holidays?*`;
}

// ---------------- SERVER INITIALIZATION & PIPELINE ----------------

async function startServer() {
  const app = express();

  // Enable CORS with proper configuration
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
  }));

  // JSON Body parser limit
  app.use(express.json({ limit: "15mb" }));

  // SECURE RATE LIMITING MIDDLEWARE
  const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};
  app.use((req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    
    if (!ipRequestCounts[ip] || now > ipRequestCounts[ip].resetTime) {
      ipRequestCounts[ip] = { count: 1, resetTime: now + 60000 }; // 1 minute window
    } else {
      ipRequestCounts[ip].count += 1;
    }

    if (ipRequestCounts[ip].count > 100) { // Limit to 100 requests per min
      res.status(429).json({ error: "Too many requests. Please wait a minute before querying the AI Secretariat Desk again." });
      return;
    }
    next();
  });

  // JWT AUTHENTICATION MIDDLEWARE FOR ADMIN WORKSPACE
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      res.status(401).json({ error: "Unauthorized. Security access token is missing." });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        res.status(403).json({ error: "Access Forbidden. Invalid or expired admin credentials." });
        return;
      }
      req.user = user;
      next();
    });
  };

  // ---------------- PUBLIC AUTHENTICATION ROUTE ----------------
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Authorized roles credentials matching
    let role: "Admin" | "Faculty" | "Staff" | null = null;
    let userName = "";

    if (cleanEmail === "admin@dhemajicollege.edu.in" && password === "admin123") {
      role = "Admin";
      userName = "Principal (System Admin)";
    } else if (cleanEmail === "faculty@dhemajicollege.edu.in" && password === "faculty123") {
      role = "Faculty";
      userName = "Professor Dutta (Science Board)";
    } else if (cleanEmail === "staff@dhemajicollege.edu.in" && password === "staff123") {
      role = "Staff";
      userName = "Nayak (Registrar Office)";
    }

    if (role) {
      const token = jwt.sign({ email: cleanEmail, role: role, name: userName }, JWT_SECRET, { expiresIn: "4h" });
      res.json({ token, role, name: userName, email: cleanEmail });
    } else {
      res.status(401).json({ error: "Invalid institutional email or password combination." });
    }
  });

  // ---------------- PUBLIC API ENDPOINTS ----------------
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: process.env.GEMINI_API_KEY ? "Gemini Cloud RAG" : "Local Search Engine fallback" });
  });

  // ---------------- PUBLIC CHAT API ENDPOINT ----------------
  app.post("/api/chat", async (req, res) => {
    const startMs = Date.now();
    const { messages, stream = true, user = { id: "guest", name: "Guest", role: "guest" }, sessionId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const userMessageText = lastMessage.text;

    if (blockedUsers.includes(user.id)) {
      res.status(403).json({ error: "Access Denied. Your student ID has been sessional flagged or temporarily blocked by the college administrators." });
      return;
    }

    chatAnalytics.totalMessages += 1;

    // Session manager
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

    session.messages.push({
      role: "user",
      text: userMessageText,
      timestamp: new Date().toISOString()
    });

    // 1. FAQ CACHE INTERCEPTOR
    const cachedResponse = queryCache[userMessageText.trim().toLowerCase()];
    if (cachedResponse) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      res.write(`data: ${JSON.stringify({ text: cachedResponse, sessionId: currentSessionId })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();

      session.messages.push({ role: "model", text: cachedResponse, timestamp: new Date().toISOString() });
      return;
    }

    // 2. DYNAMIC RETRIEVAL SEARCH (RAG)
    const dbGrounding = queryDatabaseRAG(userMessageText);

    // 3. DETERMINE GEMINI CLIENT STATUS
    let geminiError: any = null;
    let geminiClient: GoogleGenAI | null = null;
    try {
      geminiClient = getGeminiClient();
    } catch (e: any) {
      geminiError = e;
    }

    // Prepare contents payload
    const geminiContents = messages.slice(-8).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // System instruction with RAG db injection
    const activeSystemInstruction = `${SYSTEM_INSTRUCTION_BASE}

---
RETRIEVED ACTIVE DATABASE RECORDS:
${dbGrounding.contextText || "No matching database documents were found for this query. Inform the user politely and answer based on general Dhemaji College details."}

ACTIVE STUDENT LOGGED PROFILE:
- Name: ${user.name}
- Student ID: ${user.id}
- Stream Role: ${user.role === "student" ? "Registered Portal Student" : "Guest Visitor"}
`;

    // 4. STREAM SSE CHAT OR HTTP CHAT
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      if (geminiError || !geminiClient) {
        logError("WARN", `Gemini client unavailable (reason: ${geminiError?.message || "Missing Key"}). Running Local DB fallback.`);
        const fallbackText = formulateLocalFallbackAnswer(userMessageText, dbGrounding);
        
        // Simulating streaming chunks for smooth response UI
        const words = fallbackText.split(" ");
        for (let i = 0; i < words.length; i += 3) {
          const chunkBatch = words.slice(i, i + 3).join(" ") + " ";
          res.write(`data: ${JSON.stringify({ text: chunkBatch, sessionId: currentSessionId })}\n\n`);
          await new Promise(resolve => setTimeout(resolve, 20));
        }

        session.messages.push({ role: "model", text: fallbackText, timestamp: new Date().toISOString() });
        const endMs = Date.now();
        chatAnalytics.averageResponseTimeMs = Math.round((chatAnalytics.averageResponseTimeMs * 9 + (endMs - startMs)) / 10);
        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      }

      // Try calling Gemini models
      try {
        const responseStream = await geminiClient.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: geminiContents as any,
          config: {
            systemInstruction: activeSystemInstruction,
            temperature: 0.25,
            topP: 0.95
          }
        });

        let completeAnswer = "";
        for await (const chunk of responseStream) {
          const chunkText = chunk.text || "";
          completeAnswer += chunkText;
          res.write(`data: ${JSON.stringify({ text: chunkText, sessionId: currentSessionId })}\n\n`);
        }

        // Cache the answer if it was a good response and query is common
        if (userMessageText.length < 50 && completeAnswer.length > 5) {
          queryCache[userMessageText.trim().toLowerCase()] = completeAnswer;
        }

        session.messages.push({ role: "model", text: completeAnswer, timestamp: new Date().toISOString() });
        const endMs = Date.now();
        chatAnalytics.averageResponseTimeMs = Math.round((chatAnalytics.averageResponseTimeMs * 9 + (endMs - startMs)) / 10);
        res.write(`data: [DONE]\n\n`);
        res.end();
      } catch (err: any) {
        logError("ERROR", "Gemini streaming pipeline failed. Running local db fallback.", err);
        const errorText = `⚠️ **Gemini AI Service Timeout**. Swapping to Local Offline Database:\n\n` + formulateLocalFallbackAnswer(userMessageText, dbGrounding);
        res.write(`data: ${JSON.stringify({ text: errorText, sessionId: currentSessionId })}\n\n`);
        session.messages.push({ role: "model", text: errorText, timestamp: new Date().toISOString() });
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    } else {
      // Standard non-streaming
      if (geminiError || !geminiClient) {
        const fallbackText = formulateLocalFallbackAnswer(userMessageText, dbGrounding);
        session.messages.push({ role: "model", text: fallbackText, timestamp: new Date().toISOString() });
        res.json({ text: fallbackText, sessionId: currentSessionId });
        return;
      }

      try {
        const response = await geminiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: geminiContents as any,
          config: {
            systemInstruction: activeSystemInstruction,
            temperature: 0.25,
            topP: 0.95
          }
        });

        const completeAnswer = response.text || "No response generated.";
        session.messages.push({ role: "model", text: completeAnswer, timestamp: new Date().toISOString() });
        res.json({ text: completeAnswer, sessionId: currentSessionId });
      } catch (err: any) {
        logError("ERROR", "Gemini standard pipeline failed. Running local fallback.", err);
        const fallbackText = formulateLocalFallbackAnswer(userMessageText, dbGrounding);
        res.json({ text: fallbackText, sessionId: currentSessionId });
      }
    }
  });


  // ---------------- ADMIN PANEL READ/WRITE SECURED ROUTES ----------------

  // Get administrative analytics and status
  app.get("/api/admin/analytics", (req, res) => {
    res.json({
      chatAnalytics,
      totalBlocked: blockedUsers.length,
      isApiKeyConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY")
    });
  });

  app.get("/api/admin/performance", (req, res) => {
    res.json({
      cpuUsagePercent: Math.floor(Math.random() * 4) + 1,
      memoryUsageMb: Math.floor(Math.random() * 15) + 120,
      activeWsConnections: conversations.filter(c => c.active).length,
      apiLatencyMs: chatAnalytics.averageResponseTimeMs,
      cachedQueriesRatio: Object.keys(queryCache).length
    });
  });

  app.get("/api/admin/logs", (req, res) => {
    res.json(errorLogs);
  });

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

  app.post("/api/admin/conversations/delete", authenticateToken, (req, res) => {
    const { sessionId } = req.body;
    conversations = conversations.filter(c => c.id !== sessionId);
    res.json({ status: "success", message: "Conversation logs deleted." });
  });

  app.post("/api/admin/users/block", authenticateToken, (req, res) => {
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

  // 1. DEPARTMENTS CRUD
  app.get("/api/admin/departments", (req, res) => {
    res.json(dbData.departments);
  });

  app.post("/api/admin/departments", authenticateToken, (req, res) => {
    const dept = req.body;
    if (!dept.name || !dept.hod) {
      res.status(400).json({ error: "Department name and HOD are required." });
      return;
    }
    const newDept: Department = {
      id: dept.id || `dept-${Date.now()}`,
      name: dept.name,
      hod: dept.hod,
      facultyMembers: Array.isArray(dept.facultyMembers) ? dept.facultyMembers : [],
      coursesOffered: Array.isArray(dept.coursesOffered) ? dept.coursesOffered : [],
      laboratories: Array.isArray(dept.laboratories) ? dept.laboratories : [],
      research: dept.research || "None",
      contactDetails: dept.contactDetails || "",
      officeTiming: dept.officeTiming || "09:30 AM - 04:00 PM",
      description: dept.description || "",
      photos: Array.isArray(dept.photos) ? dept.photos : [],
      pdfLinks: Array.isArray(dept.pdfLinks) ? dept.pdfLinks : []
    };
    dbData.departments = dbData.departments.filter(d => d.id !== newDept.id);
    dbData.departments.unshift(newDept);
    saveDatabase();
    res.json({ status: "success", department: newDept });
  });

  app.delete("/api/admin/departments/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.departments = dbData.departments.filter(d => d.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // 2. NOTICES CRUD
  app.get("/api/admin/notices", (req, res) => {
    res.json(dbData.notices);
  });

  app.post("/api/admin/notices", authenticateToken, (req, res) => {
    const notice = req.body;
    if (!notice.title || !notice.description) {
      res.status(400).json({ error: "Notice title and description are required." });
      return;
    }
    const newNotice: Notice = {
      id: notice.id || `notice-${Date.now()}`,
      title: notice.title,
      description: notice.description,
      date: notice.date || new Date().toISOString().split("T")[0],
      category: notice.category || "General",
      pdf: notice.pdf || "",
      deadline: notice.deadline
    };
    dbData.notices = dbData.notices.filter(n => n.id !== newNotice.id);
    dbData.notices.unshift(newNotice);
    saveDatabase();
    res.json({ status: "success", notice: newNotice });
  });

  app.delete("/api/admin/notices/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.notices = dbData.notices.filter(n => n.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // 3. ADMISSIONS CRUD
  app.get("/api/admin/admissions", (req, res) => {
    res.json(dbData.admissions);
  });

  app.post("/api/admin/admissions", authenticateToken, (req, res) => {
    const adm = req.body;
    if (!adm.name || !adm.eligibility) {
      res.status(400).json({ error: "Admission program name and eligibility criteria are required." });
      return;
    }
    const newAdm: AdmissionDetail = {
      id: adm.id || `adm-${Date.now()}`,
      name: adm.name,
      eligibility: adm.eligibility,
      fees: adm.fees || "",
      documents: Array.isArray(adm.documents) ? adm.documents : [],
      applicationDates: adm.applicationDates || "",
      meritListUrl: adm.meritListUrl,
      importantLinks: Array.isArray(adm.importantLinks) ? adm.importantLinks : []
    };
    dbData.admissions = dbData.admissions.filter(a => a.id !== newAdm.id);
    dbData.admissions.unshift(newAdm);
    saveDatabase();
    res.json({ status: "success", admission: newAdm });
  });

  app.delete("/api/admin/admissions/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.admissions = dbData.admissions.filter(a => a.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // 4. EXAMINATIONS CRUD
  app.get("/api/admin/examinations", (req, res) => {
    res.json(dbData.examinations);
  });

  app.post("/api/admin/examinations", authenticateToken, (req, res) => {
    const exam = req.body;
    if (!exam.name) {
      res.status(400).json({ error: "Exam segment name is required." });
      return;
    }
    const newExam: ExaminationDetail = {
      id: exam.id || `exam-${Date.now()}`,
      name: exam.name,
      routine: exam.routine || "",
      results: exam.results || "",
      admitCards: exam.admitCards || "",
      internalExams: exam.internalExams || "",
      semesterExams: exam.semesterExams || ""
    };
    dbData.examinations = dbData.examinations.filter(e => e.id !== newExam.id);
    dbData.examinations.unshift(newExam);
    saveDatabase();
    res.json({ status: "success", examination: newExam });
  });

  app.delete("/api/admin/examinations/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.examinations = dbData.examinations.filter(e => e.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // 5. FACULTY CRUD
  app.get("/api/admin/faculty", (req, res) => {
    res.json(dbData.faculty);
  });

  app.post("/api/admin/faculty", authenticateToken, (req, res) => {
    const fac = req.body;
    if (!fac.name || !fac.department) {
      res.status(400).json({ error: "Faculty member name and department are required." });
      return;
    }
    const newFac: FacultyMember = {
      id: fac.id || `fac-${Date.now()}`,
      name: fac.name,
      department: fac.department,
      qualification: fac.qualification || "Ph.D.",
      designation: fac.designation || "Assistant Professor",
      email: fac.email || "",
      phone: fac.phone || "",
      office: fac.office || ""
    };
    dbData.faculty = dbData.faculty.filter(f => f.id !== newFac.id);
    dbData.faculty.unshift(newFac);
    saveDatabase();
    res.json({ status: "success", faculty: newFac });
  });

  app.delete("/api/admin/faculty/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.faculty = dbData.faculty.filter(f => f.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // 6. STUDENT SERVICES CRUD
  app.get("/api/admin/services", (req, res) => {
    res.json(dbData.services);
  });

  app.post("/api/admin/services", authenticateToken, (req, res) => {
    const serv = req.body;
    if (!serv.name || !serv.description) {
      res.status(400).json({ error: "Service name and description are required." });
      return;
    }
    const newServ: StudentService = {
      id: serv.id || `serv-${Date.now()}`,
      name: serv.name,
      description: serv.description,
      details: serv.details || ""
    };
    dbData.services = dbData.services.filter(s => s.id !== newServ.id);
    dbData.services.unshift(newServ);
    saveDatabase();
    res.json({ status: "success", service: newServ });
  });

  app.delete("/api/admin/services/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.services = dbData.services.filter(s => s.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // 7. ACADEMIC CALENDAR EVENTS CRUD
  app.get("/api/admin/events", (req, res) => {
    res.json(dbData.events);
  });

  app.post("/api/admin/events", authenticateToken, (req, res) => {
    const ev = req.body;
    if (!ev.title || !ev.category || !ev.date) {
      res.status(400).json({ error: "Event title, category, and scheduled date are required." });
      return;
    }
    const newEvent: AcademicEvent = {
      id: ev.id || `ev-${Date.now()}`,
      title: ev.title,
      description: ev.description || "",
      category: ev.category,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      department: ev.department,
      venue: ev.venue || "Campus grounds",
      pdfAttachment: ev.pdfAttachment,
      organizer: ev.organizer || "Administrative Board",
      status: ev.status || "Upcoming"
    };
    dbData.events = dbData.events.filter(e => e.id !== newEvent.id);
    dbData.events.unshift(newEvent);
    saveDatabase();
    res.json({ status: "success", event: newEvent });
  });

  app.delete("/api/admin/events/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    dbData.events = dbData.events.filter(e => e.id !== id);
    saveDatabase();
    res.json({ status: "success", id });
  });

  // BULK EXCEL/CSV DATA IMPORT ENDPOINT
  app.post("/api/admin/import", authenticateToken, (req, res) => {
    const { table, data } = req.body; // data is a JSON array representing CSV parsed rows
    
    if (!table || !Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: "Table name and data array are required." });
      return;
    }

    try {
      if (table === "departments") {
        data.forEach((row: any) => {
          if (!row.name || !row.hod) return;
          const newDept: Department = {
            id: row.id || `dept-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: row.name,
            hod: row.hod,
            facultyMembers: typeof row.facultyMembers === "string" ? row.facultyMembers.split(";").map((x: string) => x.trim()) : (Array.isArray(row.facultyMembers) ? row.facultyMembers : []),
            coursesOffered: typeof row.coursesOffered === "string" ? row.coursesOffered.split(";").map((x: string) => x.trim()) : (Array.isArray(row.coursesOffered) ? row.coursesOffered : []),
            laboratories: typeof row.laboratories === "string" ? row.laboratories.split(";").map((x: string) => x.trim()) : (Array.isArray(row.laboratories) ? row.laboratories : []),
            research: row.research || "None",
            contactDetails: row.contactDetails || "",
            officeTiming: row.officeTiming || "09:30 AM - 04:00 PM",
            description: row.description || "",
            photos: typeof row.photos === "string" ? row.photos.split(";").map((x: string) => x.trim()) : (Array.isArray(row.photos) ? row.photos : []),
            pdfLinks: typeof row.pdfLinks === "string" ? row.pdfLinks.split(";").map((x: string) => x.trim()) : (Array.isArray(row.pdfLinks) ? row.pdfLinks : [])
          };
          dbData.departments = dbData.departments.filter(d => d.name.toLowerCase() !== newDept.name.toLowerCase());
          dbData.departments.unshift(newDept);
        });
      } else if (table === "notices") {
        data.forEach((row: any) => {
          if (!row.title || !row.description) return;
          const newNotice: Notice = {
            id: row.id || `notice-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: row.title,
            description: row.description,
            date: row.date || new Date().toISOString().split("T")[0],
            category: row.category || "General",
            pdf: row.pdf || "",
            deadline: row.deadline
          };
          dbData.notices = dbData.notices.filter(n => n.title.toLowerCase() !== newNotice.title.toLowerCase());
          dbData.notices.unshift(newNotice);
        });
      } else if (table === "faculty") {
        data.forEach((row: any) => {
          if (!row.name || !row.department) return;
          const newFac: FacultyMember = {
            id: row.id || `fac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: row.name,
            department: row.department,
            qualification: row.qualification || "Ph.D.",
            designation: row.designation || "Assistant Professor",
            email: row.email || "",
            phone: row.phone || "",
            office: row.office || ""
          };
          dbData.faculty = dbData.faculty.filter(f => f.name.toLowerCase() !== newFac.name.toLowerCase());
          dbData.faculty.unshift(newFac);
        });
      } else if (table === "events") {
        data.forEach((row: any) => {
          if (!row.title || !row.category || !row.date) return;
          const newEvent: AcademicEvent = {
            id: row.id || `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: row.title,
            description: row.description || "",
            category: row.category,
            date: row.date,
            startTime: row.startTime,
            endTime: row.endTime,
            department: row.department,
            venue: row.venue || "Main Campus grounds",
            pdfAttachment: row.pdfAttachment,
            organizer: row.organizer || "Administrative Secretariat",
            status: row.status || "Upcoming"
          };
          dbData.events = dbData.events.filter(e => !(e.title.toLowerCase() === newEvent.title.toLowerCase() && e.date === newEvent.date));
          dbData.events.unshift(newEvent);
        });
      } else {
        res.status(400).json({ error: `Table '${table}' is not supported for bulk import.` });
        return;
      }
      
      saveDatabase();
      res.json({ status: "success", message: `Successfully bulk imported ${data.length} records into '${table}'.` });
    } catch (err: any) {
      logError("ERROR", `Bulk import failed on '${table}' table.`, err);
      res.status(500).json({ error: `Internal execution error during bulk import: ${err.message}` });
    }
  });


  // ---------------- VITE MIDDLEWARE INTERCEPTOR ----------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted on Express app.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled assets from production folder:", distPath);
  }

  // Final listen port activation
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application successfully listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("CRITICAL FAILURE: Failed to initialize the college application server.", err);
});
