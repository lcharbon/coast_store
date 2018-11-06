import Request from './Request.js';
import settings from '../settings/settings.json';

class APIRequest extends Request {	
	constructor(method, route, data, success, fail) {
		var url = settings.apiHost + "/" + route.join("/");

		super(method, url, data, success, fail);
	}
}

export default APIRequest;