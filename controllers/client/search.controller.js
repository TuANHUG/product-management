const Product = require("../../models/product.model");
const productsHelper = require("../../helpers/products");
// [GET] /search
module.exports.index = async (req, res) => {
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  let newProducts = [];
  if (req.query.keyword) {
    const regex = new RegExp(escapeRegex(req.query.keyword.trim()), "i");
    const products = await Product.find({
      status: "active",
      deleted: "false",
      title: regex,
    }).sort({ position: "desc" });
    newProducts = productsHelper.priceNewProducts(products);
  }
  res.render("client/pages/search/index.pug", {
    pageTitle: "Tìm kiếm sản phẩm",
    products: newProducts,
    keyword: req.query.keyword,
  });
};
