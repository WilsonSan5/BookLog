import { moveToColumn } from "./book-columns.js";
import { openBookDetailModal } from "./book-detail.js";
import { getAllBooks } from "./book-api.js";
import { formatDate } from "./book-notification.js";
import { openNewBookModal } from "./book-new.js";
import { loadFromStorage } from "./book-storage.js";
import { showNotification } from "./book-notification.js";

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
    const bookItem = document.createElement("div");
    bookItem.classList.add(
      "hover:bg-gray-100",
      "transition-colors",
      "duration-200",
      "rounded-md",
      "cursor-pointer",
      "flex",
      "justify-between",
      "items-center",
      "mb-2",
      "p-4",
    );

    const formattedDate = formatDate(book.published);

    bookItem.innerHTML = `
    <div>
        <h3>${book.title}, ${formattedDate}</h3>
        <p class="text-sm text-gray-600">${book.author}</p>  
        <p class="text-xs text-gray-500">${book.pages} pages</p>
    </div>
    `;

    bookItem.addEventListener("click", () => {
      closeBookListModal();
      openBookDetailModal(book);
    });

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add(
      "flex",
      "flex-col",
      "space-y-2",
      "items-center"
    );

    const addBookToReadButton = document.createElement("button");
    addBookToReadButton.textContent = "Ajouter à ma liste";
    addBookToReadButton.classList.add(
      "text-blue-500",
      "hover:text-blue-700",
      "font-semibold",
      "py-1",
      "px-4",
      "cursor-pointer"
    );

    addBookToReadButton.addEventListener("click", (event) => {
      event.stopPropagation();
      moveToColumn("toRead", book);

      // Here we can show a notification or update the UI
      showNotification(`"${book.title}" a été ajouté à votre liste "À lire"`, "success");

      // Filter out the book that have already been added to one of the columns from the book's list.
      const bookIndex = books.findIndex((b) => b.id === book.id);
      if (bookIndex > -1) {
        books.splice(bookIndex, 1);
      }
      displayBooks(books);
      // Close the modal after adding the book
      closeBookListModal();
    });

    buttonsContainer.appendChild(addBookToReadButton);
    bookItem.appendChild(buttonsContainer);
    tableBody.appendChild(bookItem);
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
