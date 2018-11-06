import React, { Component } from 'react'
import settings from '../../settings/settings.json';
import styles from './TabSizing.css';
import Icons from '../../support/Icons.js';
import {$T, $TInject} from '../../support/translations.js';


class TabSizing extends Component {
	constructor(props, context) {
		super();

		gtag('config', settings.gaid, {'page_path': '/sizing'});
	}

	render() {
		return (
			<div className={ styles["content"] }>
				<div className={ styles["inner-content"] }>
					<h1 className={ styles["title"] }>
						{ $T(126) /* Sizing */}
					</h1>
					<div className={ styles["text-body"]}>
						<div className={ styles["section"] }>
							<div className={ styles["description"] }>
								{ $T(128) }
							</div>
							<div className={ styles["table-container"]}>
								<table>
									<tbody>
										<tr>
											<td className={ styles["size-label"] }>
												{ $T("s_full") }
											</td>
											<td className={ styles["size-measurement"] }>
												28-30
											</td>
										</tr>
										<tr>
											<td className={ styles["size-label"] }>
												{ $T("m_full") }
											</td>
											<td className={ styles["size-measurement"] }>
												31-32
											</td>
										</tr>
										<tr>
											<td className={ styles["size-label"] }>
												{ $T("l_full") }
											</td>
											<td className={ styles["size-measurement"] }>
												33-35
											</td>
										</tr>
										<tr >
											<td className={ styles["size-label"] }>
												{ $T("xl_full") }
											</td>
											<td className={ styles["size-measurement"] }>
												36-38
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default TabSizing