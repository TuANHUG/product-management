const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const createTreeHelper = require("../../helpers/createTree");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const paginationHelper = require("../../helpers/pagination");
const cloudUpload = require("../../helpers/cloudUpload");
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

  // sort
  let sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
    sort.title = "asc";
  }

  // pagination
  let objPagination = {
    currentPage: 1,
    limit: 6,
  };
  const countProduct = await Product.countDocuments(find);
  objPagination = paginationHelper(req.query, objPagination, countProduct);

  const products = await Product.find(find)
    .sort(sort)
    .limit(objPagination.limit)
    .skip(objPagination.skip);

  for (const product of products) {
    // Lấy ra thông tin người tạo
    const user = await Account.findOne({
      _id: product.createdBy.account_id,
    });

    if (user) {
      product.accountFullName = user.fullName;
    }
    // Lấy ra thông tin người cập nhật gần nhất
    const updatedBy = product.updatedBy.slice(-1)[0];
    if (updatedBy) {
      const userUpdated = await Account.findOne({
        _id: updatedBy.account_id,
      });
    updatedBy.accountFullName = userUpdated.fullName;
    }
  }

  res.render("./admin/pages/products/index.pug", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: req.query.keyword || "",
    pagination: objPagination,
  });
};

// [PATCH] /admin/product/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const { status, id } = req.params;
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  await Product.updateOne(
    { _id: id },
    {
      status: status,
      $push: { updatedBy: updatedBy },
    }
  );
  req.flash("success", "Thay đổi trạng thái thành công!");

  res.redirect(req.get("Referrer") || "/");
};

// [PATCH] /admin/product/change-multi
module.exports.changeMultiStatus = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  switch (type) {
    case "active":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          status: "active",
          $push: { updatedBy: updatedBy },
        }
      );
      req.flash(
        "success",
        `Thay đổi trạng thái ${ids.length} sản phẩm thành công!`
      );
      break;
    case "inactive":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          status: "inactive",
          $push: { updatedBy: updatedBy },
        }
      );
      req.flash(
        "success",
        `Thay đổi trạng thái ${ids.length} sản phẩm thành công!`
      );
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      );
      req.flash("success", `Xóa ${ids.length} sản phẩm thành công!`);
      break;
    case "change-position":
      for (const item of ids) {
        const [id, position] = item.split("-");
        await Product.updateOne(
          { _id: id },
          {
            position: parseInt(position),
            $push: { updatedBy: updatedBy },
          }
        );
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
    {
      deleted: true,
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  );
  req.flash("success", `Xóa sản phẩm thành công!`);
  res.redirect(req.get("Referrer") || "/");
};

// [GET] /admin/product/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await ProductCategory.find(find)
    .sort({ position: "desc" })
    .lean();
  const tree = createTreeHelper(records);
  res.render("./admin/pages/products/create.pug", {
    pageTitle: "Create Product",
    category: tree,
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
    try {
      const result = await cloudUpload(req.file.buffer);
      req.body.thumbnail = result.secure_url; // dùng URL từ Cloudinary
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      req.flash("error", "Upload ảnh thất bại");
      res.redirect(req.get("Referrer") || "/");
    }
  }

  req.body.createdBy = {
    account_id: res.locals.user.id,
    createdAt: new Date(),
  };

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

    const records = await ProductCategory.find({ deleted: false })
      .sort({ position: "desc" })
      .lean();
    const tree = createTreeHelper(records);
    const product = await Product.findOne(find);

    res.render("./admin/pages/products/edit.pug", {
      pageTitle: "Edit Product",
      product: product,
      category: tree,
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
    try {
      const result = await cloudUpload(req.file.buffer);
      req.body.thumbnail = result.secure_url; // dùng URL từ Cloudinary
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      req.flash("error", "Upload ảnh thất bại");
      res.redirect(req.get("Referrer") || "/");
    }
  }

  try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date(),
    };

    await Product.updateOne(
      { _id: req.params.id },
      {
        ...req.body,
        $push: { updatedBy: updatedBy },
      }
    );
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
