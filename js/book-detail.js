import { moveToColumn, displayColumns} from "./book-columns.js";
import { renderFeedback, setupFeedbackHandlers } from "./book-feedback.js"; // <-- Import feedback modules

let feedbackHtml = "";

const modalOverlay = document.getElementById("modal-overlay");

export function openBookDetailModal(book, columnId = null) {
    const modal = document.getElementById("book-detail-modal");
    // Show feedback UI only if the book is in 'reading' or 'read' columns
    const showFeedback = columnId === "reading" || columnId === "read";
    // Render feedback UI if applicable
    if (showFeedback) {
        feedbackHtml = renderFeedback(book, handleFeedbackSave);
    } else {
        feedbackHtml = "Cette colonne ne permet pas de laisser des commentaires."; // No feedback UI for other columns
    }

  modalOverlay.style.display = "block";
  modalOverlay.addEventListener("click", () => {
    closeModal();
  });
  const bookDetailContent = `
        <!-- Conteneur de la modale -->
            <!-- En-tête de la modale -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                <h2 class="text-2xl font-bold text-gray-900">${book.title}</h2>
                <button id="close-button" class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Corps de la modale -->
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Auteur</p>
                            <p class="text-gray-900 font-medium">${
                              book.author
                            }</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Date de publication</p>
                            <p class="text-gray-900 font-medium">${formatPublicationDate(
                              book.published
                            )}</p>
                        </div>

                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Pages</p>
                            <p class="text-gray-900 font-medium">${
                              book.pages
                            }</p>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t border-gray-200">
                        <p class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
                        <p class="text-gray-700 leading-relaxed">${
                          book.description || "Aucune description disponible."
                        }</p>
                    </div>
                    ${feedbackHtml} <!-- Insert feedback UI here -->
                </div>
            </div>
            
            <!-- Pied de page de la modale -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button id="add-to-read-button" class="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Ajouter à ma liste
                </button>
            </div>
    `;
    
    // Définir les classes de la modale pour le fond et le positionnement
    // modal.className = "fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4";
    modal.innerHTML = bookDetailContent;
    
    // Ajouter la fonctionnalité du bouton de fermeture
    const closeButton = document.getElementById("close-button");
    const closeModal = () => {
        modal.style.display = "none";
        // Supprimer l'écouteur d'événement pour éviter les fuites mémoire
        document.removeEventListener('keydown', handleEscapeKey);
        modalOverlay.style.display = "none";
        modalOverlay.removeEventListener("click", closeModal);
    };

    // Ajouter l'écouteur d'événement pour le bouton "Ajouter à lire"
    const addToReadButton = document.getElementById("add-to-read-button");
    addToReadButton.onclick = () => {
        // Logique pour ajouter le livre à la colonne "À lire"
        moveToColumn("toRead", book);
        closeModal();
    }
    
    // Gérer la touche Échap
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };
    
    closeButton.onclick = closeModal;
    
    // Fermer en cliquant sur l'arrière-plan (clic en dehors du contenu de la modale)
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', handleEscapeKey);
    
    // Afficher la modale
    modal.style.display = "flex";

    // Setup feedback handlers if feedback UI is shown
    const feedbackContainer = modal.querySelector('.book-feedback');
    setupFeedbackHandlers(feedbackContainer, book, handleFeedbackSave);

}

// Fonction pour formater la date de publication
function formatPublicationDate(published) {
  // Vérifier que published existe et le convertir en string
  if (!published) {
    return "Non spécifiée";
  }

  // Convertir en string pour pouvoir utiliser includes
  const publishedStr = String(published);

  // Si la date est au format DD/MM/YYYY (nouveau format)
  if (publishedStr.includes("/")) {
    return publishedStr;
  }

  // Si c'est juste une année (ancien format de l'API)
  return publishedStr;
}

function handleFeedbackSave(bookId, rating, comments) {
    // Optionally show a notification or update UI
    // For now, do nothing (feedback is already saved in localStorage)
    displayColumns(); // Refresh columns to show updated feedback
    console.log(`Feedback saved for book ${bookId}: Rating ${rating}, Comments: ${comments}`);
}