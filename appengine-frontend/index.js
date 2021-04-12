const express = require('express');
const app = express();

app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/', async (req, res) => {
    res.redirect('/html/index.html');
});

app.get('/test', async (req, res) => {
    res.send("TEST");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Book library web frontend: listening on port ${port}`);
    console.log(`Node ${process.version}`);
});