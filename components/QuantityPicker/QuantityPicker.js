import React, { Component } from 'react'
import styles from './QuantityPicker.css'
import Icons from '../../support/Icons.js'
import {$T, $TInject} from '../../support/translations.js'

class QuantityPicker extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			inputValue: this.props.quantity
		}
	}

	decrementQuantity() {
		var wasQuantity = this.props.quantity;

		if (wasQuantity < 2) return
		
		this.props.setQuantity(--wasQuantity);
	}

	incrementQuantity() {
		var wasQuantity = this.props.quantity;

		this.props.setQuantity(++wasQuantity);
	}

	onchange(event) {
		var value = event.target.value;

		event.preventDefault();
		
		if (value && Number.isNaN(parseInt(value))) return;	
		
		this.props.setQuantity(value);

	}

	onblur() {
		if (!this.props.quantity) {
			this.props.setQuantity(1);
		}
	}

	render() {
		return (
			<div className={ styles["main"] }>
				<div className={ styles["minus"] } onClick={ this.decrementQuantity.bind(this) }>
					&#45;
				</div>
				<div className={ styles["quantity"] }>
					<input 
						type="number" 
						value={ this.props.quantity } 
						onChange={ this.onchange.bind(this) }
						onBlur={ this.onblur.bind(this) }
					/>
				</div>
				<div className={ styles["plus"] } onClick={ this.incrementQuantity.bind(this) }>
					&#43;
				</div>
			</div>
		)
	}
}

export default QuantityPicker