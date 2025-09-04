import { Page } from '@newfold/ui-component-library';
// component sourced from solutions module
// import { default as NewfoldCommerce } from '@modules/wp-module-solutions/solutions-page-component';
import * as SolutionsPageComponent from '@modules/wp-module-solutions/build/solutions-page-component';


const CommercePage = () => {
	console.log(SolutionsPageComponent)
	const NewfoldCommerce = SolutionsPageComponent.Content;
	return (
		<Page className={ 'wppbh-app-commerce-page nfd-w-full' }>
			<NewfoldCommerce/>
		</Page>
	);
};

export default CommercePage;
