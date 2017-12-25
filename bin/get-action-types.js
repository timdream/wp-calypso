#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

function main() {
	let debug = false;
	const args = process.argv.slice( 2 );
	const inputPath = args[0];
	const outputPath = args[1];

	const actionTypes = {};

	const files = JSON.parse( fs.readFileSync( inputPath ) );
	files.forEach(( { file, classifications, types } ) => {
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

	fs.writeFileSync( outputPath, JSON.stringify( actionTypes, null, 2 ) );
}

main();
