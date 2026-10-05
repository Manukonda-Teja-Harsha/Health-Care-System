// ─────────────────────────────────────────────────────────────────────────────
// Central Doctor Dataset — used across the entire public Doctors module
// All data is deterministic. No randomisation. Survives page refresh.
// ─────────────────────────────────────────────────────────────────────────────

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface TimelineEntry {
  year: number;
  title: string;
  hospital: string;
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
}

export type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface DaySchedule {
  label: string;
  slots: string[];
  bookedSlots: string[];
}

export type WeeklyAvailability = Partial<Record<DayKey, DaySchedule>>;

export interface HospitalLocation {
  building: string;
  department: string;
  floor: string;
  room: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualifications: string;
  education: Education[];
  experienceTimeline: TimelineEntry[];
  experience: number;
  bio: string;
  expertise: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  fee: number;
  consultationTypes: ('In-Person' | 'Video Consultation')[];
  availability: WeeklyAvailability;
  availableToday: boolean;
  nextSlot: string;
  hospital: string;
  location: HospitalLocation;
  avatar: string;
  avatarColor: string;
  reviews: Review[];
}

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Interventional Cardiologist',
    department: 'Cardiology',
    qualifications: 'MBBS, MD (Cardiology), FACC',
    education: [
      { degree: 'MBBS', institution: 'King\'s College London', year: 2001 },
      { degree: 'MD – Cardiology', institution: 'Johns Hopkins University', year: 2005 },
      { degree: 'FACC – Fellowship', institution: 'American College of Cardiology', year: 2008 },
    ],
    experienceTimeline: [
      { year: 2018, title: 'Senior Consultant Cardiologist', hospital: 'City General Hospital' },
      { year: 2013, title: 'Consultant Cardiologist', hospital: 'Metro Heart Institute' },
      { year: 2008, title: 'Resident Physician', hospital: 'National Cardiac Centre' },
    ],
    experience: 15,
    bio: 'Dr. Sarah Jenkins is a board-certified interventional cardiologist with over 15 years of experience managing complex cardiovascular conditions. She specialises in minimally invasive cardiac procedures, preventive cardiology, and heart failure management. She has authored over 40 peer-reviewed publications and is a Fellow of the American College of Cardiology.',
    expertise: ['Coronary Artery Disease', 'Heart Failure', 'Arrhythmia', 'Hypertension', 'Preventive Cardiology', 'Cardiac Imaging'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 312,
    fee: 150,
    consultationTypes: ['In-Person', 'Video Consultation'],
    availableToday: true,
    nextSlot: 'Today, 2:30 PM',
    hospital: 'City General Hospital',
    location: { building: 'Main Hospital', department: 'Cardiology Dept.', floor: '3rd Floor', room: 'Clinic 302' },
    availability: {
      MON: { label: '09:00 – 13:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM'], bookedSlots: ['09:30 AM','11:00 AM'] },
      TUE: { label: '14:00 – 18:00', slots: ['02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'], bookedSlots: ['03:00 PM','04:00 PM'] },
      WED: { label: '09:00 – 13:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'], bookedSlots: ['10:00 AM'] },
      FRI: { label: '10:00 – 16:00', slots: ['10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'], bookedSlots: ['10:30 AM','02:00 PM'] },
    },
    avatar: 'SJ',
    avatarColor: 'bg-rose-500',
    reviews: [
      { id: 'r1-1', patientName: 'Michael Torres', rating: 5, date: 'Sep 10, 2026', text: 'Dr. Jenkins is incredibly thorough and caring. She took the time to explain everything clearly and made me feel at ease during a stressful time. Highly recommended.', verified: true },
      { id: 'r1-2', patientName: 'Priya Nair', rating: 5, date: 'Aug 22, 2026', text: 'Exceptional cardiologist. Very knowledgeable and patient-focused. My treatment plan has made a real difference to my quality of life.', verified: true },
      { id: 'r1-3', patientName: 'James Whitfield', rating: 4, date: 'Jul 14, 2026', text: 'Very professional and efficient. Waiting time was a bit long but the consultation itself was excellent.', verified: true },
      { id: 'r1-4', patientName: 'Aisha Rahman', rating: 5, date: 'Jun 30, 2026', text: 'Best cardiologist I have seen. She explained every detail of my condition and the treatment options available.', verified: false },
    ],
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Johnson',
    specialty: 'General Practitioner',
    department: 'General Medicine',
    qualifications: 'MBBS, MRCGP',
    education: [
      { degree: 'MBBS', institution: 'University of Edinburgh', year: 2007 },
      { degree: 'MRCGP', institution: 'Royal College of GPs', year: 2011 },
    ],
    experienceTimeline: [
      { year: 2016, title: 'Senior GP', hospital: 'City General Hospital' },
      { year: 2011, title: 'General Practitioner', hospital: 'Eastside Family Clinic' },
    ],
    experience: 10,
    bio: 'Dr. Marcus Johnson is a compassionate and highly regarded GP focused on providing comprehensive, patient-centred primary care. He emphasises preventive medicine and chronic disease management, building long-term therapeutic relationships with patients and their families.',
    expertise: ['Primary Care', 'Chronic Disease Management', 'Preventive Medicine', 'Minor Procedures', 'Mental Health Support'],
    languages: ['English'],
    rating: 4.8,
    reviewCount: 198,
    fee: 100,
    consultationTypes: ['In-Person', 'Video Consultation'],
    availableToday: true,
    nextSlot: 'Today, 4:00 PM',
    hospital: 'City General Hospital',
    location: { building: 'Outpatient Wing', department: 'General Medicine', floor: '1st Floor', room: 'Room 104' },
    availability: {
      MON: { label: '08:00 – 18:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'], bookedSlots: ['08:00 AM','09:00 AM','02:00 PM'] },
      TUE: { label: '08:00 – 18:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'], bookedSlots: ['10:00 AM','11:00 AM'] },
      WED: { label: '08:00 – 13:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM'], bookedSlots: [] },
      THU: { label: '08:00 – 18:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'], bookedSlots: ['09:00 AM','03:00 PM'] },
      FRI: { label: '08:00 – 14:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM'], bookedSlots: ['08:00 AM'] },
      SAT: { label: '09:00 – 12:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM'], bookedSlots: ['09:30 AM'] },
    },
    avatar: 'MJ',
    avatarColor: 'bg-blue-500',
    reviews: [
      { id: 'r2-1', patientName: 'Olivia Chen', rating: 5, date: 'Sep 5, 2026', text: 'Dr. Johnson is wonderful. He listens carefully and never rushes the consultation. My whole family sees him.', verified: true },
      { id: 'r2-2', patientName: 'Tom Hargreaves', rating: 4, date: 'Aug 18, 2026', text: 'Very approachable and thorough. Good at following up on ongoing issues.', verified: true },
      { id: 'r2-3', patientName: 'Mei Lin', rating: 5, date: 'Jul 22, 2026', text: 'Excellent doctor. Very empathetic and clear in his explanations.', verified: true },
    ],
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Davis',
    specialty: 'Consultant Neurologist',
    department: 'Neurology',
    qualifications: 'MBBS, DM (Neurology), FRCP',
    education: [
      { degree: 'MBBS', institution: 'University of Oxford', year: 2004 },
      { degree: 'DM – Neurology', institution: 'NIMHANS Bangalore', year: 2008 },
      { degree: 'FRCP', institution: 'Royal College of Physicians', year: 2012 },
    ],
    experienceTimeline: [
      { year: 2017, title: 'Senior Consultant Neurologist', hospital: 'City General Hospital' },
      { year: 2012, title: 'Consultant Neurologist', hospital: 'Metro Neurosciences Centre' },
      { year: 2008, title: 'Resident Neurologist', hospital: 'National Institute of Mental Health' },
    ],
    experience: 12,
    bio: 'Dr. Emily Davis is a highly distinguished consultant neurologist specialising in epilepsy, movement disorders, and neurodegenerative diseases. She combines clinical excellence with a deeply patient-centred approach, ensuring each patient receives a tailored and evidence-based treatment plan.',
    expertise: ['Epilepsy', "Parkinson's Disease", 'Multiple Sclerosis', 'Migraine', 'Stroke Management', 'Dementia'],
    languages: ['English', 'French'],
    rating: 4.9,
    reviewCount: 254,
    fee: 200,
    consultationTypes: ['In-Person', 'Video Consultation'],
    availableToday: false,
    nextSlot: 'Tomorrow, 10:00 AM',
    hospital: 'City General Hospital',
    location: { building: 'Neurosciences Block', department: 'Neurology Dept.', floor: '4th Floor', room: 'Suite 401' },
    availability: {
      TUE: { label: '10:00 – 16:00', slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM'], bookedSlots: ['11:00 AM','03:00 PM'] },
      THU: { label: '10:00 – 16:00', slots: ['10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM'], bookedSlots: ['10:00 AM','02:30 PM'] },
      FRI: { label: '09:00 – 13:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'], bookedSlots: ['09:30 AM'] },
    },
    avatar: 'ED',
    avatarColor: 'bg-violet-500',
    reviews: [
      { id: 'r3-1', patientName: 'Sanjay Patel', rating: 5, date: 'Sep 12, 2026', text: 'Dr. Davis is exceptional. She diagnosed a complex neurological condition that other doctors had missed for years. Forever grateful.', verified: true },
      { id: 'r3-2', patientName: 'Laura Simmons', rating: 5, date: 'Aug 3, 2026', text: 'Very professional and thorough. She explained my MRI results clearly and laid out a comprehensive treatment plan.', verified: true },
      { id: 'r3-3', patientName: 'Ravi Krishnan', rating: 4, date: 'Jul 27, 2026', text: 'Highly knowledgeable neurologist. Appointments are well worth the wait.', verified: false },
    ],
  },
  {
    id: 'doc-4',
    name: 'Dr. Arjun Mehta',
    specialty: 'Orthopaedic Surgeon',
    department: 'Orthopedics',
    qualifications: 'MBBS, MS (Ortho), FRCS',
    education: [
      { degree: 'MBBS', institution: 'AIIMS New Delhi', year: 1999 },
      { degree: 'MS – Orthopaedics', institution: 'AIIMS New Delhi', year: 2003 },
      { degree: 'FRCS (Ortho)', institution: 'Royal College of Surgeons', year: 2008 },
    ],
    experienceTimeline: [
      { year: 2015, title: 'Senior Orthopaedic Surgeon', hospital: 'City General Hospital' },
      { year: 2010, title: 'Consultant Orthopaedic Surgeon', hospital: 'Global Joint Care Centre' },
      { year: 2003, title: 'Resident Surgeon', hospital: 'AIIMS New Delhi' },
    ],
    experience: 18,
    bio: 'Dr. Arjun Mehta is one of the region\'s most experienced orthopaedic surgeons, with 18 years of expertise in joint replacement, sports injuries, and complex spinal surgeries. He has performed over 2,000 successful knee and hip replacements with consistently excellent long-term outcomes.',
    expertise: ['Knee Replacement', 'Hip Replacement', 'Sports Injuries', 'Spine Surgery', 'Fracture Management', 'Arthroscopy'],
    languages: ['English', 'Hindi'],
    rating: 4.8,
    reviewCount: 421,
    fee: 175,
    consultationTypes: ['In-Person'],
    availableToday: false,
    nextSlot: 'Mon, Oct 27',
    hospital: 'City General Hospital',
    location: { building: 'Surgical Block', department: 'Orthopaedics Dept.', floor: '5th Floor', room: 'OPD 502' },
    availability: {
      MON: { label: '09:00 – 13:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM'], bookedSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM'] },
      WED: { label: '14:00 – 18:00', slots: ['02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM'], bookedSlots: ['02:00 PM','02:30 PM','03:00 PM'] },
    },
    avatar: 'AM',
    avatarColor: 'bg-amber-600',
    reviews: [
      { id: 'r4-1', patientName: 'Wendy Clarke', rating: 5, date: 'Sep 8, 2026', text: 'Dr. Mehta performed my knee replacement surgery. I am walking pain-free for the first time in years. Outstanding surgeon.', verified: true },
      { id: 'r4-2', patientName: 'David Okonkwo', rating: 5, date: 'Aug 14, 2026', text: 'Incredibly skilled and reassuring. My hip replacement recovery was faster than expected.', verified: true },
      { id: 'r4-3', patientName: 'Helen Marsh', rating: 4, date: 'Jul 19, 2026', text: 'Brilliant surgeon. The post-op care plan was thorough and well-communicated.', verified: true },
    ],
  },
  {
    id: 'doc-5',
    name: 'Dr. Priya Kapoor',
    specialty: 'Consultant Dermatologist',
    department: 'Dermatology',
    qualifications: 'MBBS, MD (Dermatology)',
    education: [
      { degree: 'MBBS', institution: 'Maulana Azad Medical College', year: 2008 },
      { degree: 'MD – Dermatology', institution: 'PGIMER Chandigarh', year: 2012 },
    ],
    experienceTimeline: [
      { year: 2018, title: 'Consultant Dermatologist', hospital: 'City General Hospital' },
      { year: 2012, title: 'Dermatology Registrar', hospital: 'Skin & Laser Institute' },
    ],
    experience: 8,
    bio: 'Dr. Priya Kapoor is a qualified consultant dermatologist with expertise in both medical and cosmetic dermatology. She has extensive experience in treating skin conditions including acne, eczema, and psoriasis, and uses the latest evidence-based techniques for skin cancer screening and cosmetic procedures.',
    expertise: ['Acne & Scarring', 'Eczema & Psoriasis', 'Hair Loss', 'Skin Cancer Screening', 'Cosmetic Dermatology', 'Vitiligo'],
    languages: ['English', 'Hindi'],
    rating: 4.7,
    reviewCount: 145,
    fee: 130,
    consultationTypes: ['In-Person', 'Video Consultation'],
    availableToday: true,
    nextSlot: 'Today, 3:00 PM',
    hospital: 'City General Hospital',
    location: { building: 'Outpatient Wing', department: 'Dermatology Dept.', floor: '2nd Floor', room: 'Clinic 210' },
    availability: {
      MON: { label: '10:00 – 18:00', slots: ['10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'], bookedSlots: ['10:00 AM','11:00 AM'] },
      TUE: { label: '10:00 – 18:00', slots: ['10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM'], bookedSlots: ['12:00 PM'] },
      THU: { label: '10:00 – 18:00', slots: ['10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM'], bookedSlots: ['02:00 PM','03:00 PM'] },
      FRI: { label: '10:00 – 14:00', slots: ['10:00 AM','11:00 AM','12:00 PM','01:00 PM'], bookedSlots: [] },
      SAT: { label: '10:00 – 13:00', slots: ['10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM'], bookedSlots: ['10:30 AM'] },
    },
    avatar: 'PK',
    avatarColor: 'bg-pink-500',
    reviews: [
      { id: 'r5-1', patientName: 'Natasha Williams', rating: 5, date: 'Sep 15, 2026', text: 'Dr. Kapoor transformed my skin. I had struggled with severe acne for years — her treatment plan was life-changing.', verified: true },
      { id: 'r5-2', patientName: 'Ben Edwards', rating: 4, date: 'Aug 28, 2026', text: 'Very knowledgeable and helpful. Gave practical advice and a clear treatment plan.', verified: true },
      { id: 'r5-3', patientName: 'Fatima Zahra', rating: 5, date: 'Jul 10, 2026', text: 'Excellent dermatologist. She was thorough and explained everything clearly.', verified: false },
    ],
  },
  {
    id: 'doc-6',
    name: "Dr. James O'Brien",
    specialty: 'Consultant Paediatrician',
    department: 'Pediatrics',
    qualifications: 'MBBS, MRCPCH, DCH',
    education: [
      { degree: 'MBBS', institution: 'University College Dublin', year: 2003 },
      { degree: 'DCH – Diploma in Child Health', institution: 'Royal College of Physicians Ireland', year: 2006 },
      { degree: 'MRCPCH', institution: 'Royal College of Paediatrics', year: 2009 },
    ],
    experienceTimeline: [
      { year: 2016, title: 'Senior Consultant Paediatrician', hospital: 'City General Hospital' },
      { year: 2009, title: 'Paediatric Registrar', hospital: "Children's National Hospital" },
    ],
    experience: 14,
    bio: "Dr. James O'Brien is a dedicated consultant paediatrician with 14 years of clinical experience caring for children from newborns to teenagers. He has particular expertise in childhood developmental disorders, respiratory conditions, and neonatal care, always prioritising the wellbeing of his young patients and their families.",
    expertise: ['Neonatal Care', 'Childhood Asthma', 'Developmental Disorders', 'Vaccination', 'Nutrition & Growth', 'Paediatric Infections'],
    languages: ['English'],
    rating: 4.9,
    reviewCount: 289,
    fee: 120,
    consultationTypes: ['In-Person', 'Video Consultation'],
    availableToday: true,
    nextSlot: 'Today, 11:00 AM',
    hospital: 'City General Hospital',
    location: { building: "Children's Wing", department: 'Paediatrics Dept.', floor: '2nd Floor', room: 'Paed OPD 205' },
    availability: {
      MON: { label: '08:00 – 16:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM'], bookedSlots: ['08:00 AM','09:00 AM','12:00 PM'] },
      TUE: { label: '08:00 – 16:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM'], bookedSlots: ['10:00 AM'] },
      WED: { label: '08:00 – 12:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM'], bookedSlots: [] },
      THU: { label: '08:00 – 16:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM'], bookedSlots: ['08:00 AM','02:00 PM'] },
      FRI: { label: '08:00 – 12:00', slots: ['08:00 AM','09:00 AM','10:00 AM','11:00 AM'], bookedSlots: ['11:00 AM'] },
    },
    avatar: 'JO',
    avatarColor: 'bg-cyan-500',
    reviews: [
      { id: 'r6-1', patientName: 'Claire Murphy', rating: 5, date: 'Sep 18, 2026', text: 'Dr. O\'Brien is amazing with children. My 5-year-old actually looks forward to his check-ups. Cannot recommend highly enough.', verified: true },
      { id: 'r6-2', patientName: 'Samuel Osei', rating: 5, date: 'Aug 10, 2026', text: 'Brilliant paediatrician. He was thorough, patient, and explained everything in a way both my wife and I could understand.', verified: true },
    ],
  },
  {
    id: 'doc-7',
    name: 'Dr. Fatima Al-Hassan',
    specialty: 'ENT Surgeon',
    department: 'ENT',
    qualifications: 'MBBS, MS (ENT), FRCS (ORL-HNS)',
    education: [
      { degree: 'MBBS', institution: 'University of Jordan', year: 2005 },
      { degree: 'MS – ENT', institution: 'Ain Shams University', year: 2009 },
      { degree: 'FRCS (ORL-HNS)', institution: 'Royal College of Surgeons', year: 2013 },
    ],
    experienceTimeline: [
      { year: 2018, title: 'Consultant ENT Surgeon', hospital: 'City General Hospital' },
      { year: 2013, title: 'ENT Registrar', hospital: 'Royal ENT Hospital' },
    ],
    experience: 11,
    bio: 'Dr. Fatima Al-Hassan is a consultant ENT surgeon with expertise in both adult and paediatric ear, nose, and throat disorders. She is skilled in endoscopic sinus surgery, hearing rehabilitation, and head & neck oncology, bringing a meticulous and compassionate approach to every patient.',
    expertise: ['Sinus Surgery', 'Hearing Loss', 'Tonsillectomy', 'Head & Neck Tumours', 'Sleep Apnoea', 'Nasal Reconstruction'],
    languages: ['English', 'Arabic'],
    rating: 4.8,
    reviewCount: 167,
    fee: 145,
    consultationTypes: ['In-Person'],
    availableToday: true,
    nextSlot: 'Today, 5:00 PM',
    hospital: 'City General Hospital',
    location: { building: 'Surgical Block', department: 'ENT Dept.', floor: '3rd Floor', room: 'ENT Clinic 308' },
    availability: {
      MON: { label: '09:00 – 17:00', slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'], bookedSlots: ['09:00 AM','10:00 AM','02:00 PM'] },
      TUE: { label: '09:00 – 13:00', slots: ['09:00 AM','10:00 AM','11:00 AM','12:00 PM'], bookedSlots: ['09:00 AM'] },
      THU: { label: '09:00 – 17:00', slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'], bookedSlots: ['11:00 AM','03:00 PM'] },
    },
    avatar: 'FA',
    avatarColor: 'bg-teal-500',
    reviews: [
      { id: 'r7-1', patientName: 'Hassan Al-Rashid', rating: 5, date: 'Sep 6, 2026', text: 'Dr. Al-Hassan performed my sinus surgery with exceptional skill. Recovery was smooth and my symptoms have completely resolved.', verified: true },
      { id: 'r7-2', patientName: 'Sophie Grant', rating: 4, date: 'Aug 20, 2026', text: 'Very experienced ENT surgeon. She was confident and thorough in her assessment.', verified: true },
    ],
  },
  {
    id: 'doc-8',
    name: 'Dr. Ananya Sharma',
    specialty: 'Consultant Gynaecologist',
    department: 'Gynecology',
    qualifications: 'MBBS, MD (OBG), FRCOG',
    education: [
      { degree: 'MBBS', institution: 'Lady Hardinge Medical College', year: 2004 },
      { degree: 'MD – Obstetrics & Gynaecology', institution: 'PGIMER Chandigarh', year: 2008 },
      { degree: 'FRCOG', institution: 'Royal College of Obstetricians', year: 2013 },
    ],
    experienceTimeline: [
      { year: 2017, title: 'Senior Consultant Gynaecologist', hospital: 'City General Hospital' },
      { year: 2013, title: 'Consultant Gynaecologist', hospital: 'Women\'s Health Centre' },
      { year: 2008, title: 'OBG Resident', hospital: 'Lady Hardinge Medical College Hospital' },
    ],
    experience: 13,
    bio: "Dr. Ananya Sharma is a senior consultant gynaecologist and obstetrician with 13 years of clinical excellence. She provides comprehensive women's health care covering antenatal care, laparoscopic gynaecological surgery, and management of complex reproductive conditions, with a focus on holistic, compassionate care.",
    expertise: ['Obstetrics & Antenatal Care', 'Laparoscopic Surgery', 'PCOS', 'Endometriosis', 'Menopause Management', 'Fertility Counselling'],
    languages: ['English', 'Hindi'],
    rating: 4.9,
    reviewCount: 338,
    fee: 160,
    consultationTypes: ['In-Person', 'Video Consultation'],
    availableToday: false,
    nextSlot: 'Wed, Oct 29',
    hospital: 'City General Hospital',
    location: { building: "Women's Health Wing", department: 'Gynaecology Dept.', floor: '4th Floor', room: 'Clinic 415' },
    availability: {
      MON: { label: '09:00 – 15:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM'], bookedSlots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM'] },
      WED: { label: '09:00 – 15:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM'], bookedSlots: ['09:00 AM','09:30 AM'] },
      THU: { label: '09:00 – 13:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM'], bookedSlots: ['09:30 AM'] },
      FRI: { label: '09:00 – 13:00', slots: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM'], bookedSlots: [] },
    },
    avatar: 'AS',
    avatarColor: 'bg-purple-500',
    reviews: [
      { id: 'r8-1', patientName: 'Meera Iyer', rating: 5, date: 'Sep 14, 2026', text: 'Dr. Sharma is outstanding. She made me feel completely at ease throughout my pregnancy. Her expertise and bedside manner are exceptional.', verified: true },
      { id: 'r8-2', patientName: 'Julia Fernandez', rating: 5, date: 'Aug 25, 2026', text: 'The best gynaecologist I have ever seen. Her laparoscopic surgery was successful and my recovery was very quick.', verified: true },
      { id: 'r8-3', patientName: 'Asha Krishnamurthy', rating: 4, date: 'Jul 30, 2026', text: 'Very thorough and professional. She explains everything clearly and takes time to address all concerns.', verified: true },
    ],
  },
];

// ── Symptom → Department mapping for "Find Right Doctor" feature ──────────────
export const SYMPTOM_MAP: Record<string, string> = {
  'Heart & Chest':    'Cardiology',
  'Head & Brain':     'Neurology',
  'Bones & Joints':   'Orthopedics',
  'Skin':             'Dermatology',
  'Children':         'Pediatrics',
  'Ear, Nose, Throat':'ENT',
  "Women's Health":   'Gynecology',
  'General Health':   'General Medicine',
};

export const DEPARTMENTS = [
  { name: 'Cardiology',       icon: '❤️',  description: 'Heart & cardiovascular system' },
  { name: 'Neurology',        icon: '🧠',  description: 'Brain, spinal cord & nerves' },
  { name: 'Orthopedics',      icon: '🦴',  description: 'Bones, joints & musculoskeletal' },
  { name: 'Dermatology',      icon: '✨',  description: 'Skin, hair & nails' },
  { name: 'Pediatrics',       icon: '👶',  description: 'Infants, children & adolescents' },
  { name: 'ENT',              icon: '👂',  description: 'Ear, nose, throat & head-neck' },
  { name: 'Gynecology',       icon: '💜',  description: "Women's reproductive health" },
  { name: 'General Medicine', icon: '🩺',  description: 'Primary & preventive care' },
];
