import { moveToColumn } from "./book-columns.js";
import { openBookDetailModal } from "./book-detail.js";
import { getAllBooks } from "./book-api.js";
import { showNotification, formatDate } from "./book-notification.js";
import { createNewBookModalHTML, initializeDateSelectors, getFormData, createBookFromForm } from "./book-form.js";
import { loadFromStorage } from "./book-storage.js";

const searchBarElement = document.getElementById("search-bar-button");
searchBarElement.addEventListener("click", () => {
  openBookListModal();
});

let searchTerm = "";
const searchInputElement = document.getElementById("search-bar");
searchInputElement.addEventListener("input", (event) => {
  searchTerm = event.target.value.toLowerCase();
  getAllBooks().then((books) => {
    const filteredBooks = books.filter((book) => {
      return (
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
      );
    });
    displayBooks(filteredBooks);
  });
});

function displayBooks(books) {
  const tableBody = document.getElementById("books-table-body");
  tableBody.innerHTML = "";
  books.forEach((book) => {
    const row = document.createElement("tr");
    row.classList.add(
      "hover:bg-gray-100",
      "transition-colors",
      "duration-200",
      "rounded-md",
      "cursor-pointer",
      "flex",
      "justify-between",
      "mb-2",
    );
    
    const formattedDate = formatDate(book.published);
    
    row.innerHTML = `
      <div id="book-item" class="p-3">
        <h3>${book.title}, ${formattedDate}</h3>
        <p class="text-sm text-gray-600">${book.author}</p>  
        <p class="text-xs text-gray-500">${book.pages} pages</p>
      </div>
    `;

    const bookItem = row.querySelector("#book-item");
    bookItem.addEventListener("click", () => {
      openBookDetailModal(book);
      closeBookListModal();
    });

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("flex", "flex-col", "space-y-2");

    const addBookToReadButton = document.createElement("button");
    addBookToReadButton.textContent = "Ajouter à ma liste";
    addBookToReadButton.classList.add(
      "text-blue-500",
      "hover:text-blue-700",
      "font-semibold",
      "py-1",
      "px-4",
      "rounded",
      "add-book-button",
      "cursor-pointer",
    );
    addBookToReadButton.addEventListener("click", () => {
      moveToColumn("toRead", book);
      closeBookListModal();
    });

    buttonsContainer.appendChild(addBookToReadButton);
    row.appendChild(buttonsContainer);
    tableBody.appendChild(row);
  });
}

function openBookListModal() {
  const modal = document.getElementById("book-list-modal");
  modal.style.display = "flex";

  const overlay = document.getElementById("modal-overlay");
  overlay.style.display = "block";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  const searchInput = document.getElementById("search-bar");
  searchInput.focus();

  overlay.addEventListener("click", () => {
    closeBookListModal();
  });

  const newBookButton = document.getElementById("add-new-book-button");
  newBookButton.addEventListener("click", () => {
    openNewBookModal();
  });
  
  getAllBooks().then((books) => {
    displayBooks(books);
  });
}

function closeBookListModal() {
  const modal = document.getElementById("book-list-modal");
  modal.style.display = "none";

  const overlay = document.getElementById("modal-overlay");
  overlay.style.display = "none";
}

function openNewBookModal() {
  closeBookListModal();
  
  const formModal = document.createElement("div");
  formModal.id = "new-book-modal";
  formModal.className = "fixed inset-0 bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mt-20 z-50";
  formModal.innerHTML = createNewBookModalHTML();
  
  document.body.appendChild(formModal);
  
  initializeDateSelectors();
  
  const overlay = document.createElement("div");
  overlay.id = "new-book-overlay";
  overlay.className = "fixed inset-0 bg-opacity-20";
  overlay.style.display = "block";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  document.body.appendChild(overlay);
  
  document.getElementById("close-new-book-modal").addEventListener("click", closeNewBookModal);
  document.getElementById("cancel-new-book").addEventListener("click", closeNewBookModal);
  overlay.addEventListener("click", closeNewBookModal);
  
  const form = document.getElementById("new-book-form");
  form.addEventListener("submit", handleNewBookSubmit);
}

async function handleNewBookSubmit(event) {
  event.preventDefault();
  
  const formData = getFormData();
  const newBook = createBookFromForm(formData);
  
  try {
    moveToColumn("toRead", newBook);
    showNotification(`"${formData.title}" a été ajouté à votre liste "À lire" !`, "success");
    closeNewBookModalOnly();
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors de l'ajout du livre. Veuillez réessayer.", "error");
  }
}

function closeNewBookModal() {
  closeNewBookModalOnly();
  openBookListModal();
}

function closeNewBookModalOnly() {
  const modal = document.getElementById("new-book-modal");
  const overlay = document.getElementById("new-book-overlay");
  
  if (modal) modal.remove();
  if (overlay) overlay.remove();
}

export function refreshColumns() {
  displayColumns();
}

export function refreshColumns() {
  displayColumns();
}

async function init() {
  let books = await getAllBooks();
  const customBooks = loadFromStorage("customBooks");
  if (customBooks && customBooks.length > 0) {
    books.push(...customBooks);
  }
  displayBooks(books);
}

init();