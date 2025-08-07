import { Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Arrow } from 'App/images/card-mini-arrow.svg';

const QuickLinksCard = ( {} ) => {
	const manageHostingUrl = window.NewfoldRuntime.linkTracker.addUtmParams(
		'admin.php?page=nfd-hosting'
	);
	const writeBlogUrl = window.NewfoldRuntime.linkTracker.addUtmParams(
		'post-new.php?wb-library=patterns&wb-category=text'
	);
	// Sales and Discounts is handled by the wondercart tool/entitlement data or ctb link to ecom family ctb

	return (
		<div className="" data-cy="quick-links-card">
			<Title size={ 2 } as="h3" className="nfd-mb-4">
				{ __( 'Quick links', 'wp-plugin-bluehost' ) }
			</Title>
			<div className="nfd-grid nfd-gap-4 nfd-grid-cols-1">
				<a
					className="nfd-no-underline nfd-card-link nfd-card-link-mini"
					href={ manageHostingUrl }
					data-cy="hosting-card"
				>
					<Card className="wppbh-hosting-card nfd-card-mini nfd-py-4">
						<Card.Content>
							<div className="nfd-flex nfd-flex-row nfd-justify-between nfd-items-center">
								<p>
									{ __(
										'Manage hosting',
										'wp-plugin-bluehost'
									) }
								</p>
								<Arrow className="nfd-arrow nfd-max-w-6" />
							</div>
						</Card.Content>
					</Card>
				</a>
				<a
					className="nfd-no-underline nfd-card-link nfd-card-link-mini"
					href={ writeBlogUrl }
					data-cy="blog-card"
				>
					<Card className="wppbh-blog-card nfd-card-mini nfd-py-4">
						<Card.Content>
							<div className="nfd-flex nfd-flex-row nfd-justify-between nfd-items-center">
								<p>
									{ __(
										'Write a blog post',
										'wp-plugin-bluehost'
									) }
								</p>
								<Arrow className="nfd-arrow nfd-max-w-6" />
							</div>
						</Card.Content>
					</Card>
				</a>
				{
					window.NewfoldRuntime.solution.solution === 'WP_SOLUTION_COMMERCE' ? (
						// If the solution is ecommerce, show the promotion card as installer link to wondercard tool/entitlement
						<a
							className="nfd-no-underline nfd-card-link nfd-card-link-mini"
							data-cy="promotion-card"
							data-nfd-installer-plugin-activate={ window.NewfoldRuntime.solution.wondercart.activate }
							data-nfd-installer-plugin-basename={ window.NewfoldRuntime.solution.wondercart.pluginBasename }
							data-nfd-installer-plugin-name={ window.NewfoldRuntime.solution.wondercart.pluginName }
							data-nfd-installer-pls-provider={ window.NewfoldRuntime.solution.wondercart.plsProvider }
							data-nfd-installer-pls-slug={ window.NewfoldRuntime.solution.wondercart.plsSlug }
							href={ window.NewfoldRuntime.linkTracker.addUtmParams( window.NewfoldRuntime.solution.wondercart.cta.url ) }
						>
							<Card className="wppbh-promotion-card nfd-card-mini nfd-py-4">
								<Card.Content>
									<div className="nfd-flex nfd-flex-row nfd-justify-between nfd-items-center">
										<p>
											{ __(
												'Create a sale promotion',
												'wp-plugin-bluehost'
											) }
										</p>
										<Arrow className="nfd-arrow nfd-max-w-6" />
									</div>
								</Card.Content>
							</Card>
						</a>
					) : (
						// If the solution is not ecommerce, show the promotion card as ctb link to ecom family ctb
						<a
							className="nfd-no-underline nfd-card-link nfd-card-link-mini"
							data-cy="promotion-card"
							data-ctb-id={ window.NewfoldRuntime.ctbs.ecomFamily.id }
							href={ window.NewfoldRuntime.linkTracker.addUtmParams( window.NewfoldRuntime.ctbs.ecomFamily.url ) }
						>
							<Card className="wppbh-promotion-card nfd-card-mini nfd-py-4">
								<Card.Content>
									<div className="nfd-flex nfd-flex-row nfd-justify-between nfd-items-center">
										<p>
											{ __(
												'Create a sale promotion',
												'wp-plugin-bluehost'
											) }
										</p>
									</div>
								</Card.Content>
							</Card>
						</a>
					)
				}
			</div>
		</div>
	);
};

export default QuickLinksCard;
