import { Alert, Container, Page } from '@newfold/ui-component-library';
import { useContext } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import SitePages from './sitePages';
import BlogPosts from './blogPosts';
import BookingAndAppointments from './bookingAndAppointments';
import ProductsPages from './ProductsPages';
import AppStore from '../../data/store';

const PagesAndPosts = () => {
	const { store } = useContext( AppStore );

	return (
		<Page
			title="Pages & Posts"
			className={ 'wppbh-app-pagesAndPosts-page' }
		>
			<Container className="nfd-overflow-hidden">
				<Container.Header
					title={ __( 'Pages & Posts', 'wp-plugin-bluehost' ) }
					className={ 'wppbh-app-settings-header' }
				>
					{ store?.comingSoon ? (
						<Alert
							variant="warning"
							className="nfd-text-sm nfd-bg-transparent nfd-p-0 "
						>
							<span className="nfd-font-semibold nfd-text-red-700">
								{ __(
									'Your site is not live.',
									'wp-plugin-bluehost'
								) }
							</span>
						</Alert>
					) : (
						<Alert
							variant="success"
							className="nfd-text-sm nfd-bg-transparent nfd-p-0 "
						>
							<span className="nfd-font-semibold nfd-text-black">
								{ __(
									'Your site is live.',
									'wp-plugin-bluehost'
								) }
							</span>
						</Alert>
					) }
					{ store?.comingSoon ? (
						<div
							dangerouslySetInnerHTML={ {
								__html: sprintf(
									/* translators: %1$s: opening anchor tag, %2$s: closing anchor tag */
									__(
										'Visitors to your site will see your "Coming Soon" page and not your actual site. Visit %1$s"Settings"%2$s to set your site live.',
										'wp-plugin-bluehost'
									),
									'<a href="#/settings">',
									'</a>'
								),
							} }
						/>
					) : (
						<p>
							{ __(
								'Visitors to your site will see all your publicly published pages.',
								'wp-plugin-bluehost'
							) }
						</p>
					) }
				</Container.Header>

				<div className="nfd-grid md:nfd-grid-cols-2 nfd-gap-0 sm:nfd-grid-cols-1">
					<SitePages />
					<BlogPosts />
					{ window.NewfoldRuntime.isWoocommerceActive && (
						<ProductsPages />
					) }
					{ window.NewfoldRuntime.isWoocommerceActive &&
						window.NewfoldRuntime.capabilities.hasYithExtended && (
							<BookingAndAppointments />
						) }
				</div>
			</Container>
		</Page>
	);
};

export default PagesAndPosts;
