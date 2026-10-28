// ==============================================================
// Smart Library System - script.js
// ==============================================================

// Daily overdue fine amount (in Rupees)
var FINE_PER_DAY = 5;

// --------------------------------------------------------------
// REGULAR EXPRESSIONS (RegEx) FOR VALIDATION
// --------------------------------------------------------------
var memberIdPattern = /^LIB-\d{4}$/; // e.g., LIB-1001
var namePattern     = /^[a-zA-Z\s.]{3,50}$/;
var emailPattern    = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
var phonePattern    = /^[6-9]\d{9}$/; // 10 digits starting with 6, 7, 8, or 9
var isbnPattern     = /^\d{10}$|^\d{13}$/; // 10 or 13 digits

// --------------------------------------------------------------
// INITIAL SAMPLE DATA
// --------------------------------------------------------------
var defaultBooks = [
  { title: "Clean Code", author: "Robert Martin", isbn: "9780132350884", genre: "Computer Science", copies: 3 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", genre: "Literature", copies: 2 },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", genre: "Science", copies: 1 }
];

var defaultMembers = [
  { id: "LIB-1001", name: "Aarav Sharma", email: "aarav@example.com", phone: "9876543210" },
  { id: "LIB-1002", name: "Priya Patel", email: "priya@example.com", phone: "9123456780" }
];

var defaultIssued = [
  {
    bookTitle: "Clean Code",
    memberName: "Aarav Sharma",
    memberId: "LIB-1001",
    issueDate: "2026-10-01",
    dueDate: "2026-10-15"
  }
];

var books = [];
var members = [];
var issuedBooks = [];

// --------------------------------------------------------------
// STORAGE (LocalStorage)
// --------------------------------------------------------------
function loadData() {
  var savedBooks = localStorage.getItem("library_books");
  var savedMembers = localStorage.getItem("library_members");
  var savedIssued = localStorage.getItem("library_issued");

  books = savedBooks ? JSON.parse(savedBooks) : defaultBooks.slice();
  members = savedMembers ? JSON.parse(savedMembers) : defaultMembers.slice();
  issuedBooks = savedIssued ? JSON.parse(savedIssued) : defaultIssued.slice();
}

function saveData() {
  localStorage.setItem("library_books", JSON.stringify(books));
  localStorage.setItem("library_members", JSON.stringify(members));
  localStorage.setItem("library_issued", JSON.stringify(issuedBooks));
}

function resetToSampleData() {
  if (confirm("Reset all data back to the original sample values?")) {
    localStorage.clear();
    loadData();
    refreshUI();
    alert("Data has been reset.");
  }
}

// --------------------------------------------------------------
// 1. BOOK CATALOG & SEARCH
// --------------------------------------------------------------
function renderBooks(bookList) {
  var tbody = document.getElementById("booksList");
  tbody.innerHTML = "";

  if (bookList.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No matching books found.</td></tr>";
    return;
  }

  for (var i = 0; i < bookList.length; i++) {
    var b = bookList[i];
    var tr = document.createElement("tr");

    tr.innerHTML = 
      "<td><b>" + b.title + "</b></td>" +
      "<td>" + b.author + "</td>" +
      "<td>" + b.isbn + "</td>" +
      "<td>" + b.genre + "</td>" +
      "<td>" + b.copies + "</td>" +
      "<td><button class='btn-del' onclick='deleteBook(" + i + ")'>Delete</button></td>";

    tbody.appendChild(tr);
  }
}

function addBook(event) {
  event.preventDefault();

  var title = document.getElementById("bookTitle").value.trim();
  var author = document.getElementById("bookAuthor").value.trim();
  var isbn = document.getElementById("bookISBN").value.trim().replace(/[-\s]/g, "");
  var genre = document.getElementById("bookGenre").value;
  var copies = parseInt(document.getElementById("bookCopies").value, 10);
  var msg = document.getElementById("bookMsg");

  // RegEx check for ISBN
  if (!isbnPattern.test(isbn)) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Error: ISBN must be 10 or 13 digits.";
    return;
  }

  books.push({
    title: title,
    author: author,
    isbn: isbn,
    genre: genre,
    copies: copies
  });

  saveData();
  refreshUI();

  document.getElementById("addBookForm").reset();
  msg.className = "msg-text msg-success";
  msg.innerText = "Book added successfully.";
  setTimeout(function() { msg.innerText = ""; }, 2500);
}

function deleteBook(index) {
  var bookToDelete = books[index];

  var isIssued = issuedBooks.some(function(item) {
    return item.bookTitle === bookToDelete.title;
  });

  if (isIssued) {
    alert("Cannot delete this book while copies are currently issued to members.");
    return;
  }

  if (confirm("Delete \"" + bookToDelete.title + "\"?")) {
    books.splice(index, 1);
    saveData();
    refreshUI();
  }
}

function searchBooks() {
  var query = document.getElementById("searchInput").value.trim();
  var useRegex = document.getElementById("useRegexCheck").checked;

  if (query === "") {
    renderBooks(books);
    return;
  }

  var filtered = [];

  if (useRegex) {
    try {
      var regex = new RegExp(query, "i");
      filtered = books.filter(function(b) {
        return regex.test(b.title) || regex.test(b.author) || regex.test(b.genre) || regex.test(b.isbn);
      });
    } catch (err) {
      return; // Invalid user regex syntax
    }
  } else {
    var q = query.toLowerCase();
    filtered = books.filter(function(b) {
      return b.title.toLowerCase().indexOf(q) !== -1 ||
             b.author.toLowerCase().indexOf(q) !== -1 ||
             b.genre.toLowerCase().indexOf(q) !== -1 ||
             b.isbn.indexOf(q) !== -1;
    });
  }

  renderBooks(filtered);
}

// --------------------------------------------------------------
// 2. MEMBER REGISTRATION
// --------------------------------------------------------------
function renderMembers() {
  var tbody = document.getElementById("membersList");
  tbody.innerHTML = "";

  if (members.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No members registered yet.</td></tr>";
    return;
  }

  for (var i = 0; i < members.length; i++) {
    var m = members[i];
    var tr = document.createElement("tr");

    tr.innerHTML = 
      "<td><b>" + m.id + "</b></td>" +
      "<td>" + m.name + "</td>" +
      "<td>" + m.email + "</td>" +
      "<td>" + m.phone + "</td>" +
      "<td><button class='btn-del' onclick='deleteMember(" + i + ")'>Delete</button></td>";

    tbody.appendChild(tr);
  }
}

function registerMember(event) {
  event.preventDefault();

  var name = document.getElementById("memberName").value.trim();
  var id = document.getElementById("memberId").value.trim().toUpperCase();
  var email = document.getElementById("memberEmail").value.trim();
  var phone = document.getElementById("memberPhone").value.trim();
  var msg = document.getElementById("memberMsg");

  // RegEx Check 1: Name
  if (!namePattern.test(name)) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Error: Name must contain only letters and spaces (min 3 characters).";
    return;
  }

  // RegEx Check 2: Member ID format (LIB-XXXX)
  if (!memberIdPattern.test(id)) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Error: Member ID must follow LIB-XXXX format (e.g. LIB-1001).";
    return;
  }

  // RegEx Check 3: Email
  if (!emailPattern.test(email)) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Error: Please enter a valid email address.";
    return;
  }

  // RegEx Check 4: Phone (10 digits starting with 6-9)
  if (!phonePattern.test(phone)) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Error: Phone must be 10 digits starting with 6, 7, 8, or 9.";
    return;
  }

  // Duplicate ID check
  var exists = members.some(function(m) { return m.id === id; });
  if (exists) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Error: Member with ID " + id + " already exists.";
    return;
  }

  members.push({ id: id, name: name, email: email, phone: phone });
  saveData();
  refreshUI();

  document.getElementById("memberForm").reset();
  msg.className = "msg-text msg-success";
  msg.innerText = "Member registered successfully.";
  setTimeout(function() { msg.innerText = ""; }, 2500);
}

function deleteMember(index) {
  var member = members[index];

  var hasLoan = issuedBooks.some(function(item) {
    return item.memberId === member.id;
  });

  if (hasLoan) {
    alert("Cannot delete member because they currently have an issued book.");
    return;
  }

  if (confirm("Remove member \"" + member.name + "\" (" + member.id + ")?")) {
    members.splice(index, 1);
    saveData();
    refreshUI();
  }
}

// --------------------------------------------------------------
// 3. ISSUE & RETURN + OVERDUE FINE
// --------------------------------------------------------------
function calculateOverdue(dueDateString) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);

  var diffTime = today - dueDate;
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      isOverdue: true,
      days: diffDays,
      fine: diffDays * FINE_PER_DAY
    };
  }

  return { isOverdue: false, days: 0, fine: 0 };
}

function updateIssueDropdowns() {
  var memberSelect = document.getElementById("issueMemberSelect");
  var bookSelect = document.getElementById("issueBookSelect");

  memberSelect.innerHTML = "<option value=''>-- Select Member --</option>";
  for (var i = 0; i < members.length; i++) {
    memberSelect.innerHTML += "<option value='" + members[i].id + "'>" + members[i].name + " (" + members[i].id + ")</option>";
  }

  bookSelect.innerHTML = "<option value=''>-- Select Available Book --</option>";
  for (var j = 0; j < books.length; j++) {
    if (books[j].copies > 0) {
      bookSelect.innerHTML += "<option value='" + books[j].title + "'>" + books[j].title + " (" + books[j].copies + " left)</option>";
    }
  }
}

function issueBook(event) {
  event.preventDefault();

  var memberId = document.getElementById("issueMemberSelect").value;
  var bookTitle = document.getElementById("issueBookSelect").value;
  var dueDate = document.getElementById("issueDueDate").value;
  var msg = document.getElementById("issueMsg");

  if (!memberId || !bookTitle || !dueDate) {
    msg.className = "msg-text msg-error";
    msg.innerText = "Please choose a member, a book, and a due date.";
    return;
  }

  var book = books.find(function(b) { return b.title === bookTitle; });
  if (!book || book.copies <= 0) {
    msg.className = "msg-text msg-error";
    msg.innerText = "No copies currently available.";
    return;
  }
  book.copies -= 1;

  var member = members.find(function(m) { return m.id === memberId; });
  var todayStr = new Date().toISOString().split("T")[0];

  issuedBooks.push({
    bookTitle: bookTitle,
    memberId: memberId,
    memberName: member ? member.name : "Unknown",
    issueDate: todayStr,
    dueDate: dueDate
  });

  saveData();
  refreshUI();

  document.getElementById("issueForm").reset();
  msg.className = "msg-text msg-success";
  msg.innerText = "Book issued successfully.";
  setTimeout(function() { msg.innerText = ""; }, 2500);
}

function renderIssuedBooks() {
  var tbody = document.getElementById("issuedList");
  tbody.innerHTML = "";

  if (issuedBooks.length === 0) {
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No books currently issued.</td></tr>";
    return;
  }

  for (var i = 0; i < issuedBooks.length; i++) {
    var item = issuedBooks[i];
    var overdue = calculateOverdue(item.dueDate);

    var statusHtml = "<span class='text-success'>On Time</span>";
    if (overdue.isOverdue) {
      statusHtml = "<span class='text-danger'>Overdue by " + overdue.days + " day(s) &bull; Fine: ₹" + overdue.fine + "</span>";
    }

    var tr = document.createElement("tr");
    tr.innerHTML = 
      "<td><b>" + item.bookTitle + "</b></td>" +
      "<td>" + item.memberName + " (" + item.memberId + ")</td>" +
      "<td>" + item.issueDate + "</td>" +
      "<td>" + item.dueDate + "</td>" +
      "<td>" + statusHtml + "</td>" +
      "<td><button onclick='returnBook(" + i + ")'>Return</button></td>";

    tbody.appendChild(tr);
  }
}

function returnBook(index) {
  var item = issuedBooks[index];
  var overdue = calculateOverdue(item.dueDate);

  var confirmMsg = "Process return for \"" + item.bookTitle + "\" borrowed by " + item.memberName + "?";
  if (overdue.isOverdue) {
    confirmMsg += "\n\nOVERDUE NOTICE:\nThis book is " + overdue.days + " days late.\nFine to collect: ₹" + overdue.fine;
  } else {
    confirmMsg += "\n\nReturned on time. No fine due.";
  }

  if (confirm(confirmMsg)) {
    var book = books.find(function(b) { return b.title === item.bookTitle; });
    if (book) {
      book.copies += 1;
    }

    issuedBooks.splice(index, 1);
    saveData();
    refreshUI();
    alert("Book returned successfully.");
  }
}

// --------------------------------------------------------------
// 4. SUMMARY STATS & INITIALIZATION
// --------------------------------------------------------------
function updateStats() {
  var totalCopies = 0;
  for (var i = 0; i < books.length; i++) {
    totalCopies += books[i].copies;
  }

  document.getElementById("statTotalBooks").innerText = totalCopies;
  document.getElementById("statTotalMembers").innerText = members.length;
  document.getElementById("statTotalIssued").innerText = issuedBooks.length;
}

function refreshUI() {
  renderBooks(books);
  renderMembers();
  updateIssueDropdowns();
  renderIssuedBooks();
  updateStats();
}

window.onload = function() {
  loadData();
  refreshUI();

  // Set default due date to 14 days from today
  var defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 14);
  var dueInput = document.getElementById("issueDueDate");
  if (dueInput) {
    dueInput.value = defaultDue.toISOString().split("T")[0];
  }
};
