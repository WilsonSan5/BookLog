import { moveToColumn } from "./book-columns.js";
import { openBookDetailModal } from "./book-detail.js";

// Changer l'API pour une API avec plus de livres
const ApiRoute = "https://openlibrary.org/subjects/fiction.json?limit=50";

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
  try {
    // Récupérer les livres de l'API OpenLibrary
    const response = await fetch(ApiRoute);
    const data = await response.json();
    
    // Transformer les données de l'API OpenLibrary au format attendu
    const apiBooks = data.works.map(work => ({
      title: work.title,
      author: work.authors ? work.authors[0].name : "Auteur inconnu",
      published: work.first_publish_year ? String(work.first_publish_year) : "Date inconnue", // Convertir en string
      pages: Math.floor(Math.random() * 400) + 100,
      description: work.subject ? work.subject.slice(0, 3).join(", ") : "Description non disponible"
    }));
    
    // Récupérer les livres stockés localement
    const localBooks = JSON.parse(localStorage.getItem('customBooks') || '[]');
    
    // Récupérer la liste des livres supprimés
    const deletedBooks = JSON.parse(localStorage.getItem('deletedBooks') || '[]');
    
    // Filtrer les livres de l'API pour exclure ceux qui ont été supprimés
    const filteredApiBooks = apiBooks.filter(book => {
      const bookIdentifier = `${book.title}_${book.author}_${book.published || 'unknown'}`;
      return !deletedBooks.includes(bookIdentifier);
    });
    
    // Fusionner les deux listes
    const allBooks = [...filteredApiBooks, ...localBooks];
    
    console.log(allBooks);
    return allBooks;
  } catch (error) {
    console.error("Erreur lors de la récupération des books :", error);
    // En cas d'erreur, utiliser une API de fallback
    return await getFallbackBooks();
  }
}

// Fonction de fallback avec une autre API
async function getFallbackBooks() {
  try {
    // API alternative : Google Books API (sans clé requise pour les recherches basiques)
    const fallbackResponse = await fetch("https://www.googleapis.com/books/v1/volumes?q=fiction&maxResults=40");
    const fallbackData = await fallbackResponse.json();
    
    const fallbackBooks = fallbackData.items.map(item => ({
      title: item.volumeInfo.title || "Titre inconnu",
      author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : "Auteur inconnu",
      published: item.volumeInfo.publishedDate ? String(item.volumeInfo.publishedDate.split('-')[0]) : "Date inconnue", // Convertir en string
      pages: item.volumeInfo.pageCount || Math.floor(Math.random() * 400) + 100,
      description: item.volumeInfo.description ? 
        item.volumeInfo.description.substring(0, 200) + "..." : 
        "Description non disponible"
    }));
    
    return fallbackBooks;
  } catch (fallbackError) {
    console.error("Erreur avec l'API de fallback :", fallbackError);
    // En dernier recours, retourner seulement les livres locaux
    return JSON.parse(localStorage.getItem('customBooks') || '[]');
  }
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
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("flex", "flex-col", "space-y-2");

    // Bouton "À lire"
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

    // Bouton "Retirer de la liste"
    

    // Bouton "Supprimer définitivement" (seulement pour les livres personnalisés)
   

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

  overlay.addEventListener("click", () => {
    closeBookListModal();
  });

  // Ajouter le bouton "Nouveau livre" dans la modal
  addNewBookButton();
  
  // Charger et afficher tous les livres au moment de l'ouverture
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

function addNewBookButton() {
  const modal = document.getElementById("book-list-modal");
  let newBookButton = document.getElementById("new-book-button");
  
  if (!newBookButton) {
    newBookButton = document.createElement("button");
    newBookButton.id = "new-book-button";
    newBookButton.textContent = "Nouveau livre";
    newBookButton.classList.add(
      "bg-blue-600",
      "text-white",
      "font-bold",
      "py-2",
      "px-4",
      "rounded",
      "mb-4",
      "bootstrap",
    );
    
    newBookButton.addEventListener("click", () => {
      openNewBookModal();
    });
    
    // Insérer le bouton avant la table
    const searchContainer = modal.querySelector("#search-bar").parentElement;
    searchContainer.appendChild(newBookButton);
  }
}

function openNewBookModal() {
  closeBookListModal();
  
  // Créer la modal du formulaire avec le même design que l'index
  const formModal = document.createElement("div");
  formModal.id = "new-book-modal";
  formModal.className = "fixed inset-0 bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mt-20 z-50";
  
  formModal.innerHTML = `
    <button id="close-new-book-modal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">
      &times;
    </button>
    <div class="space-y-4">
      <h2 class="text-3xl font-semibold mb-4">Ajouter un nouveau livre</h2>
      <form id="new-book-form" class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="book-title">
            Titre
          </label>
          <input class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 id="book-title" type="text" placeholder="Titre du livre" required>
        </div>
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="book-author">
            Auteur
          </label>
          <input class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 id="book-author" type="text" placeholder="Nom de l'auteur" required>
        </div>
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Date de publication
          </label>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Jour</label>
              <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      id="book-day" required>
                <option value="">Jour</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Mois</label>
              <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      id="book-month" required>
                <option value="">Mois</option>
                <option value="01">Janvier</option>
                <option value="02">Février</option>
                <option value="03">Mars</option>
                <option value="04">Avril</option>
                <option value="05">Mai</option>
                <option value="06">Juin</option>
                <option value="07">Juillet</option>
                <option value="08">Août</option>
                <option value="09">Septembre</option>
                <option value="10">Octobre</option>
                <option value="11">Novembre</option>
                <option value="12">Décembre</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Année</label>
              <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      id="book-year" required>
                <option value="">Année</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="book-pages">
            Nombre de pages
          </label>
          <input class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                 id="book-pages" type="number" placeholder="Nombre de pages" required>
        </div>
        
        <div>
          <label class="block text-gray-700 text-sm font-bold mb-2" for="book-description">
            Description
          </label>
          <textarea class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    id="book-description" placeholder="Description du livre" rows="3" required></textarea>
        </div>
        
        <div class="flex items-center justify-between mt-6">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="submit">
            Ajouter
          </button>
          <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500" 
                  type="button" id="cancel-new-book">
            Annuler
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(formModal);
  
  // Initialiser les options du calendrier
  initializeDateSelectors();
  
  // Créer l'overlay avec le même style
  const overlay = document.createElement("div");
  overlay.id = "new-book-overlay";
  overlay.className = "fixed inset-0 bg-opacity-20";
  overlay.style.display = "block";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  document.body.appendChild(overlay);
  
  // Gérer la fermeture avec le bouton X
  document.getElementById("close-new-book-modal").addEventListener("click", closeNewBookModal);
  
  // Gérer la fermeture avec le bouton Annuler
  document.getElementById("cancel-new-book").addEventListener("click", closeNewBookModal);
  
  // Gérer la fermeture avec l'overlay
  overlay.addEventListener("click", closeNewBookModal);
  
  // Gérer la soumission du formulaire
  const form = document.getElementById("new-book-form");
  form.addEventListener("submit", handleNewBookSubmit);
}

// Fonction pour initialiser les sélecteurs de date
function initializeDateSelectors() {
  const daySelect = document.getElementById("book-day");
  const monthSelect = document.getElementById("book-month");
  const yearSelect = document.getElementById("book-year");
  
  // Remplir les jours (1-31)
  for (let i = 1; i <= 31; i++) {
    const option = document.createElement("option");
    option.value = i.toString().padStart(2, '0');
    option.textContent = i;
    daySelect.appendChild(option);
  }
  
  // Remplir les années (de 1900 à l'année actuelle)
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  
  // Gérer le changement de mois/année pour ajuster les jours
  const updateDays = () => {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    if (month && year) {
      // Calculer le nombre de jours dans le mois
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Sauvegarder la valeur sélectionnée
      const selectedDay = daySelect.value;
      
      // Vider et re-remplir les jours
      daySelect.innerHTML = '<option value="">Jour</option>';
      for (let i = 1; i <= daysInMonth; i++) {
        const option = document.createElement("option");
        option.value = i.toString().padStart(2, '0');
        option.textContent = i;
        daySelect.appendChild(option);
      }
      
      // Restaurer la sélection si elle est toujours valide
      if (selectedDay && parseInt(selectedDay) <= daysInMonth) {
        daySelect.value = selectedDay;
      }
    }
  };
  
  monthSelect.addEventListener("change", updateDays);
  yearSelect.addEventListener("change", updateDays);
}

async function handleNewBookSubmit(event) {
  event.preventDefault();
  
  const title = document.getElementById("book-title").value;
  const author = document.getElementById("book-author").value;
  const day = document.getElementById("book-day").value;
  const month = document.getElementById("book-month").value;
  const year = document.getElementById("book-year").value;
  const pages = parseInt(document.getElementById("book-pages").value);
  const description = document.getElementById("book-description").value;
  
  // Créer la date de publication au format DD/MM/YYYY
  const published = `${day}/${month}/${year}`;
  
  // Créer un livre temporaire avec un ID unique
  const newBook = {
    id: Date.now(), // ID unique pour identifier que c'est un livre temporaire
    title,
    author,
    published,
    pages,
    description,
    isTemporary: true // Flag pour indiquer que c'est un livre temporaire
  };
  
  try {
    // Importer la fonction moveToColumn depuis book-columns.js
    const { moveToColumn } = await import('./book-columns.js');
    
    // Ajouter directement le livre à la colonne "À lire"
    moveToColumn("toRead", newBook);
    
    // Afficher une notification de succès
    showNotification(`"${title}" a été ajouté à votre liste "À lire" !`, "success");
    
    // Fermer la modal du formulaire
    closeNewBookModalOnly();
    
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors de l'ajout du livre. Veuillez réessayer.", "error");
  }
}

function closeNewBookModal() {
  closeNewBookModalOnly();
  openBookListModal(); // Rouvrir la liste des livres
}

function closeNewBookModalOnly() {
  const modal = document.getElementById("new-book-modal");
  const overlay = document.getElementById("new-book-overlay");
  
  if (modal) {
    modal.remove();
  }
  if (overlay) {
    overlay.remove();
  }
  // Ne pas rouvrir automatiquement la liste ici
}

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

// Fonction pour retirer un livre de la liste (mais pas le supprimer définitivement)
function removeBookFromList(book) {
  if (book.id) {
    // Livre personnalisé - ne rien faire de spécial, juste ne pas l'afficher
    showNotification(`"${book.title}" a été retiré de la liste`, "success");
  } else {
    // Livre de l'API - l'ajouter à la liste des livres masqués
    const hiddenBooks = JSON.parse(localStorage.getItem('hiddenBooks') || '[]');
    const bookIdentifier = `${book.title}_${book.author}_${book.published || 'unknown'}`;
    
    if (!hiddenBooks.includes(bookIdentifier)) {
      hiddenBooks.push(bookIdentifier);
      localStorage.setItem('hiddenBooks', JSON.stringify(hiddenBooks));
    }
    
    showNotification(`"${book.title}" a été retiré de la liste`, "success");
  }
}

// Fonction pour supprimer définitivement un livre personnalisé
function deleteBookPermanently(book) {
  if (book.id) {
    // Supprimer du localStorage
    const customBooks = JSON.parse(localStorage.getItem('customBooks') || '[]');
    const updatedCustomBooks = customBooks.filter(b => b.id !== book.id);
    localStorage.setItem('customBooks', JSON.stringify(updatedCustomBooks));
    
    showNotification(`"${book.title}" a été supprimé définitivement`, "success");
  }
}

// Modifier la fonction de confirmation pour supporter les deux types d'actions
function showDeleteConfirmation(bookTitle, actionType, onConfirm) {
  const modal = document.createElement("div");
  modal.id = "delete-confirmation-modal";
  modal.className = "fixed inset-0 bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto mt-32 z-50";
  
  const actionText = actionType === "delete" ? "supprimer définitivement" : "retirer de la liste";
  const warningText = actionType === "delete" ? "Cette action est irréversible." : "Le livre sera masqué de votre liste.";
  const buttonText = actionType === "delete" ? "Supprimer" : "Retirer";
  const buttonColor = actionType === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700";
  
  modal.innerHTML = `
    <button id="close-delete-modal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">
      &times;
    </button>
    <div class="space-y-6">
      <div class="flex items-start mb-4">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-6 h-6 ${actionType === 'delete' ? 'text-red-500' : 'text-orange-500'}" fill="currentColor" viewBox="0 0 20 20">
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
  
  // Créer l'overlay
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
}
