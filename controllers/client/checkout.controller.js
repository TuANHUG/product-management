const Product = require("../../models/product.model");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const productHelper = require("../../helpers/products");
//[GET] /checkout
module.exports.index = async (req, res) => {
  const cart = await Cart.findOne({ _id: req.cookies.cartId });
  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const product = await Product.findById(item.product_id);
      product.priceNew = productHelper.priceNewProduct(product);
      item.productInfo = product;
    }

    cart.totalPrice = cart.products.reduce((total, item) => {
      return total + item.productInfo.priceNew * item.quantity;
    }, 0);
  }
  res.render("client/pages/checkout/index", {
    pageTitle: "Đặt hàng",
    cart: cart,
  });
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
  const cart = await Cart.findOne({ _id: req.cookies.cartId });
  const userInfo = {
    fullName: req.body.fullName,
    phone: req.body.phone,
    address: req.body.address,
  };

  let products = [];
  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productInfo = await Product.findById(item.product_id);
      const product = {
        product_id: item.product_id,
        quantity: item.quantity,
        price: productInfo.price,
        discountPercentage: productInfo.discountPercentage,
      }
      products.push(product);
    }
    const order = {
      cart_id: cart._id,
      userInfo: userInfo,
      products: products,
      user_id: res.locals.user ? res.locals.user._id : "",
      status: "pending"
    };
    const orderModel = new Order(order);
    await orderModel.save();
    await Cart.updateOne(
      { _id: cart._id },
      {  products: []  }
    );
    res.redirect(`/checkout/success/${orderModel._id}`);
  }
};

//[GET] /checkout/success/:orderId
module.exports.success = async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (order) {
    for (const item of order.products) {
      const product = await Product.findById(item.product_id).select(
        "title thumbnail"
      );
      item.productInfo = product;

      item.priceNew = productHelper.priceNewProduct(item);
      item.totalPrice = item.priceNew * item.quantity;
    }
    order.totalPrice = order.products.reduce((total, item) => {
      return total + item.totalPrice;
    }, 0);
    res.render("client/pages/checkout/success", {
      pageTitle: "Đặt hàng thành công",
      order: order,
    });
  } else {
    res.redirect("/");
  }
};
