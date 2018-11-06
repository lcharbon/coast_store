const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const shippo = require('shippo')(process.env.SHIPPO_API_KEY);
const request = require('request-promise');
const currencySettings = require('./settings/currencies.json');
const shipmentCreationFailureNoticeMailer = require("./mailers/shipment_creation_failure_notice_mailer.js");
const bugReportMailer = require("./mailers/bug_report_mailer.js");

module.exports.handler = (event, context, callback) => {
	const requestBody = JSON.parse(event.body);
	const token = requestBody.token.id;
	const totals = requestBody.totals;
	const shippingRate = requestBody.shippingRate;
	const currency = requestBody.currency.toLowerCase();
	const purchases = requestBody.purchases;
	const billingAddr = requestBody.billingAddr;
	const shippingAddr = requestBody.shippingAddr;
	const taxAmountInt = Math.round(parseFloat(totals.taxes) * 100);
	const primaryCurrency = function () {
		var currency;

		for (curreny in currencySettings) {
			if (currencySettings[curreny].primary === true) return curreny;
		}
	}();

	let stripeOrder = {};
	let shippoOrder = {};

	function createStripeMetaData() {
		var metadata = {
			shippingRate: JSON.stringify({ shipmentId: shippingRate.shipment, provider: shippingRate.provider, cost: shippingRate.amount, estimatedDays: shippingRate.estimated_days }),
			purchases: JSON.stringify(purchases),
			billingAddr: JSON.stringify(billingAddr),
			shippingAddr: JSON.stringify(shippingAddr)
		}

		return metadata;
	};

	function compileItemData(purchase) {
		var itemData = purchases.map(function(purchase) { 		
			return {
				type: "sku", 
				parent: addSkuCurrencySuffix(purchase.variantId),
				quantity: purchase.quantity,
				metadata: {}
			} 
		})

		return itemData;
	};

	function addSkuCurrencySuffix(sku) {
		var suffix = currency === primaryCurrency ? "" : "-" + currency;

		return sku + suffix;
	};

	async function decrementInventory() {
		var purchase;
		var stripeVariant;
		var wasQuantity;
		var newQuantity;

		if (currency === primaryCurrency) return;

		for (purchase of purchases) {
			stripeVariant = await stripe.skus.retrieve(purchase.variantId);

			wasQuantity = stripeVariant.inventory.quantity;
			newQuantity = wasQuantity - purchase.quantity;

			if (newQuantity < 0 ) {
				bugReportMailer.send(`Inventory for SKU ${purchase.variantId} is less than 0`);

				newQuantity = 0;
			} 

			await stripe.skus.update(purchase.variantId, { inventory: { quantity: newQuantity }});
		}
	}

	async function processOrder() {
		var customer = (await stripe.customers.list({ email: billingAddr.email })).data[0];		
		var customerData = {
			description: `${billingAddr.first_name} ${billingAddr.last_name}`,
			email: billingAddr.email,
			shipping: {
				name: [`$(billingAddr.first_name) $(billingAddr.last_name)`, billingAddr.company].join(" "),
				phone: billingAddr.phone,
				address: { 
					line1: billingAddr.address,
					line2: billingAddr.apt,
					city: billingAddr.city,
					state: billingAddr.territory,
					country: billingAddr.country,
					postal_code: billingAddr.postal_code
				}
			},
			metadata: {
				isBilling: true,
			}
		}

		if (billingAddr.company) customerData.metadata.company = billingAddr.company;

		if (customer) customer = await stripe.customers.update(customer.id, customerData);
		else customer = await stripe.customers.create(customerData);

		var stripeOrder = await stripe.orders.create({
			currency: currency,
			items: compileItemData(),
			email: billingAddr.email,
			shipping: {
				name: [`${shippingAddr.first_name} ${shippingAddr.last_name}`, shippingAddr.company].join(" "),
				phone: shippingAddr.phone,
				address: {
					line1: shippingAddr.address,
					line2: shippingAddr.apt,
					city: shippingAddr.city,
					state: shippingAddr.territory,
					country: shippingAddr.country,
					postal_code: shippingAddr.postal_code
				}
			},
			metadata: { 
				shipment_id: shippingRate.shipment,
				shipment_rate_id: shippingRate.object_id,
				provider: shippingRate.provider,
				shipping_amount: Math.round(parseFloat(shippingRate.amount)*100), 
				estimated_days: shippingRate.estimated_days,
				tax_amount: taxAmountInt,
				language: requestBody.language
			},
			customer: customer.id
		})

		charge = await stripe.orders.pay(stripeOrder.id, { source: token });

		await decrementInventory();

		request({
			method: 'POST',
			uri: 'https://api.goshippo.com/orders/',
			headers: {
				Authorization: "ShippoToken " + process.env.SHIPPO_API_KEY
			},
			body: {
				order_number: stripeOrder.id,
				to_address: shippingAddr,
				placed_at: new Date,
				order_status: "PAID",
				shop_app: "StripeRelay",
				weight: "1",
				weight_unit: "g"
			},
			json: true 
		}).then(function(orderData) {
			shippoOrder = orderData;
			return shippo.transaction.create({
				rate: shippingRate.object_id,
				label_file_type: "PDF_4x6",
				async: false,
				order: shippoOrder.object_id
			})
		}).catch(function(err) {
			if (err) {
				console.log(err);
				shipmentCreationFailureNoticeMailer.send(stripeOrder.id);
				console.log("Warning: Shipping Error");
			}
		});

		return charge
	}

	processOrder().then(function(charge) {
		callback(null, {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({
				message: `Processed succesfully!`,
				charge,
			}),
		});
	}).catch(function(err) { // Error response
			const response = {
				statusCode: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify({
					error: err.message,
					metadata: createStripeMetaData()
				}),
			};
			callback(null, response);
	});
};