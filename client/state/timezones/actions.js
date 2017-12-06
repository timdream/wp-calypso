/** @format */

/**
 * Internal dependencies
 */

import { TIMEZONES_RECEIVE, TIMEZONES_REQUEST } from 'state/action-types';
import { addCoreHandlers } from 'state/data-layer/middleware';
import timezonesHandler from 'state/data-layer/wpcom/timezones';
import { addReducers } from 'state/reducer-registry';
import timezones from 'state/timezones/reducer';

addCoreHandlers( timezonesHandler );
addReducers( { timezones } );

export const requestTimezones = () => ( {
	type: TIMEZONES_REQUEST,
} );

export const timezonesReceive = data => ( {
	type: TIMEZONES_RECEIVE,
	...data,
} );
