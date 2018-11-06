import React, { Component } from 'react'
import settings from '../../settings/settings.json';
import styles from './TabFAQ.css';
import Icons from '../../support/Icons.js';
import {$T, $TInject} from '../../support/translations.js';


class TabFAQ extends Component {
	constructor(props, context) {
		super();

		gtag('config', settings.gaid, {'page_path': '/faq'});
	}

	render() {
		return (
			<div className={ styles["content"] }>
				<div className={ styles["inner-content"] }>
					<h1 className={ styles["title"] }>
						{ $T(127) /* Sizing */}
					</h1>
					<div className={ styles["text-body"]}>
						<div className={ styles["section"] }>
							<div className={ styles["description"] }>
								{ $T(129) }
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default TabFAQ