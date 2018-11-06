const receiptMailer = require("./mailers/receipt_mailer.js");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = async function(event, context, callback) {
	const requestBody = JSON.parse(event.body);
	
	let stripeOrder = requestBody.data.object;

	if (!stripeOrder.metadata.language) {
		stripeOrder = await stripe.orders.update(stripeOrder.id, {
			metadata: Object.assign({ language: "fr" }, stripeOrder.metadata)
		});
	}

	receiptMailer.send(stripeOrder);
	
	callback(null, {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
		}
	});
}