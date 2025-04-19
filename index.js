const express = require('express');

const route = require('./routes/client/index.route.js');
// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/product-management');

const app = express();
const port = 3000;

app.set("views", "./views");
app.set("view engine", "pug");

route(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
} );

