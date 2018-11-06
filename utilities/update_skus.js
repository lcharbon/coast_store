const secretSettingsPath = {
	development: '../settings/development_secret_settings.json',
	production: '../settings/production_secret_settings.json'
}

const secretSettings = require(secretSettingsPath[process.argv.slice(2)]);
const currencies = require('../settings/currencies.json');
const products = require('../settings/products.json');
const translationTable = require('../settings/translation_table.json')["en"];
const stripe = require("stripe")(secretSettings.stripeAPIKey);

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

var update = async function() {
	var currency= "";
	var currencyData;
	var product;
	var variant;
	var idSuffix = "";
	var stripeVariant;
	var skuData = {};
	var skuId = "";

	for (currency in currencies) {
		currencyData = currencies[currency];
		
		idSuffix = !currencyData.primary? `-${currency}` : "";

		for (product of products) {
			for (variant of product.variants) {
				skuId = variant.id + idSuffix;
				
				stripeVariant = await stripe.skus.retrieve(skuId).catch((err) => {
					if (err.statusCode !== 404) console.log(err);
				});

				skuData = {
					product: product.id,
					currency: currency,
					attributes: {
						size: translationTable[variant.size + "_full"],
						color: translationTable["code" + variant.color],
						currency: currency.toUpperCase()
					}
				}

				if (currencyData.primary) {
					skuData.price = product.price * 100;
				} else {
					skuData.inventory = { type: "bucket", value: "in_stock"};
					skuData.price = Math.round(product.price * 100 * currencyData.conversionCAD);
				}

				console.log(skuData);

				if (stripeVariant) stripe.skus.update(skuId, skuData);
				else stripe.skus.create(Object.assign({ id: skuId}, skuData));
			}
		}
	}
}

update();


