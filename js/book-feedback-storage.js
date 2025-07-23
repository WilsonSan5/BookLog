export function getBookFeedback(bookId) {
  const feedback = JSON.parse(localStorage.getItem("bookFeedback") || "{}");
  return feedback[bookId] || { rating: 0, comments: "" };
}

export function setBookFeedback(bookId, rating, comments) {
  const feedback = JSON.parse(localStorage.getItem("bookFeedback") || "{}");
  feedback[bookId] = { rating, comments };
  localStorage.setItem("bookFeedback", JSON.stringify(feedback));
}

export function clearBookFeedback(bookId) {
  const feedback = JSON.parse(localStorage.getItem("bookFeedback") || "{}");
  if (feedback[bookId]) {
    delete feedback[bookId];
    localStorage.setItem("bookFeedback", JSON.stringify(feedback));
  }
}
