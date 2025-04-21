const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
// [GET] /admin/product

module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  // filter status
  const filterStatus = filterStatusHelper(req.query);

  
  if (req.query.status) {
    find.status = req.query.status;
  }

  // search product
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  if (req.query.keyword) {
    const regex = new RegExp(escapeRegex(req.query.keyword.trim()), "i");
    find.title = regex;
  }

  const products = await Product.find(find);

  res.render("./admin/pages/products/index.pug", {
    pageTitle: "Products List",
    products: products,
    filterStatus: filterStatus,
    keyword: req.query.keyword || "",
  });
};
