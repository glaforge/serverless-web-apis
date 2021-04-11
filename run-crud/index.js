const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();
const bookStore = firestore.collection('books');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({origin: true}));

const ISBN = require('isbn3');

function isbnOK(isbn, res) {
    const parsedIsbn = ISBN.parse(isbn);
    if (!parsedIsbn) {
        res.status(406)
            .send({error: `Invalid ISBN: ${isbn}`});
        return false;
    }
    return parsedIsbn;
}

// list all books
// - filter by field
// - pagination
app.get('/books', async (req, res) => {
    try {
        const bookStore = new Firestore().collection('books');
        const snapshot = await bookStore
            .where("language", "==", "French")
            .where("author", "==", "Gustave Flaubert")
            .orderBy('updated', 'desc')
            .startAt(0)
//            .limit(10)
            .get();

        const books = [];

        if (snapshot.empty) {
            console.log('No book found');
        } else {
            snapshot.forEach(doc => {
                const {title, author, pages, year, language, ...otherFields} = doc.data();
                const book = {isbn: doc.id, title, author, pages, year, language};
                books.push(book);
            });
        }

        res.status(200).send(books);
    } catch (e) {
        console.error('Failed to fetch books', e);
        res.status(400)
            .send({error: `Impossible to fetch books: ${e.message}`});
    }
});

// create a new book (ISBN in book description)
app.post('/books', async (req, res) => {
    const isbn = req.body.isbn;
    createBook(isbn, req, res);
});

// create a new book (ISBN in the URL path)
app.post('/books/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    createBook(isbn, req, res);
});

async function createBook(isbn, req, res) {
    const parsedIsbn = isbnOK(isbn, res);
    if (!parsedIsbn) return;

    const {title, author, pages, year, language} = req.body;

    try {
        const docRef = bookStore.doc(parsedIsbn.isbn13);
        await docRef.set({
            title, author, pages, year, language,
            updated: Firestore.Timestamp.now()
        });
        console.log(`Saved book ${parsedIsbn.isbn13}`);

        res.status(201)
            .location(`/books/${parsedIsbn.isbn13}`)
            .send({status: `Book ${parsedIsbn.isbn13} created`});
    } catch (e) {
        console.error(`Failed to save book ${parsedIsbn.isbn13}`, e);
        res.status(400)
            .send({error: `Impossible to create book ${parsedIsbn.isbn13}: ${e.message}`});
    }    
}

// retrieve a book by ISBN
app.get('/books/:isbn', async (req, res) => {
    const parsedIsbn = isbnOK(req.params.isbn, res);
    if (!parsedIsbn) return;

    try {
        const docRef = bookStore.doc(parsedIsbn.isbn13);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            console.log(`Book not found ${parsedIsbn.isbn13}`)
            res.status(404)
                .send({error: `Could not find book ${parsedIsbn.isbn13}`});
            return;
        }

        console.log(`Fetched book ${parsedIsbn.isbn13}`, docSnapshot.data());

        const {title, author, pages, year, language, ...otherFields} = docSnapshot.data();
        const book = {isbn: parsedIsbn.isbn13, title, author, pages, year, language};

        res.status(200).send(book);
    } catch (e) {
        console.error(`Failed to fetch book ${parsedIsbn.isbn13}`, e);
        res.status(400)
            .send({error: `Impossible to fetch book ${parsedIsbn.isbn13}: ${e.message}`});
    }
});

// update a book by ISBN
app.put('/books/:isbn', async (req, res) => {
    const parsedIsbn = isbnOK(req.params.isbn, res);
    if (!parsedIsbn) return;

    try {
        const docRef = bookStore.doc(parsedIsbn.isbn13);
        await docRef.set({
            ...req.body,
            updated: Firestore.Timestamp.now()
        }, {merge: true});
        console.log(`Updated book ${parsedIsbn.isbn13}`);

        res.status(201)
            .location(`/books/${parsedIsbn.isbn13}`)
            .send({status: `Book ${parsedIsbn.isbn13} updated`});
    } catch (e) {
        console.error(`Failed to update book ${parsedIsbn.isbn13}`, e);
        res.status(400)
            .send({error: `Impossible to update book ${parsedIsbn.isbn13}: ${e.message}`});
    }    
});

// delete a book by ISBN
app.delete('/books/:isbn', async (req, res) => {
    const parsedIsbn = isbnOK(req.params.isbn, res);
    if (!parsedIsbn) return;

    try {
        const docRef = bookStore.doc(parsedIsbn.isbn13);
        await docRef.delete();
        console.log(`Book ${parsedIsbn.isbn13} was deleted`);

        res.status(204).end();
    } catch (e) {
        console.error(`Failed to delete book ${parsedIsbn.isbn13}`, e);
        res.status(400)
            .send({error: `Impossible to delete book ${parsedIsbn.isbn13}: ${e.message}`});
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Books Web API service: listening on port ${port}`);
    console.log(`Node ${process.version}`);
});