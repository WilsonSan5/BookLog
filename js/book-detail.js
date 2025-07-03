import { moveToColumn } from "./book-columns.js";

export function openBookDetailModal(book){
    const modal = document.getElementById("book-detail-modal");

    const bookDetailContent = `
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                <h2 class="text-2xl font-bold text-gray-900">${book.title}</h2>
                <button id="close-button" class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto max-h-[60vh]">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Auteur</p>
                            <p class="text-gray-900 font-medium">${book.author}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Date de publication</p>
                            <p class="text-gray-900 font-medium">${formatPublicationDate(book.published)}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase tracking-wide">Pages</p>
                            <p class="text-gray-900 font-medium">${book.pages}</p>
                        </div>
                    </div>
                    
                    <div class="pt-4 border-t border-gray-200">
                        <p class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
                        <p class="text-gray-700 leading-relaxed">${book.description || "Aucune description disponible."}</p>
                    </div>
                </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button id="add-to-read-button" class="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Ajouter à ma liste
                </button>
            </div>
        </div>
    `;
    
    // Set modal classes for backdrop and positioning
    modal.className = "fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4";
    modal.innerHTML = bookDetailContent;
    
    // Add close button functionality
    const closeButton = document.getElementById("close-button");
    
    
    const closeModal = () => {
        modal.style.display = "none";
        modal.className = ""; // Reset classes when closing
        // Remove event listener to prevent memory leaks
        document.removeEventListener('keydown', handleEscapeKey);
    };

    // Add event listener for the "Add to Read" button
    const addToReadButton = document.getElementById("add-to-read-button");
    addToReadButton.onclick = () => {
        // Logic to add the book to the "To Read" column
        moveToColumn("toRead", book);
        closeModal();
    }
    
    // Handle escape key
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };
    
    closeButton.onclick = closeModal;
    
    // Close on backdrop click (clicking outside the modal content)
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    // Close on Escape key
    document.addEventListener('keydown', handleEscapeKey);
    
    // Show the modal
    modal.style.display = "flex";
}

// Fonction pour formater la date de publication
function formatPublicationDate(published) {
  // Si la date est au format DD/MM/YYYY (nouveau format)
  if (published && published.includes('/')) {
    return published;
  }
  // Si c'est juste une année (ancien format de l'API)
  return published || 'Non spécifiée';
}