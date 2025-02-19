/**
 * This sets the latest wp-version in the wp-env.json file.
 * It keeps us updated every time we run `npm i` so we don't have to remember.
 */

const { writeFile } = require( 'fs/promises' );
const wpEnv = require( '../.wp-env.json' );
async function fetchData( url ) {
	try {
		const fetch = ( ...args ) =>
			import( 'node-fetch' ).then( ( { default: fetch } ) =>
				fetch( ...args )
			);
		const response = await fetch( url );
		if ( ! response.ok ) {
			throw new Error( `HTTP error! status: ${ response.status }` );
		}
		const data = await response.json();
		return data;
	} catch ( error ) {
		console.error( 'Fetching error:', error );
		throw error;
	}
}

fetchData( 'https://api.wordpress.org/core/stable-check/1.0/' ).then(
	( json ) => {
		const wpVersion = Object.keys( json )[ Object.keys( json ).length - 1 ];
		wpEnv.core = `WordPress/WordPress#tags/${ wpVersion }`;
		writeFile(
			'../.wp-env.json',
			JSON.stringify( wpEnv, null, 2 ),
			'utf8',
			( err ) => {
				if ( err ) {
					console.log(
						'An error occurred while writing latest WordPress version to .wp-env.json file.'
					);
					return console.log( err );
				}
				console.log(
					`The .wp-env.json file was updated with the latest WordPress version (${ wpVersion }).`
				);
			}
		);
	}
);
