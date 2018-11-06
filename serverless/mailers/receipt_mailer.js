const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const shippo = require('shippo')(process.env.SHIPPO_API_KEY);
const aws = require('aws-sdk');
const ejs = require('ejs');

const translationTable = require('../settings/translation_table.json');
const productsData = require('../settings/products.json');

function findVariantById(id) {
	for (product of  productsData) {
		for (variant of product.variants) {
			if (variant.id === id) {
				variant.product = Object.assign({}, product);
				return variant;
			}
		}
	}
}

function getSelectedRate(shippoShipment, shipment_rate_id) {
	if (!shipment_rate_id) return;

	return shippoShipment.rates.find(function(rate) {
		return rate.object_id == shipment_rate_id;
	});
}

function generateTotals(stripeOrder) {
	var totals = {
		subtotal: 0,
		shipping: 0,
		taxes: 0,
		total: 0
	}

	for (item of stripeOrder.items) {
		if (item.type == "sku") {
			totals.subtotal += item.amount;
		}

		if (item.type == "shipping") {
			totals.shipping += item.amount;
		}

		if (item.type == "tax") {
			totals.taxes += item.amount;
		}
	}

	totals.total = totals.subtotal + totals.shipping + totals.taxes;

	return totals;
}

function compileOrderData(stripeOrder, shippoShipment, stripeCustomer) {
	var shippoRate = getSelectedRate(shippoShipment, stripeOrder.metadata.shipment_rate_id);
	var totals = generateTotals(stripeOrder);
	var orderData = {
		id: stripeOrder.id,
		totals: {},
		purchases: [],
		items: [],
	};

	if (stripeOrder.metadata && stripeOrder.metadata.shipment_rate_id) {
		orderData.shippingRate = {
			provider: shippoRate.provider,
			servicelevel: (shippoRate.servicelevel && shippoRate.servicelevel.name) || "",
			estimated_days: shippoRate.days || shippoRate.estimated_days
		};

		orderData.shippingAddr = {
			company: shippoShipment.address_to.company,
			name: shippoShipment.address_to.name,
			line1: shippoShipment.address_to.street1,
			line2: shippoShipment.address_to.street2,
			city: shippoShipment.address_to.city,
			state: shippoShipment.address_to.state,
			country: shippoShipment.address_to.country,
			postal_code: shippoShipment.address_to.zip
		};

		orderData.billingAddr = {
			company: stripeCustomer.metadata.company,
			name: stripeCustomer.description,
			line1: stripeCustomer.shipping.address.line1,
			line2: stripeCustomer.shipping.address.line2,
			city: stripeCustomer.shipping.address.city,
			state: stripeCustomer.shipping.address.state,
			country: stripeCustomer.shipping.address.country,
			postal_code: stripeCustomer.shipping.address.postal_code
		};
	}

	for (key in totals) {
		orderData.totals[key] = translationTable[stripeOrder.metadata.language]["27"].replace("$0",  (totals[key]/ 100).toFixed(2));
	}

	orderData.purchases = [];

	stripeOrder.items.forEach(function(item) {
		var purchase = {};
		
		if (item.type != "sku") return;

		purchase.variant = findVariantById(item.parent);

		purchase.variant.name = translationTable[stripeOrder.metadata.language][purchase.variant.color] + " " + translationTable[stripeOrder.metadata.language][`${purchase.variant.size}_full`];
		purchase.price = translationTable[stripeOrder.metadata.language]["27"].replace("$0", (item.amount / 100).toFixed(2));
		purchase.quantity = item.quantity;

		orderData.purchases.push(purchase);
	})

	return orderData;
}

module.exports.send = async function(stripeOrder) {
	var ses = new aws.SES({
		region: 'us-east-1'
	});

	var shippoShipment = stripeOrder.metadata.shipment_id? await shippo.shipment.retrieve(stripeOrder.metadata.shipment_id): undefined;
	var stripeCustomer = stripeOrder.metadata.shipment_id? await stripe.customers.retrieve(stripeOrder.customer) : undefined;
	var templateData = { $t: translationTable[stripeOrder.metadata.language], orderData: compileOrderData(stripeOrder, shippoShipment, stripeCustomer) };
	var htmlString = await ejs.renderFile(__dirname + '/templates/receipt.ejs', templateData, { rmWhitespace: true, async: true });

	var emailParams = {
		Destination: {
			ToAddresses: [stripeOrder.email]
		},
		Message: {
			Body: {
				Html: {
					Data: htmlString
				}
			},
			Subject: {
				Data: translationTable[stripeOrder.metadata.language]["120"]
			}
		},
		Source: "contact@coastbeachwear.com"
	};

	ses.sendEmail(emailParams, function(err) {
		if (err) console.log(err);
		else console.log("Receipt Sent");	
	}); 
};