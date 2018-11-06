import React, { Component } from 'react'
import settings from '../../settings/settings.json';
import reviews from '../../settings/reviews.json';
import styles from './TabReviews.css';
import Icons from '../../support/Icons.js';
import {$T, $TInject} from '../../support/translations.js';
import ReviewDisplay from '../ReviewDisplay/ReviewDisplay.js';


class TabReviews extends Component {
	constructor(props, context) {
		super();

		gtag('config', settings.gaid, {'page_path': '/reviews'});
	}

	render() {
		return (
			<div className={ styles["content"] }>
				<div className={ styles["reviews-container"] }>
					<h1 className={ styles["title"] }>
						{ $T(132) /* Reviews */}
					</h1>
					<div className={ styles["review-list"] }>

						{
							reviews.map(function(review, index) {
								return <ReviewDisplay {...review} key={index} />
							})
						}
					</div>
				</div>
			</div>
		)
	}
}

export default TabReviews