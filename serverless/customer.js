const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.handler = (event, context, callback) => {
	const requestBody = JSON.parse(event.body);
	const AddrDetails = requestBody.AddrDetails;
	const isBilling = requestBody.isBilling;


	stripe.customers.list({ email: AddrDetails.email }).then(function(customers) {
		var customer = customers.data[0];
		
		if (customer) return customer;

		var customerData = {
			description: `${AddrDetails.first_name} ${AddrDetails.last_name}`,
			email: AddrDetails.email,
			shipping: {
				name: [`$(AddrDetails.first_name) $(AddrDetails.last_name)`, AddrDetails.company].join(" "),
				phone: AddrDetails.phone,
				address: { 
					line1: AddrDetails.address,
					line2: AddrDetails.apt,
					city: AddrDetails.city,
					state: AddrDetails.territory,
					country: AddrDetails.country,
					postal_code: AddrDetails.postal_code
				}
			},
			metadata: {
				isBilling: isBilling
			}
		}

		if (AddrDetails.company) customerData.metadata.company = AddrDetails.company;

		return stripe.customers.create(customerData);
	}).then(function(customer) {
		callback(null, {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({
				customer: { id: customer.id}
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
			}),
		};
		callback(null, response);
	});
}