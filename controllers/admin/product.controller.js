const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const paginationHelper = require("../../helpers/pagination");
const { parse } = require("dotenv");

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

  // pagination
  let objPagination = {
    currentPage: 1,
    limit: 6,
  };
  const countProduct = await Product.countDocuments(find);
  objPagination = paginationHelper(req.query, objPagination, countProduct);

  const products = await Product.find(find)
    .sort({position: "desc"})
    .limit(objPagination.limit)
    .skip(objPagination.skip);

  res.render("./admin/pages/products/index.pug", {
    pageTitle: "Products List",
    products: products,
    filterStatus: filterStatus,
    keyword: req.query.keyword || "",
    pagination: objPagination,
  });
};

// [PATCH] /admin/product/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;
  await Product.updateOne({ _id: id }, { status: status });

  req.flash("success", "Thay đổi trạng thái thành công!");

  res.redirect(req.get("Referrer") || "/");
};

// [PATCH] /admin/product/change-multi
module.exports.changeMultiStatus = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");

  switch (type) {
    case "active":
      await Product.updateMany(
        { _id: { $in: ids } },
        { status: "active" }
      );
      req.flash("success", `Thay đổi trạng thái ${ids.length} sản phẩm thành công!`);
      break;
    case "inactive":
      await Product.updateMany(
        { _id: { $in: ids } },
        { status: "inactive" }
      );
      req.flash(
        "success",
        `Thay đổi trạng thái ${ids.length} sản phẩm thành công!`
      );
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        { deleted: true, deletedAt: new Date() }
      );
      req.flash(
        "success",
        `Xóa ${ids.length} sản phẩm thành công!`
      );
      break
    case "change-position":
      for(const item of ids) {
        const [id, position] = item.split("-");
        await Product.updateOne({ _id: id }, { position: parseInt(position) });
      }
      req.flash(
        "success",
        `Thay đổi vị trí ${ids.length} sản phẩm thành công!`
      );
      break;
    default:
      break;
  }
  res.redirect(req.get("Referrer") || "/");
};

// [DELETE] /admin/product/delete/:id
module.exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
  res.redirect(req.get("Referrer") || "/");

}