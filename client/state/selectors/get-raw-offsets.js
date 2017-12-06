/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { addReducers } from 'state/reducer-registry';
import timezones from 'state/timezones/reducer';

addReducers( { timezones } );

/**
 * Return manual utc offsets data
 * gotten from state.timezones subtree.
 *
 * @param  {Object} state - Global state tree
 * @return {?Array} An array of manual offset timezones
 */
export default function getRawOffsets( state ) {
	return get( state, 'timezones.rawOffsets', null );
}
