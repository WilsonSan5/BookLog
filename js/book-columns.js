import { openBookDetailModal } from "./book-detail.js";

let columns = [
  { id: "toRead", title: "A lire", books: [] },
  { id: "reading", title: "En cours", books: [] },
  { id: "read", title: "Lu", books: [] },
];

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
    
    column.books.forEach((book, index) => {
      const bookItem = document.createElement("li");
      bookItem.classList.add(
        "bg-white", 
        "hover:bg-gray-50",
        "rounded-lg", 
        "p-4", 
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
      bookItem.addEventListener('click', (e) => {
        // Only open modal if clicking on the title (h3) element
        if (e.target.tagName === 'H3' || e.target.closest('h3')) {
          e.stopPropagation();
          openBookDetailModal(book);
        }
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
      authorElement.innerHTML = 
        book.author
      ;

      // Add additional book info if available
      if (book.pages) {
        const pagesElement = document.createElement("p");
        pagesElement.classList.add(
          "text-xs",
          "text-gray-500",
          "flex",
          "items-center"
        );
        pagesElement.innerHTML = `
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          ${book.pages} pages
        `;
        bookItem.appendChild(pagesElement);
      }

      // Add action buttons
      const actionButtons = document.createElement("div");
      actionButtons.classList.add(
        "mt-3",
        "flex",
        "justify-between",
        "items-center"
      );

      // Move buttons
      const moveButtons = document.createElement("div");
      moveButtons.classList.add("flex", "space-x-2");

      columns.forEach((targetColumn) => {
        if (targetColumn.id !== column.id) {
          const moveButton = document.createElement("button");
          moveButton.classList.add(
            "px-3",
            "py-1",
            "text-xs",
            "bg-blue-100",
            "hover:bg-blue-200",
            "text-blue-700",
            "rounded-full",
            "transition-colors",
            "duration-200"
          );
          moveButton.textContent = `→ ${targetColumn.title}`;
          moveButton.onclick = () => {
            // Remove from current column
            column.books = column.books.filter(b => b !== book);
            // Move to target column
            moveToColumn(targetColumn.id, book);
          };
          moveButtons.appendChild(moveButton);
        }
      });

      // Remove button (retirer de la colonne)
      const removeButton = document.createElement("button");
      removeButton.classList.add(
        "px-3",
        "py-1",
        "text-xs",
        "bg-orange-100",
        "hover:bg-orange-200",
        "text-orange-700",
        "rounded-full",
        "transition-colors",
        "duration-200"
      );
      removeButton.innerHTML = "🗑️";
      removeButton.onclick = () => {
        // Retirer directement de la colonne sans popup
        column.books = column.books.filter(b => b !== book);
        displaylColumns();
        showNotification(`"${book.title}" a été retiré de la colonne`, "success");
      };

      // Delete button (supprimer définitivement) - garde la popup pour cette action
      const deleteButton = document.createElement("button");
      deleteButton.classList.add(
        "px-3",
        "py-1",
        "text-xs",
        "bg-red-100",
        "hover:bg-red-200",
        "text-red-700",
        "rounded-full",
        "transition-colors",
        "duration-200",
      );
      deleteButton.innerHTML = "❌";
      deleteButton.onclick = () => {
        showDeleteConfirmation(book.title, "delete", () => {
          if (book.id) {
            // Livre personnalisé - suppression définitive
            removeBookFromAPI(book, column);
          } else {
            // Livre de l'API externe - suppression de la colonne et masquage
            removeBookFromColumn(book, column);
          }
        });
      };

      actionButtons.appendChild(moveButtons);
      actionButtons.appendChild(removeButton);
      
      // N'ajouter le bouton de suppression définitive que pour les livres personnalisés
      // ou afficher pour tous mais avec des comportements différents
      actionButtons.appendChild(deleteButton);

      bookItem.appendChild(titleElement);
      bookItem.appendChild(authorElement);
      bookItem.appendChild(actionButtons);
      bookList.appendChild(bookItem);
    });
    
    columnElement.appendChild(columnTitle);
    columnElement.appendChild(bookList);
    columnsSection.appendChild(columnElement);
  });
}

export function moveToColumn(columnId, book) {
  console.log(
    `Déplacement du livre "${book.title}" vers la colonne "${columnId}"`
  );
  const column = columns.find((col) => col.id === columnId);
  if (column) {
    // Check if book already exists in the column
    const bookExists = column.books.some(b => b.title === book.title && b.author === book.author);
    if (!bookExists) {
      // Add the book to the new column
      column.books.push(book);
    }

    // Refresh the display
    displaylColumns();
  }
}

// Fonction pour supprimer un livre uniquement de la colonne (livres API)
function removeBookFromColumn(book, column) {
  // Supprimer de la colonne actuelle
  column.books = column.books.filter(b => b !== book);
  
  // Ajouter à la liste des livres supprimés pour éviter qu'il réapparaisse
  const deletedBooks = JSON.parse(localStorage.getItem('deletedBooks') || '[]');
  const bookIdentifier = `${book.title}_${book.author}_${book.published || 'unknown'}`;
  
  if (!deletedBooks.includes(bookIdentifier)) {
    deletedBooks.push(bookIdentifier);
    localStorage.setItem('deletedBooks', JSON.stringify(deletedBooks));
  }
  
  // Rafraîchir l'affichage
  displaylColumns();
  
  // Afficher une notification de succès
  showNotification(`"${book.title}" a été supprimé définitivement`, "success");
}

// Fonction pour supprimer un livre définitivement (livres personnalisés)
function removeBookFromAPI(book, column) {
  // Supprimer de la colonne actuelle
  column.books = column.books.filter(b => b !== book);
  
  // Supprimer définitivement du localStorage
  const customBooks = JSON.parse(localStorage.getItem('customBooks') || '[]');
  const updatedCustomBooks = customBooks.filter(b => b.id !== book.id);
  localStorage.setItem('customBooks', JSON.stringify(updatedCustomBooks));
  
  // Rafraîchir l'affichage
  displaylColumns();
  
  // Afficher une notification de succès
  showNotification(`"${book.title}" a été supprimé définitivement`, "success");
}

// Ajouter la fonction showNotification si elle n'existe pas déjà
function showNotification(message, type = "success") {
  // Créer l'élément de notification
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
    type === "success" 
      ? "bg-green-500 text-white" 
      : "bg-red-500 text-white"
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${type === "success" 
          ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
          : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
        }
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <div class="ml-auto pl-3">
        <button class="text-white hover:text-gray-200" onclick="this.parentElement.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Ajouter la notification au body
  document.body.appendChild(notification);
  
  // Animation d'entrée
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);
  
  // Supprimer automatiquement après 5 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Ajouter la fonction de confirmation personnalisée avec le même design
function showDeleteConfirmation(bookTitle, actionType, onConfirm) {
  const modal = document.createElement("div");
  modal.id = "delete-confirmation-modal";
  modal.className = "fixed inset-0 bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto mt-32 pop z-50";
  
  const actionText = actionType === "delete" ? "supprimer définitivement" : "retirer de la colonne";
  const warningText = actionType === "delete" ? "Cette action est irréversible." : "Le livre sera retiré de cette colonne uniquement.";
  const buttonText = actionType === "delete" ? "Supprimer" : "Retirer";
  const buttonColor = actionType === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700";
  const iconColor = actionType === "delete" ? "text-red-500" : "text-orange-500";
  
  modal.innerHTML = `
    <button id="close-delete-modal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">
      &times;
    </button>
    <div class="space-y-6">
      <div class="flex items-start mb-4">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-6 h-6 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Confirmer l'action</h2>
          <p class="text-gray-600">
            Êtes-vous sûr de vouloir ${actionText} le livre 
          </p>
          <p class="font-medium text-gray-800 mt-1">
            "${bookTitle}"
          </p>
          <p class="text-sm text-gray-500 mt-2">
            ${warningText}
          </p>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 justify-end">
        <button id="cancel-delete" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">
          Annuler
        </button>
        <button id="confirm-delete" class="${buttonColor} text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200">
          ${buttonText}
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Créer l'overlay avec le même style
  const overlay = document.createElement("div");
  overlay.id = "delete-overlay";
  overlay.className = "fixed inset-0 bg-opacity-20";
  overlay.style.display = "block";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  document.body.appendChild(overlay);
  
  // Gérer les événements
  const cancelButton = modal.querySelector("#cancel-delete");
  const confirmButton = modal.querySelector("#confirm-delete");
  const closeButton = modal.querySelector("#close-delete-modal");
  
  const closeModal = () => {
    if (modal.parentElement) modal.remove();
    if (overlay.parentElement) overlay.remove();
  };
  
  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);
  confirmButton.addEventListener("click", () => {
    onConfirm();
    closeModal();
  });
  overlay.addEventListener("click", closeModal);
  
  // Fermer avec Escape
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}

displaylColumns();
