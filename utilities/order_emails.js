const stripe = require('stripe')("adasdasdasd");

stripe.orders.list({ limit: 100 }).then(function(result) {
	var emails = [];
	var productId = "0001-010000-006005-00m";
	
	result.data.forEach(function(order) {
		order.items.forEach(function(item) {
			if (item.parent === productId) {
				emails.push(order.email);
			}
		})
	})

	console.log(emails);
})