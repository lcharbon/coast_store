class Model {
	static attributes = [];
	
	setData(data) {
		var attributes = this.constructor.attributes;

		for (var key in data) {
			if (attributes.includes(key)) this[key] = data[key];
		}
	}

	asJSON() {
		var json = {};

		json.id = this.id;

		this.constructor.attributes.forEach((function(attribute) {
			if (this[attribute] === Object(this[attribute])) return;
			
			json[attribute] = this[attribute];
		}).bind(this));

		return json;
	}
}

export default Model
