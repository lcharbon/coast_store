import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import styles from './HelpButton.css'
import Icons from '../../support/Icons.js'
import beachHut from '../../main/BeachHut.js'

class helpButton extends Component {
	
	constructor(props, context) {
		super(props, context)
		this.state = {
			active: false
		}
	}

	closeCallBack() {
		this.setState({
			active: false
		})
	}

	onclick() {
		if (!this.state.active) {
			beachHut.ui.displayHelpOverlay(this.closeCallBack.bind(this))
		} else {
			beachHut.ui.closeOverlay();
			this.closeCallBack();
		}

		this.setState({
			active: !this.state.active
		});
	}

	mainCssClass() {
		return this.state.active? `${styles["main"]} ${styles["active"]}` : styles["main"]; 
	}

	render() {
		return (
			<div className={ this.mainCssClass() } onClick={ this.onclick.bind(this) }>
				<div className={ styles["help-icon"] }>
					{ Icons.insert('help') }
				</div>
			</div>
		)
	}
}

export default hot(module)(helpButton)