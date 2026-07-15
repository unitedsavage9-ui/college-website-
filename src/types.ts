export interface Student {
  name: string;
  id: string;
  department: string;
  photoUrl: string;
  cgpa: number;
  attendancePercent: number;
  feesDue: number;
  feesPaid: number;
  email?: string;
  phone?: string;
}

export interface CourseScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  completed: boolean;
  prestigeBorder: boolean;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: 'pending' | 'due' | 'announcement';
}

export interface SubjectAttendance {
  id: string;
  subjectCode: string;
  subjectName: string;
  attendedClasses: number;
  totalClasses: number;
  attendancePercent: number;
  lastAttended: string;
}

export interface SemesterResult {
  id: string;
  semesterName: string;
  sgpa: number;
  subjects: Array<{
    code: string;
    name: string;
    grade: string;
    credits: number;
    internalMarks: number;
    externalMarks: number;
    maxMarks: number;
  }>;
}

export interface FeeItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category: string;
  transactionId?: string;
  paymentDate?: string;
}
