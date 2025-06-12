const ApiRoute = "https://keligmartin.github.io/api/books.json";

const toReadColumn = document.getElementById('toRead');
 

let allBooks = [];

async function getAllBooks() {
  await fetch(ApiRoute)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((data) => {
      allBooks = data;
      console.log(allBooks);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des books :", error);
    });
}

getAllBooks();

