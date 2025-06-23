import React, { useContext } from 'react';
import { Card, Title } from '@newfold/ui-component-library';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReactComponent as Icon } from 'App/images/party.svg';
import { ReactComponent as LaunchIcon } from 'App/images/launch.svg';
import { ReactComponent as VideoIcon } from 'App/images/play.svg';
import { ReactComponent as DocumentIcon } from 'App/images/document.svg';
import AppStore from 'App/data/store';
import { hideWelcomeBannerTransient } from 'App/util/helpers';

const WelcomeBanner = () => {
	const { store, setStore } = useContext( AppStore );
	const isSiteLive = !store.comingSoon;

	if ( !store.showWelcomeBanner ) {
		return null;
	}

	const handleClose = () => {
		hideWelcomeBannerTransient()
			.then( () => {
				setStore( {
					...store,
					showWelcomeBanner: false,
				} );
			} )
			.catch( ( error ) => {
				console.error( 'Error hiding welcome banner:', error );
			} );
	};

	const getTitle = () => {
		return isSiteLive 
			? __( 'Congrats, your site is live!', 'wp-plugin-bluehost' )
			: __( 'Congrats, your site is almost live!', 'wp-plugin-bluehost' );
	};

	return (
		<div className="nfd-flex wpbh-home-welcome-banner">
			<Card className="nfd-w-[100%]">
				<Card.Header className="nfd-flex nfd-flex-col nfd-gap-2">
					<div className="nfd-flex nfd-flex-row nfd-gap-2 nfd-items-center nfd-justify-between">
						<div className="nfd-flex nfd-flex-row nfd-gap-2 nfd-items-center">
							<Title>{ getTitle() }</Title>
							<Icon className="nfd-w-30" />
						</div>
						<button
							onClick={ handleClose }
							className="nfd-p-1 nfd-rounded-full nfd-text-gray-500 hover:nfd-text-gray-700 hover:nfd-bg-gray-100 nfd-transition-colors"
							aria-label={ __( 'Close welcome banner', 'wp-plugin-bluehost' ) }
						>
							<XMarkIcon className="nfd-w-5 nfd-h-5" />
						</button>
					</div>
					<span>
						{ __( 'Now go head with the suggested steps below - or feel free to explore your dashboard!', 'wp-plugin-bluehost' ) }
					</span>
				</Card.Header>
				<Card.Content>
					<div className="nfd-grid nfd-gap-4 nfd-grid-cols-1 min-[783px]:nfd-grid-cols-2 min-[960px]:nfd-grid-cols-3">
						<div className="nfd-flex nfd-flex-row nfd-gap-4 nfd-items-center min-[960px]:nfd-border-r min-[960px]:nfd-border-gray-200 min-[960px]:nfd-pr-4">
							<div className="nfd-card__content__icon_wrapper nfd-flex-shrink-0 nfd-w-[62px] nfd-h-[62px] nfd-flex nfd-items-center nfd-justify-center">
								<LaunchIcon className="nfd-w-[34px]" />
							</div>
							<div className="nfd-flex nfd-flex-col nfd-gap-2 nfd-flex-1">
								<Title as="h5">
									{ __( 'Launch our Setup Wizard', 'wp-plugin-bluehost' ) }
								</Title>
								<span>
									{ __( 'An easy, step-by-step process—from creating your products to setting up taxes and shipping.', 'wp-plugin-bluehost' ) }
								</span>
							</div>
						</div>
						<div className="nfd-flex nfd-flex-row nfd-gap-4 nfd-items-center min-[960px]:nfd-border-r min-[960px]:nfd-border-gray-200 min-[960px]:nfd-pr-4">
							<div className="nfd-card__content__icon_wrapper nfd-flex-shrink-0 nfd-w-[62px] nfd-h-[62px] nfd-flex nfd-items-center nfd-justify-center">
								<VideoIcon className="nfd-w-[34px] nfd-stroke-[0.02px]" />
							</div>
							<div className="nfd-flex nfd-flex-col nfd-gap-2 nfd-flex-1">
								<Title as="h5">
									{ __( 'Watch our Quick Start Guide video', 'wp-plugin-bluehost' ) }
								</Title>
								<span>
									{ __( 'Discover what you can do and how — in just three minutes of video: the first essential step to building your shop', 'wp-plugin-bluehost' ) }
								</span>
							</div>
						</div>
						<div className="nfd-flex nfd-flex-row nfd-gap-4 nfd-items-center">
							<div className="nfd-card__content__icon_wrapper nfd-flex-shrink-0 nfd-w-[62px] nfd-h-[62px] nfd-flex nfd-items-center nfd-justify-center">
								<DocumentIcon className="nfd-w-[34px] nfd-stroke-[0.02px]" />
							</div>
							<div className="nfd-flex nfd-flex-col nfd-gap-2 nfd-flex-1">
								<Title as="h5">
									{ __( 'Read our First steps tutorial', 'wp-plugin-bluehost' ) }
								</Title>
								<span>
									{ __( 'A comprehensive guide you can follow to build your store exactly the way you want it.', 'wp-plugin-bluehost' ) }
								</span>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card>
		</div>
	);
};

export default WelcomeBanner;
