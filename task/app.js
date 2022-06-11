const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', express.static('./static'))

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})