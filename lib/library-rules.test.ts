import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_BANGLA_BOOKS,
  INITIAL_LIBRARIANS,
  INITIAL_STUDENT_APPROVALS,
  INITIAL_CIRCULATION_LOANS,
  canPerformAction,
  filterBooks,
  calculateOverdueFineBdt,
  computeLibraryMetrics,
  isValidDocumentId,
  validateBookInput,
  validateLibrarianInput,
  validateStudentApprovalInput,
} from './library-rules';

test('Initial Bangla books catalog contains iconic Bengali titles and valid hex bindings', () => {
  assert.ok(INITIAL_BANGLA_BOOKS.length >= 10);
  const patherPanchali = INITIAL_BANGLA_BOOKS.find((b) => b.titleBn === 'পথের পাঁচালী');
  assert.ok(patherPanchali, 'পথের পাঁচালী must be present');
  assert.equal(patherPanchali.authorBn, 'বিভূতিভূষণ বন্দ্যোপাধ্যায়');

  const gitanjali = INITIAL_BANGLA_BOOKS.find((b) => b.titleBn === 'গীতাঞ্জলি');
  assert.ok(gitanjali, 'গীতাঞ্জলি must be present');

  for (const book of INITIAL_BANGLA_BOOKS) {
    const res = validateBookInput(book);
    assert.equal(res.valid, true, `Seed book ${book.id} failed validation: ${res.error}`);
  }
});

test('RBAC permissions enforce Admin-only librarian appointment and Staff-only student approval', () => {
  // Default Admin permissions
  assert.equal(canPerformAction('admin', 'add_librarian'), true);
  assert.equal(canPerformAction('admin', 'approve_student'), true);
  assert.equal(canPerformAction('admin', 'add_book'), true);
  assert.equal(canPerformAction('admin', 'delete_book'), true);

  // Librarian permissions
  assert.equal(canPerformAction('librarian', 'add_librarian'), false);
  assert.equal(canPerformAction('librarian', 'delete_book'), false);
  assert.equal(canPerformAction('librarian', 'approve_student'), true);
  assert.equal(canPerformAction('librarian', 'add_book'), true);
  assert.equal(canPerformAction('librarian', 'issue_book'), true);

  // Student permissions
  assert.equal(canPerformAction('student', 'add_librarian'), false);
  assert.equal(canPerformAction('student', 'approve_student'), false);
  assert.equal(canPerformAction('student', 'add_book'), false);
  assert.equal(canPerformAction('student', 'request_borrow'), true);
  assert.equal(canPerformAction('student', 'apply_student_card'), true);
});

test('filterBooks searches across Bangla script, English transliteration, and category', () => {
  const byBangla = filterBooks(INITIAL_BANGLA_BOOKS, 'গীতাঞ্জলি', 'all');
  assert.equal(byBangla.length, 1);
  assert.equal(byBangla[0].id, 'bk-gitanjali');

  const byAuthor = filterBooks(INITIAL_BANGLA_BOOKS, 'Zahir Raihan', 'all');
  assert.equal(byAuthor.length, 1);
  assert.equal(byAuthor[0].titleBn, 'হাজার বছর ধরে');

  const poetryOnly = filterBooks(INITIAL_BANGLA_BOOKS, '', 'কবিতা (Poetry)');
  assert.equal(poetryOnly.length, 2);
});

test('calculateOverdueFineBdt computes exact BDT fine only after due date', () => {
  assert.equal(calculateOverdueFineBdt('2026-11-15', '2026-11-13', 10), 0);
  assert.equal(calculateOverdueFineBdt('2026-11-03', '2026-11-13', 10), 100);
});

test('computeLibraryMetrics aggregates volumes, pending approvals, and active librarians', () => {
  const metrics = computeLibraryMetrics(
    INITIAL_BANGLA_BOOKS,
    INITIAL_LIBRARIANS,
    INITIAL_STUDENT_APPROVALS,
    INITIAL_CIRCULATION_LOANS
  );
  assert.equal(metrics.totalTitles, 10);
  assert.equal(metrics.activeLibrarians, 3);
  assert.equal(metrics.pendingStudents, 2);
  assert.equal(metrics.approvedStudents, 2);
  assert.equal(metrics.activeLoans, 2);
});

test('Input and ID validators reject Dirty Dozen malformed inputs', () => {
  // ID Poisoning check
  assert.equal(isValidDocumentId('bk-gitanjali'), true);
  assert.equal(isValidDocumentId('bad$id!'), false);
  assert.equal(isValidDocumentId('a'.repeat(130)), false);

  // Invalid Librarian employeeId
  assert.equal(
    validateLibrarianInput({
      name: 'Test Librarian',
      nameBn: 'টেস্ট',
      employeeId: 'BAD ID WITH SPACES!',
      department: 'Bangla Archive',
      shift: 'Morning (8:00 AM - 2:00 PM)',
    }).valid,
    false
  );

  // Invalid Student rollNumber
  assert.equal(
    validateStudentApprovalInput({
      studentName: 'Test Student',
      studentNameBn: 'টেস্ট শিক্ষার্থী',
      rollNumber: 'INVALID/ROLL',
      department: 'Bengali',
      semester: '1st Semester',
      sessionYear: '2025-2026',
    }).valid,
    false
  );
});
