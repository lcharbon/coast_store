import React, { Component } from 'react'
import styles from './ReviewDisplay.css'
import Icons from '../../support/Icons.js'
import {$T, $TInject} from '../../support/translations.js'

class ReviewDisplay extends Component {
	constructor(props, context) {
		super(props, context);
	}

	renderStar(e, index) {
		return (
			<div className={ styles["star"] } key={index}>
				{ Icons.insert("star") }
			</div>
		)
	}

	render() {
		return (
			<div className={ styles["main"] }>
				<div className={ styles["heading"] }>
					<img className={ styles["thumbnail"] } src={ this.props.reviewerImg } />
					<div className={ styles["summary"] }>
						<div className={ styles["name"] }>
							{ this.props.reviewer }
						</div>
						<div className={ styles["date"] }>
							{ this.props.date }
						</div>
					</div>
					<div className={ styles["rating"] }>
						{
							[...Array(this.props.rating)].map(this.renderStar)
						}
					</div>
				</div>
				<div className={ styles["review"] }>
					{ this.props.review }
				</div>
				<a className={ styles["link-container"] } href={ this.props.url } target="_blank">
					<div className={ styles["link-caption"] }>
						{ $T(131) /* View On */}
					</div>
					<div className={ styles["link-icon"] }>
						{ Icons.insert('facebook', styles['social-icon']) }
					</div>
				</a>
			</div>
		)
	}
}

export default ReviewDisplay