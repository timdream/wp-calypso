/**
 * External dependencies
 *
 * @format
 */

import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { assign, some } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import cartValues from 'lib/cart-values';
import CountrySelect from 'my-sites/domains/components/form/country-select';
import Input from 'my-sites/domains/components/form/input';
import notices from 'notices';
import PaymentBox from './payment-box';
import SubscriptionText from './subscription-text';
import TermsOfService from './terms-of-service';
import { abtest } from 'lib/abtest';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import config from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import CartToggle from './cart-toggle';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

const PaypalPaymentBox = React.createClass( {
	displayName: 'PaypalPaymentBox',

	getInitialState: function() {
		return {
			country: null,
			formDisabled: false,
		};
	},

	handleToggle: function( event ) {
		event.preventDefault();

		analytics.ga.recordEvent( 'Upgrades', 'Clicked Or Use Credit Card Link' );
		analytics.tracks.recordEvent( 'calypso_checkout_switch_to_card' );
		this.props.onToggle( 'credit-card' );
	},

	handleChange: function( event ) {
		var data = {};
		data[ event.target.name ] = event.target.value;

		this.setState( data );
	},

	setSubmitState: function( submitState ) {
		if ( submitState.error ) {
			notices.error( submitState.error );
		}
		if ( submitState.info ) {
			notices.info( submitState.info );
		}

		this.setState( {
			formDisabled: submitState.disabled,
		} );
	},

	getLocationOrigin: function( l ) {
		return l.protocol + '//' + l.hostname + ( l.port ? ':' + l.port : '' );
	},

	redirectToPayPal: function( event ) {
		var cart,
			transaction,
			dataForApi,
			origin = this.getLocationOrigin( window.location );
		event.preventDefault();

		cart = this.props.cart;
		transaction = this.props.transaction;

		this.setSubmitState( {
			info: this.props.translate( 'Sending details to PayPal' ),
			disabled: true,
		} );

		let cancelUrl = origin + '/checkout/';

		if ( this.props.selectedSite ) {
			cancelUrl += this.props.selectedSite.slug;
		} else {
			cancelUrl += 'no-site';
		}

		dataForApi = assign( {}, this.state, {
			successUrl: origin + this.props.redirectTo(),
			cancelUrl,
			cart,
			domainDetails: transaction.domainDetails,
		} );

		// get PayPal Express URL from rest endpoint
		wpcom.paypalExpressUrl(
			dataForApi,
			function( error, paypalExpressURL ) {
				var errorMessage;
				if ( error ) {
					if ( error.message ) {
						errorMessage = error.message;
					} else {
						errorMessage = this.props.translate( 'Please specify a country and postal code.' );
					}

					this.setSubmitState( {
						error: errorMessage,
						disabled: false,
					} );
				}

				if ( paypalExpressURL ) {
					this.setSubmitState( {
						info: this.props.translate( 'Redirecting you to PayPal' ),
						disabled: true,
					} );
					analytics.ga.recordEvent( 'Upgrades', 'Clicked Checkout With Paypal Button' );
					analytics.tracks.recordEvent( 'calypso_checkout_with_paypal' );
					window.location = paypalExpressURL;
				}
			}.bind( this )
		);
	},

	renderButtonText: function() {
		if ( cartValues.cartItems.hasRenewalItem( this.props.cart ) ) {
			return this.props.translate( 'Purchase %(price)s subscription with PayPal', {
				args: { price: this.props.cart.total_cost_display },
				context: 'Pay button on /checkout',
			} );
		}

		return this.props.translate( 'Pay %(price)s with PayPal', {
			args: { price: this.props.cart.total_cost_display },
			context: 'Pay button on /checkout',
		} );
	},

	content: function() {
		const hasBusinessPlanInCart = some( this.props.cart.products, {
			product_slug: PLAN_BUSINESS,
		} );
		const showPaymentChatButton =
			config.isEnabled( 'upgrades/presale-chat' ) &&
			abtest( 'presaleChatButton' ) === 'showChatButton' &&
			hasBusinessPlanInCart;
		const creditCardButtonClasses = classnames( 'credit-card-payment-box__switch-link', {
			'credit-card-payment-box__switch-link-left': showPaymentChatButton,
		} );
		return (
			<form onSubmit={ this.redirectToPayPal }>
				<div className="payment-box-section">
					<CountrySelect
						additionalClasses="checkout-field"
						name="country"
						label={ this.props.translate( 'Country', { textOnly: true } ) }
						countriesList={ this.props.countriesList }
						value={ this.state.country }
						onChange={ this.handleChange }
						disabled={ this.state.formDisabled }
						eventFormName="Checkout Form"
					/>
					<Input
						additionalClasses="checkout-field"
						name="postal-code"
						label={ this.props.translate( 'Postal Code', { textOnly: true } ) }
						onChange={ this.handleChange }
						disabled={ this.state.formDisabled }
						eventFormName="Checkout Form"
					/>
				</div>

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription(
						this.props.cart
					) }
				/>

				<div className="payment-box-actions">
					<div className="pay-button">
						<button
							type="submit"
							className="button is-primary button-pay"
							disabled={ this.state.formDisabled }
						>
							{ this.renderButtonText() }
						</button>
						<SubscriptionText cart={ this.props.cart } />
					</div>

					{ cartValues.isCreditCardPaymentsEnabled( this.props.cart ) && (
						<a href="" className={ creditCardButtonClasses } onClick={ this.handleToggle }>
							{ this.props.translate( 'or use a credit card', {
								context: 'Upgrades: PayPal checkout screen',
								comment: 'Checkout with PayPal -- or use a credit card',
							} ) }
						</a>
					) }

					{ showPaymentChatButton && (
						<PaymentChatButton paymentType="paypal" cart={ this.props.cart } />
					) }
				</div>

				<CartCoupon cart={ this.props.cart } />

				<CartToggle />
			</form>
		);
	},

	render: function() {
		return (
			<PaymentBox
				classSet="paypal-payment-box"
				title={ this.props.translate( 'Secure Payment with PayPal' ) }
			>
				{ this.content() }
			</PaymentBox>
		);
	},
} );

export default localize( PaypalPaymentBox );
