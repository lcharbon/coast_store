import React from 'react';
import styles from './OverlayPolicies.css';
import settings from '../../settings/settings.json';
import Icons from '../../support/Icons.js';
import { $T, $TInject } from '../../support/translations.js';
import Overlay from '../Overlay/Overlay.js';

class OverlayPolicies extends Overlay {
	constructor(props, context) {
		super(props, context);

		gtag('config', settings.gaid, {'page_path': '/policies'});
	}

	content() {
		return (
			<div className={ styles["content"] }>
				<div className={ styles["logo"] }>
					{ Icons.insert('logo') }
				</div>
				<div className={ styles["inner-content"] }>
					<h1 className={ styles["title"] }>
						{ $T(47) /* Policies */}
					</h1>
					<div className={ styles["text-body"]}>
						<div className={ styles["section"] }>
							<h2 className={ styles["section-title"] }>
								{ $T(122) /* Exchange */}
							</h2>
							<div className={ styles["description"] }>
								{ $T(123) }
							</div>
						</div>
						<div className={ styles["section"] }>
							<h2 className={ styles["section-title"] }>
								{ $T(49) /* Return */}
							</h2>
							<div className={ styles["description"] }>
								{ $T(124) }
							</div>
						</div>
					</div>
				</div>
			</div>
		) 
	}
}

export default OverlayPolicies