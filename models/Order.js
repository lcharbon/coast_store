import Model from './Model.js';
import beachHut from '../main/BeachHut.js';
import locale from '../support/locale.js'
import { originCountryCode } from '../settings/settings.json';
import validation from './concerns/order_validation.js';
import taxRates from '../settings/tax_rates.json';
import $T from '../support/translations.js';
import APIRequest from '../support/APIRequest.js';
import Fulfilment from './Fulfilment.js';
import Purchase from './Purchase.js';

class Order extends Model {
	
	static billingAddrFields = ["first_name", "last_name", "company", "address", "city", "country", "apt", "territory", "postal_code", "email", "phone"];
	static shippingAddrFields = ["first_name", "last_name", "company", "address", "city", "country", "apt", "territory", "postal_code", "email", "phone", "placeId"];
	static paymentInfoFields = ["card_number", "card_holder", "card_type", "expiry", "cvv"];

	constructor() {
		super();

		this.billingAddr = {};
		this.shippingAddr = {};
		this.paymentInfo = {}
		this.purchases = [];
		
		this.isComplete = false;
		this.fulfilment = new Fulfilment(this);
	}

	// Method also used as updates.
	setBillingAddr(obj) {
		var fields = this.constructor.billingAddrFields;
		var validationOutput;

		validationOutput = this.validateBillingAddr(obj);

		if (validationOutput !== true) return validationOutput;

		for (var key in obj) {
			if (!fields.includes(key)) continue;
			this.billingAddr[key] = obj[key].trim();
		}

		this.updateUIState();

		return true;
	}

	// Method also used as updates.
	setShippingAddr(obj) {
		var fields = this.constructor.shippingAddrFields;
		var validationOutput; 

		obj.territory = obj.territory || obj.state;
		obj.postal_code = obj.postal_code || obj.zip;

		validationOutput = this.validateShippingAddr(obj);

		if (validationOutput !== true) return validationOutput;

		for (var key in obj) {
			if (!fields.includes(key)) continue;
			this.shippingAddr[key] = obj[key].trim();
		}

		this.updateUIState();

		return true;
	}

	validateBillingAddr(obj) {
		var fields = this.constructor.shippingAddrFields;
		var validationErrors = {};
		var validationOutput;
		var value = "";

		for (var key in obj) {
			if (validation.billingAddr[key]) {
				value = (obj[key] || "").trim();
				validationOutput = validation.billingAddr[key](value);
			}
			 
			if (validation.billingAddr[key] && validationOutput !== true) validationErrors[key] = validationOutput;
		}

		return !Object.keys(validationErrors).length || validationErrors;
	}

	validateShippingAddr(obj) {
		var fields = this.constructor.shippingAddrFields;
		var validationErrors = {};
		var validationOutput;
		var value = "";

		for (var key in obj) {
			if (validation.shippingAddr[key]) {
				value = (obj[key] || "").trim();
				validationOutput = validation.shippingAddr[key](value);
			} 
			if (validation.shippingAddr[key] && validationOutput !== true) validationErrors[key] = validationOutput;
		}

		return !Object.keys(validationErrors).length || validationErrors;
	}

	getBillingAddr() {
		var data = {};

		this.constructor.billingAddrFields.forEach((function(field) {
			data[field] = this.billingAddr[field] || "";
		}).bind(this));

		return JSON.parse(JSON.stringify(data));
	}

	getShippingAddr() {
		var data = {};

		this.constructor.shippingAddrFields.forEach((function(field) {
			data[field] = this.shippingAddr[field] || "";
		}).bind(this));

		return JSON.parse(JSON.stringify(data));
	}

	setPaymentInfo(obj) {
		var fields = this.constructor.paymentInfoFields;

		for (var key in obj) {
			if (fields.includes(key)) this.paymentInfo[key] = obj[key];
		}

		this.updateUIState();
	}

	addPurchase(purchase, success, fail) {
		var existingVariantPurchase;

		function createShipmentSuccess() {
			this.updateUIState();

			success();
		};
		createShipmentSuccess = createShipmentSuccess.bind(this);

		function createShipmentFail() {
			this.removePurchase(purchase);
			fail();
		};
		createShipmentFail = createShipmentFail.bind(this);

		success = success || function() {};
		fail = fail || function() {};

		if (this.purchases.includes(purchase)) return;

		existingVariantPurchase = this.purchases.filter(function(p) {
			return p.variant.id == purchase.variant.id;
		})[0]

		if (existingVariantPurchase) {
			existingVariantPurchase.quantity = purchase.quantity;
			return;
		}

		this.purchases.push(purchase);
		
		if (Object.keys(this.shippingAddr).length === 0) createShipmentSuccess();
		else this.fulfilment.createShipment(createShipmentSuccess, createShipmentFail);
	}

	removePurchase(purchase, success, fail) {
		success = success || function() {};
		fail = fail || function() {};

		this.purchases.remove(purchase);

		function createShipmentSuccess() {
			this.updateUIState();
			success();

			gtag('event', 'remove_from_cart', { items: [{
				id: purchase.variant.id,
				name: purchase.variant.product.name,
				variant: purchase.variant.color + " " + purchase.variant.size
			}] });
		};
		createShipmentSuccess = createShipmentSuccess.bind(this);

		function createShipmentFail() {
			this.purchases.push(purchase);
			fail();
		};
		createShipmentFail = createShipmentFail.bind(this);

		if (Object.keys(this.shippingAddr).length !== 0) this.fulfilment.createShipment(createShipmentSuccess, createShipmentFail);
		else createShipmentSuccess();

	}

	updateUIState() {
		beachHut.ui.setState({ order: this })
	}

	calcSubtotal() {
		var total = 0; 

		this.purchases.forEach(function(purchase) {
			var product = purchase.variant.product

			total = total + product.localPrice() * purchase.quantity
		})

		return total
	}

	isSameAddress() {
		var i = 0;
		var isSame = true;
		var field = "";

		for (i=0; i < this.constructor.billingAddrFields.length; i++ ) {
			field = this.constructor.billingAddrFields[i];

			if (this.billingAddr[field] !== this.shippingAddr[field]) {
				isSame = false;
				break;
			}
		}

		return isSame;
	}

	isShippingAddrEmpty() {
		var i = 0;
		var isEmpty = true;
		var field = "";

		for (i=0; i < this.constructor.shippingAddrFields.length; i++ ) {

			field = this.constructor.shippingAddrFields[i];

			if (this.shippingAddr[field] !== undefined) {
				isEmpty = false;
				break;
			}
		}

		return isEmpty;
	}

	calcShippingCosts() {
		if (!this.fulfilment.selectedRate) return 0;
		
		return locale.toLocalPrice(parseFloat(this.fulfilment.selectedRate.amount));
	}

	calcTaxes() {
		var country = this.shippingAddr.country.toLowerCase();
		var territory = this.shippingAddr.territory.toLowerCase();
		var rate = taxRates[country] && taxRates[country][territory];

		if (rate) return this.calcSubtotal() * rate;
		else return 0;
	}

	calcDiscounts() {
		return 0;
	}

	compileAddition() {
		var addition = {};
		var key = "";

		addition.subtotal = this.calcSubtotal();
		addition.shipping = this.calcShippingCosts();
		addition.taxes = this.calcTaxes();
		addition.discounts = this.calcDiscounts();

		addition.total = function() {
			var total = 0;

			for (key in addition) {
				if (!isNaN(addition[key])) total+=addition[key];
			}
			
			return total;
		}();

		return addition;
	}

	compileStringifiedAdditon() {
		var addition = this.compileAddition();

		Object.keys(addition).forEach(function(key) {
			if (isNaN(addition[key])) return "0";

			return addition[key] = addition[key].toFixed(2);
		});

		return addition;
	}

	countUnits() {
		var count = 0;

		this.purchases.forEach(function(purchase) {
			count+= purchase.quantity
		})

		return count;
	}

	isShippedInterational() {
		if (this.shippingAddr.country === undefined) return undefined;
		else return this.shippingAddr.country.toLowerCase() !== originCountryCode;
	}

	placeId2AddrObj(placeId, isLongName) {
		var rawData = {};
		var data = {};
		var nameType = isLongName? "long_name" : "short_name";
		
		obj.address_components.forEach(function(component) {
			var types = component.types;

			types.forEach(function(type) {
				// Force long name
				if (["route"].includes(type)) rawData[type] = component["long_name"];
				if (["street_number", "locality", "administrative_area_level_1", "country"].includes(type)) rawData[type] = component[nameType];
			});
		});

		data = {
			address: `${rawData.street_number} ${rawData.route}`,
			city: rawData.locality,
			country: rawData.country,
			territory: rawData.administrative_area_level_1
		};

		//Validation
		if (Object.values(data).includes(undefined)) return false;
		else return data;
	}

	restorePurchases() {
		beachHut.db.then(function(db) {
			var tx = db.transaction('purchases', 'readonly');
			var store = tx.objectStore('purchases');
			
			return store.getAll();
		}).then((function(purchaseData) {
			var data;
			var variant;

			for (data of purchaseData) {
				variant = beachHut.findVariantbyId(data.variantId);
				
				if (!variant) {
					beachHut.db.then((function(db) {
						var tx = db.transaction('purchases', 'readwrite');
						var store = tx.objectStore('purchases');
			
						store.delete(data.variantId);
			
						return tx.complete;
					}).bind(this))
					continue;
				}

				this.addPurchase(new Purchase({
					variant: variant,
					quantity: data.quantity,
					order: this
				}));
			}
		}).bind(this))
	}

	complete(token, success, fail) {
		success = success || function() {};
		fail = fail || function() {};

		var data = { 
			token: token,
			totals: this.compileStringifiedAdditon(),
			currency: locale.currency,
			purchases: this.purchases.map(function(purchase) { return purchase.exportJSON() }),
			billingAddr: this.getBillingAddr(),
			shippingAddr: this.getShippingAddr(),
			shippingRate: this.fulfilment.selectedRate,
			language: locale.language
		};

		function onfail(err) {
			var errorString = "";

			err = err || {};

			try {
    			errorString = JSON.stringify(err);
			} catch(err) {
				console.log("Error parsing error to string.");
			}
			
			emailjs.send("default_service", "bug_report", { message: `Could not process order: \n ${ JSON.stringify(data) }.\n\n Error: ${ errorString }`});
			
			fail();
		};
		onfail = onfail.bind(this);

		function oncomplete(data) {
			if (!data.charge) return onfail(data);

			beachHut.ui.setState({ isOrderComplete: true });
			
			this.isComplete = true;

			success();

			beachHut.db.then(function(db) {
			  var tx = db.transaction('purchases', 'readwrite');
			  var store = tx.objectStore('purchases');
			  
			  store.clear();
			});

			gtag('event', 'purchase', { 
				transaction_id: data.charge.id,
				items: this.purchases.map(function(purchase) { return { id: purchase.variant.id, quantity: purchase.quantity } })
			});
		};
		oncomplete = oncomplete.bind(this);

		new APIRequest('post', ["orders"], data, oncomplete, onfail);
	}
}

export default Order