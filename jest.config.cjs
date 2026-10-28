module.exports = {
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/tests/jest/**/*.test.js' ],
	modulePathIgnorePatterns: [
		'<rootDir>/vendor/',
		'<rootDir>/vendor-prefixed/',
		'<rootDir>/bluehost-wordpress-plugin/',
	],
	moduleNameMapper: {
		'^App/(.*)$': '<rootDir>/src/app/$1',
		'\\.css$': '<rootDir>/tests/jest/style-mock.cjs',
	},
	transform: {
		'^.+\\.js$': [
			'babel-jest',
			{
				babelrc: false,
				configFile: false,
				presets: [ '@wordpress/babel-preset-default' ],
			},
		],
	},
};
