import Model from './Model';
import currencies from '../settings/currencies.json';
import beachHut from '../main/BeachHut.js';
import Variant from './Variant';
import locale from '../support/locale.js';

class Product extends Model {

	static attributes = ["id", "name", "version", "description", "price"]

	constructor(data) {
		super();
		this.setData(data);
	}

	setData(data) {
		super.setData(data);

		this.variants = data.variants.map((function(data) {
			data.product = this;
			return new Variant(data);
		}).bind(this));
	}

	getVariantsBySize(size) {
		return this.variants.filter(function(variant) {
			return variant.size == size;
		})
	}

	getVariantsByColor(color) {
		return this.variants.filter(function(variant) {
			return variant.color == color;
		})
	}

	localPrice() {
		return locale.toLocalPrice(this.price);
	}
}

export default Product