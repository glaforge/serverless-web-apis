console.log('App started');

document.addEventListener("DOMContentLoaded", async function(event) {
    var page = 0;

    const moreButton = document.getElementById('more-button');
    moreButton.addEventListener('sl-focus', event => {
        console.log('Button clicked');
        moreButton.blur();

        appendMoreBooks(page++);
    });
});

async function appendMoreBooks(page) {
    const response = await fetch('https://run-crud-sh43zgzkgq-ew.a.run.app/books?page=' + page);
    const books = await response.json();

    const library = document.getElementById('library');
    const template = document.getElementById('book-card');
    for (let book of books) {
        const bookCard = template.content.cloneNode(true);

        bookCard.querySelector('slot[name=title]').innerText = book.title;
        bookCard.querySelector('slot[name=language]').innerText = book.language;
        bookCard.querySelector('slot[name=author]').innerText = book.author;
        bookCard.querySelector('slot[name=year]').innerText = book.year;
        
        const img = document.createElement('img');
        img.setAttribute('id', book.isbn);
        img.setAttribute('class', 'img-barcode-' + book.isbn)
        //bookCard.querySelector('slot[name=barcode]').parentElement.appendChild(img);
        bookCard.querySelector('slot[name=barcode]').appendChild(img);

        library.appendChild(bookCard);

        JsBarcode('.img-barcode-' + book.isbn).EAN13(book.isbn, {fontSize: 18, textMargin: 0, height: 60}).render();
    }
}
