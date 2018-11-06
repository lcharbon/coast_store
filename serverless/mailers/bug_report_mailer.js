const aws = require('aws-sdk');

module.exports.send = function(message) {
	var ses = new aws.SES({
		region: 'us-east-1'
	});
	
	var eParams = {
		Destination: {
			ToAddresses: ["bugs@coastbeachwear.com"]
		},
		Message: {
			Body: {
				Text: {
					Data: `The following bug was autmatically reported:\n${message}`
				}
			},
			Subject: {
				Data: "Bug Report"
			}
		},
		Source: "contact@coastbeachwear.com"
	};
	
	ses.sendEmail(eParams, function(err) {
		if (err) console.log(err);
		else console.log("Shipping Error Email Sent");	
	}); 
};