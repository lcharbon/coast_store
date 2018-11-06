import React, { Component } from 'react'
import styles from './VideoPlayer.css'
import Icons from '../../support/Icons.js'

class VideoPlayer extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			isPlayer: false
		}
	}

	playhandler() {
		this.setState({ isPlayer: true })

		gtag('event', 'play', {
			'event_category': 'Videos',
			'event_label': this.props.title
		});
	}

	onPlaying() {

	}

	renderPlaceHolder() {
		return (
			<div>
				<img 
					className={ styles["video-thumbnail"] }
					height="160"
					src={ this.props.thumbnail }
				/>
				<div 
					className={ styles["play-button"] }
					onClick={ this.playhandler.bind(this) }
				>
					<div className={ styles["play-icon"] }>
						
					</div>
				</div>

			</div>
		)
	}

	renderPlayer() {
		return (
			<video 
				src= { this.props.src }
				height="160"
				width="284"
				onPlaying={ this.onPlaying.bind(this) }
				className={ styles["video-player"] }
				autoplay="autoplay"
				controls
			/>
		)
	}

	render() {
		return (
			<div className={ styles["main"] }>
				{ this.state.isPlayer && this.renderPlayer() || this.renderPlaceHolder() }
				<div className={ styles["title-section"] }>
					{ this.props.title }
				</div>
			</div>
		)
	}
}

export default VideoPlayer