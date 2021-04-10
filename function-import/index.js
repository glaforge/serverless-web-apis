const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();
const bookStore = firestore.collection('books');

exports.parseBooks = async (req, resp) => {
    if (req.method !== "POST") {
        resp.status(405).send({error: "Only method POST allowed"});
        return;
    }
    if (req.headers['content-type'] !== "application/json") {
        resp.status(406).send({error: "Only application/json accepted"});
        return;
    }

    const books = req.body;
    // console.debug(books);

    const writeBatch = firestore.batch();

    for (const book of books) {
        const doc = bookStore.doc(book.isbn);
        writeBatch.set(doc, {
            title: book.title,
            author: book.author,
            language: book.language,
            pages: book.pages,
            year: book.year,
            country: book.country,
            created: Firestore.Timestamp.now()
        });
    }

    try {
        await writeBatch.commit();
        console.log("Saved books in Firestore");
    } catch (e) {
        console.error("Error saving books:", e);
        resp.status(400).send({error: "Error saving books"});
        return;
    };

    resp.status(202).send({status: "OK"});
};