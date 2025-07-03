import { moveToColumn } from "./book-columns.js";
import { openBookDetailModal } from "./book-detail.js";

const ApiRoute = "https://keligmartin.github.io/api/books.json";

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

async function getAllBooks() {
  return await fetch(ApiRoute)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des books :", error);
    });
}

function displayBooks(books) {
  const tableBody = document.getElementById("books-table-body");
  tableBody.innerHTML = ""; // Clear existing rows
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
    ); // Add hover effect
    row.innerHTML = `
      <div id="book-item" class="p-3">
        <h3>${book.title}, ${book.published}</h3>
        <p class="text-sm text-gray-600">${book.author}</p>  
        <p class="text-xs text-gray-500">${book.pages} pages</p>
      </div>
      `;

    const bookItem = row.querySelector("#book-item");
    bookItem.addEventListener("click", () => {
      openBookDetailModal(book);
      closeBookListModal();
    });

    // Create buttons for each book
    const addBookToReadButton = document.createElement("button");
    addBookToReadButton.textContent = "À lire";
    addBookToReadButton.classList.add(
      "bg-blue-500",
      "hover:bg-blue-700",
      "text-white",
      "font-bold",
      "py-2",
      "px-4",
      "rounded",
      "add-book-button"
    );
    addBookToReadButton.addEventListener("click", () => {
      moveToColumn("toRead", book);
      closeBookListModal();
    });
    row.appendChild(addBookToReadButton);
    tableBody.appendChild(row);
  });
}

function openBookListModal() {
  const modal = document.getElementById("book-list-modal");
  modal.style.display = "flex";

  const overlay = document.getElementById("modal-overlay");
  overlay.style.display = "block";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

  overlay.addEventListener("click", () => {
    closeBookListModal();
  });
}

function closeBookListModal() {
  const modal = document.getElementById("book-list-modal");
  modal.style.display = "none";

  const overlay = document.getElementById("modal-overlay");
  overlay.style.display = "none";
}

async function init() {
  const books = await getAllBooks();
  displayBooks(books);
}

init();
