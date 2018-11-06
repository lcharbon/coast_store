import React from 'react';
import { hot } from 'react-hot-loader'
import settings from '../../settings/settings.json';
import styles from './OverlayLastChance.css';
import { $T, $TInject } from '../../support/translations.js';
import OverlayHelp from '../OverlayHelp/OverlayHelp.js';


class OverlayLastChance extends OverlayHelp {
	
	static backgroundColor = "primary";

	constructor(props, context) {
		super(props, context);
	}

	fireAnalyticsEvent() {
		gtag('config', settings.gaid, {'page_path': '/last_chance'});
	}

	titleBarContent() {
		return (
			<div className={ this.styles["title"]}>
				{ $T(108) /* Before you go... */ }
			</div>
		);
	}
}

export default hot(module) (OverlayLastChance)