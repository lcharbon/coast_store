import React from 'react';
import { render } from 'react-dom';
import "babel-polyfill"

import idb from 'idb';
import locale from '../support/locale.js';
import locationServices from '../support/LocationServices.js';
import UI from '../components/UI/UI.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import HelpRequest from '../models/HelpRequest.js';
import products from '../settings/products.json';
import 'normalize.css';

class Beachhut {
	products = [];
	order = new Order;
	ui = {};
	initTime = Date.now();
	haslastChanceProptDisplayed = false;

	constructor() {
		emailjs.init("user_USAtZzUGAE7R9LfQjWO6w");
		locale.init().then(async () => {
			this.loadDB();
			
			await this.loadExternalAPIs();

			this.loadProducts();
			locationServices.loadLocationServices();
			this.loadUI();
			this.order.restorePurchases();
		});	
	}

	parseRoute() {
		var path = location.hash.split('/');

		path.shift();

		return path;
	}

	loadProducts() {
		this.products = products.map(function(data) {
			return new Product(data);
		})
	}

	loadDB() {
		if (!('indexedDB' in window)) {
			console.log('This browser doesn\'t support IndexedDB');
			return;
		}

		this.db = idb.open('beach_hut_db', 1, function(upgradeDb) {
			var purchases;

			if (!upgradeDb.objectStoreNames.contains('purchases')) {
				purchases = upgradeDb.createObjectStore('purchases', { autoIncrement:true, keyPath: 'variantId' });
				purchases.createIndex('variantId', 'variantId', { unique: false });
			}
		});
	}

	loadUI() {
		var mountDOM = document.getElementById('beachhut');
		var logoOverlay = document.getElementById('logo-overlay');
		

		this.ui = render(
			<UI
				locale={ this.locale }
				products={ this.products }
				order={ this.order }
			/>,
			mountDOM
		)

		window.getComputedStyle(mountDOM).opacity;

		mountDOM.style.opacity = 1;

		setTimeout((function() {
			var variant = this.parseVariantFromPath();
			
			logoOverlay.style.display = "none"

			if (variant) {
				(new Purchase({ variant: variant})).displayInOverlay();
			}
		}).bind(this), 1600)
		
	}

	loadExternalAPIs() {
		return new Promise((resolve, reject) => {
			this.loadGoogleAPI(resolve, reject);
		})
	}

	loadScript(url, id, success, fail) {
		var tag,
			wasTag;

		success = success || function() {};
		fail = fail || function() {};

		wasTag = document.getElementById(id);

		/* Removes old URL */
		if (wasTag) wasTag.parentElement.removeChild(wasTag);

		tag = document.createElement('script');
		tag.onload = success;
		tag.onerror = fail;

		tag.setAttribute("type", "text/javascript");
		tag.setAttribute("id", id);
		tag.setAttribute("src", url);

		document.getElementsByTagName("head")[0].appendChild(tag);
	}

	loadGoogleAPI(success, fail) {
		var language = locale.language.toLowerCase();
		var url = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB7CvnyMLujWk65zH5ya3PNLFznqrA-xIU&libraries=places&language=${language}`;

		this.loadScript(url, "googleMapsAPI", success, fail);
	}

	resetOrder() {
		this.order = new Order;
		
		this.ui.setState({
			order: this.order,
			isOrderComplete: false
		});
	}

	findVariantbyId(id) {
		var product;
		var variant;

		for (product of products) {
			for (variant of product.variants) {
				if (variant.id === id) return variant;
			}
		}
	}

	findProductByName(name) {
		name = name.toLowerCase();

		return this.products.find(function(product) { 
			return product.name.toLowerCase() === name
		});
	}

	userApprochNavigation() {
		if ((Date.now() - this.initTime) < 4000 || this.haslastChanceProptDisplayed === true || this.order.isComplete === true) return;

		this.ui.displayLastChanceOverlay();
		this.haslastChanceProptDisplayed = true;
	}

	parseVariantFromPath() {
		var path = this.parseRoute();
		var product;

		if (path[0] !== "products") return;

		product = this.findProductByName(path[1]);

		return product.getVariantsByColor(path[2]).find(function(variant) {
			return variant.size === "m";
		});
	}
}

window.Require = __webpack_require__;

const beachHut = new Beachhut;

export default beachHut;