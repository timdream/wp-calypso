#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

function main() {
	let debug = false;
	const args = process.argv.slice( 2 );
	const jsonFilePath = args[0];

	const actionTypes = {};
	const files = {};

	const list = JSON.parse( fs.readFileSync( jsonFilePath ) );
	list.forEach(( { file, classifications, types } ) => {
		files[ file ] = { types, classifications };

		types.forEach( type => {
			actionTypes[ type ] = actionTypes[ type ] || {
				dataLayerHandlers: [],
				actions: [],
				reducers: [],
				unknowns: [],
				isAmbiguous: false
			};

			if (-1 !== classifications.indexOf( 'test' ) ||
				-1 !== classifications.indexOf( 'maybe-test' )) {
				// Skipping adding this file to the final output.
				return;
			}

			classifications.forEach( classification => {
				switch ( classification ) {
					case 'maybe-action':
					case 'action':
						actionTypes[ type ].actions.push( file );
						break;
					case 'maybe-reducer':
					case 'reducer':
						actionTypes[ type ].reducers.push( file );
						break;
					case 'maybe-data-layer-handler':
					case 'data-layer-handler':
						actionTypes[ type ].dataLayerHandlers.push( file );
						break;
					case 'unknown':
						actionTypes[ type ].unknowns.push( file );
						break;
				}
			});

			if (-1 !== classifications.indexOf( 'maybe-action' ) ||
				-1 !== classifications.indexOf( 'maybe-reducer' ) ||
				-1 !== classifications.indexOf( 'maybe-data-layer-handler' )) {
				actionTypes[ type ].isAmbiguous = true;
			}
		});
	});

	// Locate the actions that need a specific data layer handler files.

	Object.keys( files ).forEach( file => {
		const dependents = [];

		let isDataHandler = false;
		const canBeMoved = files[ file ].types.every( type => {
			const o = actionTypes[ type ];
			if ( o.isAmbiguous ||
				 o.unknowns.length ||
				 1 < o.dataLayerHandlers.length ||
				 ( 1 === o.dataLayerHandlers.length &&
					o.dataLayerHandlers[0] !== file ) ) {
				return false;
			}

			if ( o.dataLayerHandlers[0] === file ) {
				isDataHandler = true;
			}

			o.actions.forEach( f => {
				if ( dependents.indexOf(f) === -1 ) {
					dependents.push( f );
				}
			});

			return true;
		});

		if ( isDataHandler && canBeMoved ) {
			files[ file ].actionDependents = dependents;
		}
	});

	fs.writeFileSync( jsonFilePath, JSON.stringify( { actionTypes, files }, null, 2 ) );
}

main();
