import React, { Component } from 'react'
import styles from './NavigationTab.css'

class NavigationTab extends Component {
	constructor(props, context) {
		super(props, context)
	}

	handleClick() {
		this.props.navigationTabClick(this.props.component);
	}

	render() {
		return (
			<div 
				className={ this.props.selected && styles["main-selected"] || styles["main"]}
				onClick={ this.handleClick.bind(this) }
			>
				{ this.props.title }
			</div>
		)
	}
}

export default NavigationTab