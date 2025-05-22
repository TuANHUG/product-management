const dashboardRoute = require("./dashboard.route");
const productRoute = require("./product.route");
const productCategoryRoute = require("./prouduct-category.route");
const roleRoute = require("./role.route");
const accountRoute = require("./account.route");
const authRoute = require("./auth.route");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const myAccountRoutes = require("./my-account.route");
const orderRoute = require("./order.route");
const systemConfig = require("../../config/system");

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(PATH_ADMIN + "/dashboard",authMiddleware.requireAuth, dashboardRoute);

  app.use(PATH_ADMIN + "/product", authMiddleware.requireAuth, productRoute);

  app.use(
    PATH_ADMIN + "/product-category",
    authMiddleware.requireAuth,
    productCategoryRoute
  );

  app.use(PATH_ADMIN + "/role", authMiddleware.requireAuth, roleRoute);

  app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountRoute);

  app.use(PATH_ADMIN + "/auth", authRoute);

  app.use(
    PATH_ADMIN + "/my-account",
    authMiddleware.requireAuth,
    myAccountRoutes
  );
  app.use(
    PATH_ADMIN + "/order",
    authMiddleware.requireAuth,
    orderRoute
  );

};
