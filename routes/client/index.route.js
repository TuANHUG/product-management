const productsRoute = require("./product.route");
const homeRoute = require("./home.route");
const searchRoute = require("./search.route");
const cartRoute = require("./cart.route"); 
const checkoutRoute = require("./checkout.route"); 
const userRoute = require("./user.route");
const categoryMiddleWare = require("../../middlewares/client/category.middleware");
const cartMiddleWare = require("../../middlewares/client/cart.middleware");
const userMiddleWare = require("../../middlewares/client/user.middleware");
module.exports = (app) => {
  app.use(categoryMiddleWare.category);

  app.use(cartMiddleWare.cart);

  app.use(userMiddleWare.infoUser);

  app.use("/", homeRoute);

  app.use("/product", productsRoute);

  app.use("/search", searchRoute);
  
  app.use("/cart", cartRoute);

  app.use("/checkout", checkoutRoute);

  app.use("/user", userRoute);
};
