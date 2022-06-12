const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const HOST = process.env.HOST;
const PORT = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static('./public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'pubilc/index.html'));
});

app.listen(PORT, () => {
	console.log(`Server listening at ${HOST}:${PORT}`);
});