console.log('App started');

document.addEventListener("DOMContentLoaded", async function(event) {
    const serverUrlResponse = await fetch('/webapi');
    const serverUrl = await serverUrlResponse.text();
    console.log('Web API endpoint:', serverUrl);
    
    const server = serverUrl + '/books';
    var page = 0;
    var language = '';

    const moreButton = document.getElementById('more-button');
    moreButton.addEventListener('sl-focus', event => {
        console.log('Button clicked');
        moreButton.blur();

        appendMoreBooks(server, page++, language);
    });

    const langSelect = document.getElementById('language-select');
    langSelect.addEventListener('change', event => {
        page = 0;
        language = event.target.value;
        document.getElementById('library').replaceChildren();
        console.log(`Language selected: "${language}"`);

        appendMoreBooks(server, page++, language);
    });
});

async function appendMoreBooks(server, page, language) {
    const searchUrl = new URL(server);
    if (!!page) searchUrl.searchParams.append('page', page);
    if (!!language) searchUrl.searchParams.append('language', language);
        
    const response = await fetch(searchUrl.href);
    const books = await response.json();

    const linkHeader = response.headers.get('Link')
    console.log('Link', linkHeader);
    if (!!linkHeader && linkHeader.indexOf('rel="next"') > -1) {
        console.log('Show more button');
        document.getElementById('buttons').style.display = 'block';
    } else {
        console.log('Hide more button');
        document.getElementById('buttons').style.display = 'none';
    }

    const library = document.getElementById('library');
    const template = document.getElementById('book-card');
    for (let book of books) {
        const bookCard = template.content.cloneNode(true);

        bookCard.querySelector('slot[name=title]').innerText = book.title;
        bookCard.querySelector('slot[name=language]').innerText = book.language;
        bookCard.querySelector('slot[name=author]').innerText = book.author;
        bookCard.querySelector('slot[name=year]').innerText = book.year;
        bookCard.querySelector('slot[name=pages]').innerText = book.pages;
        
        const img = document.createElement('img');
        img.setAttribute('id', book.isbn);
        img.setAttribute('class', 'img-barcode-' + book.isbn)
        bookCard.querySelector('slot[name=barcode]').appendChild(img);

        library.appendChild(bookCard);

        JsBarcode('.img-barcode-' + book.isbn).EAN13(book.isbn, {fontSize: 18, textMargin: 0, height: 60}).render();
    }
}
