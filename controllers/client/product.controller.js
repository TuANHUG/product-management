const Product = require('../../models/product.model');

// [GET] /product
module.exports.index = async (req, res) => {
    const products = await Product.find({
        status: 'active',
        deleted: 'false'
    }).sort({ position: 'desc' });
  

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

//[GET] /product/detail/:slug
module.exports.detail = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({
    slug: slug,
    status: 'active',
    deleted: false
  }); 

  const newProduct = {
    ...product.toObject(),
    newPrice: (product.price * (100 - product.discountPercentage) / 100).toFixed(2)
  };
  res.render('client/pages/products/detail.pug', {
    pageTitle: newProduct.title,
    product: newProduct
  });
}
