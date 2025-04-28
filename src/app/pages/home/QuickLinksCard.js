import { Card, Title } from '@newfold/ui-component-library';
import { ReactComponent as Arrow } from 'App/images/card-mini-arrow.svg';

const QuickLinksCard = ( {} ) => {
	return (
		<div className="" data-cy="quick-links-card">
			<Title size={ 2 } as="h3" className="nfd-mb-4">
				{ __( 'Quick links', 'wp-plugin-bluehost' ) }
			</Title>
			<div className="nfd-grid nfd-gap-4 nfd-grid-cols-1">
				<a
					className="nfd-no-underline nfd-card-link nfd-card-link-mini"
					href="#/hosting"
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
					href="post-new.php?wb-library=patterns&wb-category=text"
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
				<a
					className="nfd-no-underline nfd-card-link nfd-card-link-mini"
					href="admin.php?page=bluehost#/store/sales_discounts"
					data-cy="promotion-card"
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
			</div>
		</div>
	);
};

export default QuickLinksCard;
