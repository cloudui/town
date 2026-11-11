// The Library's bookshelf: one book per recent blog post (src/content/books.json).
// Hovering or focusing a book shows its blurb (title, date, description) below
// the shelf; clicking opens the post. On touch, the first tap picks a book and
// the second tap opens it, like places in town.

function pick(book) {
  const shelf = book.closest("[data-shelf]");
  const blurbs = shelf.querySelectorAll("[data-blurb]");
  shelf.querySelectorAll("[data-book]").forEach((b, i) => {
    b.classList.toggle("on", b === book);
    blurbs[i].classList.toggle("on", b === book);
  });
}

export function initShelf(panel) {
  let touch = false, wasOn = false;
  const bookAt = (e) => e.target.closest?.("[data-book]");

  panel.addEventListener("pointerover", (e) => {
    const book = e.pointerType === "mouse" && bookAt(e);
    if (book) pick(book);
  });
  panel.addEventListener("focusin", (e) => {
    const book = bookAt(e);
    if (book) pick(book);
  });
  // Runs before focus moves, so `wasOn` is what the book looked like before this tap.
  panel.addEventListener("pointerdown", (e) => {
    const book = bookAt(e);
    touch = e.pointerType === "touch";
    wasOn = !!book && book.classList.contains("on");
  });
  panel.addEventListener("click", (e) => {
    const book = bookAt(e);
    if (!book) return;
    if (touch && !wasOn) e.preventDefault();
    pick(book);
  });
}
