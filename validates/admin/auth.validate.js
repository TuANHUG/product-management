module.exports.loginPost = (req, res, next) => {
  if (!req.body.email) {
    req.flash("error", `Vui lòng nhập họ tên`);
    res.redirect(req.get("Referrer") || "/");
    return;
  }

  if (!req.body.email) {
    req.flash("error", `Vui lòng nhập email`);
    res.redirect(req.get("Referrer") || "/");
    return;
  }

  next();
};
