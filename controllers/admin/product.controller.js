const Product = require("../../models/product.model");
const systemConfig = require("../../config/system");
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
    .sort({ position: "desc" })
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
      await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash(
        "success",
        `Thay đổi trạng thái ${ids.length} sản phẩm thành công!`
      );
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
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
      req.flash("success", `Xóa ${ids.length} sản phẩm thành công!`);
      break;
    case "change-position":
      for (const item of ids) {
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
  await Product.updateOne(
    { _id: id },
    { deleted: true, deletedAt: new Date() }
  );

  req.flash("success", `Xóa sản phẩm thành công!`);
  res.redirect(req.get("Referrer") || "/");
};

// [GET] /admin/product/create
module.exports.create = async (req, res) => {
  res.render("./admin/pages/products/create.pug", {
    pageTitle: "Create Product",
  });
};

// [POST] /admin/product/create
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);

  if (req.body.position === "") {
    const countProduct = await Product.countDocuments({});
    req.body.position = countProduct + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  const product = new Product(req.body);

  await product.save();

  req.flash("success", "Thêm sản phẩm thành công!");

  res.redirect(`${systemConfig.prefixAdmin}/product`);
};

// [GET] /admin/product/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    const find = {
      _id: id,
      deleted: false,
    };

    const product = await Product.findOne(find);

    res.render("./admin/pages/products/edit.pug", {
      pageTitle: "Edit Product",
      product: product,
    });
  } catch (error) {
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/product`);
  }
};

// [PATCH] /admin/product/edit/:id
module.exports.editPatch = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = parseInt(req.body.position);

  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  try {
    await Product.updateOne({ _id: req.params.id }, req.body);
    req.flash("success", "Cập nhật thành công!");
  } catch (error) {
    console.log(error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
  }

  res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/product`);
};

// [GET] /admin/product/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const find = {
      _id: id,
      deleted: false,
    };

    const product = await Product.findOne(find);

    res.render("./admin/pages/products/detail.pug", {
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/product`);
  }
};