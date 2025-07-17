import { openBookDetailModal } from "./book-detail.js";
import { saveToStorage } from "./book-storage.js";
import { clearBookFeedback, getBookFeedback } from "./book-feedback-storage.js"; // Add this import
import { showNotification } from "./book-notification.js";

let columns = [
  { id: "toRead", title: "A lire", books: [] },
  { id: "reading", title: "En cours", books: [] },
  { id: "read", title: "Lu", books: [] },
];

let draggedBook = null;

function initializeColumns() {
  // Charger les colonnes depuis localStorage si disponibles
  const savedColumns = localStorage.getItem("columns");
  if (savedColumns) {
    columns = JSON.parse(savedColumns);
  } else {
    // Initialiser avec les colonnes par défaut si non trouvées dans localStorage
    saveToStorage("columns", columns);
  }
}

export function displayColumns() {
  const columnsSection = document.getElementById("columns-section");
  columnsSection.innerHTML = ""; // Vider les colonnes existantes
  columns.forEach((column) => {
    const columnElement = document.createElement("div");
    columnElement.classList.add(
      "bg-gradient-to-br",
      "from-white",
      "to-gray-50",
      "shadow-lg",
      "hover:shadow-xl",
      "transition-shadow",
      "duration-300",
      "rounded-xl",
      "p-6",
      "border",
      "border-gray-200",
      "min-h-96",
      "w-full"
    );
    columnElement.id = column.id;

    // Titre de la colonne
    const columnTitle = document.createElement("h2");
    columnTitle.classList.add(
      "text-2xl",
      "font-bold",
      "text-transparent",
      "bg-clip-text",
      "bg-gradient-to-r",
      "from-blue-600",
      "to-purple-600",
      "mb-6",
      "text-center",
      "border-b",
      "border-gray-200",
      "pb-3"
    );
    columnTitle.innerHTML = column.title;

    // Ajouter la fonctionnalité de glisser-déposer
    columnElement.addEventListener("dragover", (e) => {
      e.preventDefault(); // Permettre le dépôt
    });
    columnElement.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedBook) {
        moveToColumn(column.id, draggedBook);
      }
    });

    // Liste des livres dans la colonne
    const bookList = document.createElement("ul");
    bookList.classList.add("space-y-3"); // Ajoute un espacement entre les éléments de livre

    // Ajouter un message d'état vide si aucun livre
    if (column.books.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.classList.add(
        "text-gray-400",
        "text-center",
        "py-8",
        "italic"
      );
      emptyMessage.textContent = "Aucun livre dans cette catégorie";
      bookList.appendChild(emptyMessage);
    }
    columnElement.appendChild(columnTitle);
    columnsSection.appendChild(columnElement);
    displayBookItems(column.id);
  });
  saveToStorage("columns", columns);
}

function displayBookItems(columnId) {
  const columnElement = document.getElementById(columnId);
  const column = columns.find((col) => col.id === columnId);

  column.books.forEach((book, index) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add(
      "bg-white",
      "hover:bg-gray-50",
      "rounded-lg",
      "p-4",
      "mb-4",
      "shadow-md",
      "hover:shadow-lg",
      "border",
      "border-gray-200",
      "transition-all",
      "duration-200",
      "cursor-pointer",
      "transform",
      "hover:-translate-y-1"
    );

    // Ajouter un événement de clic pour ouvrir la modale de détails du livre
    bookItem.addEventListener("click", (e) => {
      // Ouvrir la modale seulement si on clique sur le titre (élément h3)
      if (e.target.tagName === "H3" || e.target.closest("h3")) {
        e.stopPropagation();
        openBookDetailModal(book, columnId);
      }
    });

    // Rendre l'élément livre déplaçable
    bookItem.setAttribute("draggable", "true");
    bookItem.addEventListener("dragstart", (e) => {
      draggedBook = book; // Stocker le livre déplacé
      e.dataTransfer.effectAllowed = "move";
      bookItem.classList.add("opacity-50");
    });
    bookItem.addEventListener("dragend", () => {
      bookItem.classList.remove("opacity-50");
    });

    // Ajouter un délai d'animation pour un effet échelonné
    bookItem.style.animationDelay = `${index * 100}ms`;

    const titleElement = document.createElement("h3");
    titleElement.classList.add(
      "text-lg",
      "font-bold",
      "text-gray-800",
      "mb-2",
      "line-clamp-2",
      "hover:underline"
    );
    titleElement.textContent = book.title;

    const authorElement = document.createElement("p");
    authorElement.classList.add(
      "text-sm",
      "text-gray-600",
      "mb-2",
      "flex",
      "items-center"
    );
    authorElement.innerHTML = book.author;

    const pagesElement = document.createElement("p");
    pagesElement.classList.add(
      "text-xs",
      "text-gray-500",
      "flex",
      "items-center"
    );
    pagesElement.innerHTML = `
          ${book.pages} pages
        `;

    // Ajouter les boutons d'action
    const actionButtons = document.createElement("div");
    actionButtons.classList.add(
      "mt-3",
      "flex",
      "justify-between",
      "items-center"
    );

    // Bouton de suppression
    const removeButton = document.createElement("button");
    removeButton.classList.add(
      "px-3",
      "py-1",
      "text-xs",
      "bg-red-100",
      "hover:bg-red-200",
      "text-red-700",
      "rounded-full",
      "transition-colors",
      "duration-200",
      "cursor-pointer"
    );
    removeButton.innerHTML = "❌";
    removeButton.onclick = () => {
      column.books = column.books.filter((b) => b !== book);
      clearBookFeedback(book.id); // Clear feedback when removing book
      showNotification(`"${book.title}" a été retiré de la liste`, "success");
      displayColumns();
    };

    actionButtons.appendChild(removeButton);
    const feedbackDiv = document.createElement("div");

    // Feedback summary (only for reading and read columns)
    if (columnId === "reading" || columnId === "read") {
      const feedback = getBookFeedback(book.id);
      if (feedback.rating > 0 || feedback.comments) {
        feedbackDiv.classList.add("mt-2", "text-sm", "text-yellow-600");
        // Stars
        if (feedback.rating > 0) {
          feedbackDiv.innerHTML += `<span>${"★".repeat(
            feedback.rating
          )}${"☆".repeat(5 - feedback.rating)}</span>`;
        }
        // Comment
        if (feedback.comments) {
          feedbackDiv.innerHTML += `<div class="text-gray-700 italic mt-1">${feedback.comments}</div>`;
        }
      }
    }

    bookItem.appendChild(titleElement);
    bookItem.appendChild(authorElement);
    bookItem.appendChild(pagesElement);
    bookItem.appendChild(actionButtons);
    bookItem.appendChild(feedbackDiv);
    columnElement.appendChild(bookItem);
  });
}

export function moveToColumn(columnId, book) {
  console.log(
    `Déplacement du livre "${book.title}" vers la colonne "${columnId}"`
  );
  const column = columns.find((col) => col.id === columnId);
  if (column) {
    // Vérifier si le livre existe déjà dans la colonne
    const bookExists = column.books.some(
      (b) => b.title === book.title && b.author === book.author
    );
    if (!bookExists) {
      // Ajouter le livre à la nouvelle colonne
      column.books.push(book);
    }
    // Supprimer le livre de la colonne actuelle
    columns.forEach((col) => {
      if (col.id !== columnId) {
        col.books = col.books.filter((b) => b.title !== book.title);
      }
    });
    // Actualiser l'affichage de toutes les colonnes
    displayColumns();
  }
  // Sauvegarder les colonnes mises à jour dans localStorage
  saveToStorage("columns", columns);
}

function initDragAndDrop() {
  const columnElements = document.querySelectorAll(".column");
  columnElements.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("bg-gray-100");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("bg-gray-100");
    });

    column.addEventListener("drop", (e) => {
      e.preventDefault();
      const bookId = e.dataTransfer.getData("text/plain");
      const book = columns
        .flatMap((col) => col.books)
        .find((b) => b.id === bookId);
      if (book) {
        moveToColumn(column.id, book);
      }
      column.classList.remove("bg-gray-100");
    });
  });
}

initializeColumns();
displayColumns();
initDragAndDrop();
