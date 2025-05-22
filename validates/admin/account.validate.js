module.exports.createPost = (req, res, next) => {
  if (!req.body.fullName) {
    req.flash("error", `Vui lòng nhập họ tên`);
    return res.redirect(req.get("Referrer") || "/");

  }

  if (!req.body.email) {
    req.flash("error", `Vui lòng nhập email`);
    return res.redirect(req.get("Referrer") || "/");

  }

  if (!req.body.password) {
    req.flash("error", `Vui lòng nhập mật khẩu `);
    return res.redirect(req.get("Referrer") || "/");
;
  }
  next();
};

module.exports.editPatch = (req, res, next) => {
  if (!req.body.fullName) {
    req.flash("error", `Vui lòng nhập họ tên`);
    return res.redirect(req.get("Referrer") || "/");

  }

  if (!req.body.email) {
    req.flash("error", `Vui lòng nhập email`);
    return res.redirect(req.get("Referrer") || "/");

  }

  next();
};
