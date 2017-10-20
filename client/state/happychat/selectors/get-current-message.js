/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current message the user is typing
 *
 * @param { Object }  state  Global state tree
 * @return { String }        Current chat message
 */
export default state => get( state, 'happychat.message' );
