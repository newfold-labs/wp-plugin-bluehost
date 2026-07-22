/**
 * ESLint flat config for the Bluehost WordPress plugin.
 *
 * Mirrors @wordpress/scripts default (recommended + test-unit + Babel) and
 * restores project-specific import aliases + globals (matching webpack
 * ProvidePlugin / resolve.alias) that previously lived in .eslintrc.js.
 */
const path = require( 'path' );

const wpPlugin = require( '@wordpress/eslint-plugin' );
const { hasBabelConfig } = require( '@wordpress/scripts/utils' );

const pluginDir = __dirname;

const importAliasMap = [
	[ 'App', path.join( pluginDir, 'src/app' ) ],
	[ 'Assets', path.join( pluginDir, 'assets' ) ],
	[ '@modules', path.join( pluginDir, 'vendor/newfold-labs' ) ],
];

/** Globals injected by webpack ProvidePlugin (see webpack.config.js). */
const webpackProvidedGlobals = {
	__: 'readonly',
	_n: 'readonly',
	_camelCase: 'readonly',
	_filter: 'readonly',
	classNames: 'readonly',
	useContext: 'readonly',
	useEffect: 'readonly',
	useState: 'readonly',
};

const config = [
	{
		ignores: [ '**/build/**', '**/node_modules/**', '**/vendor/**' ],
	},

	...wpPlugin.configs.recommended,

	...wpPlugin.configs[ 'test-unit' ].map( ( c ) => ( {
		...c,
		files: [ '**/@(test|__tests__)/**/*.js', '**/?(*.)test.js' ],
	} ) ),

	// Project-specific: match webpack aliases and ProvidePlugin for ./src.
	{
		files: [ 'src/**/*.js' ],
		languageOptions: {
			globals: webpackProvidedGlobals,
		},
		settings: {
			'import/resolver': {
				alias: {
					map: importAliasMap,
					extensions: [
						'.js',
						'.jsx',
						'.json',
						'.mjs',
						'.svg',
					],
				},
			},
		},
	},
];

if ( ! hasBabelConfig() ) {
	config.push( {
		languageOptions: {
			parserOptions: {
				requireConfigFile: false,
				babelOptions: {
					presets: [
						require.resolve( '@wordpress/babel-preset-default' ),
					],
				},
			},
		},
	} );
}

module.exports = config;
