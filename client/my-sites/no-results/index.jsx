/** @format */
/**
 * External dependencies
 */
import React from 'react';

const NoResults = React.createClass( {
	getDefaultProps: function() {
		return {
			text: 'No results',
			image: false,
		};
	},

	render: function() {
		return (
			<div className="no-results">
				{ this.props.image ? <img className="no-results__img" src={ this.props.image } /> : null }
				<span>{ this.props.text }</span>
			</div>
		);
	},
} );

export default NoResults;
