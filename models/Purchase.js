import Model from './Model';
import beachHut from '../main/BeachHut.js';
import idb from 'idb';

class Purchase extends Model {

	static attributes = ["variant", "quantity"];

	constructor(data) {
		super();
		
		this.order = beachHut.order;
		this.setData(data);
	}

	displayInOverlay = () => {
		beachHut.ui.displayPurchaseOverlay(this);

		gtag('event', 'view_item', { 
			items: [{ id: this.variant.id, quantity: this.quantity }]
		});
	}

	calcPrice() {
		return parseFloat(this.variant.product.localPrice()) * this.quantity;
	}

	add(success, fail) {
		if (this.order.isComplete) return fail();
		
		function addSuccess() {
			this.store().then(success).catch(fail);
		};
		addSuccess = addSuccess.bind(this);

		this.order.addPurchase(this, success, fail);
	}

	save(data, success, fail) {
		if (!this.quantity) this._create(data, success, fail);
		else this._update(data, success, fail);
	}

	_create(data, success, fail) {
		this.setData(data);

		function createSuccess() {
			this.store();
			success();
		};
		createSuccess = createSuccess.bind(this);

		this.order.addPurchase(this, createSuccess, fail);


	}

	_update(data, success, fail) {
		var wasData = this.asJSON();

		this.setData(data);

		function createShipmentFail() {
			this.setData(wasData);
			fail();
		};
		createShipmentFail = createShipmentFail.bind(this);

		function updateSuccess() {
			this.store();
			success();
		};
		updateSuccess = updateSuccess.bind(this);

		if (this.quantity !== wasData.quantity && Object.keys(this.order.shippingAddr).length > 0) {
			this.order.fulfilment.createShipment(updateSuccess, createShipmentFail);
		} else {
			updateSuccess();
		}
	}

	exportJSON() {
		var json = this.asJSON()

		json.variantId = this.variant.id;

		return json;
	}

	store() {
		beachHut.db.then((function(db) {
			var tx = db.transaction('purchases', 'readwrite');
			var store = tx.objectStore('purchases');

			store.put(this.exportJSON());
		}).bind(this)).catch(function(error) {
			console.log("Warning: Unable to store purchase.");
		})
	}

	destroy() {
		this.order.removePurchase(this);

		beachHut.db.then((function(db) {
			var tx = db.transaction('purchases', 'readwrite');
			var store = tx.objectStore('purchases');
			
			store.delete(this.variant.id);
			
			return tx.complete;
		}).bind(this))
	}
}

export default Purchase