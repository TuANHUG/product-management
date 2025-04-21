const express = require('express');
require("dotenv").config();
const database = require('./config/database.js');

const systemConfig = require("./config/system");

const route = require('./routes/client/index.route.js');
const routeAdmin = require("./routes/admin/index.route.js");


database.connect();

// Initialize express app
const app = express();
const port = process.env.PORT;

//
app.set("views", "./views");
app.set("view engine", "pug");

//local variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static("public"));


// Routes
route(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
} );

