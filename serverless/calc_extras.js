module.exports.handler = (event, context, callback) => {
	const requestBody = JSON.parse(event.body);
	const order = requestBody.order;

	let responseBody = {};

	if (!order || !order.metadata) {
		return callback(null, {
			statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			body: "Missing values.",
		});
	}

	responseBody = {
		order_update: {
			items: [],
			shipping_methods: []
		}
	}

	if (order.metadata.from_app == "com.nudge.payment") {
		responseBody.order_update.items.push({
			"parent": null,
			"type": "tax",
			"description": "Sales taxes",
			"amount": Math.round(order.amount * 0.1842425),
			"currency": order.currency
		});
	} else {
		responseBody.order_update.items.push({
			"parent": null,
			"type": "tax",
			"description": "Sales taxes",
			"amount": parseInt(order.metadata.tax_amount),
			"currency": order.currency
		});

		responseBody.order_update.shipping_methods.push({
			"description": "Shipping Fee",
			"amount": parseInt(order.metadata.shipping_amount),
			"currency": order.currency
		});
	}

	callback(null, {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		body: JSON.stringify(responseBody),
	});
};