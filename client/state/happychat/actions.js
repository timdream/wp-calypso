/** @format **/

/**
 * Internal dependencies
 */
import { HAPPYCHAT_IO_RECEIVE_STATUS, HAPPYCHAT_SET_MESSAGE } from 'state/action-types';

export const receiveStatus = status => ( {
	type: HAPPYCHAT_IO_RECEIVE_STATUS,
	status,
} );

export const setChatMessage = message => ( { type: HAPPYCHAT_SET_MESSAGE, message } );
