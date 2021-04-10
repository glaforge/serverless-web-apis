const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();
const bookStore = firestore.collection('books');

const express = require('express');
const app = express();

const ISBN = require('isbn3');

// list all books
// - filter by field
// - pagination
app.get('/books', async (req, res) => {
    
});

// create a new book (ISBN in book description)
app.post('/books', async (req, res) => {
    const isbn = req.body.isbn;
    createBook(isbn, req, res);
});

// create a new book (ISBN in the URL path)
app.put('/books/:isbn', async (req, res) => {
    const isbn = req.param.isbn;
    createBook(isbn, req, res);
});

async function createBook(isbn, req, res) {
    if (!ISBN.isValid(isbn)) {
        res.status(406).send({error: "Invalid ISBN"});
        return;
    }

    const docRef = bookStore.doc(isbn);
    docRef.set()
}

// retrieve a book by ISBN
app.get('/books/:isbn', async (req, res) => {
    if (!ISBN.isValid(req.param.isbn)) {
        res.status(406).send({error: "Invalid ISBN"});
        return;
    }
});

// update a book by ISBN
app.put('/books/:isbn', async (req, res) => {
    if (!ISBN.isValid(req.param.isbn)) {
        res.status(406).send({error: "Invalid ISBN"});
        return;
    }
});

// delete a book by ISBN
app.delete('/books/:isbn', async (req, res) => {
    if (!ISBN.isValid(req.param.isbn)) {
        res.status(406).send({error: "Invalid ISBN"});
        return;
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Books CRUD service: listening on port ${port}`);
    console.log(`Node ${process.version}`);
});