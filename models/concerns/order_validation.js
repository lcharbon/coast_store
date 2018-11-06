import { $T, $TInject} from '../../support/translations.js';
import settings from '../../settings/settings.json';

let emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

let validation = {
	billingAddr: {
		first_name: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(1)]);
		},
		last_name: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(2)]);
		},
		address: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(4)]);
		},
		city: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(58)]);
		},
		country: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(58)]);
		},
		territory: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(7)]);
		},
		postal_code: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(8)]);
		},
		email: function(value) {
			if (!value) return $TInject(111, [$T(18)]);
			if (value.match(emailRegex)) return true;
			else return $T(112);
		},
		phone: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(17)]);
		}
	},
	shippingAddr: {
		first_name: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(1)]);
		},
		last_name: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(2)]);
		},
		address: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(4)]);
		},
		city: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(58)]);
		},
		country: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(58)]);
		},
		territory: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(7)]);
		},
		postal_code: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(8)]);
		},
		email: function(value) {
			if (!value) return $TInject(111, [$T(18)]);
			if (value.match(emailRegex)) return true;
			else return $T(112);
		},
		phone: function(value) {
			if (value) return true;
			else return $TInject(111, [$T(17)]);
		},
		placeId: function(value) {
			if (value) return true;
			else return $T(113);
		}
	}
}

export default validation;