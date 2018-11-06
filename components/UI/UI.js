import React, { Component } from 'react';
import styles from './UI.css';
import beachHut from '../../main/BeachHut.js';
import settings from '../../settings/settings.json';

import Showcase from '../Showcase/Showcase.js';
import Checkout from '../Checkout/Checkout.js';
import CompleteSummary from '../CompleteSummary/CompleteSummary.js';
import Footer from '../Footer/Footer.js';
import OverlayPurchase from '../OverlayPurchase/OverlayPurchase.js';
import OverlayHelp from '../OverlayHelp/OverlayHelp.js';
import OverlayLastChance from '../OverlayLastChance/OverlayLastChance.js';
import OverlayAbout from '../OverlayAbout/OverlayAbout.js';
import OverlayPolicies from '../OverlayPolicies/OverlayPolicies.js';
import HelpButton from '../HelpButton/HelpButton.js';
import MessageBox from '../MessageBox/MessageBox.js';
import DesignController from '../DesignController/DesignController.js'

class UI extends Component {
	constructor(props, context) {
		super(props, context);
		
		this.state = {
			order: props.order,
			isOrderComplete: false,
			currentOverlay: undefined,
			message: ""
		};

		gtag('config', settings.gaid, {'page_path': '/main'});
	}

	displayMessage(title, message, time) {
		time = time || 3200;

		if (this.state.message) return;

		this.setState({
			message: {
				title: title,
				message: message,
			}
		});

		setTimeout((function() {
			this.setState({ message: undefined });
		}).bind(this), time);
	}

	displayPrompt(title, message, buttons) {
		if (this.state.message) return;

		this.setState({
			message: {
				title: title,
				message: message,
				buttons: buttons
			}
		});
	}

	closeOverlay() {
		this.setState({
			currentOverlay: undefined
		});
	}

	displayHelpOverlay(callback) {
		var overlay;

		callback = callback || function() {};
		
		function onclose() {
			this.closeOverlay();
			callback();
		}
		onclose = onclose.bind(this);

		overlay = (
			<OverlayHelp 
				closeOverlay={ onclose }
			/>
		)

		this.setState({
			currentOverlay: overlay
		});
	}

	displayLastChanceOverlay(callback) {
		var overlay;

		callback = callback || function() {};
		
		function onclose() {
			this.closeOverlay();
			callback();
		}
		onclose = onclose.bind(this);

		overlay = (
			<OverlayLastChance 
				closeOverlay={ onclose }
			/>
		)

		this.setState({
			currentOverlay: overlay
		});
	}

	displayPurchaseOverlay(purchase) {
		var overlay = (
			<OverlayPurchase purchase={ purchase } closeOverlay={ this.closeOverlay.bind(this) } />
		)

		this.setState({
			currentOverlay: overlay
		});
	}

	displayAboutOverlay() {
		this.setState({
			currentOverlay: (
				<OverlayAbout closeOverlay={ this.closeOverlay.bind(this) } />
			)
		});
	}

	displayPolicyOverlay() {
		this.setState({
			currentOverlay: (
				<OverlayPolicies closeOverlay={ this.closeOverlay.bind(this) } />
			)
		});
	}

	render() {
		return (
			<div>
				<Showcase product={ this.props.products[0] }/>
				{ this.state.isOrderComplete? <CompleteSummary order= { this.state.order }/> : <Checkout order= { this.state.order }/> }
				<div 
					className={ styles["detect-navigation"] }
					onMouseEnter={ beachHut.userApprochNavigation.bind(beachHut) }
				>
				</div>
				<Footer 
					isOrderComplete={ this.state.isOrderComplete }
				/>
				{ this.state.currentOverlay }
				<HelpButton />
				{ 
					this.state.message && 
					<MessageBox
						title={ this.state.message.title }
						message={ this.state.message.message }
						buttons={ this.state.message.buttons }
					/> 
				}
				{ settings.designControler == true && <DesignController /> }
			</div>
		)
	};
}

export default UI;