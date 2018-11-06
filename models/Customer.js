import Model from './Model'
import beachHut from '../main/BeachHut.js';
import APIRequest from '../support/APIRequest.js';

class Customer extends Model {
	
	static attributes = ["id"];

	constructor(data) {
		super();
		this.setData(data);
	}

	save() {
		var data =  {};

		beachHut.order.customer = this;

		data.AddrDetails = beachHut.order.getShippingAddr();
		data.isBilling = beachHut.order.isSameAddress();

		new APIRequest('post', ["customers"], data);
	}

}

export default Customer