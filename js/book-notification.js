import { loadFromStorage, saveToStorage } from "./book-storage.js";

/**
 * Display a toast in the top‑right corner.
 * @param {string} message
 * @param {"success"|"error"} type
 */
/**
 * Display a toast in the top‑right corner.
 * @param {string}                message
 * @param {"success" | "error"}   type
 */
export function displayNotification(message, type = "success") {
  const isSuccess = type === "success";
  const notification = document.createElement("div");

  // Tailwind classes; NOTE: no translate‑x‑full anymore
  notification.className =
    "fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg " +
    "transition-transform duration-300 " +
    (isSuccess ? "bg-green-500 text-white" : "bg-red-500 text-white");

  // Start just outside the viewport; we’ll slide to 0 on the next frame
  notification.style.transform = "translateX(120%)";

  notification.innerHTML = `
    <div class="flex items-center gap-3">
      ${buildNotificationIcon(type)}
      <p class="flex-1 text-sm font-medium">${message}</p>
      <button type="button" class="toast-close hover:text-gray-200">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586
                   l4.293-4.293a1 1 0 111.414 1.414L11.414 10
                   l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414
                   l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10
                   4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  /* Slide in (next frame for CSS transition) */
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0)";
  });

  /* Manual close */
  notification
    .querySelector(".toast-close")
    .addEventListener("click", () => removeNotification(notification));

  /* Auto dismiss after 5 s */
  setTimeout(() => removeNotification(notification), 5000);
}

// Remove a notification with slide‑out animation
function removeNotification(el) {
  el.style.transform = "translateX(120%)";
  setTimeout(() => el.remove(), 300);
}

// Helper to build the notification icon based on type
function buildNotificationIcon(type) {
  return type === "success"
    ? `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
         <path fill-rule="evenodd"
               d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293
                  a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293
                  a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
               clip-rule="evenodd"></path>
       </svg>`
    : `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
         <path fill-rule="evenodd"
               d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293
                  a1 1 0 00-1.414 1.414L8.586 10 7.293 11.293
                  a1 1 0 001.414 1.414L10 11.414l1.293 1.293
                  a1 1 0 001.414-1.414L11.414 10l1.293-1.293
                  a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
               clip-rule="evenodd"></path>
       </svg>`;
}

/**
 * Show a confirmation modal.
 * @param {string}  bookTitle
 * @param {"delete"|"remove"} actionType
 * @param {() => void} onConfirm
 */
export function showDeleteConfirmation(bookTitle, actionType, onConfirm) {
  /* Overlay */
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 z-40";
  document.body.appendChild(overlay);

  /* Modal container */
  const modalWrapper = document.createElement("div");
  modalWrapper.className =
    "fixed inset-0 z-50 flex justify-center items-start pt-32";
  document.body.appendChild(modalWrapper);

  /* Dialog HTML */
  modalWrapper.innerHTML = buildDeleteModalHtml(bookTitle, actionType);

  /* Buttons */
  const dialog = modalWrapper.querySelector(".delete-dialog");
  const btnCancel = dialog.querySelector("#cancel-delete");
  const btnConfirm = dialog.querySelector("#confirm-delete");
  const btnClose = dialog.querySelector("#close-delete-modal");

  function closeModal() {
    modalWrapper.remove();
    overlay.remove();
  }

  btnCancel.addEventListener("click", closeModal);
  btnClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  btnConfirm.addEventListener("click", () => {
    onConfirm();
    closeModal();
  });
}

// Build the HTML for the delete confirmation modal
function buildDeleteModalHtml(bookTitle, actionType) {
  const permanent = actionType === "delete";
  const actionText = permanent
    ? "supprimer définitivement"
    : "retirer de la liste";
  const warning = permanent
    ? "Cette action est irréversible."
    : "Le livre sera masqué de votre liste.";
  const buttonLabel = permanent ? "Supprimer" : "Retirer";
  const buttonTone = permanent
    ? "bg-red-600 hover:bg-red-700"
    : "bg-orange-600 hover:bg-orange-700";
  const iconTone = permanent ? "text-red-500" : "text-orange-500";

  return `
    <div class="delete-dialog bg-white shadow-lg rounded-lg p-6 max-w-md w-full relative pointer-events-auto">
      <button id="close-delete-modal"
              class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              aria-label="Fermer">
        &times;
      </button>

      <div class="flex items-start gap-3 mb-6">
        <svg class="w-6 h-6 ${iconTone}" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92
                   c.75 1.334-.213 2.98-1.742 2.98H4.42
                   c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1
                   1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0
                   002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"></path>
        </svg>

        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Confirmer l'action
          </h2>
          <p class="text-gray-600">
            Êtes-vous sûr de vouloir ${actionText} le livre
          </p>
          <p class="font-medium text-gray-800 mt-1">"${bookTitle}"</p>
          <p class="text-sm text-gray-500 mt-2">${warning}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-end">
        <button id="cancel-delete"
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold
                       py-2 px-4 rounded-lg focus:outline-none focus:ring-2
                       focus:ring-gray-500 transition-colors duration-200">
          Annuler
        </button>
        <button id="confirm-delete"
                class="${buttonTone} text-white font-bold py-2 px-4 rounded-lg
                       focus:outline-none focus:ring-2 transition-colors
                       duration-200">
          ${buttonLabel}
        </button>
      </div>
    </div>`;
}

// Book removal functions
export function removeBookFromList(book) {
  if (book.id) {
    displayNotification(`"${book.title}" a été retiré de la liste`, "success");
    return;
  }

  const hiddenBooks = loadFromStorage("hiddenBooks") || [];
  const key = `${book.title}_${book.author}_${book.published ?? "unknown"}`;

  if (!hiddenBooks.includes(key)) {
    hiddenBooks.push(key);
    saveToStorage("hiddenBooks", hiddenBooks);
  }

  displayNotification(`"${book.title}" a été retiré de la liste`, "success");
}

export function deleteBookPermanently(book) {
  if (!book.id) return;

  const customBooks = loadFromStorage("customBooks") || [];
  const updatedList = customBooks.filter((b) => b.id !== book.id);
  saveToStorage("customBooks", updatedList);

  displayNotification(
    `"${book.title}" a été supprimé définitivement`,
    "success"
  );
}

/** Format an ISO date string as DD/MM/YYYY (fr‑FR). */
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("fr-FR");
}
