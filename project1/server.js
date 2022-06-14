const express = require('express');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const liveReload = livereload.createServer();
liveReload.watch(__dirname + "dist");

liveReload.server.once("connection", () => {
    setTimeout(() => {
        liveReload.refresh("/");
    }, 100);
});

app.use(connectLivereload());

app.use('/', express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});