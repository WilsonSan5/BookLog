export function createNewBookModalHTML() {
  return `
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
}

export function initializeDateSelectors() {
  const daySelect = document.getElementById("book-day");
  const monthSelect = document.getElementById("book-month");
  const yearSelect = document.getElementById("book-year");
  
  for (let i = 1; i <= 31; i++) {
    const option = document.createElement("option");
    option.value = i.toString().padStart(2, '0');
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
        option.value = i.toString().padStart(2, '0');
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
    description: document.getElementById("book-description").value
  };
}

export function createBookFromForm(formData) {
  const published = `${formData.day}/${formData.month}/${formData.year}`;
  
  return {
    id: Date.now(),
    title: formData.title,
    author: formData.author,
    published,
    pages: formData.pages,
    description: formData.description,
    isTemporary: true
  };
}