import React, { Component } from 'react';
import formStyles from '../CheckoutForm/CheckoutForm.css';
import styles from './PaymentForm.css';
import beachHut from '../../main/BeachHut.js';
import $T from '../../support/translations.js';
import Icons from '../../support/Icons.js';
import settings from '../../settings/settings.json';
import {StripeProvider, Elements} from 'react-stripe-elements';;
import InputUnderline from '../Inputs/InputUnderline/InputUnderline.js';
import TotalDetails from '../TotalDetails/TotalDetails.js';
import StripeCheckoutForm from '../Stripe/StripeCheckoutForm/StripeCheckoutForm.js';
import FormNavigation from '../FormNavigation/FormNavigation.js';
import FulfilmentForm from '../FulfilmentForm/FulfilmentForm.js';

class PaymentForm extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			promoCode: "",
			cardHolder: ""
		}

		gtag('config', settings.gaid, {'page_path': '/paymentform'});
	}

	static getTitle() {
		return $T(32) // Payment
	}

	navigateBackward() {
		if (this.props.order.countUnits() > 0) {
			this.props.setCurrentForm(FulfilmentForm);
		} else {
			beachHut.ui.displayMessage(
				$T(114), /* Order Empty */
				$T(77) /* Add item to order to proceed. */
			);
		}
	}

	onchange(obj) {
		this.setState(obj)
	}

	applyPromo() {
		beachHut.ui.displayMessage(
			$T(114), /* Invalid Promo Code */
			$T(115) /* The promo code entered was not found. */
		);
	}

	render() {
		return (
			<div className={ styles["main"] }>
				<div className={ formStyles["header"] }>{ $T(32) /* Payment*/ }</div>
				<div className={ styles["total-details-container"] }>
					<TotalDetails
						addition={ this.props.order.compileAddition() }
						isShippedInterational={ this.props.order.isShippedInterational() }
					/>
				</div>
				<div className={ styles["thank-you"] }>
					<div className={ styles["made-in-canada-icon"] } >
						{ Icons.insert('made_in_canada') }
					</div>
					<div className={ styles["thank-you-caption"] }>
						{ $T("73") /* "Thank you!" */ }
					</div>
				</div>
				<InputUnderline 
					dataKey={ "promoCode" }
					data={ this.state }
					onchange={ this.onchange.bind(this) }
					inputWidth="340px"
					placeholder={$T("68") /* Promo Code */}
				/>
				<div 
					className={ styles["apply-button"] }
					onClick={ this.applyPromo.bind(this) }
				>
					<div className={ styles["caption"] }>
						{ $T("69") /* Apply */ }
					</div>
				</div>
				<StripeProvider apiKey={ settings.stripePublicAPIKey }>
					<Elements
						fonts={ 
							[
							    {
									family: 'quantumrounded',
									src: 'url("https://coastbeachwear.com/fonts/quantumrounded.otf")',
							    }
						  	] 
						}
					>
						<StripeCheckoutForm
							order={ this.props.order }
							card_holder={ this.state.cardHolder }
							navigateBackward={ this.navigateBackward.bind(this) }
							navigateForward={ this.props.order.complete.bind(this.props.order) }
							data={ this.state }
						/>
					</Elements>
				</StripeProvider>
			</div>
		)
	}
}

export default PaymentForm