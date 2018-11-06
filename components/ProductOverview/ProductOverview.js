import React, { Component } from 'react'
import styles from './ProductOverview.css';
import settings from '../../settings/settings.json';
import Icons from '../../support/Icons.js';
import {$T, $TInject} from '../../support/translations.js';
import locale from '../../support/locale.js'
import ImageCarousel from '../ImageCarousel/ImageCarousel.js';
import SizePicker from '../SizePicker/SizePicker.js';
import QuantityPicker from '../QuantityPicker/QuantityPicker.js';

class ProductOverview extends Component {
	constructor(props, context) {
		super();

		gtag('config', settings.gaid, {'page_path': '/purchase'});
	}

	renderStar(e, index) {
		return (
			<div className={ styles["star"] } key={index}>
				{ Icons.insert("star") }
			</div>
		)
	}

	render() {
		var purchase = this.props.purchase;
		var variant = this.props.currentVariant;
		var product = variant.product;

		return (
			<div className={ styles["content"] }>
				<div className={ styles["product-info"] }>
					<div className={ styles["title-container"] }>
						<div className={ styles["title"] }>
							{ product.name }
						</div>
						<div className={ styles["subtitle"] }>
							{ $TInject(29, [product.version])}&nbsp;{$T("code" + variant.color) }
						</div>
					</div>
					<div className={ styles["details"] }>
						<div className={ styles["rating-container"] }>
							<div className={ styles["rating"] }>
								{
									[...Array(5)].map(this.renderStar)
								}
							</div>
							<div 
								className={ styles["view-reviews-button"] }
								onClick={ this.props.viewReviews }
							>
								{ $T(133) /* View Reviews */ }
							</div>
						</div>
						<div className={ styles["price"] }>
							{ $TInject(27, [product.localPrice().toFixed(2)]) }
						</div>
						<div className={ styles["currency"] }>
							{ locale.currency.toUpperCase() }
						</div>
						<SizePicker 
							sizeVariants={ product.getVariantsByColor(variant.color) }
							currentVariant={ variant }
							setCurrentVariant={ this.props.setCurrentVariant }
						/>
						<div className={ styles["detail"] }>
							<div className={ styles["description"] }>
								{ $T(119) }
							</div>
						</div>
						<div className={ styles["quantity-section"] }>
							<div className={ styles["quantity-caption"] }>
								{ $T(31) /*How Many do you want? */}
							</div>
							<div className={ styles["quantity-picker-container"] }>
								<QuantityPicker quantity={ this.props.quantity } setQuantity={ this.props.setQuantity } /> 
							</div>
						</div>
					</div>
				</div>
				<div className={ styles["carousel-container"] }>
					<ImageCarousel images={ variant.images }/>
				</div>
			</div>
		)
	}
}

export default ProductOverview