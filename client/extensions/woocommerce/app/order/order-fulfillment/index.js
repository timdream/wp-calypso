/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { first } from 'lodash';

/**
 * Internal dependencies
 */
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import config from 'config';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import { isOrderFinished } from 'woocommerce/lib/order-status';
import LabelPurchaseDialog from 'woocommerce/woocommerce-services/views/shipping-label/label-purchase-modal';
import Notice from 'components/notice';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import QueryLabels from 'woocommerce/woocommerce-services/components/query-labels';
import { updateOrder } from 'woocommerce/state/sites/orders/actions';
import { openPrintingFlow } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getLabels,
	getSelectedPaymentMethod,
	isEnabled as areLabelsEnabled,
	isLoaded as areLabelsLoaded,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

class OrderFulfillment extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			id: PropTypes.number.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	state = {
		errorMessage: false,
		shouldEmail: false,
		showDialog: false,
		showPopoverMenu: false,
		trackingNumber: '',
	};

	toggleDialog = () => {
		this.setState( {
			showDialog: ! this.state.showDialog,
		} );
	};

	togglePopoverMenu = () => {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu,
		} );
	};

	updateTrackingNumber = event => {
		this.setState( {
			errorMessage: false,
			trackingNumber: event.target.value,
		} );
	};

	updateCustomerEmail = () => {
		this.setState( {
			errorMessage: false,
			shouldEmail: ! this.state.shouldEmail,
		} );
	};

	submit = () => {
		const { order, site, translate } = this.props;
		const { shouldEmail, trackingNumber } = this.state;

		if ( shouldEmail && ! trackingNumber ) {
			this.setState( { errorMessage: translate( 'Please enter a tracking number.' ) } );
			return;
		}

		this.props.updateOrder( site.ID, {
			id: order.id,
			status: 'completed',
		} );

		this.toggleDialog();
		const note = {
			note: translate( 'Your order has been shipped. The tracking number is %(trackingNumber)s.', {
				args: { trackingNumber },
			} ),
			customer_note: shouldEmail,
		};
		if ( trackingNumber ) {
			this.props.createNote( site.ID, order.id, note );
		}
	};

	getOrderFulfilledMessage = () => {
		const { labelsLoaded, labels, translate } = this.props;
		const unknownCarrierMessage = translate( 'Order has been fulfilled' );
		if ( ! labelsLoaded || ! labels.length ) {
			return unknownCarrierMessage;
		}

		const label = first( this.props.labels );
		if ( ! label || 'usps' !== label.carrier_id ) {
			return unknownCarrierMessage;
		}

		return translate( 'Order has been fulfilled and will be shipped via USPS' );
	};

	getFulfillmentStatus = () => {
		const { order, translate } = this.props;
		switch ( order.status ) {
			case 'completed':
				return this.getOrderFulfilledMessage();
			case 'cancelled':
				return translate( 'Order has been cancelled' );
			case 'refunded':
				return translate( 'Order has been refunded' );
			case 'failed':
				return translate( 'Order has failed' );
			default:
				return translate( 'Order needs to be fulfilled' );
		}
	};

	renderFulfillmentAction() {
		const {
			labelsLoaded,
			labelsEnabled,
			order,
			site,
			translate,
			hasLabelsPaymentMethod,
		} = this.props;
		const isShippable = ! isOrderFinished( order.status );
		const hideLabels = labelsLoaded && ( ! hasLabelsPaymentMethod || ! labelsEnabled );

		if ( ! isShippable && ( ! wcsEnabled || hideLabels ) ) {
			return null;
		}

		if ( ! wcsEnabled || hideLabels ) {
			return (
				<Button primary onClick={ this.toggleDialog }>
					{ translate( 'Fulfill' ) }
				</Button>
			);
		}

		const onLabelPrint = () => this.props.openPrintingFlow( order.id, site.ID );
		const buttonClassName = classNames( {
			'is-placeholder': ! labelsLoaded,
		} );

		if ( ! isShippable ) {
			return (
				<Button onClick={ onLabelPrint } className={ buttonClassName }>
					{ translate( 'Print new label' ) }
				</Button>
			);
		}

		return (
			<div>
				<ButtonGroup className="order-fulfillment__button-group">
					<Button primary={ labelsLoaded } onClick={ onLabelPrint } className={ buttonClassName }>
						{ translate( 'Print label & fulfill' ) }
					</Button>
					<Button onClick={ this.togglePopoverMenu } ref="popoverMenuButton">
						<Gridicon icon="ellipsis" />
					</Button>
				</ButtonGroup>
				<PopoverMenu
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.togglePopoverMenu }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem onClick={ this.toggleDialog }>
						{ translate( 'Fulfill without printing a label' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	}

	render() {
		const { order, site, translate } = this.props;
		const { errorMessage, showDialog, trackingNumber } = this.state;
		const dialogClass = 'woocommerce order-fulfillment'; // eslint/css specificity hack
		if ( ! order ) {
			return null;
		}

		const dialogButtons = [
			<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.submit }>
				{ translate( 'Fulfill' ) }
			</Button>,
		];

		const classes = classNames( {
			'order-fulfillment': true,
			'is-completed': 'completed' === order.status,
		} );

		return (
			<div className={ classes }>
				<div className="order-fulfillment__label">
					<Gridicon icon={ 'completed' === order.status ? 'checkmark' : 'shipping' } />
					{ this.getFulfillmentStatus() }
				</div>
				<div className="order-fulfillment__action">{ this.renderFulfillmentAction() }</div>

				<Dialog
					isVisible={ showDialog }
					onClose={ this.toggleDialog }
					className={ dialogClass }
					buttons={ dialogButtons }
				>
					<h1>{ translate( 'Fulfill order' ) }</h1>
					<form>
						<FormFieldset className="order-fulfillment__tracking">
							<FormLabel className="order-fulfillment__tracking-label" htmlFor="tracking-number">
								{ translate( 'Enter a tracking number (optional)' ) }
							</FormLabel>
							<FormTextInput
								id="tracking-number"
								className="order-fulfillment__value"
								value={ trackingNumber }
								onChange={ this.updateTrackingNumber }
								placeholder={ translate( 'Tracking Number' ) }
							/>
						</FormFieldset>
						<FormLabel className="order-fulfillment__email">
							<FormInputCheckbox
								checked={ this.state.shouldEmail }
								onChange={ this.updateCustomerEmail }
							/>
							<span>{ translate( 'Email tracking number to customer' ) }</span>
						</FormLabel>
						{ errorMessage && (
							<Notice status="is-error" showDismiss={ false }>
								{ errorMessage }
							</Notice>
						) }
					</form>
				</Dialog>
				{ wcsEnabled && <QueryLabels orderId={ order.id } /> }
				{ wcsEnabled && <LabelPurchaseDialog orderId={ order.id } siteId={ site.ID } /> }
			</div>
		);
	}
}

export default connect(
	( state, { order, site } ) => {
		const labelsLoaded = wcsEnabled && Boolean( areLabelsLoaded( state, order.id, site.ID ) );
		const hasLabelsPaymentMethod =
			wcsEnabled && labelsLoaded && getSelectedPaymentMethod( state, order.id, site.ID );

		return {
			labelsLoaded,
			labelsEnabled: areLabelsEnabled( state, order.id, site.ID ),
			labels: getLabels( state, order.id, site.ID ),
			hasLabelsPaymentMethod,
		};
	},
	dispatch => bindActionCreators( { createNote, updateOrder, openPrintingFlow }, dispatch )
)( localize( OrderFulfillment ) );
