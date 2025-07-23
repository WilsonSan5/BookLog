// Import utility to load data from local storage
import { loadFromStorage } from "./book-storage.js";

// API endpoint to fetch fiction books
const ApiRoute = "https://keligmartin.github.io/api/books.json";

/**
 * Fetches all books from the API and local storage, excluding deleted books.
 * Combines API books and locally stored custom books.
 * @returns {Array} Array of book objects
 */
export async function getAllBooks() {
  try {
    // Fetch books from the OpenLibrary API
    const response = await fetch(ApiRoute);
    const data = await response.json();

    // Map API data to book objects with default values
    const apiBooks = data.map((work) => ({
      id: work.isbn,
      title: work.title,
      // Use first author if available, else default
      author: work.authors ? work.authors[0].name : "Auteur inconnu",
      // Use publish year if available, else default
      published: work.first_publish_year
        ? String(work.first_publish_year)
        : "Date inconnue",
      // Generate a random page count between 100 and 499
      pages: work.pages,
      // Use up to 3 subjects as description, else default
      description: work.subject
        ? work.subject.slice(0, 3).join(", ")
        : "Description non disponible",
    }));

    // Load custom books and deleted books from local storage
    const localBooks = loadFromStorage("customBooks") || [];
    const deletedBooks = loadFromStorage("deletedBooks") || [];

    // Filter out API books that have been deleted locally
    const filteredApiBooks = apiBooks.filter((book) => {
      // Create a unique identifier for each book
      const bookIdentifier = `${book.title}_${book.author}_${
        book.published || "unknown"
      }`;
      // Exclude books whose identifier is in deletedBooks
      return !deletedBooks.includes(bookIdentifier);
    });

    // Combine filtered API books with local custom books
    const allBooks = [...filteredApiBooks, ...localBooks];
    return allBooks;
  } catch (error) {
    // On error, log and return only local custom books
    console.error("Erreur lors de la récupération des books :", error);
    return loadFromStorage("customBooks") || [];
  }
}
