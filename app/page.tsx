'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Sliders,
  LogIn,
  LogOut,
} from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase';
import {
  type UserRole,
  type BookRecord,
  type LibrarianRecord,
  type LibrarianShift,
  type StudentApprovalRecord,
  type AcademicSemester,
  type CirculationLoanRecord,
  INITIAL_BANGLA_BOOKS,
  INITIAL_LIBRARIANS,
  INITIAL_STUDENT_APPROVALS,
  INITIAL_CIRCULATION_LOANS,
  computeLibraryMetrics,
} from '@/lib/library-rules';
import Library3DScene, {
  type CameraPreset,
  type LightingPreset,
} from '@/components/Library3DScene';
import ManagementConsole, {
  type ConsoleTab,
} from '@/components/ManagementConsole';

export default function GranthagarLibraryPage() {
  // Core Library State (Seeded with rich Bangla Books, Librarians, Student Approvals, and Circulation Loans)
  const [books, setBooks] = useState<BookRecord[]>(INITIAL_BANGLA_BOOKS);
  const [selectedBookId, setSelectedBookId] = useState<string>(INITIAL_BANGLA_BOOKS[0].id);
  const [librarians, setLibrarians] = useState<LibrarianRecord[]>(INITIAL_LIBRARIANS);
  const [students, setStudents] = useState<StudentApprovalRecord[]>(INITIAL_STUDENT_APPROVALS);
  const [loans, setLoans] = useState<CirculationLoanRecord[]>(INITIAL_CIRCULATION_LOANS);

  // Default Role is Admin as requested ("defult -- admin also who can add libarian and also for student approveal")
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // 3D Viewport Controls State
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('lectern');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('study');
  const [explodedAmount, setExplodedAmount] = useState<number>(0.15);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  // Management Console Modal State
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<ConsoleTab>('catalog');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedBook =
    books.find((b) => b.id === selectedBookId) || books[0] || INITIAL_BANGLA_BOOKS[0];

  const metrics = computeLibraryMetrics(books, librarians, students, loans);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Keyboard shortcut 'H' to collapse/expand bottom HUD dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setIsDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Boot connection test & Auth listener
  useEffect(() => {
    testFirestoreConnection();
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Live Firestore Sync for Books Catalog when authenticated
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubBooks = onSnapshot(
      collection(db, 'books'),
      (snap) => {
        if (!snap.empty) {
          const remoteBooks: BookRecord[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            remoteBooks.push({
              id: docSnap.id,
              titleBn: d.titleBn,
              titleEn: d.titleEn,
              authorBn: d.authorBn,
              authorEn: d.authorEn,
              category: d.category,
              isbn: d.isbn,
              shelfCode: d.shelfCode,
              totalCopies: d.totalCopies,
              availableCopies: d.availableCopies,
              publishYear: d.publishYear,
              coverColor: d.coverColor,
              spineAccent: d.spineAccent,
              summaryBn: d.summaryBn,
              summaryEn: d.summaryEn,
              addedByUid: d.addedByUid,
              createdAt: String(d.createdAt || ''),
              updatedAt: String(d.updatedAt || ''),
            });
          });
          setBooks((prev) => {
            const merged = [...prev];
            for (const rb of remoteBooks) {
              const idx = merged.findIndex((b) => b.id === rb.id);
              if (idx >= 0) merged[idx] = rb;
              else merged.unshift(rb);
            }
            return merged;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'books');
      }
    );
    return () => unsubBooks();
  }, [firebaseUser]);

  // Handlers for Library Actions (Local Immediate State + Firestore Persistence when authenticated)
  const handleOpenConsoleTab = (tab: ConsoleTab) => {
    setActiveConsoleTab(tab);
    setIsConsoleOpen(true);
  };

  const handleSelectPrevNextBook = (dir: -1 | 1) => {
    const idx = books.findIndex((b) => b.id === selectedBook.id);
    if (idx === -1) return;
    const nextIdx = (idx + dir + books.length) % books.length;
    setSelectedBookId(books[nextIdx].id);
  };

  const handleAddBook = async (
    newBookInput: Omit<BookRecord, 'id' | 'addedByUid' | 'createdAt' | 'updatedAt'>
  ) => {
    const cleanSlug = newBookInput.titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 36);
    const id = `bk-${cleanSlug || 'bangla'}-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const newBook: BookRecord = {
      ...newBookInput,
      id,
      addedByUid: firebaseUser?.uid || 'admin-default',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setBooks((prev) => [newBook, ...prev]);
    setSelectedBookId(newBook.id);
    showToast(`Added Bangla book "${newBook.titleBn}" to 3D Library.`);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'books', id), {
          ...newBookInput,
          addedByUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `books/${id}`);
      }
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== bookId);
      if (selectedBookId === bookId && next.length > 0) {
        setSelectedBookId(next[0].id);
      }
      return next;
    });
    showToast('Removed book from catalog.');

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await deleteDoc(doc(db, 'books', bookId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `books/${bookId}`);
      }
    }
  };

  const handleAddLibrarian = async (libInput: {
    name: string;
    nameBn: string;
    employeeId: string;
    department: string;
    shift: LibrarianShift;
  }) => {
    const id = `lib-${libInput.employeeId.toLowerCase().replace(/[^a-z0-9\-]/g, '')}-${Date.now()
      .toString()
      .slice(-3)}`;
    const nowIso = new Date().toISOString();
    const newLib: LibrarianRecord = {
      ...libInput,
      id,
      status: 'active',
      addedByUid: firebaseUser?.uid || 'admin-default',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setLibrarians((prev) => [newLib, ...prev]);
    showToast(`Appointed Librarian ${newLib.name} (${newLib.employeeId}).`);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'librarians', id), {
          ...libInput,
          status: 'active',
          addedByUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `librarians/${id}`);
      }
    }
  };

  const handleToggleLibrarianStatus = async (librarianId: string) => {
    let nextStatus: 'active' | 'suspended' = 'active';
    setLibrarians((prev) =>
      prev.map((lib) => {
        if (lib.id !== librarianId) return lib;
        nextStatus = lib.status === 'active' ? 'suspended' : 'active';
        return { ...lib, status: nextStatus, updatedAt: new Date().toISOString() };
      })
    );
    showToast(`Updated librarian status to ${nextStatus}.`);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await updateDoc(doc(db, 'librarians', librarianId), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `librarians/${librarianId}`);
      }
    }
  };

  const handleApproveStudent = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((stu) =>
        stu.id === studentId
          ? {
              ...stu,
              status: 'approved',
              reviewedByUid: firebaseUser?.uid || 'admin-default',
              updatedAt: new Date().toISOString(),
            }
          : stu
      )
    );
    const target = students.find((s) => s.id === studentId);
    showToast(`Approved student membership for ${target?.studentName || studentId}.`);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await updateDoc(doc(db, 'studentApprovals', studentId), {
          status: 'approved',
          reviewedByUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `studentApprovals/${studentId}`);
      }
    }
  };

  const handleRejectStudent = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((stu) =>
        stu.id === studentId
          ? {
              ...stu,
              status: 'rejected',
              reviewedByUid: firebaseUser?.uid || 'admin-default',
              updatedAt: new Date().toISOString(),
            }
          : stu
      )
    );
    const target = students.find((s) => s.id === studentId);
    showToast(`Rejected student application for ${target?.studentName || studentId}.`);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await updateDoc(doc(db, 'studentApprovals', studentId), {
          status: 'rejected',
          reviewedByUid: firebaseUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `studentApprovals/${studentId}`);
      }
    }
  };

  const handleAddStudentApplication = async (stuInput: {
    studentName: string;
    studentNameBn: string;
    rollNumber: string;
    department: string;
    semester: AcademicSemester;
    sessionYear: string;
  }) => {
    const id = `stu-${stuInput.rollNumber.toLowerCase().replace(/[^a-z0-9\-]/g, '')}-${Date.now()
      .toString()
      .slice(-3)}`;
    const nowIso = new Date().toISOString();
    const newStu: StudentApprovalRecord = {
      ...stuInput,
      id,
      status: 'pending',
      maxBooksAllowed: 3,
      applicantUid: firebaseUser?.uid || id,
      reviewedByUid: firebaseUser?.uid || id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setStudents((prev) => [newStu, ...prev]);
    showToast(`Submitted student approval application for ${newStu.studentName}.`);

    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        await setDoc(doc(db, 'studentApprovals', id), {
          ...stuInput,
          status: 'pending',
          maxBooksAllowed: 3,
          applicantUid: firebaseUser.uid,
          reviewedByUid: firebaseUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `studentApprovals/${id}`);
      }
    }
  };

  const handleIssueLoan = ({
    bookId,
    studentId,
    dueDate,
    asRequest = false,
  }: {
    bookId: string;
    studentId: string;
    dueDate: string;
    asRequest?: boolean;
  }) => {
    const book = books.find((b) => b.id === bookId);
    const student = students.find((s) => s.id === studentId);
    if (!book || !student || book.availableCopies <= 0) return;

    const id = `loan-${Date.now().toString().slice(-5)}`;
    const todayIso = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();
    const newLoan: CirculationLoanRecord = {
      id,
      bookId: book.id,
      bookTitleBn: book.titleBn,
      bookTitleEn: book.titleEn,
      studentId: student.id,
      studentName: student.studentName,
      rollNumber: student.rollNumber,
      issueDate: todayIso,
      dueDate,
      status: asRequest ? 'requested' : 'issued',
      fineAmountBdt: 0,
      issuedByUid: firebaseUser?.uid || 'admin-default',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setLoans((prev) => [newLoan, ...prev]);
    if (!asRequest) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
            : b
        )
      );
    }
    showToast(
      asRequest
        ? `Requested "${book.titleBn}" for ${student.studentName}.`
        : `Issued "${book.titleBn}" to ${student.studentName}.`
    );
  };

  const handleApproveLoanRequest = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan || targetLoan.status !== 'requested') return;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: 'issued', updatedAt: new Date().toISOString() } : l
      )
    );
    setBooks((prev) =>
      prev.map((b) =>
        b.id === targetLoan.bookId
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b
      )
    );
    showToast(`Approved book loan for "${targetLoan.bookTitleBn}".`);
  };

  const handleReturnLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan || targetLoan.status === 'returned') return;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: 'returned', updatedAt: new Date().toISOString() } : l
      )
    );
    setBooks((prev) =>
      prev.map((b) =>
        b.id === targetLoan.bookId
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      )
    );
    showToast(`Returned "${targetLoan.bookTitleBn}" to the shelf.`);
  };

  const handleQuickBorrowSelectedBook = () => {
    const firstApproved = students.find((s) => s.status === 'approved');
    if (!firstApproved) {
      handleOpenConsoleTab('students');
      return;
    }
    if (selectedBook.availableCopies <= 0) {
      showToast('No available copies currently on the shelf.');
      return;
    }
    handleIssueLoan({
      bookId: selectedBook.id,
      studentId: firstApproved.id,
      dueDate: '2026-11-28',
      asRequest: currentRole === 'student',
    });
  };

  const handleGoogleAuth = async () => {
    try {
      if (firebaseUser) {
        await signOut(auth);
        showToast('Signed out of Google account.');
      } else {
        await signInWithPopup(auth, googleProvider);
        showToast('Signed in with Google.');
      }
    } catch {
      showToast('Authentication popup closed.');
    }
  };

  return (
    <main
      data-state="library-3d-active"
      className="relative w-screen h-screen overflow-hidden select-none"
    >
      {/* 1. Full-Bleed 100vw x 100vh 3D College Library & Bangla Lectern Canvas */}
      <Library3DScene
        books={books}
        selectedBook={selectedBook}
        onSelectBook={(b) => setSelectedBookId(b.id)}
        cameraPreset={cameraPreset}
        lightingPreset={lightingPreset}
        explodedAmount={explodedAmount}
      />

      {/* 2. Top Bar Contract (Strict 3-Zone Header: Brand Wordmark — 4 Nav Links — 1 Primary Action) */}
      <header className="relative z-20 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#120e0b]/95 border-b border-amber-900/30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setIsConsoleOpen(false);
            setCameraPreset('lectern');
          }}
          className="text-xl font-display font-bold tracking-tight text-amber-100 whitespace-nowrap shrink-0"
        >
          Granthagar · গীতাঞ্জলি কলেজ গ্রন্থাগার
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Library Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300"
        >
          <button
            type="button"
            onClick={() => handleOpenConsoleTab('catalog')}
            className="hover:text-amber-200 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Bangla Catalog ({metrics.totalTitles})
          </button>
          <button
            type="button"
            onClick={() => handleOpenConsoleTab('students')}
            className="hover:text-amber-200 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Student Approvals ({metrics.pendingStudents} Pending)
          </button>
          <button
            type="button"
            onClick={() => handleOpenConsoleTab('librarians')}
            className="hover:text-amber-200 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Librarian Staff ({metrics.activeLibrarians})
          </button>
          <button
            type="button"
            onClick={() => handleOpenConsoleTab('circulation')}
            className="hover:text-amber-200 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Circulation ({metrics.activeLoans})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsConsoleOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Open Library Console
          </button>
        </div>
      </header>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#1c1510] border border-amber-500/50 text-amber-100 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}

      {/* 3. Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion, No backdrop-filter over WebGL) */}
      <section
        aria-label="3D Library Controls and Active Book Inspector"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95vw] max-w-[1140px]"
      >
        {/* Collapse / Expand Tab Handle */}
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="px-3 py-1 text-xs font-medium text-stone-200 bg-[#14100d] hover:bg-[#1f1813] border border-amber-900/40 rounded-lg shadow-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Dock Drawer Body */}
        {!isDockCollapsed && (
          <div className="px-4 py-2.5 bg-[#130f0c]/96 border border-amber-900/45 rounded-xl shadow-2xl space-y-2">
            {/* Row 1: Active 3D Bangla Book Readout + Quick Actions */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 pb-2 border-b border-amber-900/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleSelectPrevNextBook(-1)}
                  aria-label="Previous Bangla Book"
                  className="p-1.5 bg-[#1d1611] hover:bg-amber-900/40 text-amber-200 rounded-md border border-amber-900/40 transition-colors shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bengali font-bold text-sm text-amber-100 whitespace-nowrap shrink-0">
                      {selectedBook.titleBn}
                    </span>
                    <span className="text-xs text-stone-300 truncate hidden sm:inline">
                      · {selectedBook.titleEn}
                    </span>
                    <span className="text-xs text-stone-400 whitespace-nowrap shrink-0 hidden md:inline font-mono tabular-nums">
                      · {selectedBook.authorBn} · {selectedBook.shelfCode} ·{' '}
                      <strong className="text-emerald-400">
                        {selectedBook.availableCopies}/{selectedBook.totalCopies} Available
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPrevNextBook(1)}
                  aria-label="Next Bangla Book"
                  className="p-1.5 bg-[#1d1611] hover:bg-amber-900/40 text-amber-200 rounded-md border border-amber-900/40 transition-colors shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleQuickBorrowSelectedBook}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {currentRole === 'student' ? 'Request Borrow' : 'Quick Issue Book'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenConsoleTab('students')}
                  className="px-3 py-1.5 text-xs font-medium bg-[#1d1611] hover:bg-stone-800 text-amber-200 border border-amber-800/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Approve Students ({metrics.pendingStudents})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenConsoleTab('librarians')}
                  className="px-3 py-1.5 text-xs font-medium bg-[#1d1611] hover:bg-stone-800 text-amber-200 border border-amber-800/40 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Add Librarian</span>
                </button>
              </div>
            </div>

            {/* Row 2: 3D Camera Presets, Book Layer Slider, Lighting, Role & Auth */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 text-xs">
              {/* Camera View Buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#0b0806] border border-amber-900/30 rounded-lg shrink-0">
                {(
                  [
                    { id: 'lectern', label: 'Lectern View' },
                    { id: 'shelf', label: 'Bangla Shelf' },
                    { id: 'rotunda', label: 'Grand Hall' },
                    { id: 'top', label: 'Top Plan' },
                  ] as const
                ).map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setCameraPreset(cam.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                      cameraPreset === cam.id
                        ? 'bg-amber-600 text-stone-950 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Exploded Tome / Page-Spread Slider */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0b0806] border border-amber-900/30 rounded-lg shrink-0">
                <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <label
                  htmlFor="tome-spread-slider"
                  className="text-stone-300 whitespace-nowrap shrink-0"
                >
                  Book Layers
                </label>
                <input
                  id="tome-spread-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Lighting Presets */}
              <div className="flex items-center gap-1 p-1 bg-[#0b0806] border border-amber-900/30 rounded-lg shrink-0">
                {(
                  [
                    { id: 'study', label: 'Warm Study' },
                    { id: 'daylight', label: 'Atrium Day' },
                    { id: 'archival', label: 'Amber Lamp' },
                  ] as const
                ).map((lt) => (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => setLightingPreset(lt.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                      lightingPreset === lt.id
                        ? 'bg-stone-800 text-amber-300 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {lt.label}
                  </button>
                ))}
              </div>

              {/* Active Role Selector & Google Sign-In */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  aria-label="Active Workspace Role"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="px-2.5 py-1 bg-[#0b0806] border border-amber-900/40 rounded-lg text-amber-200 font-medium text-xs"
                >
                  <option value="admin">Role: Admin (Default)</option>
                  <option value="librarian">Role: Librarian</option>
                  <option value="student">Role: Student</option>
                </select>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="px-2.5 py-1 bg-[#1d1611] hover:bg-stone-800 text-stone-300 border border-amber-900/40 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  {firebaseUser ? (
                    <>
                      <LogOut className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sign Out</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Google Sync</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Full Library Management Console Modal (Bangla Books, Student Approvals, Librarians, Circulation) */}
      <ManagementConsole
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        activeTab={activeConsoleTab}
        onTabChange={setActiveConsoleTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        books={books}
        selectedBookId={selectedBook.id}
        onSelectBookIn3D={(b) => {
          setSelectedBookId(b.id);
          setCameraPreset('lectern');
        }}
        onAddBook={handleAddBook}
        onDeleteBook={handleDeleteBook}
        librarians={librarians}
        onAddLibrarian={handleAddLibrarian}
        onToggleLibrarianStatus={handleToggleLibrarianStatus}
        students={students}
        onApproveStudent={handleApproveStudent}
        onRejectStudent={handleRejectStudent}
        onAddStudentApplication={handleAddStudentApplication}
        loans={loans}
        onIssueLoan={handleIssueLoan}
        onApproveLoanRequest={handleApproveLoanRequest}
        onReturnLoan={handleReturnLoan}
      />
    </main>
  );
}
