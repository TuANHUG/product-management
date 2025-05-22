const md5 = require("md5");
const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgotPassword.model.js");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const Product= require("../../models/product.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail.js");
// [GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản",
  });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
  });

  if (existEmail) {
    req.flash("error", "Email đã tồn tại!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }

  req.body.password = md5(req.body.password);

  const user = new User(req.body);
  await user.save();

  // Tạo giỏ hàng mới cho user
  const newCart = new Cart({ user_id: user._id });
  await newCart.save();

  // Ghi cookie
  res.cookie("tokenUser", user.tokenUser);
  res.cookie("cartId", newCart._id.toString());

  res.redirect("/");
};

// [GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }

  if (md5(password) !== user.password) {
    req.flash("error", "Sai mật khẩu!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }

  if (user.status === "inactive") {
    req.flash("error", "Tài khoản đang bị khóa!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }
  res.cookie("tokenUser", user.tokenUser);
  let cart = await Cart.findOne({ user_id: user._id });
  if (!cart) {
    cart = new Cart({ user_id: user._id });
    await cart.save();
  }
  res.cookie("cartId", cart._id.toString());
  
  res.redirect("/");
};

// [GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("cartId");
  res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu",
  });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại!");
    res.redirect("back");
    return;
  }

  // Lưu thông tin vào DB
  const otp = generateHelper.generateRandomNumber(8);

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now(),
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  const subject = "Mã OTP xác minh lấy lại mật khẩu";
  const html = `
    Mã OTP để lấy lại mật khẩu là <b style="color: green;">${otp}</b>. Thời hạn sử dụng là 3 phút.
  `;
  sendMailHelper.sendMail(email, subject, html);

  res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email,
  });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    req.flash("error", "OTP không hợp lệ!");
    res.redirect(req.get("Referrer") || "/");
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/user/password/reset");
};

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;

  await User.updateOne(
    {
      tokenUser: tokenUser,
    },
    {
      password: md5(password),
    }
  );

  res.redirect("/");
};

module.exports.info = async (req, res) => {
  const user = res.locals.user;

  let orders = [];
  if (user) {
    orders = await Order.find({ user_id: user._id }).sort({ createdAt: -1 });

    for (const order of orders) {
      for (const item of order.products) {
        const product = await Product.findById(item.product_id).select(
          "title thumbnail"
        );
        item.productInfo = product;

        const discountPrice =
          item.price - (item.price * item.discountPercentage) / 100;
        item.totalPrice = discountPrice * item.quantity;
      }

      order.totalPrice = order.products.reduce(
        (total, item) => total + item.totalPrice,
        0
      );

      // Làm tròn sau cùng để hiển thị
      order.totalPrice = order.totalPrice.toFixed(2);
      order.products.forEach((item) => {
        item.totalPrice = item.totalPrice.toFixed(2);
      });
    }   
  }

  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
    orders,
  });
};
