import { Page } from '@newfold/ui-component-library';
// component sourced from solutions module
// import { default as NewfoldCommerce } from '@modules/wp-module-solutions/solutions-page-component';
import * as SolutionsPageComponent from '@modules/wp-module-solutions/build/solutions-page-component';


const CommercePage = () => {

	useEffect( () => {
		// run when mounts
		const solutionsPortal = document.getElementById( 'solutions-portal' );
		
		if ( solutionsPortal ) {
			window.NFDPortalRegistry.registerPortal(
				'solutions',
				solutionsPortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'solutions' );
		};
	}, [] );

	return (
		<Page className={ 'wppbh-app-commerce-page nfd-w-full' }>
			<div id="nfd-solutions-portal"></div>{/* this is the new commerce portal */}
			<SolutionsPageComponent.Content />{/* this is the old commerce page */}
		</Page>
	);
};

export default CommercePage;
