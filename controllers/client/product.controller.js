const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const productsHelper = require("../../helpers/products");
const productsCategoryHelper = require("../../helpers/products-category");
// [GET] /product
module.exports.index = async (req, res) => {
  const products = await Product.find({
    status: "active",
    deleted: "false",
  }).sort({ position: "desc" });

  const newProducts = products.map((item) => {
    const obj = item.toObject();
    return {
      ...obj,
      newPrice: ((item.price * (100 - item.discountPercentage)) / 100).toFixed(
        2
      ),
    };
  });

  res.render("client/pages/products/index.pug", {
    pageTitle: "Danh sách sản phẩm",
    products: newProducts,
  });
};

//[GET] /product/detail/:slug
module.exports.detail = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({
      slug: slug,
      status: "active",
      deleted: false,
    });
    if (product.product_category_id) {
      const category = await ProductCategory.findOne({
        _id: product.product_category_id,
        status: "active",
        deleted: false,
      });

      product.category = category;
    }

    product.priceNew = productsHelper.priceNewProduct(product);
    res.render("client/pages/products/detail.pug", {
      pageTitle: product.title,
      product: product
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
};

// [GET] /product/:slugCategory
module.exports.category = async (req, res) => {
  const category = await ProductCategory.findOne({
    slug: req.params.slugCategory,
    status: "active",
    deleted: false,
  });

  const listSubCategory = await productsCategoryHelper.getSubCategory(
    category.id
  );

  const listSubCategoryId = listSubCategory.map((item) => item.id);

  const products = await Product.find({
    product_category_id: { $in: [category.id, ...listSubCategoryId] },
    deleted: false,
  }).sort({ position: "desc" });

  const newProducts = productsHelper.priceNewProducts(products);
  res.render("client/pages/products/index", {
    pageTitle: category.title,
    products: newProducts,
  });
};
