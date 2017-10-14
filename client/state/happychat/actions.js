/** @format **/

/**
 * Internal dependencies
 */
import { HAPPYCHAT_IO_RECEIVE_STATUS } from 'state/action-types';

export const receiveStatus = status => ( {
	type: HAPPYCHAT_IO_RECEIVE_STATUS,
	status,
} );
