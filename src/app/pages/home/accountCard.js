import {
	CpuChipIcon,
	CreditCardIcon,
	EnvelopeIcon,
	GiftIcon,
	IdentificationIcon,
	ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Card, Title } from '@newfold/ui-component-library';
import {
	addUtmParams,
	getPlatformPathUrl,
	getPlatformBaseUrl,
	isJarvis,
} from '../../util/helpers';
import classNames from 'classnames';

const base = [
	{
		icon: CpuChipIcon,
		id: 'account_link',
		href: addUtmParams( getPlatformPathUrl( 'hosting/list', 'app' ) ),
		label: isJarvis()
			? __( 'Hosting', 'wp-plugin-bluehost' )
			: __( 'Control Panel', 'wp-plugin-bluehost' ),
		color: 'nfd-fill-gray',
	},
	{
		icon: GiftIcon,
		id: 'products_link',
		href: addUtmParams(
			getPlatformPathUrl( 'renewal-center', 'account_center#products' )
		),
		label: isJarvis()
			? __( 'Renewal Center', 'wp-plugin-bluehost' )
			: __( 'Products', 'wp-plugin-bluehost' ),
		color: 'nfd-fill-primary-dark',
	},
	{
		icon: CreditCardIcon,
		id: 'billing_link',
		href: addUtmParams(
			getPlatformPathUrl( 'billing-center', 'account_center#billing' )
		),
		label: isJarvis()
			? __( 'Payment Methods', 'wp-plugin-bluehost' )
			: __( 'Billing', 'wp-plugin-bluehost' ),
		color: 'nfd-fill-primary',
	},
	{
		icon: EnvelopeIcon,
		id: 'mail_link',
		href: addUtmParams( getPlatformPathUrl( 'home', 'app#/email-office' ) ),
		label: isJarvis()
			? __( 'Mail', 'wp-plugin-bluehost' )
			: __( 'Mail & Office', 'wp-plugin-bluehost' ),
		color: 'nfd-fill-[#5b5b5b]',
	},
	{
		icon: ShieldCheckIcon,
		id: 'security_link',
		href: addUtmParams(
			getPlatformPathUrl( 'account-center', 'account_center#security' )
		),
		label: __( 'Security', 'wp-plugin-bluehost' ),
		color: 'nfd-fill-[#17b212]',
	},
	{
		icon: IdentificationIcon,
		id: 'validation_token_link',
		href: isJarvis()
			? addUtmParams( getPlatformPathUrl( 'account-center' ) )
			: addUtmParams( getPlatformBaseUrl( '/cgi/token' ) ),
		label: isJarvis()
			? __( 'Profile', 'wp-plugin-bluehost' )
			: __( 'Validation Token', 'wp-plugin-bluehost' ),
		color: 'nfd-fill-[#f89c24]',
	},
];

const AccountCard = ( { props } ) => {
	return (
		<Card { ...props }>
			<Card.Content>
				<Title size={ 2 }>
					{ __( 'Bluehost Account', 'wp-plugin-bluehost' ) }
				</Title>
				<ul
					className={ classNames(
						'max-[575px]:nfd-grid-cols-2 nfd-gap-3',
						'nfd-grid nfd-grid-cols-3 nfd-h-full'
					) }
				>
					{ base.map( ( link ) => (
						<li
							key={ link.id }
							className={ classNames(
								'max-[575px]:nfd-items-start',
								'nfd-flex nfd-items-center nfd-justify-center'
							) }
						>
							<a
								href={ link.href }
								className={ classNames(
									'nfd-flex nfd-flex-col nfd-gap-3',
									'nfd-items-center nfd-text-center',
									'nfd-text-[#404040] hover:nfd-text-primary'
								) }
							>
								<link.icon className={ 'nfd-w-12' } />
								{ link.label }
							</a>
						</li>
					) ) }
				</ul>
			</Card.Content>
		</Card>
	);
};

export default AccountCard;
