console.log('App started');

document.addEventListener("DOMContentLoaded", async function(event) {
    const response = await fetch('https://run-crud-sh43zgzkgq-ew.a.run.app/books');

    const books = await response.json();
    console.log(books);

    for (let [key, value] of response.headers) {
        console.log(`${key} = ${value}`);
    }

    const library = document.getElementById('library');
    const template = document.getElementById('book-card');
    for (let book of books) {
        const bookCard = template.content.cloneNode(true);
        bookCard.querySelector('slot[name=author]').innerText = book.author;
        bookCard.querySelector('slot[name=title]').innerText = book.title;
        bookCard.querySelector('slot[name=year]').innerText = book.year;
        bookCard.querySelector('slot[name=isbn]').innerText = book.isbn;
        library.appendChild(bookCard);
    }

    
});
