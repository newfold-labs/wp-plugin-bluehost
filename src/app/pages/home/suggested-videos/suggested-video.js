import { Card, Title } from '@newfold/ui-component-library';
import { __ } from '@wordpress/i18n';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { PlayIcon } from '@heroicons/react/24/outline';

export default () => (
	<Card
		className={
			'nfd-suggested-video-card nfd-flex nfd-flex-col nfd-gap-4 nfd-border nfd-border-[#D5D5D5] nfd-shadow-none'
		}
	>
		<div
			className={
				'nfd-flex nfd-justify-center nfd-items-center nfd-w-full nfd-h-[130px] nfd-bg-[#2c5ead] nfd-text-white nfd-rounded-lg'
			}
		>
			<PlayCircleIcon width={ 24 } />
		</div>
		<Title
			as={ 'h2' }
			className={ 'nf-text-base nfd-font-semibold nfd-mt-0' }
		>
			{ __(
				'Learn how to use blocks to design your Store',
				'wp-plugin-bluehost'
			) }
		</Title>
		{ __(
			'This video tutorial will walk you through the basics of the WordPress Block Editor and help you start building like a pro.',
			'wp-plugin-bluehost'
		) }
		<a
			className={
				'nfd-w-fit nfd-flex nfd-gap-1 nfd-mt-2 nfd-p-2 nfd-pr-2.5 nfd-border nfd-border-[#D1D5DC] nfd-text-[#4A5565] nfd-text-sm nfd-font-semibold nfd-rounded-lg nfd-no-underline'
			}
			href={ '#video-url' }
		>
			<PlayIcon width={ 16 } strokeWidth={ 2 } />
			{ __( 'Watch Video', 'wp-plugin-bluehost' ) }
		</a>
	</Card>
);
