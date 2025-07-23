import { moveToColumn, displayColumns } from "./book-columns.js";
import { renderFeedback, setupFeedbackHandlers } from "./book-feedback.js";
import { showNotification } from "./book-notification.js";

// Cached DOM refs
const modalOverlay = document.getElementById("modal-overlay");
const modal = document.getElementById("book-detail-modal");

// Global state
let currentBook = null;
let currentColumnId = null;

// Small utilities functions
const isFeedbackColumn = (col) => col === "reading" || col === "read";

function formatPublicationDate(published) {
  if (!published) return "Non spécifiée";
  const s = String(published);
  return s.includes("/") ? s : s; // keep as-is for now (simple school-safe)
}


// Optional: escape text if you ever display untrusted user input
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Template builders (return strings)
function buildModalHeader(book) {
  return `
    <div class="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
      <h2 class="text-2xl font-bold text-gray-900">${escapeHtml(
        book.title
      )}</h2>
      <button type="button" data-action="close" class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100" aria-label="Fermer">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>`;
}

function buildModalBody(book, feedbackHtml) {
  // You can keep your grid + description markup; shortened here.
  return `
    <div class="p-6 overflow-y-auto max-h-[60vh]">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Auteur</p>
            <p class="text-gray-900 font-medium">${escapeHtml(
              book.author ?? "Inconnu"
            )}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Date de publication</p>
            <p class="text-gray-900 font-medium">${formatPublicationDate(
              book.published
            )}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Pages</p>
            <p class="text-gray-900 font-medium">${book.pages ?? "?"}</p>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <p class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
          <p class="text-gray-700 leading-relaxed">
            ${escapeHtml(book.description || "Aucune description disponible.")}
          </p>
        </div>

        <div class="book-feedback mt-4">
          ${feedbackHtml}
        </div>
      </div>
    </div>`;
}

function buildModalFooter(columnId) {
  // Primary button: either close (if already "toRead") or move to toRead
  const primaryAction = columnId === "toRead" ? "close" : "toRead";

  // Secondary button: depends on current column
  let secondaryBtn = "";
  if (columnId === "reading") {
    secondaryBtn = `
      <button type="button" data-action="move" data-move-to="read"
        class="ml-2 bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span class="text-sm">Déplacer vers "Lu"</span>
      </button>`;
  } else if (columnId === "read") {
    secondaryBtn = `
      <button type="button" data-action="move" data-move-to="reading"
        class="ml-2 bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span class="text-sm">Déplacer vers "En cours"</span>
      </button>`;
  }

  return `
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
      <button type="button" data-action="${primaryAction}"
        class="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span class="text-sm">${
          primaryAction === "close" ? "Fermer" : 'Déplacer vers "À lire"'
        }</span>
      </button>
      ${secondaryBtn}
    </div>`;
}

function buildModalHtml(book, columnId) {
  const feedbackHtml = isFeedbackColumn(columnId)
    ? renderFeedback(book, handleFeedbackSave)
    : `<p class="text-sm italic text-gray-500">Cette colonne ne permet pas de laisser des commentaires.</p>`;
  return `
    <!-- wrapper inside modal -->
    <div class="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden" role="dialog" aria-modal="true">
      ${buildModalHeader(book)}
      ${buildModalBody(book, feedbackHtml)}
      ${buildModalFooter(columnId)}
    </div>`;
}

// Event handlers
function onEscKey(e) {
  if (e.key === "Escape") closeModal();
}

function onOverlayClick(e) {
  // If click is outside inner content, close
  if (e.target === modalOverlay) closeModal();
}

// Click delegation inside modal
function onModalClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  if (action === "close") {
    closeModal();
    return;
  }

  if (action === "toRead") {
    moveToColumn("toRead", currentBook);
    closeModal();
    return;
  }

  if (action === "move") {
    const newCol = btn.dataset.moveTo;
    handleColumnChange(newCol, currentBook);
    closeModal();
  }
}

// This function opens the modal with the book details
// and sets up the feedback handlers if applicable.

export function openBookDetailModal(book, columnId = null) {
  currentBook = book;
  currentColumnId = columnId;
  // Render content
  modal.innerHTML = buildModalHtml(book, columnId);
  // Show
  modalOverlay.style.display = "block";
  modal.style.display = "flex";
  // Listeners (idempotent: attach once if not already)
  addGlobalModalListeners();

  // Feedback wiring (after DOM inserted)
  if (isFeedbackColumn(columnId)) {
    const feedbackContainer = modal.querySelector(".book-feedback");
    setupFeedbackHandlers(feedbackContainer, book, handleFeedbackSave);
  }
}

function closeModal() {
  modal.style.display = "none";
  modalOverlay.style.display = "none";
  removeGlobalModalListeners();
  currentBook = null;
  currentColumnId = null;
}

// Listener management helpers
// (These guard against double-binding if open called multiple times.)
let listenersAttached = false;
function addGlobalModalListeners() {
  if (listenersAttached) return;
  document.addEventListener("keydown", onEscKey);
  modalOverlay.addEventListener("click", onOverlayClick);
  modal.addEventListener("click", onModalClick);
  listenersAttached = true;
}
function removeGlobalModalListeners() {
  if (!listenersAttached) return;
  document.removeEventListener("keydown", onEscKey);
  modalOverlay.removeEventListener("click", onOverlayClick);
  modal.removeEventListener("click", onModalClick);
  listenersAttached = false;
}

// Column change + feedback save
function handleColumnChange(newColumnId, currentBook) {
  moveToColumn(newColumnId, currentBook);
}

function handleFeedbackSave(bookId, rating, comments) {
  displayColumns(); // refresh
  showNotification(
    `Feedback enregistré pour le livre ${currentBook?.title ?? ""}`,
    "success"
  );
  closeModal();
}
