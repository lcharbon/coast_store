import Model from './Model'

class Variant extends Model {
	
	static attributes = ["id", "color", "size", "product", "images", "showcaseImage"];

	constructor(data) {
		super();
		this.setData(data);
	}

}

export default Variant