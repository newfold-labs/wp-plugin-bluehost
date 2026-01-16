import './styles.scss';
import {
	Page,
	Card,
	Title,
	Container,
	Button,
} from '@newfold/ui-component-library';
import { ReactComponent as WonderCartIcon } from 'App/images/sales-discounts-wondercart.svg';
import promotions from 'App/pages/store-sales-discounts/promotions';

const promotionsUrl =
	window.NewfoldRuntime?.adminUrl +
	'admin.php?page=bluehost&s=promotions#/commerce';

const StoreSalesDiscounts = () => {
	return (
		<Page>
			<Container
				className={
					'wppbh-app-help-page__header nfd-flex nfd-flex-col nfd-mb-8 nfd-p-8'
				}
			>
				<div className="nfd-flex nfd-flex-col md:nfd-flex-row nfd-gap-8 nfd-items-center">
					<div className="nfd-flex nfd-flex-col md:nfd-grow-0">
						<WonderCartIcon className="nfd-w-36" />
					</div>
					<div className="nfd-flex nfd-flex-col nfd-gap-y-4 nfd-w-full text-center md:text-left">
						<Title as="h1">
							{ __(
								'Create a campaign and boost your sales!',
								'wp-plugin-bluehost'
							) }
						</Title>
						<Title as="h2" className="nfd-text-body nfd-text-sm">
							{ __(
								'Create custom upsell, cross-sell and other promotional campaigns to generate more sales.',
								'wp-plugin-bluehost'
							) }
						</Title>
					</div>
					<div className="nfd-flex nfd-flex-col">
						<Button
							as="a"
							className="nfd-button-xl"
							href={ promotionsUrl }
							size="large"
							variant="upsell"
						>
							{ __( 'Get Started Now', 'wp-plugin-bluehost' ) }
						</Button>
					</div>
				</div>
			</Container>

			<Title as="h2">
				{ __(
					'Not sure where to start? Try one of these popular promotions:',
					'wp-plugin-bluehost'
				) }
			</Title>
			<Container
				className={ classNames(
					'wppbh-app-container nfd-bg-transparent nfd-shadow-none',
					'nfd-grid nfd-grid-cols-1 nfd-gap-4 md:nfd-grid-cols-2 lg:nfd-grid-cols-3'
				) }
			>
				{ promotions.map( ( promotion ) => (
					<Card
						key={ promotion.name }
						className="nfd-flex nfd-flex-col nfd-h-full"
					>
						<Card.Content className="nfd-flex nfd-flex-col nfd-h-full">
							<div
								className={
									'nfd-flex nfd-flex-col nfd-gap-4 nfd-items-center nfd-text-center nfd-mt-4 nfd-w-full'
								}
							>
								<div className="nfd-w-36 nfd-h-24 nfd-object-contain nfd-object-center nfd-flex nfd-items-center nfd-justify-center">
									{ promotion.icon }
								</div>
							</div>
							<Title size={ 2 } as="h2" className="nfd-mt-8">
								{ promotion.title }
							</Title>
							<p className="nfd-text-body nfd-text-sm nfd-mt-4 nfd-mb-4">
								{ promotion.description }
							</p>
							<div className="nfd-flex nfd-justify-center nfd-align-center nfd-w-full nfd-mt-auto">
								<Button
									as="a"
									className="nfd-w-full"
									href={ promotionsUrl }
									variant="secondary"
								>
									{ __(
										'Create a Campaign',
										'wp-plugin-bluehost'
									) }
								</Button>
							</div>
						</Card.Content>
					</Card>
				) ) }
			</Container>
		</Page>
	);
};

export default StoreSalesDiscounts;
