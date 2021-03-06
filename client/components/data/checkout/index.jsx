/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import CartStore from 'lib/cart/store';
import TransactionStore from 'lib/transaction/store';

var stores = [ TransactionStore, CartStore ];

function getStateFromStores() {
	return {
		transaction: TransactionStore.get(),
		cart: CartStore.get(),
	};
}

const CheckoutData = React.createClass( {
	render: function() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	},
} );

export default CheckoutData;
