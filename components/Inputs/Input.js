import React, { Component } from 'react'
import styles from './Input.css'
import Icons from '../../support/Icons.js'

class Input extends Component {

	static type = "text";
	styles = styles;

	constructor(props, context) {
		super(props, context)
		this.state = {
			dataKey: props.dataKey
		}
	}

	formatText(value) {
		var formatedValue = value;

		if (this.props.noSpace === true ) {
			formatedValue = formatedValue.replace(/ /g,'');
		}
		
		if (this.props.alphaNumeric === true){
			formatedValue = formatedValue.replace(/[\W_]+/g,"");
		}
		
		if (this.props.upperCase === true) formatedValue = formatedValue.toUpperCase();

		return formatedValue
	}

	onchange(event) {
		var value = event.target.value;
		var newData = {}

		event.preventDefault();

		newData[this.props.dataKey] = this.formatText(value)
		this.props.onchange(newData);
	}
	
	formatedValue() {
		return this.formatText(this.props.data[this.state.dataKey]);
	}

	hasContent() {
		return !!this.props.data[this.state.dataKey];
	}

	inputElement() {
		return (
			<input 
				className={ this.hasContent()? this.styles["input-filled"] : this.styles["input"] } 
				placeholder={ this.props.placeholder }
				onChange={ this.onchange.bind(this) } 
				style={{ width: this.props.inputWidth }}
				type= { this.constructor.type }
				value= { this.formatedValue() }
				name={ this.props.autocomplete }
				autoComplete={ this.props.autocomplete? "on" : "new-password" }
			/>
		)
	}

	render() {
		var isValid = !(this.props.validationErrors && this.props.validationErrors[this.props.dataKey])
		return (
			<div className={ this.styles["main"] }>
				<div className={ this.styles["text-area"] }>
					<label className={ this.hasContent()? (isValid? this.styles["placeholder"]: this.styles["placeholder-invalid"]): this.styles["placeholder-hidden"] }>{ this.props.placeholder }</label>
					{ this.inputElement() }
				</div>
				<div className={ this.styles["error-section"] }>
					<div className={ this.styles["error-message"] }>
						{ this.props.validationErrors && this.props.validationErrors[this.props.dataKey] }
					</div>
				</div>
			</div>
		)
	}
}

export default Input