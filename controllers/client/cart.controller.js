const Product = require("../../models/product.model");
const Cart = require("../../models/cart.model");
const productHelper = require("../../helpers/products");
//[GET] /cart
module.exports.index = async (req, res) => {
  const cart = await Cart.findOne({ _id: req.cookies.cartId });
  if (cart && cart.products.length > 0) {
    let totalPrice = 0;

    for (const item of cart.products) {
      const product = await Product.findById(item.product_id);
      const priceNew = productHelper.priceNewProduct(product);
      totalPrice += priceNew * item.quantity;

      // Gắn thông tin sản phẩm kèm giá đã tính
      item.productInfo = {
        ...product.toObject(),
        priceNew: priceNew // để hiển thị
      };
    }

    cart.totalPrice = totalPrice.toFixed(2); // chỉ để hiển thị
  }
  res.render("client/pages/cart/index", {
    pageTitle: "Giỏ hàng",
    cart: cart
  });
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  try {
    const cart = await Cart.findOne({ _id: req.cookies.cartId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }
    const isExistProduct = cart.products.find(
      (item) => item.product_id.toString() == req.params.productId
    );
    if (isExistProduct) {
      const newQuantity =
        parseInt(req.body.quantity) + isExistProduct.quantity ;

      await Cart.updateOne(
        {
          _id: req.cookies.cartId,
          "products.product_id": req.params.productId,
        },
        { "products.$.quantity": newQuantity }
      );
      req.flash("success", "Cập nhật số lượng sản phẩm thành công");
      return res.redirect(req.get("Referrer") || "/");
    }

    const cartProduct = {
      product_id: req.params.productId,
      quantity: parseInt(req.body.quantity),
    };
    await Cart.updateOne(
      { _id: req.cookies.cartId },
      { $push: { products: cartProduct } }
    );
    req.flash("success", "Thêm sản phẩm vào giỏ hàng thành công");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.log(error);
  }
};


// [GET] /cart/delete/:productId
module.exports.deletePost = async (req, res) => {
  try {
    const cart = await Cart.findOne({ _id: req.cookies.cartId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }
    await Cart.updateOne(
      { _id: req.cookies.cartId },
      { $pull: { products: { product_id: req.params.productId } } }
    );
    req.flash("success", "Xóa sản phẩm khỏi giỏ hàng thành công");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.log(error);
  }
};  

//[GET] /cart/update/:productId/:quantity
module.exports.updatePost = async (req, res) => {
  try {
    const cart = await Cart.findOne({ _id: req.cookies.cartId });
    if (!cart) {
      return res.status(404).send("Cart not found");
    }
    const newQuantity = parseInt(req.params.quantity);
    await Cart.updateOne(
      { _id: req.cookies.cartId, "products.product_id": req.params.productId },
      { "products.$.quantity": newQuantity }
    );
    req.flash("success", "Cập nhật số lượng sản phẩm thành công");
    res.redirect(req.get("Referrer") || "/");
  } catch (error) {
    console.log(error);
  }
};  