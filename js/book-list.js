import { moveToColumn } from "./book-columns.js";
import { openBookDetailModal } from "./book-detail.js";
import { getAllBooks } from "./book-api.js";
import { formatDate } from "./book-notification.js";
import { openNewBookModal } from "./book-new.js";
import { loadFromStorage } from "./book-storage.js";

const modalOverlay = document.getElementById("modal-overlay");

const searchBarElement = document.getElementById("search-bar-button");
searchBarElement.addEventListener("click", () => {
  openBookListModal();
});

let searchTerm = "";
const searchInputElement = document.getElementById("search-bar");
searchInputElement.addEventListener("input", (event) => {
  searchTerm = event.target.value.toLowerCase();
  console.log("Recherche en cours :", searchTerm);
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

export function openBookListModal() {
  const modal = document.getElementById("book-list-modal");
  modal.style.display = "flex";

  modalOverlay.style.display = "block";

  const searchInput = document.getElementById("search-bar");
  searchInput.focus();

  modalOverlay.addEventListener("click", () => {
    closeBookListModal();
  });

  const newBookButton = document.getElementById("add-new-book-button");
  newBookButton.addEventListener("click", () => {
    closeBookListModal();
    openNewBookModal();
  });

  getAllBooks().then((books) => {
    displayBooks(books);
  });
}

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
      "mb-2"
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
      "cursor-pointer"
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

function closeBookListModal() {
  const modal = document.getElementById("book-list-modal");
  modal.style.display = "none";

  modalOverlay.style.display = "none";
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
