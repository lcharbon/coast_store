import React, { Component } from 'react'
import styles from './OverlayNavigation.css'
import NavigationTab from './NavigationTab/NavigationTab.js'

class OverlayNavigation extends Component {
	constructor(props, context) {
		super(props, context)
	}

	selectedTab() {
		return this.props.tabs.find(function(tab) { return tab.selected === true }).component
	}

	navigationTabClick(component) {
		this.props.selectTab(component);
	}

	render() {
		var barElements = []
		var tab;

		this.props.tabs.forEach(function(tab, index, tabs) {
			barElements.push(tab);

			if (index != tabs.length - 1) {
				barElements.push("/");
			}
		})

		return (
			<div className={ styles["main"] }>
				<div className={ styles["bar"] }>
					{
						barElements.map((function(barElement, index) {
							return (
								<div className={ styles["bar-element"] } key={index}>
									{
										barElement == "/" && 
											<div className={ styles["separator"] }>
												{ "/" }
											</div> 
										||
											<NavigationTab 
												title= { barElement.title }
												component= { barElement.component }
												selected= { barElement.component == this.selectedTab() }
												navigationTabClick= { this.navigationTabClick.bind(this) }
											/>
									}
								</div>

							)
						}).bind(this))
					}
				</div>
			</div>
		)
	}
}

export default OverlayNavigation