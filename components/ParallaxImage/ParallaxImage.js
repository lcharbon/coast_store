import React, { Component } from 'react';
import styles from './ParallaxImage.css';
import settings from '../../settings/settings.json';

class ParallaxImage extends Component {
	static scrollingElement = window.document.body;
	static containerHeight = 680;
	static scrollMultiple = 1.30;

	constructor(props) {
		super(props);

		this.state = {
			translateY: 0,
		};
	}

	componentDidMount() {
		this.constructor.scrollingElement.addEventListener('scroll', this.onScroll.bind(this));
	}
	
	componentWillUnmount() {
		this.constructor.scrollingElement.removeEventListener('scroll', this.onScroll);
	}

	onScroll(e) {
		var position = this.constructor.scrollingElement.scrollTop;
		var scrollArea = this.constructor.containerHeight * this.constructor.scrollMultiple - this.constructor.containerHeight;

		this.setState({
			translateY: scrollArea * position / this.constructor.containerHeight
		});
	}

	render() {
		var translateY = 0;
		return (
			<div className={ styles["main"] }>
				<div
					className={ styles["inner"] } 
					style={{
						height: `${this.constructor.containerHeight * this.constructor.scrollMultiple}px`,
						transform: `translate(0, ${this.state.translateY}px)`,
						backgroundImage:`url('${ settings.bannerImage }')`,
						backgroundSize: "cover"
					}}
				>
				</div>
			</div>
		);
	}
}

export default ParallaxImage;