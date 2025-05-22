const Cart = require('../../models/cart.model');
module.exports.cart = async (req, res, next) => {
  if (!req.cookies.cartId) {
    const cart = new Cart();
    await cart.save();
    const expires = new Date(Date.now() + 365*24*60 * 60 * 1000); // 1 hour
    res.cookie('cartId', cart._id.toString(), {expires: expires, httpOnly: true});
  } else {
    const cart = await Cart.findById(req.cookies.cartId);
    if (cart) {
      cart.totalQuantity = cart.products.reduce((total, item) => {
        return total + item.quantity;
      }, 0);
      res.locals.miniCart = cart;
    }
  }
  next();
};