export type UserRole = 'admin' | 'librarian' | 'student';

export type BookCategory =
  | 'উপন্যাস (Novel)'
  | 'কবিতা (Poetry)'
  | 'বিজ্ঞান ও প্রযুক্তি (Science)'
  | 'ইতিহাস ও মুক্তিযুদ্ধ (History)'
  | 'দর্শন ও প্রবন্ধ (Philosophy)'
  | 'নাটক ও সাহিত্য (Drama)';

export interface BookRecord {
  id: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  category: BookCategory;
  isbn: string;
  shelfCode: string;
  totalCopies: number;
  availableCopies: number;
  publishYear: number;
  coverColor: string;
  spineAccent: string;
  summaryBn: string;
  summaryEn: string;
  addedByUid: string;
  createdAt: string;
  updatedAt: string;
}

export type LibrarianShift =
  | 'Morning (8:00 AM - 2:00 PM)'
  | 'Afternoon (2:00 PM - 8:00 PM)'
  | 'Full Day (9:00 AM - 5:00 PM)';

export interface LibrarianRecord {
  id: string;
  name: string;
  nameBn: string;
  employeeId: string;
  department: string;
  shift: LibrarianShift;
  status: 'active' | 'suspended';
  addedByUid: string;
  createdAt: string;
  updatedAt: string;
}

export type AcademicSemester =
  | '1st Semester'
  | '2nd Semester'
  | '3rd Semester'
  | '4th Semester'
  | '5th Semester'
  | '6th Semester'
  | '7th Semester'
  | '8th Semester'
  | 'Honours Final'
  | 'Masters';

export interface StudentApprovalRecord {
  id: string;
  studentName: string;
  studentNameBn: string;
  rollNumber: string;
  department: string;
  semester: AcademicSemester;
  sessionYear: string;
  status: 'pending' | 'approved' | 'rejected';
  maxBooksAllowed: number;
  applicantUid: string;
  reviewedByUid: string;
  createdAt: string;
  updatedAt: string;
}

export interface CirculationLoanRecord {
  id: string;
  bookId: string;
  bookTitleBn: string;
  bookTitleEn: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'requested' | 'issued' | 'returned';
  fineAmountBdt: number;
  issuedByUid: string;
  createdAt: string;
  updatedAt: string;
}

export const BOOK_CATEGORIES: BookCategory[] = [
  'উপন্যাস (Novel)',
  'কবিতা (Poetry)',
  'বিজ্ঞান ও প্রযুক্তি (Science)',
  'ইতিহাস ও মুক্তিযুদ্ধ (History)',
  'দর্শন ও প্রবন্ধ (Philosophy)',
  'নাটক ও সাহিত্য (Drama)',
];

export const LIBRARIAN_SHIFTS: LibrarianShift[] = [
  'Morning (8:00 AM - 2:00 PM)',
  'Afternoon (2:00 PM - 8:00 PM)',
  'Full Day (9:00 AM - 5:00 PM)',
];

export const ACADEMIC_SEMESTERS: AcademicSemester[] = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
  'Honours Final',
  'Masters',
];

export const INITIAL_BANGLA_BOOKS: BookRecord[] = [
  {
    id: 'bk-pather-panchali',
    titleBn: 'পথের পাঁচালী',
    titleEn: 'Pather Panchali (Song of the Little Road)',
    authorBn: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
    authorEn: 'Bibhutibhushan Bandyopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-7215-001-3',
    shelfCode: 'BN-NV-101',
    totalCopies: 12,
    availableCopies: 9,
    publishYear: 1929,
    coverColor: '#5c1d24',
    spineAccent: '#d4af37',
    summaryBn:
      'বাংলার গ্রামীণ প্রকৃতি, অপু ও দুর্গার শৈশব এবং নিশ্চিন্দিপুর গ্রামের চিরায়ত জীবনচিত্রের এক অমর কথাশিল্প।',
    summaryEn:
      'A foundational masterpiece of Bengali literature chronicling childhood wonder, rural Bengal, and resilience through the eyes of Apu and Durga.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'bk-gitanjali',
    titleBn: 'গীতাঞ্জলি',
    titleEn: 'Gitanjali (Song Offerings)',
    authorBn: 'রবীন্দ্রনাথ ঠাকুর',
    authorEn: 'Rabindranath Tagore',
    category: 'কবিতা (Poetry)',
    isbn: '978-81-7522-104-8',
    shelfCode: 'BN-PT-102',
    totalCopies: 15,
    availableCopies: 13,
    publishYear: 1910,
    coverColor: '#1b3b2b',
    spineAccent: '#e6c253',
    summaryBn:
      'নোবেলজয়ী কাব্যগ্রন্থ যেখানে ভক্তি, প্রকৃতি, মানবাত্মা ও অসীমের সাথে মিলনের বাণী গীতিময় ছন্দে প্রকাশিত।',
    summaryEn:
      'Nobel Prize-winning anthology of 157 devotional and philosophical Bengali lyrics exploring nature, humanity, and the infinite.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z',
  },
  {
    id: 'bk-hajar-bochor-dhore',
    titleBn: 'হাজার বছর ধরে',
    titleEn: 'Hajar Bochor Dhore (For a Thousand Years)',
    authorBn: 'জহির রায়হান',
    authorEn: 'Zahir Raihan',
    category: 'উপন্যাস (Novel)',
    isbn: '978-984-412-033-4',
    shelfCode: 'BN-NV-103',
    totalCopies: 10,
    availableCopies: 7,
    publishYear: 1964,
    coverColor: '#1e2f4d',
    spineAccent: '#f0c674',
    summaryBn:
      'টুনি ও মন্তুর হৃদয়স্পর্শী আখ্যানের মধ্য দিয়ে আবহমান বাংলার গ্রামীণ সমাজ, সংস্কার ও জীবনসংগ্রামের প্রতিচ্ছবি।',
    summaryEn:
      'Zahir Raihan’s iconic portrait of timeless agrarian life, folklore, and unspoken longing along the riverbanks of Bengal.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'bk-dipu-number-two',
    titleBn: 'দীপু নাম্বার টু',
    titleEn: 'Dipu Number Two',
    authorBn: 'মুহম্মদ জাফর ইকবাল',
    authorEn: 'Muhammed Zafar Iqbal',
    category: 'বিজ্ঞান ও প্রযুক্তি (Science)',
    isbn: '978-984-701-112-7',
    shelfCode: 'BN-SC-104',
    totalCopies: 14,
    availableCopies: 11,
    publishYear: 1984,
    coverColor: '#2d3a24',
    spineAccent: '#e0b84c',
    summaryBn:
      'কিশোর দীপুর নতুন স্কুল, বন্ধুত্ব, সাহসিকতা এবং পুরাকীর্তি চোরদের রুখে দেওয়ার এক রোমাঞ্চকর অভিযান।',
    summaryEn:
      'Beloved Bengali adventure novel celebrating curiosity, friendship, and courage as Dipu and his classmates uncover a smuggling ring.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-13T09:00:00.000Z',
    updatedAt: '2026-01-13T09:00:00.000Z',
  },
  {
    id: 'bk-chander-pahar',
    titleBn: 'চাঁদের পাহাড়',
    titleEn: 'Chander Pahar (Mountain of the Moon)',
    authorBn: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
    authorEn: 'Bibhutibhushan Bandyopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-7955-210-9',
    shelfCode: 'BN-NV-105',
    totalCopies: 9,
    availableCopies: 6,
    publishYear: 1937,
    coverColor: '#4a2c18',
    spineAccent: '#dfb15b',
    summaryBn:
      'বাঙালি তরুণ শঙ্করের আফ্রিকার দুর্গম রихটারসভেল্ড পর্বতমালা ও হীরার খনির রোমাঞ্চকর অভিযানের কাহিনী।',
    summaryEn:
      'Thrilling expedition of a young Bengali explorer, Shankar, across the untamed Richtersveld mountains of Africa.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-14T09:00:00.000Z',
    updatedAt: '2026-01-14T09:00:00.000Z',
  },
  {
    id: 'bk-sanchita',
    titleBn: 'সঞ্চিতা',
    titleEn: 'Sanchita (Selected Poems)',
    authorBn: 'কাজী নজরুল ইসলাম',
    authorEn: 'Kazi Nazrul Islam',
    category: 'কবিতা (Poetry)',
    isbn: '978-984-07-4120-5',
    shelfCode: 'BN-PT-106',
    totalCopies: 16,
    availableCopies: 14,
    publishYear: 1928,
    coverColor: '#661c22',
    spineAccent: '#f2ca65',
    summaryBn:
      'জাতীয় কবি কাজী নজরুল ইসলামের বিদ্রোহী চেতনা, সাম্যবাদ ও মানবতার শ্রেষ্ঠ কবিতা ও গানের সংকলন।',
    summaryEn:
      'Definitive anthology of National Poet Kazi Nazrul Islam’s revolutionary, egalitarian, and lyrical poetry.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'bk-lalsalu',
    titleBn: 'লালসালু',
    titleEn: 'Lalsalu (Tree Without Roots)',
    authorBn: 'সৈয়দ ওয়ালীউল্লাহ',
    authorEn: 'Syed Waliullah',
    category: 'দর্শন ও প্রবন্ধ (Philosophy)',
    isbn: '978-984-510-209-1',
    shelfCode: 'BN-PH-107',
    totalCopies: 8,
    availableCopies: 5,
    publishYear: 1948,
    coverColor: '#59161b',
    spineAccent: '#d9a74a',
    summaryBn:
      'মহব্বতনগর গ্রামে মজিদ ও জমিলা চরিত্রের মধ্য দিয়ে কুসংস্কার, অন্ধবিশ্বাস ও মানবিক প্রতিবাদের শিল্পরূপ।',
    summaryEn:
      'A psychological and social examination of superstition, authority, and individual conscience in rural Bengal.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-16T09:00:00.000Z',
    updatedAt: '2026-01-16T09:00:00.000Z',
  },
  {
    id: 'bk-ekattorer-dinguli',
    titleBn: 'একাত্তরের দিনগুলি',
    titleEn: 'Ekattorer Dinguli (Of Blood and Fire)',
    authorBn: 'জাহানারা ইমাম',
    authorEn: 'Jahanara Imam',
    category: 'ইতিহাস ও মুক্তিযুদ্ধ (History)',
    isbn: '978-984-480-019-9',
    shelfCode: 'BN-HS-108',
    totalCopies: 11,
    availableCopies: 8,
    publishYear: 1986,
    coverColor: '#193529',
    spineAccent: '#e25845',
    summaryBn:
      '১৯৭১ সালের মহান মুক্তিযুদ্ধের দিনলিপি, শহীদ রুমীর আত্মত্যাগ এবং অবরুদ্ধ ঢাকার প্রামাণ্য ইতিহাস।',
    summaryEn:
      'Moving personal wartime diary chronicling the 1971 Liberation War of Bangladesh, resistance, and sacrifice.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-17T09:00:00.000Z',
    updatedAt: '2026-01-17T09:00:00.000Z',
  },
  {
    id: 'bk-padma-nadir-majhi',
    titleBn: 'পদ্মা নদীর মাঝি',
    titleEn: 'Padma Nadir Majhi (Boatman of the Padma)',
    authorBn: 'মানিক বন্দ্যোপাধ্যায়',
    authorEn: 'Manik Bandopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-7079-312-0',
    shelfCode: 'BN-NV-109',
    totalCopies: 10,
    availableCopies: 8,
    publishYear: 1936,
    coverColor: '#1f3647',
    spineAccent: '#d4af37',
    summaryBn:
      'পদ্মা তীরবর্তী কেতুপুর গ্রামের জেলে ও মাঝিদের জীবনসংগ্রাম, কুবের, কপিলা ও হোসেন মিয়ার ময়নাদ্বীপের আখ্যান।',
    summaryEn:
      'Realist classic depicting the lives, hardships, and dreams of Padma river fishermen and the enigmatic island of Moynadwip.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-18T09:00:00.000Z',
    updatedAt: '2026-01-18T09:00:00.000Z',
  },
  {
    id: 'bk-kobor',
    titleBn: 'কবর (নাটক)',
    titleEn: 'Kobor (The Grave — Language Movement Drama)',
    authorBn: 'মুনীর চৌধুরী',
    authorEn: 'Munier Choudhury',
    category: 'নাটক ও সাহিত্য (Drama)',
    isbn: '978-984-07-5011-5',
    shelfCode: 'BN-DR-110',
    totalCopies: 7,
    availableCopies: 6,
    publishYear: 1953,
    coverColor: '#36233d',
    spineAccent: '#e6c253',
    summaryBn:
      '১৯৫২ সালের মহান ভাষা আন্দোলনের প্রেক্ষাপটে রচিত বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ প্রতিবাদী নাটক।',
    summaryEn:
      'Landmark expressionist Bengali play written in prison commemorating the martyrs of the 1952 Bengali Language Movement.',
    addedByUid: 'admin-default',
    createdAt: '2026-01-19T09:00:00.000Z',
    updatedAt: '2026-01-19T09:00:00.000Z',
  },
];

export const QUICK_BANGLA_BOOK_PRESETS: Array<Omit<BookRecord, 'id' | 'addedByUid' | 'createdAt' | 'updatedAt'>> = [
  {
    titleBn: 'দেবী চৌধুরাণী',
    titleEn: 'Devi Chaudhurani',
    authorBn: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
    authorEn: 'Bankim Chandra Chattopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-8912-301-2',
    shelfCode: 'BN-NV-201',
    totalCopies: 8,
    availableCopies: 8,
    publishYear: 1884,
    coverColor: '#5e1920',
    spineAccent: '#e5c158',
    summaryBn: 'প্রফুল্লের সাধারণ গৃহবধূ থেকে প্রজাদরদী নেত্রী দেবী চৌধুরাণীতে রূপান্তরের ঐতিহাসিক উপন্যাস।',
    summaryEn: 'Classic historical novel tracing Prafulla’s transformation into the benevolent leader Devi Chaudhurani.',
  },
  {
    titleBn: 'শ্রীকান্ত',
    titleEn: 'Srikanto',
    authorBn: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    authorEn: 'Sarat Chandra Chattopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-8912-409-5',
    shelfCode: 'BN-NV-202',
    totalCopies: 10,
    availableCopies: 10,
    publishYear: 1917,
    coverColor: '#243b30',
    spineAccent: '#dfb452',
    summaryBn: 'ভবঘুরে শ্রীকান্ত, ইন্দ্রনাথ ও রাজলক্ষ্মীর জীবনদর্শন ও মানবিক সম্পর্কের কালজয়ী উপাখ্যান।',
    summaryEn: 'Autobiographical-style picaresque masterpiece following Srikanto, Indranath, and Rajlakshmi.',
  },
  {
    titleBn: 'কপালকুণ্ডলা',
    titleEn: 'Kapalkundala',
    authorBn: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
    authorEn: 'Bankim Chandra Chattopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-8912-511-5',
    shelfCode: 'BN-NV-203',
    totalCopies: 6,
    availableCopies: 6,
    publishYear: 1866,
    coverColor: '#2d2342',
    spineAccent: '#e0b84c',
    summaryBn: 'সমুদ্রতীরের অরণ্যে বেড়ে ওঠা কপালকুণ্ডলা ও নবকুমারের নাটকীয় ও কাব্যময় উপন্যাস।',
    summaryEn: 'Poetic romance of Kapalkundala, raised in coastal wilderness, and the traveler Nabakumar.',
  },
  {
    titleBn: 'অপরাজিত',
    titleEn: 'Aparajito (The Unvanquished)',
    authorBn: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
    authorEn: 'Bibhutibhushan Bandyopadhyay',
    category: 'উপন্যাস (Novel)',
    isbn: '978-81-7215-612-1',
    shelfCode: 'BN-NV-204',
    totalCopies: 9,
    availableCopies: 9,
    publishYear: 1932,
    coverColor: '#3d2817',
    spineAccent: '#e6c253',
    summaryBn: 'পথের পাঁচালীর পরবর্তী খণ্ড যেখানে অপুর কৈশোর, কলকাতার শিক্ষাজীবন ও আত্মঅন্বেষণের গল্প বিবৃত।',
    summaryEn: 'Sequel to Pather Panchali following Apu’s intellectual awakening in Kolkata and quest for meaning.',
  },
];

export const INITIAL_LIBRARIANS: LibrarianRecord[] = [
  {
    id: 'lib-mahmudul-hasan',
    name: 'Dr. Mahmudul Hasan',
    nameBn: 'ড. মাহমুদুল হাসান',
    employeeId: 'LIB-1001',
    department: 'Bangla Literature & Rare Manuscripts Wing',
    shift: 'Morning (8:00 AM - 2:00 PM)',
    status: 'active',
    addedByUid: 'admin-default',
    createdAt: '2026-01-05T08:30:00.000Z',
    updatedAt: '2026-01-05T08:30:00.000Z',
  },
  {
    id: 'lib-farhana-yasmin',
    name: 'Farhana Yasmin',
    nameBn: 'ফারহানা ইয়াসমিন',
    employeeId: 'LIB-1002',
    department: 'Science, Engineering & Periodicals Wing',
    shift: 'Full Day (9:00 AM - 5:00 PM)',
    status: 'active',
    addedByUid: 'admin-default',
    createdAt: '2026-01-06T09:00:00.000Z',
    updatedAt: '2026-01-06T09:00:00.000Z',
  },
  {
    id: 'lib-subrata-chakraborty',
    name: 'Subrata Chakraborty',
    nameBn: 'সুব্রত চক্রবর্তী',
    employeeId: 'LIB-1003',
    department: 'History & Liberation War Archive',
    shift: 'Afternoon (2:00 PM - 8:00 PM)',
    status: 'active',
    addedByUid: 'admin-default',
    createdAt: '2026-01-08T14:00:00.000Z',
    updatedAt: '2026-01-08T14:00:00.000Z',
  },
];

export const INITIAL_STUDENT_APPROVALS: StudentApprovalRecord[] = [
  {
    id: 'stu-nusrat-jahan',
    studentName: 'Nusrat Jahan Mim',
    studentNameBn: 'নুসরাত জাহান মিম',
    rollNumber: 'BN-2026-041',
    department: 'Department of Bengali Literature',
    semester: '4th Semester',
    sessionYear: '2024-2025',
    status: 'pending',
    maxBooksAllowed: 3,
    applicantUid: 'stu-nusrat-jahan',
    reviewedByUid: 'stu-nusrat-jahan',
    createdAt: '2026-11-10T10:15:00.000Z',
    updatedAt: '2026-11-10T10:15:00.000Z',
  },
  {
    id: 'stu-tanvir-ahmed',
    studentName: 'Tanvir Ahmed',
    studentNameBn: 'তানভীর আহমেদ',
    rollNumber: 'CS-2026-118',
    department: 'Department of Computer Science',
    semester: '6th Semester',
    sessionYear: '2023-2024',
    status: 'pending',
    maxBooksAllowed: 3,
    applicantUid: 'stu-tanvir-ahmed',
    reviewedByUid: 'stu-tanvir-ahmed',
    createdAt: '2026-11-11T11:20:00.000Z',
    updatedAt: '2026-11-11T11:20:00.000Z',
  },
  {
    id: 'stu-aritra-sen',
    studentName: 'Aritra Sen Gupta',
    studentNameBn: 'অরিত্র সেনগুপ্ত',
    rollNumber: 'HS-2026-019',
    department: 'Department of History',
    semester: 'Honours Final',
    sessionYear: '2022-2023',
    status: 'approved',
    maxBooksAllowed: 4,
    applicantUid: 'stu-aritra-sen',
    reviewedByUid: 'admin-default',
    createdAt: '2026-10-15T09:00:00.000Z',
    updatedAt: '2026-10-16T14:00:00.000Z',
  },
  {
    id: 'stu-sadia-afrin',
    studentName: 'Sadia Afrin',
    studentNameBn: 'সাদিয়া আফরিন',
    rollNumber: 'PH-2026-073',
    department: 'Department of Philosophy',
    semester: '2nd Semester',
    sessionYear: '2025-2026',
    status: 'approved',
    maxBooksAllowed: 3,
    applicantUid: 'stu-sadia-afrin',
    reviewedByUid: 'lib-mahmudul-hasan',
    createdAt: '2026-10-20T09:30:00.000Z',
    updatedAt: '2026-10-21T12:00:00.000Z',
  },
];

export const INITIAL_CIRCULATION_LOANS: CirculationLoanRecord[] = [
  {
    id: 'loan-101',
    bookId: 'bk-pather-panchali',
    bookTitleBn: 'পথের পাঁচালী',
    bookTitleEn: 'Pather Panchali (Song of the Little Road)',
    studentId: 'stu-aritra-sen',
    studentName: 'Aritra Sen Gupta',
    rollNumber: 'HS-2026-019',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    status: 'issued',
    fineAmountBdt: 0,
    issuedByUid: 'admin-default',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'loan-102',
    bookId: 'bk-gitanjali',
    bookTitleBn: 'গীতাঞ্জলি',
    bookTitleEn: 'Gitanjali (Song Offerings)',
    studentId: 'stu-sadia-afrin',
    studentName: 'Sadia Afrin',
    rollNumber: 'PH-2026-073',
    issueDate: '2026-10-20',
    dueDate: '2026-11-03',
    status: 'issued',
    fineAmountBdt: 100,
    issuedByUid: 'lib-mahmudul-hasan',
    createdAt: '2026-10-20T11:00:00.000Z',
    updatedAt: '2026-10-20T11:00:00.000Z',
  },
];

// ============================================================================
// Pure Business Logic & RBAC Rules
// ============================================================================

export function canPerformAction(
  role: UserRole,
  action:
    | 'add_librarian'
    | 'toggle_librarian_status'
    | 'approve_student'
    | 'reject_student'
    | 'add_book'
    | 'delete_book'
    | 'issue_book'
    | 'return_book'
    | 'request_borrow'
    | 'apply_student_card'
): boolean {
  switch (action) {
    case 'add_librarian':
    case 'toggle_librarian_status':
    case 'delete_book':
      return role === 'admin';
    case 'approve_student':
    case 'reject_student':
    case 'add_book':
    case 'issue_book':
    case 'return_book':
      return role === 'admin' || role === 'librarian';
    case 'request_borrow':
    case 'apply_student_card':
      return true;
    default:
      return false;
  }
}

export function filterBooks(
  books: BookRecord[],
  query: string,
  category: string
): BookRecord[] {
  const q = query.trim().toLowerCase();
  return books.filter((b) => {
    const matchesCategory =
      !category || category === 'all' || b.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      b.titleBn.toLowerCase().includes(q) ||
      b.titleEn.toLowerCase().includes(q) ||
      b.authorBn.toLowerCase().includes(q) ||
      b.authorEn.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.shelfCode.toLowerCase().includes(q)
    );
  });
}

export function calculateOverdueFineBdt(
  dueDateIso: string,
  referenceDateIso: string,
  dailyRateBdt = 10
): number {
  const due = new Date(dueDateIso).getTime();
  const ref = new Date(referenceDateIso).getTime();
  if (Number.isNaN(due) || Number.isNaN(ref) || ref <= due) {
    return 0;
  }
  const diffDays = Math.floor((ref - due) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays * dailyRateBdt);
}

export function computeLibraryMetrics(
  books: BookRecord[],
  librarians: LibrarianRecord[],
  students: StudentApprovalRecord[],
  loans: CirculationLoanRecord[]
) {
  const totalTitles = books.length;
  const totalPhysicalVolumes = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableVolumes = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeLibrarians = librarians.filter((l) => l.status === 'active').length;
  const pendingStudents = students.filter((s) => s.status === 'pending').length;
  const approvedStudents = students.filter((s) => s.status === 'approved').length;
  const activeLoans = loans.filter((l) => l.status === 'issued').length;
  const requestedLoans = loans.filter((l) => l.status === 'requested').length;

  return {
    totalTitles,
    totalPhysicalVolumes,
    availableVolumes,
    activeLibrarians,
    pendingStudents,
    approvedStudents,
    activeLoans,
    requestedLoans,
  };
}

export function isValidDocumentId(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(id)
  );
}

export function validateBookInput(input: {
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  category: string;
  isbn: string;
  shelfCode: string;
  totalCopies: number;
  publishYear: number;
  coverColor: string;
  spineAccent: string;
  summaryBn: string;
  summaryEn: string;
}): { valid: boolean; error?: string } {
  if (!input.titleBn || input.titleBn.trim().length < 1 || input.titleBn.length > 120) {
    return { valid: false, error: 'Bangla title (বাংলা শিরোনাম) is required (1–120 chars).' };
  }
  if (!input.titleEn || input.titleEn.trim().length < 1 || input.titleEn.length > 120) {
    return { valid: false, error: 'English / transliterated title is required (1–120 chars).' };
  }
  if (!input.authorBn || input.authorBn.trim().length < 1 || input.authorBn.length > 100) {
    return { valid: false, error: 'Bangla author name (লেখকের নাম) is required.' };
  }
  if (!input.authorEn || input.authorEn.trim().length < 1 || input.authorEn.length > 100) {
    return { valid: false, error: 'English author name is required.' };
  }
  if (!BOOK_CATEGORIES.includes(input.category as BookCategory)) {
    return { valid: false, error: 'Please select a valid library category.' };
  }
  if (!input.isbn || input.isbn.trim().length < 4 || input.isbn.length > 32) {
    return { valid: false, error: 'ISBN / Accession code must be 4–32 characters.' };
  }
  if (!input.shelfCode || input.shelfCode.trim().length < 2 || input.shelfCode.length > 24) {
    return { valid: false, error: 'Shelf location code must be 2–24 characters.' };
  }
  if (!Number.isInteger(input.totalCopies) || input.totalCopies < 1 || input.totalCopies > 500) {
    return { valid: false, error: 'Total copies must be an integer between 1 and 500.' };
  }
  if (!Number.isInteger(input.publishYear) || input.publishYear < 1800 || input.publishYear > 2030) {
    return { valid: false, error: 'Publication year must be between 1800 and 2030.' };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(input.coverColor) || !/^#[0-9a-fA-F]{6}$/.test(input.spineAccent)) {
    return { valid: false, error: 'Cover and spine colors must be 6-digit hex codes.' };
  }
  return { valid: true };
}

export function validateLibrarianInput(input: {
  name: string;
  nameBn: string;
  employeeId: string;
  department: string;
  shift: string;
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length < 2 || input.name.length > 100) {
    return { valid: false, error: 'Librarian name is required (2–100 chars).' };
  }
  if (!input.nameBn || input.nameBn.trim().length < 1 || input.nameBn.length > 100) {
    return { valid: false, error: 'Librarian Bangla name is required.' };
  }
  if (
    !input.employeeId ||
    input.employeeId.trim().length < 3 ||
    input.employeeId.length > 32 ||
    !/^[a-zA-Z0-9_\-]+$/.test(input.employeeId.trim())
  ) {
    return {
      valid: false,
      error: 'Employee ID must be 3–32 alphanumeric/hyphen characters (e.g. LIB-1004).',
    };
  }
  if (!input.department || input.department.trim().length < 2 || input.department.length > 80) {
    return { valid: false, error: 'Department / Wing assignment is required.' };
  }
  if (!LIBRARIAN_SHIFTS.includes(input.shift as LibrarianShift)) {
    return { valid: false, error: 'Please select a valid duty shift.' };
  }
  return { valid: true };
}

export function validateStudentApprovalInput(input: {
  studentName: string;
  studentNameBn: string;
  rollNumber: string;
  department: string;
  semester: string;
  sessionYear: string;
}): { valid: boolean; error?: string } {
  if (!input.studentName || input.studentName.trim().length < 2 || input.studentName.length > 100) {
    return { valid: false, error: 'Student English name is required (2–100 chars).' };
  }
  if (!input.studentNameBn || input.studentNameBn.trim().length < 1 || input.studentNameBn.length > 100) {
    return { valid: false, error: 'Student Bangla name (শিক্ষার্থীর নাম) is required.' };
  }
  if (
    !input.rollNumber ||
    input.rollNumber.trim().length < 2 ||
    input.rollNumber.length > 32 ||
    !/^[a-zA-Z0-9_\-]+$/.test(input.rollNumber.trim())
  ) {
    return {
      valid: false,
      error: 'Roll number must be 2–32 alphanumeric/hyphen characters (e.g. BN-2026-099).',
    };
  }
  if (!input.department || input.department.trim().length < 2 || input.department.length > 80) {
    return { valid: false, error: 'Academic department is required.' };
  }
  if (!ACADEMIC_SEMESTERS.includes(input.semester as AcademicSemester)) {
    return { valid: false, error: 'Please select a valid academic semester.' };
  }
  if (!input.sessionYear || input.sessionYear.trim().length < 4 || input.sessionYear.length > 20) {
    return { valid: false, error: 'Session year is required (e.g. 2025-2026).' };
  }
  return { valid: true };
}
