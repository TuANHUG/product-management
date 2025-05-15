const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");

// [GET] /admin/role
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  const records = await Role.find(find).lean();
  res.render("admin/pages/role/index", {
    pageTitle: "Phân quyền",
    records: records,
  });
};

// [GET] /admin/role/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/role/create", {
    pageTitle: "Tạo nhóm quyền",
  });
};

// [POST] /admin/role/create
module.exports.createPost = async (req, res) => {
  const record = new Role(req.body);

  await record.save();

  res.redirect(`${systemConfig.prefixAdmin}/role`);
};

// [GET] /admin/role/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const record = await Role.findOne({
      _id: req.params.id,
      deleted: false,
    }).lean();
    if (!record) {
      return res.redirect(`${systemConfig.prefixAdmin}/role`);
    }
    res.render("admin/pages/role/edit.pug", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      record: record,
    });
  } catch (error) {
    
  }
};

// [PATCH] /admin/role/edit/:id
module.exports.editPost = async (req, res) => {
  console.log(req.body);
  try {
    await Role.updateOne({ _id: req.params.id }, req.body);
    req.flash("success", "Cập nhật thành công!");
  } catch (error) {
    req.flash("error", "Có lỗi xảy ra, vui lòng thử lại!");
  }

  res.redirect( `${systemConfig.prefixAdmin}/role`);
}

// [GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
  let find = {
      deleted : false
  }

  const records = await Role.find(find);

  res.render("admin/pages/role/permissions", {
      pageTitle: "Phân quyền",
      records: records
  });
  
}

// [PATCH] /admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
  const permissions = JSON.parse(req.body.permissions);

  for (const item of permissions) {
    await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
  }

  req.flash("success", "Cập nhật phân quyền thành công");

  res.redirect(`${systemConfig.prefixAdmin}/role/permissions`);
};