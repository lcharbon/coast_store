import React from 'react';
import { hot } from 'react-hot-loader'
import beachHut from '../../main/BeachHut.js';
import settings from '../../settings/settings.json';
import Icons from '../../support/Icons.js';
import styles from './OverlayPurchase.css';
import Overlay from '../Overlay/Overlay.js';
import {$T, $TInject} from '../../support/translations.js';
import OverlayNavigation from '../OverlayNavigation/OverlayNavigation.js';
import ProductOverview from '../ProductOverview/ProductOverview.js';
import TabSizing from '../TabSizing/TabSizing.js';
import TabFAQ from '../TabFAQ/TabFAQ.js';
import TabReviews from '../TabReviews/TabReviews.js';

class OverlayPurchase extends Overlay {
	constructor(props, context) {
		super();

		this.state = {
			currentVariant: props.purchase.variant,
			quantity: props.purchase.quantity || 1,
			selectedTab: ProductOverview,
			isProcessing: false
		};

		this.purchase = props.purchase;
	}

	viewReviews() {
		this.selectTab(TabReviews);
	}

	onOverlayClick(event) {
		if (this.state.isProcessing) return;
		super.onOverlayClick(event);
	}

	onCloseClick(event) {
		if (this.state.isProcessing) return;
		super.onCloseClick();
		gtag('config', settings.gaid, {'page_path': '/main'});
	}

	selectTab(tabComponent) {
		this.setState({
			selectedTab: tabComponent
		})
	}

	setCurrentVariant(variant) {
		var matchedPurchase = this.matchPurchase(variant);

		this.setState({
			currentVariant: variant
		})

		if (matchedPurchase) this.setCurrentPurchase(matchedPurchase);
	}

	setQuantity(value) {
		if (Number.isNaN(value)) return;	
		
		this.setState({
			quantity: value
		})

	}

	matchPurchase(variant) {
		var matchedPurchase;

		beachHut.order.purchases.forEach((function(purchase) {
			if (purchase.variant.id == variant.id) {
				matchedPurchase = purchase;
			}
		}).bind(this))

		return matchedPurchase;
	}

	setCurrentPurchase(purchase) {
		this.purchase = purchase;

		this.setQuantity(purchase.quantity);
	}

	addPurchase() {
		var data = {};
		var targetPurchase = (this.purchase.quantity && this.matchPurchase(this.purchase.variant)) || this.matchPurchase(this.state.currentVariant) || this.purchase;

		if (!this.state.quantity) return;

		function onaddsuccess() {
			this.props.closeOverlay();

			gtag('event', 'add_to_cart', { items: [{
				id: targetPurchase.variant.id,
				name: targetPurchase.variant.product.name,
				variant: targetPurchase.variant.color + " " + targetPurchase.variant.size
			}] });
		};
		onaddsuccess = onaddsuccess.bind(this);

		function onaddfail(error) {
			this.setState({ isProcessing: false });
		};
		onaddfail = onaddfail.bind(this);
		
		if (this.props.purchase.order.isComplete) {
			return this.displayCompletePrompt();
		}

		this.setState({ isProcessing: true });

		data.quantity = this.state.quantity;
		data.variant = this.state.currentVariant;

		targetPurchase.save(data, onaddsuccess, onaddfail);
	}

	displayCompletePrompt() {
		var promptButtons = [
			{
				caption: $T(103), /* Cancel*/
			},
			{
				caption: $T(99), /* New Order */
				onclick: (function() {
					beachHut.resetOrder();
					
					this.props.purchase.order = beachHut.order;
					this.addPurchase();
				}).bind(this)
			}
		]

		beachHut.ui.displayPrompt(
			$T(99), /* New Order */
			$T(104) /* Would you like to create a new order with this product in it? */,
			promptButtons
		);
	}

	addButtonCaption() {
		if (this.props.purchase.order.isComplete === true) return  $T(99); /* New Order */
		if (this.props.purchase.quantity > 0) return $T(30); /* Update Order */

		return $T(24); /* Add To Order */ 
	}

	titleBarContent() {
		return (
			<div className={ styles["navigation"] }>
				<OverlayNavigation
					selectTab={ this.selectTab.bind(this) }
					tabs={[
						{
							title: $T(125), // Overview
							component: ProductOverview,
							selected: this.state.selectedTab == ProductOverview
						},
						{
							title: $T(126), // Sizing
							component: TabSizing,
							selected: this.state.selectedTab == TabSizing
						},
						{
							title: $T(132), // Reviews
							component: TabReviews,
							selected: this.state.selectedTab == TabReviews
						}
						/*
						{
							title: $T(127), //FAQ
							component: TabFAQ,
							selected: this.state.selectedTab == TabFAQ
						}
						*/
					]}
				/>
			</div>
		)
	}

	content() {
		var SelectedTab = this.state.selectedTab
		
		return (
			<div className={ styles["main"] }>
				<div className={ styles["tab-content"] }>
					<SelectedTab
						purchase={ this.props.purchase }
						setQuantity={ this.setQuantity.bind(this) }
						setCurrentVariant={ this.setCurrentVariant.bind(this) }
						currentVariant={ this.state.currentVariant }
						quantity={ this.state.quantity }
						viewReviews={ this.viewReviews.bind(this) }
					/>
				</div>
				{
					!this.state.isProcessing && <div className={ styles["add-button"] } onClick={ this.addPurchase.bind(this) } >
						<div className={ styles["add-button-plus"] }>
							&#43;
						</div>
						<div className={ styles["add-button-caption"] }>
							{ this.addButtonCaption() }
						</div>
					</div>
				}
				{
					this.state.isProcessing && <div className={ styles["add-button-processing"] } onClick={ this.addPurchase.bind(this) } >
						<div className={ styles["add-button-caption"] }>
							{ $T(66) /* Processing */ }
						</div>
					</div>
				}
			</div>
		)
	}
}

export default hot(module)(OverlayPurchase);