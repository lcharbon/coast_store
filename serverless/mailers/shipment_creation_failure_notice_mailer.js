const aws = require('aws-sdk');

module.exports.send = function(orderID) {
	var ses = new aws.SES({
		region: 'us-east-1'
	});
	
	var eParams = {
		Destination: {
			ToAddresses: ["bugs@coastbeachwear.com", "help@coastbeachwear.com"]
		},
		Message: {
			Body: {
				Text: {
					Data: `Shipment creation failed for order id: ${orderID}.`
				}
			},
			Subject: {
				Data: "Shipment Creation Failed"
			}
		},
		Source: "contact@coastbeachwear.com"
	};
	
	ses.sendEmail(eParams, function(err) {
		if (err) console.log(err);
		else console.log("Shipping Error Email Sent");	
	}); 
};