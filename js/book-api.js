import { loadFromStorage } from './book-storage.js';

const ApiRoute = "https://openlibrary.org/subjects/fiction.json?limit=50";

export async function getAllBooks() {
  try {
    const response = await fetch(ApiRoute);
    const data = await response.json();
    
    const apiBooks = data.works.map(work => ({
      title: work.title,
      author: work.authors ? work.authors[0].name : "Auteur inconnu",
      published: work.first_publish_year ? String(work.first_publish_year) : "Date inconnue",
      pages: Math.floor(Math.random() * 400) + 100,
      description: work.subject ? work.subject.slice(0, 3).join(", ") : "Description non disponible"
    }));
    
    const localBooks = loadFromStorage('customBooks') || [];
    const deletedBooks = loadFromStorage('deletedBooks') || [];
    
    const filteredApiBooks = apiBooks.filter(book => {
      const bookIdentifier = `${book.title}_${book.author}_${book.published || 'unknown'}`;
      return !deletedBooks.includes(bookIdentifier);
    });
    
    const allBooks = [...filteredApiBooks, ...localBooks];
    console.log(allBooks);
    return allBooks;
  } catch (error) {
    console.error("Erreur lors de la récupération des books :", error);
    return loadFromStorage('customBooks') || [];
  }
}