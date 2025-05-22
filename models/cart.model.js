const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
  {
    user_id: String,
    products: [
      {
        product_id: String,
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],
  },
  {timestamps: true}
);

const Cart = mongoose.model('Cart', CartSchema, "carts");

module.exports = Cart;