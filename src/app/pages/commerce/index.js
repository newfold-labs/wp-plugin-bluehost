import { Page, Title } from '@newfold/ui-component-library';
import * as SolutionsPageComponent from '@modules/wp-module-solutions/build/solutions-page-component';
import { __ } from '@wordpress/i18n';

const CommercePage = () => {
	return (
		<Page className={ 'wppbh-app-commerce-page nfd-page-solutions nfd-w-full' }>
			<div
				className={
					'wppbh-app-help-page__header nfd-flex nfd-flex-col nfd-gap-y-4'
				}
			>
				<Title as="h1">
					{ __(
						'Premium tools available in eCommerce Add-Ons',
						'wp-plugin-bluehost'
					) }
				</Title>
				<Title
					as="h2"
					className="nfd-font-normal nfd-text-[13px] nfd-color-body"
				>
					{ __(
						'Discover exclusive features, designed to deliver unmatched value and elevate your online experience.',
						'wp-plugin-bluehost'
					) }
				</Title>
			</div>
			<SolutionsPageComponent.Content />
		</Page>
	);
};

export default CommercePage;
