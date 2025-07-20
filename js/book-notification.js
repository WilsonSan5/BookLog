import { loadFromStorage, saveToStorage } from './book-storage.js';

export function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `absolute top-4 right-4 z-100 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
    type === "success" 
      ? "bg-green-500 text-white" 
      : "bg-red-500 text-white"
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${getNotificationIcon(type)}
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
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);
  
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

function getNotificationIcon(type) {
  return type === "success" 
    ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
    : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
}

export function showDeleteConfirmation(bookTitle, actionType, onConfirm) {
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
  
  const overlay = document.createElement("div");
  overlay.id = "delete-overlay";
  overlay.className = "fixed inset-0 bg-opacity-20";
  overlay.style.display = "block";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  document.body.appendChild(overlay);
  
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

export function removeBookFromList(book) {
  if (book.id) {
    showNotification(`"${book.title}" a été retiré de la liste`, "success");
  } else {
    const hiddenBooks = loadFromStorage('hiddenBooks') || [];
    const bookIdentifier = `${book.title}_${book.author}_${book.published || 'unknown'}`;
    
    if (!hiddenBooks.includes(bookIdentifier)) {
      hiddenBooks.push(bookIdentifier);
      saveToStorage('hiddenBooks', hiddenBooks);
    }
    
    showNotification(`"${book.title}" a été retiré de la liste`, "success");
  }
}

export function deleteBookPermanently(book) {
  if (book.id) {
    const customBooks = loadFromStorage('customBooks') || [];
    const updatedCustomBooks = customBooks.filter(b => b.id !== book.id);
    saveToStorage('customBooks', updatedCustomBooks);
    
    showNotification(`"${book.title}" a été supprimé définitivement`, "success");
  }
}

export function formatDate(published) {
  const publishedDate = new Date(published);
  return publishedDate.toLocaleDateString('fr-FR');
}