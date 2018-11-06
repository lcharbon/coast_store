import React, { Component } from 'react';
import styles from './FeaturesExhibit.css';
import $T from '../../support/translations.js';
import Icons from '../../support/Icons.js';

class FeaturesExhibit extends Component {

	icons = ["feature_quick_dry", "feature_casual_look", "feature_classy_and_discreet", "feature_low_drag", "feature_liberating_fit", "feature_durable_construction", "feature_full_tan", "feature_emphasize_quads", "feature_elongates_the_figure"];
	featureTitles = {};

	constructor(props, context) {
		super(props, context)

		this.state = {
			showBack: false,
			showForward: true
		}
	}

	refreshFeatureTitles() {
		this.featureTitles = {
			feature_emphasize_quads: $T(136),
			feature_attention_to_detail: $T(137),
			feature_full_tan: $T(138),
			feature_casual_look: $T(139),
			feature_liberating_fit: $T(140),
			feature_classy_and_discreet: $T(141),
			feature_low_drag: $T(142),
			feature_durable_construction: $T(143),
			feature_quick_dry: $T(144),
			feature_elongates_the_figure: $T(145)
		}
	}

	onScrollBackClick() {
		var slideDOM = this.refs.slider;
		var scrollInterval;
		var scrollCounter = 0;

		scrollInterval = setInterval(() => {
			slideDOM.scrollLeft -= 25;
			scrollCounter++;

			if (scrollCounter === 12) {
				window.clearInterval(scrollInterval);
			}
		}, 16);
		this.onScroll();
	}

	onScrollForwardClick() {
		var slideDOM = this.refs.slider;
		var scrollInterval;
		var scrollCounter = 0;

		scrollInterval = setInterval(() => {
			slideDOM.scrollLeft += 25;
			scrollCounter++;

			if (scrollCounter === 12) {
				window.clearInterval(scrollInterval);
			}
		}, 16);

		this.onScroll();
	}

	onScroll(event) {
		var slideDOM = this.refs.slider;
		var maxScrollLeft = slideDOM.scrollWidth - slideDOM.clientWidth;
		
		this.setState({
			showBack: Boolean(slideDOM.scrollLeft > 0),
			showForward: Boolean(slideDOM.scrollLeft < maxScrollLeft)
		});

		gtag('event', 'scroll', {
			'event_category': 'Features',
			'event_label': 'Scroll Features'
		});
	}

	renderIcon(name) {
		return (
			<div 
				className={ styles["feature"] }
				key={ name }
			>
				<div className={ styles["icon-container"] }>
					{ Icons.insert(name) }
				</div>
				<div className={ styles["icon-title"] }>
					{ this.featureTitles[name] }
				</div>
			</div>
		)
	}

	render() {
		this.refreshFeatureTitles();

		return (
			<div className={ styles["main"] }>
				<div className={ styles["inner"] }>
					<div 
						ref="slide"
						className={ styles["slide"] }
						onScroll={ this.onScroll.bind(this) }
					>
						<div 
							className={ styles["slider"] }
							ref="slider"
						>
							{ this.icons.map((name) => { return this.renderIcon(name) }) }
						</div>
					</div>
				</div>
				{
					this.state.showBack && <div className={ styles["back-control-container"] }>
						<div 
							className={ styles["back-scroll-control"] }
							onClick={ this.onScrollBackClick.bind(this) }
						>
							<div className={ styles["arrow-container"] }>
								{ Icons.insert("next_arrow_outline") }
							</div>
						</div>
					</div>
				}
				{
					this.state.showForward && <div className={ styles["forward-control-container"] }>
						<div 
							className={ styles["forward-scroll-control"] }
							onClick={ this.onScrollForwardClick.bind(this) }
						>
							<div className={ styles["arrow-container"] }>
								{ Icons.insert("next_arrow_outline") }
							</div>
						</div>
					</div>
				}

			</div>
		)
	}
}

export default FeaturesExhibit