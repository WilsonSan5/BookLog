import { moveBookToColumn } from "./book-columns.js";
import { openBookDetailModal } from "./book-detail.js";
import { getAllBooks } from "./book-api.js";
import { formatDate } from "./book-notification.js";
import { openNewBookModal } from "./book-new.js";
import { loadFromStorage } from "./book-storage.js";
import { displayNotification } from "./book-notification.js";
import { getAllBookIdsInColumns } from "./book-columns.js";

const modalOverlay = document.getElementById("modal-overlay");

const searchBarElement = document.getElementById("search-bar-button");
searchBarElement.addEventListener("click", () => {
  openBookListModal();
});

let searchTerm = "";
const searchInputElement = document.getElementById("search-bar");
searchInputElement.addEventListener("input", (event) => {
  searchTerm = event.target.value.toLowerCase();

  // Afficher le loader pendant la recherche
  showLoader();

  getAllBooks()
    .then((books) => {
      const filteredBooks = books.filter((book) => {
        return (
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm)
        );
      });
      displayBooks(filteredBooks);
      // Masquer le loader après l'affichage
      hideLoader();
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche :", error);
      hideLoader();
    });
});

// Fonction pour afficher le loader
function showLoader() {
  const loader = document.getElementById("book-list-loader");
  const tableBody = document.getElementById("books-table-body");

  if (loader) {
    loader.style.display = "flex";
  }

  if (tableBody) {
    tableBody.style.display = "none";
  }
}

// Fonction pour masquer le loader
function hideLoader() {
  const loader = document.getElementById("book-list-loader");
  const tableBody = document.getElementById("books-table-body");

  if (loader) {
    loader.style.display = "none";
  }

  if (tableBody) {
    tableBody.style.display = "block";
  }
}

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

  // Afficher le loader au début du chargement
  showLoader();

  getAllBooks()
    .then((books) => {
      displayBooks(books);
      // Masquer le loader après le chargement
      hideLoader();
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des livres :", error);
      hideLoader();
    });
}

function displayBooks(books) {
  const tableBody = document.getElementById("books-table-body");
  tableBody.innerHTML = "";

  const booksIdInColumns = getAllBookIdsInColumns();

  // Supprimer de la liste les livres déjà présents dans les colonnes
  books = books.filter((book) => {
    return !booksIdInColumns.includes(book.id);
  });

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
      "p-4"
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
      moveBookToColumn("toRead", book);

      // Afficher une notification
      displayNotification(
        `"${book.title}" a été ajouté à votre liste "À lire"`,
        "success"
      );

      displayBooks(books);
      // Fermer la modale après avoir ajouté le livre
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
  // Afficher le loader au début de l'initialisation
  showLoader();

  try {
    let books = await getAllBooks();
    const customBooks = loadFromStorage("customBooks");
    if (customBooks && customBooks.length > 0) {
      books.push(...customBooks);
    }
    displayBooks(books);
  } catch (error) {
    console.error("Erreur lors de l'initialisation :", error);
  } finally {
    // Masquer le loader dans tous les cas
    hideLoader();
  }
}

init();
