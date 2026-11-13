# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Global Default Deny**: Any path not explicitly matched in `firestore.rules` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity & Role Hierarchy**:
   - All writes require a signed-in user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
   - **Admin (`isAdmin()`)**: Verified via either the bootstrapped runtime owner email (`anjuara.ab1979@gmail.com` with `email_verified == true`) or existence of `/admins/$(request.auth.uid)`.
   - **Librarian (`isLibrarian()`)**: Verified via existence of an active librarian document at `/librarians/$(request.auth.uid)` where `data.status == 'active'`.
3. **Path Variable Hardening (`isValidId`)**: Every single-document operation (`get`, `create`, `update`, `delete`) validates the document ID against `^[a-zA-Z0-9_\-]+$` with `size() <= 128`.
4. **Strict Blueprint Validation (`isValid[Entity]`)**:
   - Every `create` and `update` invokes `isValid[Entity](incoming())` enforcing `keys().hasAll(...)`, `keys().hasOnly(...)`, type checks, string `.size()` bounds, integer ranges, and regex patterns matching `firebase-blueprint.json`.
   - Temporal integrity: `createdAt == request.time` on `create`; `createdAt == existing().createdAt` and `updatedAt == request.time` on `update`.
5. **Relational & Terminal State Guarantees**:
   - A `CirculationLoan` can only be created if both `/books/$(incoming().bookId)` and `/studentApprovals/$(incoming().studentId)` exist in Firestore.
   - Once a `CirculationLoan` reaches terminal `status == 'returned'`, non-admins cannot mutate it further.
   - Non-admin users can only `list` their own `studentApprovals` (`resource.data.applicantUid == request.auth.uid`) or their own `circulationLoans` (`resource.data.issuedByUid == request.auth.uid`).

---

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on Book Create**: Includes an undeclared field `"isFeatured": true` alongside valid `Book` fields -> Rejected by `data.keys().hasOnly(...)`.
2. **Unverified Admin Email Spoof**: User token has `email: "anjuara.ab1979@gmail.com"` but `email_verified: false` attempting to create a `/librarians/{id}` record -> Rejected by `isVerifiedUser()`.
3. **ID Poisoning Attack**: Attempting to `create` a document in `/books/{bookId}` with a 200-character or special-character ID (`book$123!`) -> Rejected by `isValidId(bookId)`.
4. **Identity Spoofing on Book Cataloging**: Authenticated admin/librarian sends `addedByUid: "spoofed_other_uid"` on `/books/{bookId}` create -> Rejected by `data.addedByUid == request.auth.uid`.
5. **Client Timestamp Forgery**: Payload sends a past/future `createdAt` timestamp instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
6. **Immortal Field Mutation on Update**: Updating a `/books/{bookId}` document while altering `createdAt` or `addedByUid` -> Rejected by immutability checks and `affectedKeys().hasOnly(...)`.
7. **Unauthorized Privilege Escalation**: Non-admin user attempting to write their own UID into `/admins/{uid}` or `/librarians/{uid}` -> Rejected by `isAdmin()`.
8. **Student Self-Approval**: Student applicant attempting to create a `/studentApprovals/{studentId}` record with `status: "approved"` instead of `"pending"` -> Rejected because non-staff creates must set `status == 'pending'`.
9. **Orphaned Circulation Loan**: Attempting to create `/circulationLoans/{loanId}` referencing a non-existent `bookId` or `studentId` -> Rejected by `exists(/databases/$(database)/documents/books/$(incoming().bookId))` and `exists(/databases/$(database)/documents/studentApprovals/$(incoming().studentId))`.
10. **Terminal State Re-opening**: Non-admin attempting to update a `/circulationLoans/{loanId}` document whose existing `status` is already `'returned'` -> Rejected by terminal state lock `existing().status != 'returned' || isAdmin()`.
11. **Value Poisoning on Update**: Updating `availableCopies` on `/books/{bookId}` with a string `"999"` or negative number `-5` -> Rejected by `isValidBook(incoming())` wrapping the `allow update` rule.
12. **Unauthorized Blanket List Scraping**: Standard student attempting an unconstrained `list` query across `/studentApprovals` belonging to other users -> Rejected by `resource.data.applicantUid == request.auth.uid || isAdmin() || isLibrarian()`.
