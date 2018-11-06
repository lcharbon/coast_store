import beachHut from '../main/BeachHut.js';
import TRANSLATIONTABEL from '../settings/translation_table.json';
import Request from '../support/Request.js';
import currencies from '../settings/currencies.json';
import settings from '../settings/settings.json';

let locale = {};

locale.init = async function() {
	this.availableLanguages = Object.keys(TRANSLATIONTABEL);
	this.availableCurrencies = Object.keys(currencies);
	this.language = this.detectLanguage() || this.availableLanguages.first();
	this.currency = await this.detectCurrency() || this.availableCurrencies.first();
};
locale.init = locale.init.bind(locale);

locale.setCurrency = function(currency) {
	localStorage.setItem("currency", currency);

	this.currency = currency;

	beachHut.ui.setState({local: this});
};
locale.setCurrency = locale.setCurrency.bind(locale);

locale.setLanguage = function(language) {
	var wasLanguage = this.language;

	this.language = language;
	beachHut.ui.setState({local: this});

	function APILoadSuccess() {
		localStorage.setItem("language", language);
	}
	APILoadSuccess = APILoadSuccess.bind(this);

	function APILoadLoadFail() {
		this.language = wasLanguage;
		beachHut.ui.setState({local: this});
	}
	APILoadSuccess = APILoadSuccess.bind(this);


	beachHut.loadGoogleAPI(APILoadSuccess, APILoadLoadFail);
};
locale.setLanguage = locale.setLanguage.bind(locale);

locale.getLocationFromIP = function() {
	var locatePromise = new Promise((resolve, reject) => {
		new Request("GET", `https://api.ipdata.co?api-key=${settings.ipDataAPIKey}`, undefined, resolve, reject);
	})

	locatePromise.catch(() => {
		var message = "Could not get location from IP."

		emailjs.send("default_service", "bug_report", { message: message});
	})

	return locatePromise;
};
locale.getLocationFromIP = locale.getLocationFromIP.bind(locale);

locale.detectCurrency = async function() {
	var storedCurrency = localStorage.getItem("currency");
	var countryCode;
	var key;

	if (storedCurrency) return storedCurrency;

	countryCode = (await this.getLocationFromIP()).country_code.toLowerCase();

	for (key in currencies) {
		if (currencies[key].countries.includes(countryCode.toLowerCase())) return key;
	}

	// Default
	for (key in currencies) {
		if (currencies[key].default === true) return key;
	}
};
locale.detectCurrency = locale.detectCurrency.bind(locale);

locale.detectLanguage = function() {
	var storedLanguage = localStorage.getItem("language");
	var browserLanguages = navigator.languages || [navigator.language];

	// Remove country code from language.
	browserLanguages = browserLanguages.map(function(lang) {
		return lang.replace(/-.*/g, "");
	})

	// Filter out unavailable languages.
	browserLanguages = browserLanguages.filter((function(lang) {
		 return this.availableLanguages.includes(lang);
	}).bind(this));

	if (this.availableLanguages.includes(storedLanguage))
		return storedLanguage
	else if(navigator.languages && navigator.languages instanceof Array && navigator.languages.length != 0 && navigator.languages[0].replace(/\s+/g, "") != "")
		return browserLanguages[0];
};
locale.detectLanguage = locale.detectLanguage.bind(locale);

locale.toLocalPrice = function(price) {
	return price * currencies[this.currency].conversionCAD;
};
locale.toLocalPrice = locale.toLocalPrice.bind(locale);

export default locale