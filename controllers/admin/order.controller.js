const Order = require("../../models/order.model");
const systemConfig = require("../../config/system");
// [GET] /admin/order
module.exports.index = async (req, res) => {
  const records = await Order.find().sort({ createdAt: -1 }).lean();
  res.render("admin/pages/order/index", {
    pageTitle: "Quản lý đơn hàng",
    records,
  });
};

// [PATCH] /admin/order/update-status/:id
module.exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.updateOne({ _id: req.params.id }, { status });
    req.flash("success", "Cập nhật trạng thái đơn hàng thành công");
  } catch (error) {
    req.flash("error", "Cập nhật thất bại");
  }
  res.redirect(`${systemConfig.prefixAdmin}/order`);
};
