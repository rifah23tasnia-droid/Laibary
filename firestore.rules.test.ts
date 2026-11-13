import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  isValidDocumentId,
  validateBookInput,
  validateLibrarianInput,
  validateStudentApprovalInput,
  canPerformAction,
} from './lib/library-rules';

const rulesPath = path.join(process.cwd(), 'firestore.rules');
const blueprintPath = path.join(process.cwd(), 'firebase-blueprint.json');

test('firestore.rules enforces all 8 Pillars and covers all collections in firebase-blueprint.json', () => {
  const rulesText = fs.readFileSync(rulesPath, 'utf8');
  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

  // 1. Rules version & global safety net
  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('allow read, write: if false;'));

  // 2. Every collection in blueprint is matched in firestore.rules
  for (const collectionPath of Object.keys(blueprint.firestore)) {
    const matchTarget = collectionPath;
    assert.ok(
      rulesText.includes(`match ${matchTarget}`),
      `Missing match block for ${matchTarget}`
    );
  }

  // 3. Bootstrapped admin email & email_verified check
  assert.ok(rulesText.includes("request.auth.token.email == 'anjuara.ab1979@gmail.com'"));
  assert.ok(rulesText.includes('request.auth.token.email_verified == true'));

  // 4. Strict timestamps & anti-update-gap blueprints
  assert.ok(rulesText.includes('incoming().createdAt == request.time'));
  assert.ok(rulesText.includes('incoming().updatedAt == request.time'));
  assert.ok(rulesText.includes('isValidBook(incoming())'));
  assert.ok(rulesText.includes('isValidLibrarian(incoming())'));
  assert.ok(rulesText.includes('isValidStudentApproval(incoming())'));
  assert.ok(rulesText.includes('isValidCirculationLoan(incoming())'));
});

test('Dirty Dozen Payloads are rejected by schema and RBAC guards', () => {
  // Payload 1 & 11: Invalid Book coverColor / negative copies
  assert.equal(
    validateBookInput({
      titleBn: 'পথের পাঁচালী',
      titleEn: 'Pather Panchali',
      authorBn: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
      authorEn: 'Bibhutibhushan Bandyopadhyay',
      category: 'উপন্যাস (Novel)',
      isbn: '978-81-7215-001-3',
      shelfCode: 'BN-NV-101',
      totalCopies: -5,
      publishYear: 1929,
      coverColor: 'not-a-hex',
      spineAccent: '#d4af37',
      summaryBn: 'সারসংক্ষেপ',
      summaryEn: 'Summary',
    }).valid,
    false
  );

  // Payload 3: ID Poisoning
  assert.equal(isValidDocumentId('poisoned$id/with/slashes'), false);

  // Payload 7: Non-admin attempting to appoint librarian
  assert.equal(canPerformAction('librarian', 'add_librarian'), false);
  assert.equal(canPerformAction('student', 'add_librarian'), false);

  // Payload 8: Student attempting to approve student
  assert.equal(canPerformAction('student', 'approve_student'), false);

  // Payload 9 & 10: Malformed Librarian & Student inputs
  assert.equal(
    validateLibrarianInput({
      name: 'A',
      nameBn: '',
      employeeId: '!!',
      department: 'X',
      shift: 'Invalid Shift',
    }).valid,
    false
  );

  assert.equal(
    validateStudentApprovalInput({
      studentName: 'S',
      studentNameBn: '',
      rollNumber: 'bad roll',
      department: 'D',
      semester: 'Invalid Semester',
      sessionYear: '20',
    }).valid,
    false
  );
});
