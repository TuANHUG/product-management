const express = require('express');
const router = express.Router();  

const controller = require('../../controllers/client/cart.controller.js');

router.get('/', controller.index);  

router.post('/add/:productId', controller.addPost);

router.get('/delete/:productId', controller.deletePost);

router.get('/update/:productId/:quantity', controller.updatePost);
module.exports = router;