/** @format */

/**
 * Internal dependencies
 */
import { HAPPYCHAT_SET_MESSAGE } from 'state/action-types';

export const setMessage = message => ( { type: HAPPYCHAT_SET_MESSAGE, message } );
