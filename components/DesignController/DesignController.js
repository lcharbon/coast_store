import React, { Component } from 'react';
import styles from './DesignController.css';
import settings from '../../settings/settings.json';
import beachHut from '../../main/BeachHut.js'

class DesignController extends Component {

	constructor(props, context) {
		super(props, context)
	}

	fileHandler(event) {
		var file = event.target.files[0];
		var reader = new FileReader();

		reader.onload = function() {
			settings.bannerImage = reader.result;
			beachHut.ui.setState({});
		}

		reader.readAsDataURL(file);
	}

	render() {
		return (
			<div className={ styles["main"] }>
				<input type="file" onChange={ this.fileHandler.bind(this) }>
				</input>
			</div>
		)
	}
}

export default DesignController