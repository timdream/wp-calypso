/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import GridIcon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { blur, focus, closeChat, minimizeChat, minimizedChat } from 'state/happychat/ui/actions';
import isHappychatMinimizing from 'state/happychat/selectors/is-happychat-minimizing';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import HappychatConnection from './connection';
import Composer from './composer';
import Notices from './notices';
import Timeline from './timeline';

/**
 * React component for rendering title bar
 */
const Title = localize( ( { onCloseChat, translate } ) => (
	<div className="happychat__active-toolbar">
		<h4>{ translate( 'Support Chat' ) }</h4>
		<div onClick={ onCloseChat }>
			<GridIcon icon="cross" />
		</div>
	</div>
) );

/*
 * Main chat UI component
 */
class Happychat extends React.Component {
	componentDidMount() {
		this.props.setFocused();
	}

	componentWillUnmount() {
		this.props.setBlurred();
	}

	render() {
		const { isChatOpen, isMinimizing, onCloseChat, onMinimizeChat, onMinimizedChat } = this.props;

		const onCloseChatTitle = () => {
			onMinimizeChat();
			setTimeout( () => {
				onMinimizedChat();
				onCloseChat();
			}, 500 );
		};

		return (
			<div className="happychat">
				<HappychatConnection />
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen,
						'is-minimizing': isMinimizing,
					} ) }
				>
					<div className="happychat__title">
						<Title onCloseChat={ onCloseChatTitle } />
					</div>
					<Timeline />
					<Notices />
					<Composer />
				</div>
			</div>
		);
	}
}

Happychat.propTypes = {
	isChatOpen: PropTypes.bool,
	isMinimizing: PropTypes.bool,
	onCloseChat: PropTypes.func,
	onMinimizeChat: PropTypes.func,
	onMinimizedChat: PropTypes.func,
	setBlurred: PropTypes.func,
	setFocused: PropTypes.func,
};

const mapState = state => {
	return {
		isChatOpen: isHappychatOpen( state ),
		isMinimizing: isHappychatMinimizing( state ),
	};
};

const mapDispatch = () => {
	return {
		onCloseChat: closeChat,
		onMinimizeChat: minimizeChat,
		onMinimizedChat: minimizedChat,
		setBlurred: blur,
		setFocused: focus,
	};
};

export default connect( mapState, mapDispatch )( Happychat );
