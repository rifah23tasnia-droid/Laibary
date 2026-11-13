'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  UserCheck,
  ShieldCheck,
  ArrowLeftRight,
  Search,
  Plus,
  Check,
  X,
  Eye,
  Sparkles,
} from 'lucide-react';
import {
  type UserRole,
  type BookRecord,
  type BookCategory,
  type LibrarianRecord,
  type LibrarianShift,
  type StudentApprovalRecord,
  type AcademicSemester,
  type CirculationLoanRecord,
  BOOK_CATEGORIES,
  LIBRARIAN_SHIFTS,
  ACADEMIC_SEMESTERS,
  QUICK_BANGLA_BOOK_PRESETS,
  canPerformAction,
  filterBooks,
  validateBookInput,
  validateLibrarianInput,
  validateStudentApprovalInput,
} from '@/lib/library-rules';

export type ConsoleTab = 'catalog' | 'students' | 'librarians' | 'circulation';

interface ManagementConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ConsoleTab;
  onTabChange: (tab: ConsoleTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  books: BookRecord[];
  selectedBookId: string;
  onSelectBookIn3D: (book: BookRecord) => void;
  onAddBook: (book: Omit<BookRecord, 'id' | 'addedByUid' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteBook: (bookId: string) => void;
  librarians: LibrarianRecord[];
  onAddLibrarian: (lib: {
    name: string;
    nameBn: string;
    employeeId: string;
    department: string;
    shift: LibrarianShift;
  }) => void;
  onToggleLibrarianStatus: (librarianId: string) => void;
  students: StudentApprovalRecord[];
  onApproveStudent: (studentId: string) => void;
  onRejectStudent: (studentId: string) => void;
  onAddStudentApplication: (stu: {
    studentName: string;
    studentNameBn: string;
    rollNumber: string;
    department: string;
    semester: AcademicSemester;
    sessionYear: string;
  }) => void;
  loans: CirculationLoanRecord[];
  onIssueLoan: (payload: {
    bookId: string;
    studentId: string;
    dueDate: string;
    asRequest?: boolean;
  }) => void;
  onApproveLoanRequest: (loanId: string) => void;
  onReturnLoan: (loanId: string) => void;
}

export default function ManagementConsole({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  currentRole,
  onRoleChange,
  books,
  selectedBookId,
  onSelectBookIn3D,
  onAddBook,
  onDeleteBook,
  librarians,
  onAddLibrarian,
  onToggleLibrarianStatus,
  students,
  onApproveStudent,
  onRejectStudent,
  onAddStudentApplication,
  loans,
  onIssueLoan,
  onApproveLoanRequest,
  onReturnLoan,
}: ManagementConsoleProps) {
  // Catalog Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddBookForm, setShowAddBookForm] = useState(false);

  // Add Book Form State
  const [bookTitleBn, setBookTitleBn] = useState('');
  const [bookTitleEn, setBookTitleEn] = useState('');
  const [bookAuthorBn, setBookAuthorBn] = useState('');
  const [bookAuthorEn, setBookAuthorEn] = useState('');
  const [bookCategory, setBookCategory] = useState<BookCategory>('উপন্যাস (Novel)');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookShelfCode, setBookShelfCode] = useState('BN-NV-205');
  const [bookCopies, setBookCopies] = useState('10');
  const [bookYear, setBookYear] = useState('1950');
  const [bookCoverColor, setBookCoverColor] = useState('#5c1d24');
  const [bookSpineAccent, setBookSpineAccent] = useState('#d4af37');
  const [bookSummaryBn, setBookSummaryBn] = useState('');
  const [bookSummaryEn, setBookSummaryEn] = useState('');
  const [bookFormError, setBookFormError] = useState<string | null>(null);
  const [bookFormSuccess, setBookFormSuccess] = useState<string | null>(null);

  // Student Approval States
  const [studentFilter, setStudentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [stuName, setStuName] = useState('');
  const [stuNameBn, setStuNameBn] = useState('');
  const [stuRoll, setStuRoll] = useState('');
  const [stuDept, setStuDept] = useState('Department of Bengali Literature');
  const [stuSemester, setStuSemester] = useState<AcademicSemester>('1st Semester');
  const [stuSession, setStuSession] = useState('2025-2026');
  const [stuFormError, setStuFormError] = useState<string | null>(null);
  const [stuFormSuccess, setStuFormSuccess] = useState<string | null>(null);

  // Librarian Appointment States
  const [libName, setLibName] = useState('');
  const [libNameBn, setLibNameBn] = useState('');
  const [libEmpId, setLibEmpId] = useState('');
  const [libDept, setLibDept] = useState('Bangla Archive & Reference Section');
  const [libShift, setLibShift] = useState<LibrarianShift>('Morning (8:00 AM - 2:00 PM)');
  const [libFormError, setLibFormError] = useState<string | null>(null);
  const [libFormSuccess, setLibFormSuccess] = useState<string | null>(null);

  // Circulation States
  const [loanBookId, setLoanBookId] = useState<string>(books[0]?.id || '');
  const approvedStudents = students.filter((s) => s.status === 'approved');
  const [loanStudentId, setLoanStudentId] = useState<string>(approvedStudents[0]?.id || '');
  const [loanDueDate, setLoanDueDate] = useState<string>('2026-11-28');
  const [loanFeedback, setLoanFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredBooks = filterBooks(books, searchQuery, selectedCategory);
  const filteredStudents = students.filter((s) =>
    studentFilter === 'all' ? true : s.status === studentFilter
  );

  const handleApplyBookPreset = (
    preset: (typeof QUICK_BANGLA_BOOK_PRESETS)[number]
  ) => {
    setBookTitleBn(preset.titleBn);
    setBookTitleEn(preset.titleEn);
    setBookAuthorBn(preset.authorBn);
    setBookAuthorEn(preset.authorEn);
    setBookCategory(preset.category);
    setBookIsbn(preset.isbn);
    setBookShelfCode(preset.shelfCode);
    setBookCopies(String(preset.totalCopies));
    setBookYear(String(preset.publishYear));
    setBookCoverColor(preset.coverColor);
    setBookSpineAccent(preset.spineAccent);
    setBookSummaryBn(preset.summaryBn);
    setBookSummaryEn(preset.summaryEn);
    setBookFormError(null);
    setShowAddBookForm(true);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookFormError(null);
    setBookFormSuccess(null);

    const totalCopiesNum = parseInt(bookCopies, 10);
    const publishYearNum = parseInt(bookYear, 10);

    const payload = {
      titleBn: bookTitleBn.trim(),
      titleEn: bookTitleEn.trim(),
      authorBn: bookAuthorBn.trim(),
      authorEn: bookAuthorEn.trim(),
      category: bookCategory,
      isbn: bookIsbn.trim(),
      shelfCode: bookShelfCode.trim(),
      totalCopies: totalCopiesNum,
      availableCopies: totalCopiesNum,
      publishYear: publishYearNum,
      coverColor: bookCoverColor,
      spineAccent: bookSpineAccent,
      summaryBn:
        bookSummaryBn.trim() ||
        `${bookTitleBn.trim()} — কলেজ গ্রন্থাগারের বাংলা সাহিত্য সংকলনের অন্তর্ভুক্ত গ্রন্থ।`,
      summaryEn:
        bookSummaryEn.trim() ||
        `${bookTitleEn.trim()} — Cataloged volume in the Granthagar College Library archive.`,
    };

    const validation = validateBookInput(payload);
    if (!validation.valid) {
      setBookFormError(validation.error || 'Invalid book input.');
      return;
    }

    onAddBook(payload);
    setBookFormSuccess(`Added "${payload.titleBn}" (${payload.titleEn}) to the 3D Library Shelf.`);
    setBookTitleBn('');
    setBookTitleEn('');
    setBookAuthorBn('');
    setBookAuthorEn('');
    setBookIsbn('');
    setBookSummaryBn('');
    setBookSummaryEn('');
  };

  const handleLibrarianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLibFormError(null);
    setLibFormSuccess(null);

    if (!canPerformAction(currentRole, 'add_librarian')) {
      setLibFormError('Only the College Admin can appoint new Librarians.');
      return;
    }

    const payload = {
      name: libName.trim(),
      nameBn: libNameBn.trim() || libName.trim(),
      employeeId: libEmpId.trim(),
      department: libDept.trim(),
      shift: libShift,
    };

    const validation = validateLibrarianInput(payload);
    if (!validation.valid) {
      setLibFormError(validation.error || 'Invalid librarian details.');
      return;
    }

    onAddLibrarian(payload);
    setLibFormSuccess(`Appointed Librarian ${payload.name} (${payload.employeeId}).`);
    setLibName('');
    setLibNameBn('');
    setLibEmpId('');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStuFormError(null);
    setStuFormSuccess(null);

    const payload = {
      studentName: stuName.trim(),
      studentNameBn: stuNameBn.trim() || stuName.trim(),
      rollNumber: stuRoll.trim(),
      department: stuDept.trim(),
      semester: stuSemester,
      sessionYear: stuSession.trim(),
    };

    const validation = validateStudentApprovalInput(payload);
    if (!validation.valid) {
      setStuFormError(validation.error || 'Invalid student registration details.');
      return;
    }

    onAddStudentApplication(payload);
    setStuFormSuccess(
      `Submitted student application for ${payload.studentName} (${payload.rollNumber}).`
    );
    setStuName('');
    setStuNameBn('');
    setStuRoll('');
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanFeedback(null);
    const targetBookId = loanBookId || books[0]?.id;
    const targetStuId = loanStudentId || approvedStudents[0]?.id;
    if (!targetBookId || !targetStuId) {
      setLoanFeedback('Select a valid book and an approved student.');
      return;
    }
    const isStaff = canPerformAction(currentRole, 'issue_book');
    onIssueLoan({
      bookId: targetBookId,
      studentId: targetStuId,
      dueDate: loanDueDate,
      asRequest: !isStaff,
    });
    const foundBook = books.find((b) => b.id === targetBookId);
    const foundStu = students.find((s) => s.id === targetStuId);
    setLoanFeedback(
      isStaff
        ? `Issued "${foundBook?.titleBn}" to ${foundStu?.studentName}.`
        : `Submitted borrow request for "${foundBook?.titleBn}".`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="College Library Management Console"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/75"
    >
      <div className="w-full max-w-6xl h-[86vh] bg-[#130f0c] border border-amber-900/40 rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#f5efe6]">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-amber-900/30 bg-[#18120e]">
          <div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-amber-100">
              গীতাঞ্জলি কলেজ গ্রন্থাগার · Library Administration Console
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Active Workspace Role: <span className="text-amber-300 font-semibold uppercase">{currentRole}</span> · Default Admin has full authority over Librarians, Student Approvals, and Bangla Catalog
            </p>
          </div>

          {/* Role Switcher & Close */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1 p-1 bg-[#0e0a08] border border-amber-900/40 rounded-lg"
              role="group"
              aria-label="Switch Active Role"
            >
              {(['admin', 'librarian', 'student'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 capitalize ${
                    currentRole === r
                      ? 'bg-amber-600 text-stone-950 font-semibold'
                      : 'text-stone-300 hover:text-amber-200'
                  }`}
                >
                  {r === 'admin' ? 'Admin (Default)' : r}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Library Console"
              className="px-3.5 py-2 text-xs font-medium text-stone-200 bg-stone-800/80 hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <X className="w-4 h-4" />
              <span>Return to 3D Hall</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#15100c] border-b border-amber-900/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => onTabChange('catalog')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>বাংলা গ্রন্থ তালিকা · Bangla Books ({books.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('students')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'students'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              শিক্ষার্থী অনুমোদন · Student Approvals (
              {students.filter((s) => s.status === 'pending').length} Pending)
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('librarians')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'librarians'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>গ্রন্থাগারিক · Librarians ({librarians.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('circulation')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'circulation'
                ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>বই ইস্যু ও রিটার্ন · Circulation ({loans.filter((l) => l.status !== 'returned').length})</span>
          </button>
        </div>

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* =============================================================== */}
          {/* TAB 1: BANGLA BOOKS CATALOG */}
          {/* =============================================================== */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Search, Category Filter & Add Book Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    aria-label="Search Bangla or English books"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Bangla name (পথের পাঁচালী, গীতাঞ্জলি), English title, author, or ISBN..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {canPerformAction(currentRole, 'add_book') && (
                  <button
                    type="button"
                    onClick={() => setShowAddBookForm((prev) => !prev)}
                    className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showAddBookForm ? 'Hide Book Form' : 'Add Bangla Book'}</span>
                  </button>
                )}
              </div>

              {/* Category Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-amber-600 text-stone-950 font-semibold'
                      : 'bg-[#1b1410] text-stone-300 hover:text-amber-200'
                  }`}
                >
                  সকল বিভাগ · All ({books.length})
                </button>
                {BOOK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-stone-950 font-semibold'
                        : 'bg-[#1b1410] text-stone-300 hover:text-amber-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Add New Bangla Book Form + Quick Presets */}
              {showAddBookForm && canPerformAction(currentRole, 'add_book') && (
                <form
                  onSubmit={handleBookSubmit}
                  className="p-5 bg-[#19130f] border border-amber-800/40 rounded-xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-amber-200">
                      নতুন বাংলা বই যুক্ত করুন · Catalog New Bangla Volume
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-stone-400 mr-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Quick Fill Bangla Classics:
                      </span>
                      {QUICK_BANGLA_BOOK_PRESETS.map((preset) => (
                        <button
                          key={preset.isbn}
                          type="button"
                          onClick={() => handleApplyBookPreset(preset)}
                          className="px-2.5 py-1 text-xs bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-amber-700/40 rounded transition-colors whitespace-nowrap shrink-0"
                        >
                          + {preset.titleBn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {bookFormError && (
                    <p role="alert" className="text-xs text-red-400 font-medium">
                      {bookFormError}
                    </p>
                  )}
                  {bookFormSuccess && (
                    <p role="status" className="text-xs text-emerald-400 font-medium">
                      {bookFormSuccess}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        বাংলা শিরোনাম (Bangla Title) *
                      </label>
                      <input
                        type="text"
                        value={bookTitleBn}
                        onChange={(e) => setBookTitleBn(e.target.value)}
                        placeholder="যেমন: দেবী চৌধুরাণী"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        English Title *
                      </label>
                      <input
                        type="text"
                        value={bookTitleEn}
                        onChange={(e) => setBookTitleEn(e.target.value)}
                        placeholder="e.g. Devi Chaudhurani"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        লেখকের নাম (Author in Bangla) *
                      </label>
                      <input
                        type="text"
                        value={bookAuthorBn}
                        onChange={(e) => setBookAuthorBn(e.target.value)}
                        placeholder="যেমন: বঙ্কিমচন্দ্র চট্টোপাধ্যায়"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Author (English) *
                      </label>
                      <input
                        type="text"
                        value={bookAuthorEn}
                        onChange={(e) => setBookAuthorEn(e.target.value)}
                        placeholder="e.g. Bankim Chandra Chattopadhyay"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        বিভাগ (Category)
                      </label>
                      <select
                        aria-label="Book Category"
                        value={bookCategory}
                        onChange={(e) => setBookCategory(e.target.value as BookCategory)}
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      >
                        {BOOK_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        ISBN / Accession Code *
                      </label>
                      <input
                        type="text"
                        value={bookIsbn}
                        onChange={(e) => setBookIsbn(e.target.value)}
                        placeholder="978-984-07-9901-2"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        3D Shelf Code *
                      </label>
                      <input
                        type="text"
                        value={bookShelfCode}
                        onChange={(e) => setBookShelfCode(e.target.value)}
                        placeholder="BN-NV-205"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-stone-300 mb-1">
                          Total Copies
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={bookCopies}
                          onChange={(e) => setBookCopies(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-300 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          min={1800}
                          max={2030}
                          value={bookYear}
                          onChange={(e) => setBookYear(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors"
                    >
                      Save Book to 3D Archive
                    </button>
                  </div>
                </form>
              )}

              {/* Books High-Density Catalog Table */}
              <div className="border border-amber-900/30 rounded-xl overflow-hidden bg-[#16110d]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-900/30 bg-[#1c1510] text-xs text-stone-400">
                      <th className="py-3 px-4 font-medium">বাংলা শিরোনাম ও লেখক (Book & Author)</th>
                      <th className="py-3 px-4 font-medium">বিভাগ (Category)</th>
                      <th className="py-3 px-4 font-medium">Shelf / ISBN</th>
                      <th className="py-3 px-4 font-medium text-right">Available Copies</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20 text-sm">
                    {filteredBooks.map((book) => {
                      const isSelected = book.id === selectedBookId;
                      return (
                        <tr
                          key={book.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-amber-900/20' : 'hover:bg-stone-900/50'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <span
                                className="w-3 h-9 rounded-xs shrink-0 border border-amber-400/40"
                                style={{ backgroundColor: book.coverColor }}
                              />
                              <div>
                                <div className="font-bengali font-bold text-base text-amber-100">
                                  {book.titleBn}
                                </div>
                                <div className="text-xs text-stone-300">
                                  {book.titleEn} · <span className="text-amber-300/90">{book.authorBn}</span> ({book.authorEn})
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-stone-300">
                            {book.category} · {book.publishYear}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-stone-400">
                            <div>{book.shelfCode}</div>
                            <div className="text-[11px] text-stone-500">{book.isbn}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs">
                            <span
                              className={
                                book.availableCopies > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400'
                              }
                            >
                              {book.availableCopies}
                            </span>
                            <span className="text-stone-500"> / {book.totalCopies}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectBookIn3D(book);
                                  onClose();
                                }}
                                className="px-3 py-1.5 text-xs font-medium bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/30 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect on 3D Lectern</span>
                              </button>
                              {canPerformAction(currentRole, 'delete_book') && books.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteBook(book.id)}
                                  aria-label={`Delete ${book.titleEn}`}
                                  className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-red-400 transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: STUDENT APPROVALS */}
          {/* =============================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-amber-100">
                    শিক্ষার্থী গ্রন্থাগার কার্ড অনুমোদন · Student Membership Approvals
                  </h3>
                  <p className="text-xs text-stone-400">
                    Admin and Librarians can approve or reject student applications for college library borrowing privileges.
                  </p>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 p-1 bg-[#0c0907] border border-amber-900/40 rounded-lg">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStudentFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap shrink-0 ${
                        studentFilter === st
                          ? 'bg-amber-600 text-stone-950 font-semibold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {st} ({st === 'all' ? students.length : students.filter((s) => s.status === st).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Approvals Table */}
              <div className="border border-amber-900/30 rounded-xl overflow-hidden bg-[#16110d]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-900/30 bg-[#1c1510] text-xs text-stone-400">
                      <th className="py-3 px-4 font-medium">Student Name (বাংলা ও ইংরেজি)</th>
                      <th className="py-3 px-4 font-medium">Roll Number</th>
                      <th className="py-3 px-4 font-medium">Department & Semester</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20 text-sm">
                    {filteredStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-stone-900/40">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-amber-100">{stu.studentName}</div>
                          <div className="text-xs text-stone-400 font-bengali">{stu.studentNameBn}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-stone-300">
                          {stu.rollNumber}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-stone-300">
                          {stu.department} · {stu.semester} ({stu.sessionYear})
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {stu.status === 'approved' && (
                            <span className="text-emerald-400 font-semibold">
                              Approved · Max {stu.maxBooksAllowed} Books
                            </span>
                          )}
                          {stu.status === 'pending' && (
                            <span className="text-amber-400 font-semibold">
                              Pending Verification
                            </span>
                          )}
                          {stu.status === 'rejected' && (
                            <span className="text-red-400 font-semibold">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canPerformAction(currentRole, 'approve_student') ? (
                            <div className="flex items-center justify-end gap-2">
                              {stu.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => onApproveStudent(stu.id)}
                                  aria-label={`Approve Student ${stu.studentName}`}
                                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve Student</span>
                                </button>
                              )}
                              {stu.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => onRejectStudent(stu.id)}
                                  aria-label={`Reject Student ${stu.studentName}`}
                                  className="px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-red-950/80 text-stone-300 hover:text-red-300 rounded-md transition-colors whitespace-nowrap shrink-0"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-stone-500">Staff review required</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* New Student Library Card Application Form */}
              <form
                onSubmit={handleStudentSubmit}
                className="p-5 bg-[#19130f] border border-amber-800/40 rounded-xl space-y-4"
              >
                <h4 className="text-sm font-semibold text-amber-200">
                  নতুন শিক্ষার্থী নিবন্ধন · Register Student Library Card Application
                </h4>

                {stuFormError && (
                  <p role="alert" className="text-xs text-red-400 font-medium">
                    {stuFormError}
                  </p>
                )}
                {stuFormSuccess && (
                  <p role="status" className="text-xs text-emerald-400 font-medium">
                    {stuFormSuccess}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Student Name (English) *
                    </label>
                    <input
                      type="text"
                      value={stuName}
                      onChange={(e) => setStuName(e.target.value)}
                      placeholder="e.g. Rafiqul Islam"
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      শিক্ষার্থীর নাম (Bangla Name) *
                    </label>
                    <input
                      type="text"
                      value={stuNameBn}
                      onChange={(e) => setStuNameBn(e.target.value)}
                      placeholder="যেমন: রফিকুল ইসলাম"
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      College Roll Number *
                    </label>
                    <input
                      type="text"
                      value={stuRoll}
                      onChange={(e) => setStuRoll(e.target.value)}
                      placeholder="BN-2026-088"
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Academic Department *
                    </label>
                    <input
                      type="text"
                      value={stuDept}
                      onChange={(e) => setStuDept(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Semester / Year
                    </label>
                    <select
                      aria-label="Academic Semester"
                      value={stuSemester}
                      onChange={(e) => setStuSemester(e.target.value as AcademicSemester)}
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                    >
                      {ACADEMIC_SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Session Year *
                    </label>
                    <input
                      type="text"
                      value={stuSession}
                      onChange={(e) => setStuSession(e.target.value)}
                      placeholder="2025-2026"
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors"
                  >
                    Submit Student Application
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: LIBRARIANS DIRECTORY (ADMIN CONTROL) */}
          {/* =============================================================== */}
          {activeTab === 'librarians' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-100">
                  গ্রন্থাগারিক নিয়োগ ও ব্যবস্থাপনা · Librarian Staff Directory
                </h3>
                <p className="text-xs text-stone-400">
                  The Default Admin can appoint new Librarians, assign library wings and shifts, or suspend staff credentials.
                </p>
              </div>

              {/* Appoint New Librarian Form (Admin Only) */}
              {canPerformAction(currentRole, 'add_librarian') ? (
                <form
                  onSubmit={handleLibrarianSubmit}
                  className="p-5 bg-[#19130f] border border-amber-800/40 rounded-xl space-y-4"
                >
                  <h4 className="text-sm font-semibold text-amber-200">
                    নতুন গ্রন্থাগারিক নিয়োগ করুন · Appoint New College Librarian
                  </h4>

                  {libFormError && (
                    <p role="alert" className="text-xs text-red-400 font-medium">
                      {libFormError}
                    </p>
                  )}
                  {libFormSuccess && (
                    <p role="status" className="text-xs text-emerald-400 font-medium">
                      {libFormSuccess}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Librarian Full Name *
                      </label>
                      <input
                        type="text"
                        aria-label="Librarian Full Name"
                        value={libName}
                        onChange={(e) => setLibName(e.target.value)}
                        placeholder="e.g. Nazmul Huda"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        গ্রন্থাগারিকের নাম (Bangla) *
                      </label>
                      <input
                        type="text"
                        aria-label="Librarian Bangla Name"
                        value={libNameBn}
                        onChange={(e) => setLibNameBn(e.target.value)}
                        placeholder="যেমন: নাজমুল হুদা"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        aria-label="Librarian Employee ID"
                        value={libEmpId}
                        onChange={(e) => setLibEmpId(e.target.value)}
                        placeholder="LIB-1004"
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Assigned Wing / Section *
                      </label>
                      <input
                        type="text"
                        aria-label="Assigned Library Wing"
                        value={libDept}
                        onChange={(e) => setLibDept(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-300 mb-1">
                        Duty Shift
                      </label>
                      <select
                        aria-label="Duty Shift"
                        value={libShift}
                        onChange={(e) => setLibShift(e.target.value as LibrarianShift)}
                        className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                      >
                        {LIBRARIAN_SHIFTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors"
                    >
                      Appoint Librarian
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-[#19130f] border border-amber-900/30 rounded-xl text-xs text-amber-300">
                  Switch active role to <strong>Admin (Default)</strong> at the top of this console to appoint or modify Librarians.
                </div>
              )}

              {/* Librarians Table */}
              <div className="border border-amber-900/30 rounded-xl overflow-hidden bg-[#16110d]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-900/30 bg-[#1c1510] text-xs text-stone-400">
                      <th className="py-3 px-4 font-medium">Librarian Name</th>
                      <th className="py-3 px-4 font-medium">Employee ID</th>
                      <th className="py-3 px-4 font-medium">Assigned Archive Wing</th>
                      <th className="py-3 px-4 font-medium">Duty Shift</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20 text-sm">
                    {librarians.map((lib) => (
                      <tr key={lib.id} className="hover:bg-stone-900/40">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-amber-100">{lib.name}</div>
                          <div className="text-xs text-stone-400 font-bengali">{lib.nameBn}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-stone-300">
                          {lib.employeeId}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-stone-300">{lib.department}</td>
                        <td className="py-3.5 px-4 text-xs text-stone-400">{lib.shift}</td>
                        <td className="py-3.5 px-4 text-xs">
                          {lib.status === 'active' ? (
                            <span className="text-emerald-400 font-semibold">Active Duty</span>
                          ) : (
                            <span className="text-amber-500 font-semibold">Suspended</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canPerformAction(currentRole, 'toggle_librarian_status') && (
                            <button
                              type="button"
                              onClick={() => onToggleLibrarianStatus(lib.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                            >
                              {lib.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: CIRCULATION & BOOK LOANS */}
          {/* =============================================================== */}
          {activeTab === 'circulation' && (
            <div className="space-y-6">
              {/* Issue Book / Borrow Request Form */}
              <form
                onSubmit={handleIssueSubmit}
                className="p-5 bg-[#19130f] border border-amber-800/40 rounded-xl space-y-4"
              >
                <h3 className="text-sm font-semibold text-amber-200">
                  বই ইস্যু করুন · Issue Bangla Book to Approved Student
                </h3>

                {loanFeedback && (
                  <p role="status" className="text-xs text-emerald-400 font-medium">
                    {loanFeedback}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Select Bangla Book
                    </label>
                    <select
                      aria-label="Select Bangla Book"
                      value={loanBookId}
                      onChange={(e) => setLoanBookId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                          {b.titleBn} — {b.titleEn} ({b.availableCopies} avail)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Approved Student
                    </label>
                    <select
                      aria-label="Select Approved Student"
                      value={loanStudentId}
                      onChange={(e) => setLoanStudentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100"
                    >
                      {approvedStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.studentName} ({s.rollNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">
                      Return Due Date
                    </label>
                    <input
                      type="date"
                      aria-label="Return Due Date"
                      value={loanDueDate}
                      onChange={(e) => setLoanDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#0c0907] border border-amber-900/40 rounded-lg text-stone-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors"
                  >
                    {canPerformAction(currentRole, 'issue_book')
                      ? 'Issue Book Now'
                      : 'Submit Borrow Request'}
                  </button>
                </div>
              </form>

              {/* Active & Historical Circulation Ledger */}
              <div className="border border-amber-900/30 rounded-xl overflow-hidden bg-[#16110d]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-900/30 bg-[#1c1510] text-xs text-stone-400">
                      <th className="py-3 px-4 font-medium">Book Title (বাংলা ও ইংরেজি)</th>
                      <th className="py-3 px-4 font-medium">Borrower Student</th>
                      <th className="py-3 px-4 font-medium">Issue & Due Dates</th>
                      <th className="py-3 px-4 font-medium text-right">Fine (BDT)</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20 text-sm">
                    {loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-stone-900/40">
                        <td className="py-3.5 px-4">
                          <div className="font-bengali font-bold text-amber-100">
                            {loan.bookTitleBn}
                          </div>
                          <div className="text-xs text-stone-400">{loan.bookTitleEn}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-medium text-stone-200">
                            {loan.studentName}
                          </div>
                          <div className="text-[11px] font-mono text-stone-400">
                            {loan.rollNumber}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-stone-300">
                          Issued: {loan.issueDate} · Due: {loan.dueDate}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs">
                          {loan.fineAmountBdt > 0 ? (
                            <span className="text-amber-400 font-semibold">
                              ৳{loan.fineAmountBdt}
                            </span>
                          ) : (
                            <span className="text-stone-500">৳0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {loan.status === 'issued' && (
                            <span className="text-amber-300 font-semibold">Active Loan</span>
                          )}
                          {loan.status === 'requested' && (
                            <span className="text-sky-300 font-semibold">Requested</span>
                          )}
                          {loan.status === 'returned' && (
                            <span className="text-emerald-400 font-semibold">Returned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canPerformAction(currentRole, 'return_book') && (
                            <div className="flex items-center justify-end gap-2">
                              {loan.status === 'requested' && (
                                <button
                                  type="button"
                                  onClick={() => onApproveLoanRequest(loan.id)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-md transition-colors whitespace-nowrap shrink-0"
                                >
                                  Approve Issue
                                </button>
                              )}
                              {loan.status === 'issued' && (
                                <button
                                  type="button"
                                  onClick={() => onReturnLoan(loan.id)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-md transition-colors whitespace-nowrap shrink-0"
                                >
                                  Mark Returned
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
