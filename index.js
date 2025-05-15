const express = require('express');
const path = require('path');
require("dotenv").config();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const database = require('./config/database.js');
const systemConfig = require("./config/system");
const route = require('./routes/client/index.route.js');
const routeAdmin = require("./routes/admin/index.route.js");

database.connect();

// Initialize express app
const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Flash
app.use(cookieParser("estdrtfgjkjghfdfs"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

// TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

//View engine
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//local variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static(`${__dirname}/public`));

// Routes
route(app);
routeAdmin(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
} );

