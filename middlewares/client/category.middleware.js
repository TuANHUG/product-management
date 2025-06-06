const ProductCategory = require("../../models/product-category.model");
const createTreeHelper = require("../../helpers/createTree");

module.exports.category = async (req, res, next) => {
  const productsCategory = await ProductCategory.find({
    deleted: false,
  }).lean();

  const newProductsCategory = createTreeHelper(productsCategory);

  res.locals.layoutProductsCategory = newProductsCategory;

  next();
};
