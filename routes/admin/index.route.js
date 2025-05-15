const dashboardRoute = require("./dashboard.route");
const productRoute = require("./product.route");
const productCategoryRoute = require("./prouduct-category.route");
const roleRoute = require("./role.route");
const systemConfig = require("../../config/system");

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(PATH_ADMIN + "/dashboard", dashboardRoute);

  app.use(PATH_ADMIN + "/product", productRoute);

  app.use(PATH_ADMIN + '/product-category', productCategoryRoute);

  app.use(PATH_ADMIN + "/role", roleRoute);

};
