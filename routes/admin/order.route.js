const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/order.controller.js");

router.get("/", controller.index);

router.patch("/update-status/:id", controller.updateStatus);

module.exports = router;
