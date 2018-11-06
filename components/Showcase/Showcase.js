import React, { Component } from 'react'
import { hot } from 'react-hot-loader'
import styles from './Showcase.css'
import Icons from '../../support/Icons.js'
import ParallaxImage from '../ParallaxImage/ParallaxImage.js'
import ProductDisplay from '../ProductDisplay/ProductDisplay.js'
import VideoPlayer from '../VideoPlayer/VideoPlayer.js'
import $T from '../../support/translations.js'

class Showcase extends Component {
	constructor(props, context) {
		super(props, context);
	}

	render() {
		return (
			<div className={ styles["main"] }>
				<ParallaxImage />
				{ Icons.insert('logo', styles.logo) }
				<div className={ styles["video-section"] }>
					<div className={ styles["video-container-left"] }>
						<VideoPlayer 
							title={$T(134)}
							thumbnail="media/product_knowledge_video_thumbnail.jpg"
							src="media/genesis_product_knowledge.mp4" 
						/>
					</div>
					<div className={ styles["video-container-right"] }>
						<VideoPlayer
							title={$T(135)}
							thumbnail="media/making_of_video_thumbnail.jpg"
							src="media/genesis_making_of.mp4"
						/>

					</div>
				</div>
				<div className={ styles["product-showcase"] }>
					<img src={ "/media/product/torso.png" } className={ styles["torso"] } />
					{
						this.props.product.getVariantsBySize("m").map(function(variant, index) {
							return <ProductDisplay index={index} key={ variant.id } variant={ variant } />
						})
					}
				</div>
			</div>
		)
	}
}

export default hot(module) (Showcase)