#!/usr/bin/env node

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

function main() {
	let debug = false;
	const args = process.argv.slice( 2 );
	const dataLayerInputPath = args[0];
	const actionCreatorInputPath = args[1];
	const outputPath = args[2];

	const actionTypes = {};

	const dataLayerFiles = JSON.parse( fs.readFileSync( dataLayerInputPath ) );
	dataLayerFiles.forEach(( { file, types } ) => {
		types.forEach( type => {
			actionTypes[type] = actionTypes[type] = { handler: '', actionCreators: [] };
			if (actionTypes[type].handler) {
				throw new Error("Same action type " + type +
					" being handled by more than one handlers. " +
					" Likely an error on AST parsing. Check the code.");
			}
			actionTypes[type].handler = file;
		});
	});

	const actionTypeKeys = Object.keys( actionTypes );

	const actionCreatorFiles = JSON.parse( fs.readFileSync( actionCreatorInputPath ) );
	actionCreatorFiles.forEach(( { file, types } ) => {
		types.forEach( type => {
			if (-1 == actionTypeKeys.indexOf(type)) {
				return;
			}

			actionTypes[type].actionCreators.push(file);
		});
	});

	fs.writeFileSync( outputPath, JSON.stringify( actionTypes, null, 2 ) );
}

main();
