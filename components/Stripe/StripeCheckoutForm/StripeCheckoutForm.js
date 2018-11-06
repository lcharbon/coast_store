import React, { Component } from 'react'
import {injectStripe} from 'react-stripe-elements';
import beachHut from '../../../main/BeachHut.js'
import InputUnderline from '../../Inputs/InputUnderline/InputUnderline.js';
import CardSection from '../StripeCardSection/StripeCardSection.js';
import InputStripeCardNumber from "../InputStripeCardNumber/InputStripeCardNumber.js";
import InputStripeExpiry from "../InputStripeExpiry/InputStripeExpiry.js";
import InputStripeCVV from "../InputStripeCVV/InputStripeCVV.js";
import FormNavigation from "../../FormNavigation/FormNavigation.js";
import styles from './StripeCheckoutForm.css';
import { $T, $TInject } from '../../../support/translations.js';

class StripeCheckoutForm extends Component {

	validation = {
		cardHolder: function(value) {
			if (value && value.trim()) return true;
			else return $TInject(111, [$T(34)]);
		},
		cardNumber: function(value) {
			if (value !== true) return $TInject(116, [$T(33)]);
			else return true;
		},
		cardExpiry: function(value) {
			if (value !== true) return $TInject(116, [$T(117)]);
			else return true;
		},
		cardCVV: function(value) {
			if (value !== true) return $TInject(116, [$T(36)]);
			else return true;
		}
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			isProcessing: false,
			validationErrors: {},
			cardHolder: ""
		};
	}

	onchange(obj) {
		var key = "";
		var wasValidationErrors = this.state.validationErrors;
		var validationFn;

		for (key in obj) {
			validationFn = this.validation[key];

			if (!validationFn) continue;

			if (validationFn(obj[key]) === true) delete wasValidationErrors[key];
		}

		this.setState(obj);
		this.setState({ validationErrors: wasValidationErrors });
	}

	validateForm() {
		var key = "";
		var output;
		var validationErrors = {};
		
		for (key in this.validation) {
			output = this.validation[key](this.state[key]);
			if (output !== true) validationErrors[key] = output;
		}

		this.setState({validationErrors: validationErrors});

		return Object.keys(validationErrors).length === 0;
	}

	oncompleteclick = (ev) => {
		function transactionFail() {
			beachHut.ui.displayMessage(
				$T(109), /* Transaction Failed */
				$T(110) /* Could not complete transaction. Please try again. An email has been sent to help@coastbeachwear.com notifying us of this. */
			);

			this.setState({ isProcessing: false })
		};
		transactionFail = transactionFail.bind(this);

		ev.preventDefault();
		
		if (this.props.order.countUnits() < 1) {
			beachHut.ui.displayMessage(
				$T(78), /* Order Empty */
				$T(77) /* Add item to order to proceed. */
			);
			return;
		}

		if (!this.validateForm()) return;

		this.setState({isProcessing: true})
		
		this.props.stripe.createToken({ name: this.state.cardHolder }).then(({ token }) => {
			this.props.navigateForward(token, undefined, transactionFail);
		});
	}

	render() {
		return (
			<form onSubmit={ this.handleSubmit }>
				<InputUnderline 
					dataKey={ "cardHolder" } 
					data={ this.state }
					onchange={ this.onchange.bind(this) }
					inputWidth="500px" 
					placeholder={$T("34") /* Name On Card */}
					autocomplete={"cc-name"}
					validationErrors={ this.state.validationErrors }
				/>
				<InputStripeCardNumber
					dataKey={ "cardNumber" }
					onchange={ this.onchange.bind(this) }
					inputWidth="360px" 
					placeholder={$T("33") /* Card Number */ }
					validationErrors={ this.state.validationErrors }
				/>
				<InputStripeExpiry
					dataKey={ "cardExpiry" } 
					onchange={ this.onchange.bind(this) }
					inputWidth="130px"
					placeholder={$T("35") /* MM/YY */}
					validationErrors={ this.state.validationErrors }
				/> 
				<InputStripeCVV
					dataKey={ "cardCVV" }
					onchange={ this.onchange.bind(this) }
					inputWidth="140px"
					placeholder={$T("36") /* CVV */}
					validationErrors={ this.state.validationErrors }
				/>
				<FormNavigation
					navigateBackward = { this.props.navigateBackward }
					oncomplete = { this.oncompleteclick.bind(this) }
					isProcessing={ this.state.isProcessing }
					validationErrors={ this.props.validationErrors }
				/>
			</form>
		);
	}	
}

export default injectStripe(StripeCheckoutForm);