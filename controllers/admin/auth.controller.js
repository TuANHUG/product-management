const md5 = require("md5");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");

// [GET] /admin/auth/login
module.exports.login = async (req, res) => {
  if (req.cookies.token) {
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
  } else {
    res.render("admin/pages/auth/login", {
      pageTitle: "Đăng nhập",
    });
  }
};

// [POST] /admin/auth/login
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await Account.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại");
    res.redirect(req.get("Referrer") || `${systemConfig.prefixAdmin}/auth/login`);
    return;
  }

  if (md5(password) != user.password) {
    req.flash("error", "Sai mật khẩu");
    res.redirect(
      req.get("Referrer") || `${systemConfig.prefixAdmin}/auth/login`
    );
    return;
  }

  if (user.status != "active") {
    req.flash("error", "Tài khoản đã bị khóa");
    res.redirect(
      req.get("Referrer") || `${systemConfig.prefixAdmin}/auth/login`
    );
    return;
  }
  res.cookie("token", user.token);
  res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
};

// [POST] /admin/auth/logout
module.exports.logout = async (req, res) => {
  // Xóa token trong cookie
  res.clearCookie("token");
  res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
};
