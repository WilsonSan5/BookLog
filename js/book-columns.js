import { openBookDetailModal } from "./book-detail.js";
import { saveToStorage } from "./book-storage.js";
import { clearBookFeedback, getBookFeedback } from "./book-feedback-storage.js";
import { showNotification } from "./book-notification.js";

// Global state
const DEFAULT_COLUMNS = [
  { id: "toRead", title: "À lire", books: [] },
  { id: "reading", title: "En cours", books: [] },
  { id: "read", title: "Lu", books: [] },
];

let columns = []; // runtime state
let draggedBook = null; // temp holder during drag

// Helpers functions to manage columns in the local storage.
function loadColumnsFromStorage() {
  const saved = localStorage.getItem("columns");
  columns = saved ? JSON.parse(saved) : structuredClone(DEFAULT_COLUMNS);
}

function persistColumnsInStorage() {
  saveToStorage("columns", columns);
}

// Pure functions to build column and book HTML
// These are used to render the columns and books in the UI.
function buildColumnHtml(column) {
  const booksHtml = column.books.length
    ? column.books
        .map((book, index) => buildBookItemHtml(book, column.id, index))
        .join("")
    : `<li class="text-gray-400 text-center py-8 italic">
         Aucun livre dans cette catégorie
       </li>`;

  return `
    <div id="${column.id}"
         data-column-id="${column.id}"
         class="column bg-gradient-to-br from-white to-gray-50 shadow-lg
                hover:shadow-xl transition-shadow duration-300 rounded-xl p-6
                border border-gray-200 min-h-96 w-full">
      <h2 class="text-2xl font-bold text-transparent bg-clip-text
                 bg-gradient-to-r from-blue-600 to-purple-600 mb-6 text-center
                 border-b border-gray-200 pb-3">
        ${column.title}
      </h2>

      <ul class="book-list space-y-3">
        ${booksHtml}
      </ul>
    </div>`;
}

function buildBookItemHtml(book, columnId, index) {
  const feedback = getBookFeedback(book.id);
  const hasRating = feedback.rating && feedback.rating > 0;
  const hasComments = feedback.comments && feedback.comments.trim().length > 0;

  const stars = hasRating
    ? `${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)}`
    : "";

  const feedbackHtml =
    hasRating || hasComments
      ? `<div class="mt-2 text-sm text-yellow-600">
           ${hasRating ? `<span>${stars}</span>` : ""}
           ${
             hasComments
               ? `<div class="text-gray-700 italic mt-1">
                              ${feedback.comments}
                            </div>`
               : ""
           }
         </div>`
      : "";

  return `
    <li class="book bg-white hover:bg-gray-50 rounded-lg p-4 shadow-md
               hover:shadow-lg border border-gray-200 transition-all duration-200
               cursor-pointer transform hover:-translate-y-1"
        draggable="true"
        data-book-id="${book.id}"
        style="animation-delay:${index * 100}ms">

      <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:underline">
        ${book.title}
      </h3>
      <p class="text-sm text-gray-600 mb-2">${book.author}</p>
      <p class="text-xs text-gray-500">${book.pages} pages</p>

      <div class="mt-3 flex justify-between items-center">
        <button type="button"
                class="remove-book-button px-3 py-1 text-xs bg-red-100
                       hover:bg-red-200 text-red-700 rounded-full
                       transition-colors duration-200"
                aria-label="Supprimer">
          ❌
        </button>
      </div>

      ${feedbackHtml}
    </li>`;
}

// Rendering the columns section
export function displayColumns() {
  const columnsSection = document.querySelector("#columns-section");
  columnsSection.innerHTML = columns.map(buildColumnHtml).join("");

  attachColumnEventListeners(columnsSection);
  persistColumnsInStorage();
}

// Event listener wiring (delegated where possible)
function attachColumnEventListeners(root) {
  // Column‑level drag targets
  Array.from(root.querySelectorAll(".column")).forEach((columnElement) => {
    columnElement.addEventListener("dragover", handleDragOver);
    columnElement.addEventListener("dragleave", handleDragLeave);
    columnElement.addEventListener("drop", handleDrop);
  });

  // Delegated listeners for clicks and book‑level drag
  root.addEventListener("click", handleColumnSectionClick);
  root.addEventListener("dragstart", handleBookDragStart);
  root.addEventListener("dragend", handleBookDragEnd);
}

// Click handler for column section
// This handles clicks on the column section, including book removal and opening details.
function handleColumnSectionClick(event) {
  //  Remove button click → remove book
  const removeButton = event.target.closest(".remove-book-button");
  if (removeButton) {
    const bookElement = removeButton.closest(".book");
    removeBookById(bookElement.dataset.bookId);
    return;
  }

  //  Title click → open detail modal
  const titleClicked =
    event.target.tagName === "H3" || event.target.closest("h3");
  if (titleClicked) {
    const bookElement = event.target.closest(".book");
    const bookId = bookElement.dataset.bookId;
    const book = findBookById(bookId);
    const columnId = bookElement.closest(".column").dataset.columnId;
    openBookDetailModal(book, columnId);
  }
}

// Drag and drop handlers for books
// These handle the drag and drop functionality for books between columns.
function handleBookDragStart(event) {
  const bookElement = event.target.closest(".book");
  if (!bookElement) return;

  draggedBook = findBookById(bookElement.dataset.bookId);
  event.dataTransfer.effectAllowed = "move";
  bookElement.classList.add("opacity-50");
}

function handleBookDragEnd(event) {
  const bookElement = event.target.closest(".book");
  if (bookElement) bookElement.classList.remove("opacity-50");
}

function handleDragOver(event) {
  event.preventDefault(); // allow drop
  event.currentTarget.classList.add("bg-gray-100");
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove("bg-gray-100");
}

function handleDrop(event) {
  event.preventDefault();
  const targetColumnId = event.currentTarget.dataset.columnId;
  moveBookToColumn(targetColumnId, draggedBook);
  event.currentTarget.classList.remove("bg-gray-100");
}

// Functions to handle column changes and books.

export function moveBookToColumn(targetColumnId, book) {
  if (!book) return;

  const destination = findColumnById(targetColumnId);
  if (!destination) return;

  // Add to destination if missing
  if (!destination.books.some((b) => b.id === book.id)) {
    destination.books.push(book);
  }

  // Remove from any other column
  columns.forEach((column) => {
    if (column.id !== targetColumnId) {
      column.books = column.books.filter((b) => b.id !== book.id);
    }
  });

  displayColumns();
}

function removeBookById(bookId) {
  const bookTitle = findBookById(bookId)?.title ?? "";

  columns.forEach((column) => {
    column.books = column.books.filter((book) => book.id !== bookId);
  });

  clearBookFeedback(bookId);
  showNotification(`"${bookTitle}" a été retiré de la liste`, "success");
  displayColumns();
}

// Simple functions to find columns or books by ID
function findColumnById(columnId) {
  return columns.find((column) => column.id === columnId);
}

function findBookById(bookId) {
  for (const column of columns) {
    const found = column.books.find((book) => book.id === bookId);
    if (found) return found;
  }
  return null;
}

// Utility exports
export function getAllBookIdsInColumns() {
  return columns.flatMap((column) => column.books.map((b) => b.id));
}

export function bookExistsInColumns(book) {
  return getAllBookIdsInColumns().includes(book.id);
}

// Initial load
loadColumnsFromStorage();
displayColumns();
