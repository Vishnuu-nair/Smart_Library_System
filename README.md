# Smart Library System – Comprehensive Project Documentation

A lightweight, client-side web application developed using pure **HTML5**, **CSS3**, and **Vanilla JavaScript (ES5/ES6)**. This system provides complete library administration capabilities—book cataloging, member registration with Regular Expression (RegEx) validation, book issuing, return tracking, and automated overdue fine calculation—without requiring external libraries, build systems, or server backends.

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [File Structure & Visual Design](#2-file-structure--visual-design)
3. [Regular Expressions (RegEx) Deep Dive](#3-regular-expressions-regex-deep-dive)
4. [Feature & Process Implementation Details](#4-feature--process-implementation-details)
   - [4.1 Book Catalog Management](#41-book-catalog-management)
   - [4.2 Search & Filter Engine (Plain Text & RegEx)](#42-search--filter-engine-plain-text--regex)
   - [4.3 Member Registration & Validation](#43-member-registration--validation)
   - [4.4 Book Issuing Process](#44-book-issuing-process)
   - [4.5 Book Return & Overdue Fine Calculation](#45-book-return--overdue-fine-calculation)
   - [4.6 Persistence & LocalStorage](#46-persistence--localstorage)
5. [UI Controls & Buttons Reference](#5-ui-controls--buttons-reference)
6. [Explicit Project Assumptions](#6-explicit-project-assumptions)
7. [GitHub Pages Deployment Guide](#7-github-pages-deployment-guide)

---

## 1. Project Overview & Architecture

The application is structured around a single-page reactive architecture running entirely within the user's web browser:

```
+--------------------------------------------------------------------------+
|                               Browser DOM                                |
|                                                                          |
|   +-------------------+    HTML Events    +--------------------------+   |
|   |    index.html     | ----------------> |        script.js         |   |
|   |  (UI & Form Data) | <---------------- | (State, Logic, Validate) |   |
|   +-------------------+    DOM Rendering  +--------------------------+   |
|             ^                                          |                 |
|             | Stylings                                 | JSON Sync       |
|             v                                          v                 |
|   +-------------------+                   +--------------------------+   |
|   |     style.css     |                   |   Browser LocalStorage   |   |
|   +-------------------+                   +--------------------------+   |
+--------------------------------------------------------------------------+
```

### Core Architecture Highlights
- **Zero Dependencies:** Pure HTML, CSS, and JavaScript. No jQuery, Bootstrap, React, or npm dependencies.
- **State-Driven Rendering:** Application state is stored in three primary memory arrays (`books`, `members`, `issuedBooks`). Modifying any array triggers synchronization with browser `localStorage` and a centralized DOM re-render (`refreshUI()`).
- **Static Hosting Friendly:** Uses strictly relative asset paths (`href="style.css"`, `src="script.js"`), making it immediately hostable on GitHub Pages or any static file host.

---

## 2. File Structure & Visual Design

```
smart-library-system/
│
├── index.html       # Semantic HTML layout, forms, and data tables
├── style.css        # Academic template styles, banner, tables, and buttons
├── script.js        # Core logic, RegEx validation, fine math, and storage
└── README.md        # Complete system documentation (this file)
```

### Visual Layout & Template Compliance
The user interface matches a classic academic website template:
- **Header Banner:** Olive/khaki background (`#b5b274`) with centered white title text and underlined quick-navigation anchor links (`#books-section`, `#members-section`, etc.).
- **Summary Bar:** Top summary line displaying the daily fine rate and live counts of total books, registered members, and active loans.
- **Section Containers:** Centered, distinct sections separated by clean dividers (`#e0e0e0`).
- **Forms & Data Tables:** Clean two-column table layouts for form labels and inputs; classical border-collapsed data tables (`#eae8cb` headers) for displaying records.
- **Button Styling:** Authentic browser-native beveled styling (`#f0f0f0` background with `#707070` border) for buttons.
- **Footer:** Full-width dark charcoal bar (`#2e2e2e`) with centered white copyright text.

---

## 3. Regular Expressions (RegEx) Deep Dive

Input integrity is maintained using native JavaScript regular expressions. Each pattern is evaluated using `pattern.test(string)` before any state changes are accepted.

| Field Name | Variable Name | RegEx Pattern | Pattern Syntax Explanation | Valid Input Examples | Invalid Input Examples |
|---|---|---|---|---|---|
| **Member ID** | `memberIdPattern` | `/^LIB-\d{4}$/` | `^` asserts line start.<br>`LIB-` matches literal string.<br>`\d{4}` matches exactly 4 decimal digits.<br>`$` asserts line end. | `LIB-1001`<br>`LIB-0042` | `LIB-123` *(too short)*<br>`MEM-1001` *(wrong prefix)*<br>`LIB-10001` *(too long)* |
| **Member Name** | `namePattern` | `/^[a-zA-Z\s.]{3,50}$/` | `^` asserts line start.<br>`[a-zA-Z\s.]` matches letters, whitespace, and dots.<br>`{3,50}` requires length between 3 and 50 characters.<br>`$` asserts line end. | `Aarav Sharma`<br>`Dr. A. P. J. Kalam` | `Al` *(< 3 chars)*<br>`John123` *(contains digits)*<br>`User@Name` *(illegal symbol)* |
| **Email Address** | `emailPattern` | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` | Matches standard RFC 5322 email syntax: username part, literal `@`, valid domain label, dot, and minimum 2-letter Top-Level Domain (TLD). | `priya@example.com`<br>`student.cs@univ.edu` | `plainaddress`<br>`@missinguser.com`<br>`user@domain` *(missing TLD)* |
| **Phone Number** | `phonePattern` | `/^[6-9]\d{9}$/` | `^` asserts line start.<br>`[6-9]` enforces Indian mobile standard prefix (6, 7, 8, or 9).<br>`\d{9}` matches remaining 9 digits (total 10 digits).<br>`$` asserts line end. | `9876543210`<br>`7012345678` | `1234567890` *(starts with 1)*<br>`987654321` *(9 digits)*<br>`98765432100` *(11 digits)* |
| **Book ISBN** | `isbnPattern` | `/^\d{10}$|^\d{13}$/` | Matches either a 10-digit ISBN or a 13-digit modern ISBN. Hyphens and spaces are stripped before regex testing. | `0132350882`<br>`9780132350884` | `12345` *(too short)*<br>`978-013-ABC` *(contains letters)* |
| **Search Engine** | *Dynamic* | `new RegExp(query, "i")` | Dynamically compiled user pattern with `"i"` flag (case-insensitive) for flexible catalog filtering. | `^Clean`<br>`code|science`<br>`\d{3}` | Invalid regex syntax handled safely via `try...catch` |

---

## 4. Feature & Process Implementation Details

### 4.1 Book Catalog Management
- **State Representation:** Stored in the `books` array as JavaScript objects:
  ```javascript
  {
    title: "Clean Code",
    author: "Robert Martin",
    isbn: "9780132350884",
    genre: "Computer Science",
    copies: 3
  }
  ```
- **Adding a Book:**
  1. User enters Title, Author, ISBN, Genre, and Copies, then clicks **Add to Catalog**.
  2. `addBook(event)` intercepts the form submission via `event.preventDefault()`.
  3. Form inputs are trimmed, and any spaces/hyphens in the ISBN are sanitized using `.replace(/[-\s]/g, "")`.
  4. ISBN is validated against `isbnPattern`.
  5. The new book object is pushed to `books`, `saveData()` persists it to `localStorage`, and `refreshUI()` re-renders the catalog table and update dropdowns.
- **Deleting a Book:**
  1. Triggered via `deleteBook(index)` from a table row button.
  2. **Loan Check:** Scans `issuedBooks` array using `.some()`. If any active loan exists for this book title, deletion is aborted with an error message: *"Cannot delete this book while copies are currently issued to members."*
  3. If unissued, confirms with the user and splices the item from `books`.

---

### 4.2 Search & Filter Engine (Plain Text & RegEx)
- **Execution Hook:** Bound to `<input id="searchInput">` on the `onkeyup` event, triggering `searchBooks()`.
- **Mode 1 — Standard Substring Search (Default):**
  - Converts query to lowercase (`query.toLowerCase()`).
  - Checks if query is a substring of `title`, `author`, `genre`, or `isbn` using `.indexOf(q) !== -1`.
- **Mode 2 — RegEx Search (`#useRegexCheck` enabled):**
  - Compiles user input into `new RegExp(query, "i")`.
  - Wrapped inside a `try...catch` block to handle unescaped or incomplete regex syntax smoothly without throwing unhandled exceptions.
  - Matches pattern against book fields using `regex.test(...)`.
- **Live Rendering:** Passes the resulting subset to `renderBooks(filtered)` to immediately update the visible DOM table.

---

### 4.3 Member Registration & Validation
- **State Representation:** Stored in the `members` array:
  ```javascript
  {
    id: "LIB-1001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "9876543210"
  }
  ```
- **Registration Process (`registerMember(event)`):**
  1. Reads Full Name, Member ID, Email, and Phone number.
  2. Member ID is automatically capitalized (`.toUpperCase()`).
  3. Executes 4 sequential RegEx checks:
     - `namePattern.test(name)`
     - `memberIdPattern.test(id)`
     - `emailPattern.test(email)`
     - `phonePattern.test(phone)`
  4. **Uniqueness Check:** Checks `members` array using `.some(m => m.id === id)`. If the ID already exists, registration halts with an error.
  5. Successful entries are appended, saved to `localStorage`, and the member selection dropdown in the Issue form is dynamically updated.
- **Deleting a Member:**
  - `deleteMember(index)` checks `issuedBooks` to verify the member has no outstanding loans. If clear, prompts user confirmation and removes the record.

---

### 4.4 Book Issuing Process
- **State Representation:** Stored in the `issuedBooks` array:
  ```javascript
  {
    bookTitle: "Clean Code",
    memberId: "LIB-1001",
    memberName: "Aarav Sharma",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15"
  }
  ```
- **Workflow:**
  1. The **Member** select element is populated with all registered members from `members`.
  2. The **Book** select element is populated *only* with books that have `copies > 0`.
  3. **Due Date Defaulting:** When the page loads, `window.onload` automatically calculates $+14\text{ days}$ from today and pre-fills the `#issueDueDate` input.
  4. On submission (`issueBook(event)`):
     - Validates that Member, Book, and Due Date are selected.
     - Locates the book in `books` and decrements `copies` by 1 (`book.copies -= 1`).
     - Appends an issue record to `issuedBooks` with today's date formatted as `YYYY-MM-DD`.
     - Calls `saveData()` and updates tables and dropdowns.

---

### 4.5 Book Return & Overdue Fine Calculation
- **Fine Parameters:**
  - Standard Fine Rate: **₹5.00 per calendar day overdue**.
  - Accrual starts the day after the specified `dueDate`.
- **Calculation Algorithm (`calculateOverdue(dueDateString)`):**
  ```javascript
  var today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  var dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0); // Normalize to midnight

  var diffTime = today - dueDate; // Milliseconds difference
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      isOverdue: true,
      days: diffDays,
      fine: diffDays * FINE_PER_DAY
    };
  }
  return { isOverdue: false, days: 0, fine: 0 };
  ```
- **Return Workflow (`returnBook(index)`):**
  1. User clicks the **Return** button corresponding to the loan.
  2. System executes `calculateOverdue(item.dueDate)`.
  3. If overdue, a confirmation dialog appears showing:
     - Number of days overdue.
     - Total fine to collect: `₹(days * 5)`.
  4. If not overdue, a confirmation prompt shows that the book was returned on time with no fine.
  5. Upon confirmation:
     - The corresponding book copy count is incremented (`book.copies += 1`).
     - The transaction is spliced out of `issuedBooks`.
     - State is saved and the table is refreshed.

---

### 4.6 Persistence & LocalStorage
All data operations are serialized into browser `window.localStorage` under three keys:
- `library_books`: JSON string representing the array of books.
- `library_members`: JSON string representing the array of members.
- `library_issued`: JSON string representing the array of active loans.

If the user opens the page for the first time or clears browser cache, the system automatically falls back to predefined default arrays (`defaultBooks`, `defaultMembers`, `defaultIssued`) so the application is never blank on initial load.

---

## 5. UI Controls & Buttons Reference

| Control / Button Label | HTML Element ID / Class | Associated JS Handler | Purpose & Behavior Under the Hood |
|---|---|---|---|
| **Search Input** | `#searchInput` | `onkeyup="searchBooks()"` | Reads input value on every keystroke and dynamically filters the books displayed in `#booksTable`. |
| **Use RegEx Checkbox** | `#useRegexCheck` | `onchange="searchBooks()"` | Toggles catalog search between substring matching and custom regular expression pattern matching. |
| **Add to Catalog** | `#addBookForm button` | `onsubmit="addBook(event)"` | Validates ISBN with regex, appends book to `books` array, updates available stock, and resets form. |
| **Delete (Book)** | `.btn-del` in Book Table | `onclick="deleteBook(index)"` | Verifies book is not currently on loan, prompts user for confirmation, and removes book from catalog. |
| **Register Member** | `#memberForm button` | `onsubmit="registerMember(event)"` | Validates Name, ID (`LIB-XXXX`), Email, and 10-digit Phone using regexes, checks for duplicate IDs, and adds member. |
| **Delete (Member)** | `.btn-del` in Member Table | `onclick="deleteMember(index)"` | Verifies member has no unreturned books, prompts confirmation, and removes member from database. |
| **Issue Book** | `#issueForm button` | `onsubmit="issueBook(event)"` | Decrements available book copies by 1, creates a loan entry in `issuedBooks`, and sets due date. |
| **Return** | `button` in Issued Table | `onclick="returnBook(index)"` | Calculates overdue days and fine amount, prompts confirmation modal, increments book copies by 1, and removes loan. |
| **Reset Data to Default** | Button under main container | `onclick="resetToSampleData()"` | Clears `localStorage` and restores the sample catalog, members, and demo overdue transaction. |

---

## 6. Explicit Project Assumptions

1. **Client-Side Execution:** The application assumes a client-only runtime. All data is saved inside the browser's `localStorage` for that specific browser profile.
2. **Date Normalization:** Dates are normalized to midnight (`00:00:00.000`) before mathematical comparison. This prevents fractional day discrepancies caused by time of day or daylight saving shifts.
3. **Daily Fine Currency & Rate:** The overdue fine is assumed to be **₹5.00 INR per day**, accruing starting the first day past the specified due date.
4. **Loan Duration:** Default loan period is assumed to be **14 calendar days** from the day of issue, pre-filled automatically in the due date input.
5. **Referential Integrity & Safety:**
   - A book cannot be deleted while any copy is actively on loan.
   - A member cannot be removed while holding an active, unreturned book.
   - Books with 0 available copies are automatically excluded from the Issue dropdown to prevent negative stock.
6. **Unique Keys:**
   - Member ID is treated as a strictly unique primary identifier.
   - Book titles are treated as unique keys for copy tracking and return matching.
7. **Phone Number Standards:** Mobile phone validation assumes standard 10-digit formats starting with digits 6, 7, 8, or 9.

---

## 7. GitHub Pages Deployment Guide

Because the project uses standard HTML, CSS, and JavaScript with relative file references, it can be hosted on GitHub Pages in under two minutes:

1. **Create Repository:**
   - Go to [github.com/new](https://github.com/new) and name the repository (e.g. `smart-library-system`).
   - Keep it **Public**.

2. **Upload Project Files:**
   - Push or upload the following files directly into the repository root:
     - `index.html`
     - `style.css`
     - `script.js`
     - `README.md`

3. **Enable GitHub Pages:**
   - Inside your repository, click **Settings** (top navigation tab).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment > Branch**:
     - Select branch: `main` (or `master`).
     - Select folder: `/ (root)`.
     - Click **Save**.

4. **Access Live Website:**
   - In 1–2 minutes, GitHub will display your live deployment link:
     ```
     https://<your-github-username>.github.io/smart-library-system/
     ```
