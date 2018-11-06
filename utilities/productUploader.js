const secretSettings = require('../settings/secret_settings.json');
const products = require('../settings/products.json');
const translationTable = require('../settings/translation_table.json')["en"];
const stripe = require("stripe")("adasasdasd");

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function generateId(product) {
	var productId = pad("1", 4);
	var versionId = "010000";
	var colorId = pad(product.color, 6);
	var sizeId = pad(product.size, 3);
	
	return [productId, versionId, colorId, sizeId].join("-");
}

products[0].variants.forEach(function(product) {
	stripe.skus.create({
		id: product.id,
		product: "0001",
		inventory: { type: "bucket", value: "in_stock"},		
		price: 7300,
		currency: 'cad',
		attributes: {
			size: translationTable[product.size + "_full"],
			color: translationTable["code" + product.color]
		}
	}).catch(function(err) {
		console.log(err);
	});
})