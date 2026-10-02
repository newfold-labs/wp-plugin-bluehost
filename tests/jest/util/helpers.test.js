jest.mock( '@newfold/wp-module-runtime', () => ( {
	NewfoldRuntime: {
		createApiUrl: jest.fn( ( path ) => path ),
		hasCapability: jest.fn( () => false ),
	},
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: jest.fn( () => ( {
		removeNotice: jest.fn(),
		createNotice: jest.fn( () =>
			Promise.resolve( { notice: { id: 'test-notice' } } )
		),
	} ) ),
} ) );

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

jest.mock( '@wordpress/url', () => ( {
	addQueryArgs: jest.fn(),
} ) );

import {
	isEmbeddedHelpCenterOpen,
	openEmbeddedHelpCenter,
} from 'App/util/helpers';

describe( 'embedded help center helpers', () => {
	const toggle = jest.fn();

	beforeEach( () => {
		localStorage.clear();
		toggle.mockClear();
		window.newfoldEmbeddedHelp = {
			toggleNFDLaunchedEmbeddedHelp: toggle,
		};
	} );

	afterEach( () => {
		delete window.newfoldEmbeddedHelp;
	} );

	describe( 'isEmbeddedHelpCenterOpen', () => {
		it( 'returns false when helpVisible is unset or false', () => {
			expect( isEmbeddedHelpCenterOpen() ).toBe( false );
			localStorage.setItem( 'helpVisible', 'false' );
			expect( isEmbeddedHelpCenterOpen() ).toBe( false );
		} );

		it( 'returns true when helpVisible is true', () => {
			localStorage.setItem( 'helpVisible', 'true' );
			expect( isEmbeddedHelpCenterOpen() ).toBe( true );
		} );
	} );

	describe( 'openEmbeddedHelpCenter', () => {
		it( 'calls toggle when the panel is closed', () => {
			openEmbeddedHelpCenter();
			expect( toggle ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not call toggle when the panel is already open', () => {
			localStorage.setItem( 'helpVisible', 'true' );
			openEmbeddedHelpCenter();
			expect( toggle ).not.toHaveBeenCalled();
		} );

		it( 'no-ops when the embedded help API is missing', () => {
			delete window.newfoldEmbeddedHelp;
			openEmbeddedHelpCenter();
			expect( toggle ).not.toHaveBeenCalled();
		} );
	} );
} );
