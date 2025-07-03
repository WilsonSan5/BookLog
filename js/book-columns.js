import { openBookDetailModal } from "./book-detail.js";
import { saveToStorage } from "./storage.js";

let columns = [
  { id: "toRead", title: "A lire", books: [] },
  { id: "reading", title: "En cours", books: [] },
  { id: "read", title: "Lu", books: [] },
];

let draggedBook = null;

function initializeColumns() {
  // Load columns from localStorage if available
  const savedColumns = localStorage.getItem("columns");
  if (savedColumns) {
    columns = JSON.parse(savedColumns);
  } else {
    // Initialize with default columns if not found in localStorage
    saveToStorage("columns", columns);
  }
}

function displaylColumns() {
  const columnsSection = document.getElementById("columns-section");
  columnsSection.innerHTML = ""; // Clear existing columns
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

    // Title of the column
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

    // Add drag-and-drop functionality
    columnElement.addEventListener("dragover", (e) => {
      e.preventDefault(); // Allow dropping
    });
    columnElement.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedBook) {
        moveToColumn(column.id, draggedBook);
      }
    });

    // List of books in the column
    const bookList = document.createElement("ul");
    bookList.classList.add("space-y-3"); // Adds spacing between book items

    // Add empty state message if no books
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

    // Add click event to open book detail modal
    bookItem.addEventListener("click", (e) => {
      // Only open modal if clicking on the title (h3) element
      if (e.target.tagName === "H3" || e.target.closest("h3")) {
        e.stopPropagation();
        openBookDetailModal(book);
      }
    });

    // Make book item draggable
    bookItem.setAttribute("draggable", "true");
    bookItem.addEventListener("dragstart", (e) => {
      draggedBook = book; // Store the dragged book
      e.dataTransfer.effectAllowed = "move";
      bookItem.classList.add("opacity-50");
    });
    bookItem.addEventListener("dragend", () => {
      bookItem.classList.remove("opacity-50");
    });

    // Add animation delay for staggered effect
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

    // Add action buttons
    const actionButtons = document.createElement("div");
    actionButtons.classList.add(
      "mt-3",
      "flex",
      "justify-between",
      "items-center"
    );

    // Remove button
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
      displaylColumns();
    };

    actionButtons.appendChild(removeButton);

    bookItem.appendChild(titleElement);
    bookItem.appendChild(authorElement);
    bookItem.appendChild(pagesElement);
    bookItem.appendChild(actionButtons);
    columnElement.appendChild(bookItem);
  });
}

export function moveToColumn(columnId, book) {
  console.log(
    `Déplacement du livre "${book.title}" vers la colonne "${columnId}"`
  );
  const column = columns.find((col) => col.id === columnId);
  if (column) {
    // Check if book already exists in the column
    const bookExists = column.books.some(
      (b) => b.title === book.title && b.author === book.author
    );
    if (!bookExists) {
      // Add the book to the new column
      column.books.push(book);
    }
    // Remove the book from the current column
    columns.forEach((col) => {
      if (col.id !== columnId) {
        col.books = col.books.filter((b) => b.title !== book.title);
      }
    });
    // Refresh all columns display
    displaylColumns();
  }
  // Save updated columns to localStorage
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
displaylColumns();
initDragAndDrop();
