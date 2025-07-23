import { moveBookToColumn } from "./book-columns.js";
import { displayNotification } from "./book-notification.js";
import { openBookListModal } from "./book-list.js";

const modalOverlay = document.getElementById("modal-overlay");

export function openNewBookModal() {
  const newBookModal = document.getElementById("new-book-modal");
  newBookModal.style.display = "block";

  initializeDateSelectors();

  document
    .getElementById("close-new-book-modal")
    .addEventListener("click", closeNewBookModal);
  document
    .getElementById("cancel-new-book")
    .addEventListener("click", closeNewBookModal);
  modalOverlay.style.display = "block";
  modalOverlay.addEventListener("click", closeNewBookModal);

  const form = document.getElementById("new-book-form");
  form.addEventListener("submit", handleNewBookSubmit);
}

export function initializeDateSelectors() {
  const daySelect = document.getElementById("book-day");
  const monthSelect = document.getElementById("book-month");
  const yearSelect = document.getElementById("book-year");

  for (let i = 1; i <= 31; i++) {
    const option = document.createElement("option");
    option.value = i.toString().padStart(2, "0");
    option.textContent = i;
    daySelect.appendChild(option);
  }

  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }

  const updateDays = () => {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);

    if (month && year) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const selectedDay = daySelect.value;

      daySelect.innerHTML = '<option value="">Jour</option>';
      for (let i = 1; i <= daysInMonth; i++) {
        const option = document.createElement("option");
        option.value = i.toString().padStart(2, "0");
        option.textContent = i;
        daySelect.appendChild(option);
      }

      if (selectedDay && parseInt(selectedDay) <= daysInMonth) {
        daySelect.value = selectedDay;
      }
    }
  };

  monthSelect.addEventListener("change", updateDays);
  yearSelect.addEventListener("change", updateDays);
}

export function getFormData() {
  return {
    title: document.getElementById("book-title").value,
    author: document.getElementById("book-author").value,
    day: document.getElementById("book-day").value,
    month: document.getElementById("book-month").value,
    year: document.getElementById("book-year").value,
    pages: parseInt(document.getElementById("book-pages").value),
    description: document.getElementById("book-description").value,
  };
}

export function createBookFromForm(formData) {
  const generatedId = `custom-${Date.now()}`;
  const published = `${formData.day}/${formData.month}/${formData.year}`;

  return {
    id: generatedId,
    title: formData.title,
    author: formData.author,
    published,
    pages: formData.pages,
    description: formData.description,
    isTemporary: true,
  };
}

async function handleNewBookSubmit(event) {
  event.preventDefault();

  const formData = getFormData();
  const newBook = createBookFromForm(formData);

  try {
    moveBookToColumn("toRead", newBook);
    displayNotification(
      `"${formData.title}" a été ajouté à votre liste "À lire" !`,
      "success"
    );
    closeNewBookModalOnly();
  } catch (error) {
    console.error("Erreur:", error);
    displayNotification(
      "Erreur lors de l'ajout du livre. Veuillez réessayer.",
      "error"
    );
  }
}

function closeNewBookModalOnly() {
  const modal = document.getElementById("new-book-modal");

  if (modal) modal.style.display = "none";
  if (modalOverlay) modalOverlay.style.display = "none";
}

function closeNewBookModal() {
  closeNewBookModalOnly();
  openBookListModal();
}
