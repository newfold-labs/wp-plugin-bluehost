import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { ReactComponent as FreeShippingIcon } from 'App/images/sales-discounts-free-shipping.svg';
import { ReactComponent as BuyOndGetOneIcon } from 'App/images/sales-discounts-bogo.svg';
import { ReactComponent as GiftIcon } from 'App/images/sales-discounts-gift-product.svg';
import { ReactComponent as CategoryDiscountIcon } from 'App/images/sales-discounts-category-discount.svg';
import { ReactComponent as UpsellThankYouIcon } from 'App/images/sales-discounts-upsell-thank-you.svg';
import { ReactComponent as LastMinuteDealIcon } from 'App/images/sales-discounts-last-minute-deal.svg';

const promotions = [
	{
		name: 'free-shipping',
		title: __( 'Free Shipping', 'wp-plugin-bluehost' ),
		description: __(
			'Attract and retain customers by offering free shipping based on cart amount, location or store category.',
			'wp-plugin-bluehost'
		),
		icon: <FreeShippingIcon />
	},
	{
		name: 'bogo',
		title: __( 'Buy 1 Get 1', 'wp-plugin-bluehost' ),
		description: __(
			'Attract customers with a compelling deal where they can buy one product and get another product for free.',
			'wp-plugin-bluehost'
		),
		icon: <BuyOndGetOneIcon />
	},
	{
		name: 'gift',
		title: __( 'Gift Product in Cart', 'wp-plugin-bluehost' ),
		description: __(
			'Reward customers with a free gift in their cart based on total cart value, or specific products or categories.',
			'wp-plugin-bluehost'
		),
		icon: <GiftIcon />
	},
	{
		name: 'category-discount',
		title: __( 'Category Discount', 'wp-plugin-bluehost' ),
		description: __(
			'Give your customers a discount on specific categories of products and boost sales for those categories.',
			'wp-plugin-bluehost'
		),
		icon: <CategoryDiscountIcon />
	},
	{
		name: 'upsell-thank-you',
		title: __( 'Upsell in Thank You Page', 'wp-plugin-bluehost' ),
		description: __(
			'Maximize sales by presenting relevant upsell options after customers have completed their purchase.',
			'wp-plugin-bluehost'
		),
		icon: <UpsellThankYouIcon />
	},
	{
		name: 'last-minute-deal',
		title: __( 'Last Minute Deal', 'wp-plugin-bluehost' ),
		description: __(
			'Create urgency with a special time-limited deal for customers on the cart and checkout pages.',
			'wp-plugin-bluehost'
		),
		icon: <LastMinuteDealIcon />
	},
];

export default promotions;
