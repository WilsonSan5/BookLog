import { getBookFeedback, setBookFeedback } from "./book-feedback-storage.js";

/**
 * Renders the feedback UI for a given book, including star rating and comment input.
 *
 * @param {Object} book - The book object to render feedback for.
 * @returns {string} The HTML string for the feedback UI.
 */

export function renderFeedback(book) {
  // if (book.column !== 'reading' && book.column !== 'read') return '';
  const feedback = getBookFeedback(book.id);
  return `
        <div class="book-feedback mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Votre note :</label>
            <div class="stars mb-2">
                ${[1, 2, 3, 4, 5]
                  .map(
                    (star) => `
                    <span class="star${
                      feedback.rating >= star
                        ? " filled text-yellow-400"
                        : " text-gray-300"
                    }" data-star="${star}" style="cursor:pointer;font-size:1.5rem;">&#9733;</span>
                `
                  )
                  .join("")}
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Votre commentaire :</label>
            <textarea class="comment w-full border rounded p-2" rows="2" placeholder="Votre avis...">${
              feedback.comments || ""
            }</textarea>
            <button class="save-feedback mt-2 bg-blue-500 text-white px-4 py-1 rounded">Enregistrer</button>
        </div>
    `;
}

/**
 * setups the feedback section for a given book, including star rating and comment input.
 *
 * @param {Object} book - The book object to render feedback for.
 * @param {string|number} book.id - The unique identifier of the book.
 * @param {callback} onSave - Callback function to call when feedback is saved.
 * @returns {string} The HTML string for the feedback UI.
 */
export function setupFeedbackHandlers(container, book, onSave) {
  if (!container) return;
  // Star click handler
  container.querySelectorAll(".star").forEach((starEl) => {
    starEl.addEventListener("click", () => {
      const rating = Number(starEl.dataset.star);
      const comments = container.querySelector(".comment").value;
      setBookFeedback(book.id, rating, comments);
      updateStars(container, rating);
      if (onSave) onSave(book.id, rating, comments);
    });
  });
  // Save button handler
  container.querySelector(".save-feedback").addEventListener("click", () => {
    const rating = container.querySelectorAll(".star.filled").length;
    const comments = container.querySelector(".comment").value;
    setBookFeedback(book.id, rating, comments);
    if (onSave) onSave(book.id, rating, comments);
  });
}

// Helper to update star visuals after click
function updateStars(container, rating) {
  container.querySelectorAll(".star").forEach((starEl) => {
    const starNum = Number(starEl.dataset.star);
    if (starNum <= rating) {
      starEl.classList.add("filled", "text-yellow-400");
      starEl.classList.remove("text-gray-300");
    } else {
      starEl.classList.remove("filled", "text-yellow-400");
      starEl.classList.add("text-gray-300");
    }
  });
}
