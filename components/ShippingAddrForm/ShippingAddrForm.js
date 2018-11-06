import React, { Component } from 'react';
import formStyles from '../CheckoutForm/CheckoutForm.css';
import styles from './ShippingAddrForm.css';

import beachHut from '../../main/BeachHut.js';
import locale from '../../support/locale.js';
import locationServices from '../../support/LocationServices.js';
import { $T, $TInject } from '../../support/translations.js';
import validation from '../../models/concerns/order_validation.js';

import Customer from '../../models/Customer.js';

import InputUnderline from '../Inputs/InputUnderline/InputUnderline.js';
import InputTypeAhead from '../Inputs/InputTypeAhead/InputTypeAhead.js';
import FormNavigation from '../FormNavigation/FormNavigation.js';
import BillingAddrForm from '../BillingAddrForm/BillingAddrForm.js';
import FulfilmentForm from '../FulfilmentForm/FulfilmentForm.js';
import Checkbox from '../Checkbox/Checkbox.js';


class ShippingAddrForm extends Component {
	constructor(props, context) {
		super(props, context)
		
		this.state = props.order.getShippingAddr();
		this.state.sameAsBilling = props.order.isSameAddress();
		this.state.addrPredictions = this.initiateAddrPredictions();
		this.state.isProcessing = false;
		this.state.validationErrors = {};
		this.state.hasStarted = this.hasStarted();

		// Geocoding of postal code needed if returning to page.
		if (props.order.shippingAddr.postal_code) this.geoCodePostalCode(props.order.shippingAddr.postal_code);
	}

	static getTitle() {
		return $T(10) // Shipping Details
	}

	navigateForward() {
		var nextForm;

		if (!this.props.order.countUnits()) {
			beachHut.ui.displayMessage(
				$T(78), /* Order Empty */
				$T(77) /* Add item to order to proceed. */
			);
			return;
		}

		function createShipmentSuccess() {
			var customer = new Customer;
 			
 			if (this.state.sameAsBilling) {
				nextForm = FulfilmentForm;

				this.props.order.setBillingAddr(this.props.order.getShippingAddr());
			} else {
				nextForm = BillingAddrForm;
			}

			customer.save();

			this.props.setCurrentForm(nextForm);
		};
		createShipmentSuccess = createShipmentSuccess.bind(this);

		function createShipmentFail() {
			beachHut.ui.displayMessage(
				$T(89), /* Address Error */
				$T(90)
			);
			this.setState({ isProcessing: false });
		};
		createShipmentFail = createShipmentFail.bind(this);

		function dataCollectionSuccess(data) {
			var validationOutput = this.props.order.setShippingAddr(data);

			if (validationOutput === true) this.props.order.fulfilment.createShipment(createShipmentSuccess, createShipmentFail);
			else this.setState({ 
				validationErrors: validationOutput,
				isProcessing: false
			});
		};
		dataCollectionSuccess = dataCollectionSuccess.bind(this);

		function dataCollectionFail() {
			this.setState({
				isProcessing: false
			});
		};
		dataCollectionFail = dataCollectionFail.bind(this); 

		this.setState({ isProcessing: true });
		this.collectShippingAddrData(dataCollectionSuccess, dataCollectionFail)
	}

	collectShippingAddrData(success, fail) {
		success = success || function() {};
		fail = fail || function() {};

		function retrieveFail() {
			beachHut.ui.displayMessage(
				$T(89), /* Address Error */
				$T(90)
			);

			fail();
			
			this.placeIdParseError(this.state.placeId);
			
			return;
		};
		retrieveFail = retrieveFail.bind(this);

		function retrieveSuccess(locationData) {
			var combinedData = {};
			var stateData = {};

			if (locationData === false) return geoCodeFail();

			stateData = this.retrieveAddrDataFromState();

			combinedData = Object.assign({}, stateData, locationData);
			
			success(combinedData);
		};
		retrieveSuccess = retrieveSuccess.bind(this);

		if ( !this.state.placeId ) return retrieveSuccess({}); 

		locationServices.retrieveAddrObjForPlaceId(this.state.placeId, false, retrieveSuccess, retrieveFail);
	}

	hasStarted() {
		return Object.values(this.retrieveAddrDataFromState()).some(function(value) { return !!value });
	}

	retrieveAddrDataFromState() {
		var valueFromState = ["first_name", "last_name", "company", "apt", "postal_code", "email", "phone", "placeId"];
		var data = {};

		valueFromState.forEach((function(key) {
			data[key] = this.state[key];
		}).bind(this));

		return data;
	}

	parseAddressComponents(obj, isLongName) {
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

	geoCodePostalCode(postalCode) {
		function success(latLng) {
			this.postalCodeLocation = latLng;
		}
		success = success.bind(this);

		locationServices.postalCode2LatLng(postalCode, success);	
	}

	refreshAddrPredictions(search, success) {
		var request = {
    		input: search || "",
    		location: undefined,
    		radius: undefined,
    		types: ["address"]
    	};

    	if (this.postalCodeLocation) {
    		request.location = this.postalCodeLocation;
    		request.radius = 10000;
    	}

    	function predictionGetSuccess(predictions, status) {
    		var items = [];

    		predictions = predictions || [];

    		items = predictions.map(function(prediction) {
    			return {
    				id: prediction.place_id,
    				caption: prediction.description
    			}
    		});

    		this.setState({ addrPredictions: items });
    		success();
    	};
    	predictionGetSuccess = predictionGetSuccess.bind(this);

		locationServices.getPlacePredictions(request, predictionGetSuccess);
	}

	changeLanguage() {
		locationServices.loadLocationServices();
		this.initiateAddrPredictions();
	}

	placeIdParseError(placeId) {
		var message = `Could not parse address for place ID ${placeId}. Use https://developers.google.com/maps/documentation/javascript/examples/geocoding-place-id to debug. \n\n Customer Information: ${JSON.stringify(this.retrieveAddrDataFromState())}`
		
		emailjs.send("default_service", "bug_report", { message: message});
	}

	initiateAddrPredictions() {
		if (!this.state.placeId) return [];

		function retrieveSuccess(data) {
			this.setState({
				addrPredictions: [{
					id: this.state.placeId,
					caption: $TInject(92, [data.address, data.city, data.territory, data.country])	
				}]
			});
		};
		retrieveSuccess = retrieveSuccess.bind(this);

		function retrieveFail() {
			this.setState({
				addrPredictions: [{
					id: this.state.placeId,
					caption: $T(91) // Address not found.
				}]
			});

			this.placeIdParseError(this.state.placeId);
		};
		retrieveFail = retrieveFail.bind(this);

		locationServices.retrieveAddrObjForPlaceId(this.state.placeId, false, retrieveSuccess, retrieveFail);

		return [{
			id: this.state.placeId,
			caption: ""
		}]
	};

	onchange(obj) {
		var key = "";
		var wasValidationErrors = this.state.validationErrors;
		var validationFn;

		if (obj.postal_code || obj.postal_code == "") {
			this.postalCodeLocation = undefined;
			clearTimeout(this.geoCodeRequest);

			if(obj.postal_code.length > 3) {
				this.geoCodeRequest = setTimeout((function() {
					this.geoCodePostalCode(obj.postal_code);
				}).bind(this), 700);
			}
		}

		for (key in obj) {
			validationFn = validation.shippingAddr[key];

			if (!validationFn) continue;

			if (validationFn(obj[key].trim()) === true) delete wasValidationErrors[key];
		}

		if (this.state.hasStarted === false) {
			gtag('event', 'begin_checkout', {
				items: beachHut.order.purchases.map(function(purchase) { return { id: purchase.variant.id, quantity: purchase.quantity } })
			});
		}

		this.setState(Object.assign({ hasStarted: true }, obj, { validationErrors: wasValidationErrors }));
	}

	setSameAsBilling () {
		this.setState({
			sameAsBilling: !this.state.sameAsBilling
		})
	}

	render() {
		if (locationServices.language !== locale.language) this.changeLanguage();
		
		return (
			<div className={styles["main"]}>
				<div className={formStyles["header"]}>{ $T(10) /* Shipping Address*/ }</div>
				<form autoComplete={"on"}>
					<InputUnderline 
						dataKey={"first_name"}
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="260px" 
						placeholder={$T("1") /* First Name */ }
						autocomplete={"fname"}
					/> 
					<InputUnderline 
						dataKey={"last_name"} 
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="340px"
						placeholder={$T("2") /* Last Name */}
						autocomplete={"lname"}
					/>
					<InputUnderline 
						dataKey={"email"} 
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="610px"
						placeholder={$T(18) /* Email */} 
						autocomplete={"email"}
					/>
					<InputUnderline 
						dataKey={"phone"} 
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="380px"
						placeholder={$T(17) /* Phone (optional) */}
						autocomplete={"dayphone"}
					/>
					<InputUnderline 
						dataKey={"postal_code"} 
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="220px"
						placeholder={$T("8") /* Postal Code */}
						upperCase={ true }
						autocomplete={"zip"}
						noSpace={true}
						alphaNumeric={true}
					/>
					<InputTypeAhead 
						dataKey={"placeId"}
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						selectedID={ this.state.placeId || "" }
						onchange={ this.onchange.bind(this) }
						items={ this.state.addrPredictions }
						refreshItems={ this.refreshAddrPredictions.bind(this) }
						inputWidth="610px"
						placeholder={ $T("107") /* Select Address */ } 
						notice={ $T("86") /* Enter postal/zip code to narrow results. */ }
						emptyMessage={ $T("88") }
					/>
					<InputUnderline
						dataKey={"apt"} 
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="150px"
						placeholder={$T("5") /* Apt, Suite (opt) */}
						autocomplete={"addresss2"} 
					/>
					<InputUnderline
						dataKey={"company"}
						data={ this.state }
						validationErrors={ this.state.validationErrors }
						onchange={ this.onchange.bind(this) }
						inputWidth="450px"
						placeholder={$T("9") /* Company */}
						autocomplete={"company"} 
					/>
				</form>
				<Checkbox 
					caption={ $T(37) /* Billing address same as shipping address? */ }
					checked={ this.state.sameAsBilling }
					onclick = { this.setSameAsBilling.bind(this) }
				/>
				<FormNavigation 
					navigateForward={ this.navigateForward.bind(this) }
					isProcessing={ this.state.isProcessing }
				/>
			</div>
		)
	}
}

export default ShippingAddrForm