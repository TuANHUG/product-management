const ProductCategory = require("../../models/product-category.model");
const cloudUpload = require("../../helpers/cloudUpload");
const createTreeHelper = require("../../helpers/createTree");
const systemConfig = require("../../config/system");
// [GET] /admin/product-category
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find).sort({ position: "desc" }).lean();
  const tree = createTreeHelper(records);
  res.render("./admin/pages/products-category/index.pug", {
    pageTitle: "Danh mục sản phẩm",
    records: tree
  });
};

// [GET] /admin/product-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find).lean();
  const tree = createTreeHelper(records);
  res.render("./admin/pages/products-category/create.pug", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: tree,
  });
};

// [POST] /admin/product-category/create
module.exports.createPost = async (req, res) => {
  if (req.body.position === "") {
    const count = await ProductCategory.countDocuments({});
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }

  if (req.file) {
    try {
      const result = await cloudUpload(req.file.buffer);
      req.body.thumbnail = result.secure_url; // dùng URL từ Cloudinary
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      req.flash("error", "Upload ảnh thất bại");
      res.redirect(req.get("Referrer") || "/");
    }
  }

  const record = new ProductCategory(req.body);
  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/product-category`);
};

// [GET] /admin/product-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const record = await ProductCategory.findById(req.params.id).lean();
    if (!record) {
      req.flash("error", "Không tìm thấy danh mục sản phẩm");
      return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
    }

    let find = {
      deleted: false,
    };

    const records = await ProductCategory.find(find).lean();
    const tree = createTreeHelper(records);
    res.render("./admin/pages/products-category/edit.pug", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      record,
      records: tree,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
    return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
  }
};

// [PATCH] /admin/product-category/edit/:id
module.exports.editPatch = async (req, res) => {
  if (req.body.position === "") {
    const count = await ProductCategory.countDocuments({});
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  if (req.file) {
    try {
      const result = await cloudUpload(req.file.buffer);
      req.body.thumbnail = result.secure_url; // dùng URL từ Cloudinary
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      req.flash("error", "Upload ảnh thất bại");
      return res.redirect(`${systemConfig.prefixAdmin}/product-category`);
    }
  }

  try {
    await ProductCategory.updateOne({ _id: req.params.id }, req.body);
    req.flash("success", "Cập nhật thành công!");
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
  }

  res.redirect(`${systemConfig.prefixAdmin}/product-category`);
};