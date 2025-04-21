// [GET] /product

const Product = require('../../models/product.model');

module.exports.index = async (req, res) => {
    const products = await Product.find({
        status: 'active',
        deleted: 'false'
    });

    const newProducts = products.map(item => {
        const obj = item.toObject();
        return {
            ...obj,
            newPrice: (item.price*(100 - item.discountPercentage)/100).toFixed(2)
        }
    });

    res.render('client/pages/products/index.pug',{
        pageTitle: "Product List",
        products: newProducts
    });
}