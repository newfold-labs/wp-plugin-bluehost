import {
	Button,
	Card,
	Container,
	Page,
	Title,
} from '@newfold/ui-component-library';
import { addUtmParams } from 'App/util/helpers';
import help from 'App/data/help';

const HelpCard = ( { item } ) => {
	return (
		<Card className={ `wppbh-help-card card-help-${ item.name }` }>
			<Card.Content>
				<Title as="h3" size="4" className="nfd-mb-2">
					{ item.title }
				</Title>
				<p>{ item.description }</p>
			</Card.Content>

			<Card.Footer>
				<Button
					variant="secondary"
					as="a"
					className="nfd-w-full nfd-transition-bg nfd-duration-100"
					href={ addUtmParams(
						item.url
					) }
					target="_blank"
				>
					{ item.cta }
				</Button>
			</Card.Footer>
		</Card>
	);
};

const Help = () => {
	const renderHelpCards = () => {
		const helpItems = help;

		return (
			<div className="nfd-grid nfd-gap-6 nfd-grid-cols-1 sm:nfd-grid-cols-2 xl:nfd-grid-cols-3 2xl:nfd-grid-cols-4">
				{ helpItems.map( ( item ) => (
					<HelpCard key={ item.name } item={ item } />
				) ) }
			</div>
		);
	};
	return (
		<Page className={ 'wppbh-app-help-page' }>
			<div
				className={
					'wppbh-app-help-page__header nfd-flex nfd-flex-col nfd-gap-y-4'
				}
			>
				<Title as="h1">{ __( 'Help', 'wp-plugin-bluehost' ) }</Title>
				<Title
					as="h2"
					className="nfd-font-normal nfd-text-[13px] nfd-color-body"
				>
					{ __(
						'We are available 24/7 to help answer questions and solve your problems.',
						'wp-plugin-bluehost'
					) }
				</Title>
			</div>
			<Container
				className={
					'wppbh-app-help-container nfd-bg-transparent nfd-shadow-none'
				}
			>
				<Container.Block className={ 'nfd-p-0' }>
					{ renderHelpCards() }
				</Container.Block>
			</Container>
		</Page>
	);
};

export default Help;
