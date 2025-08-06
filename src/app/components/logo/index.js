import { Button } from '@wordpress/components';
import { Title } from '@newfold/ui-component-library';
import { ReactComponent as Brand } from 'Assets/svg/bluehost-logo.svg';
import { BluehostIcon } from 'App/components/icons';
import { delay } from 'lodash';

const Mark = ({variant}) => {
	const isIcon = 'icon' === variant;
	const defocus = () => {
		const button = document.querySelector( '.logo-mark' );
		delay( () => {
			if ( null !== button ) {
				button.blur();
			}
		}, 500 );
	};
	return (
		<Button
			icon={ isIcon ? <BluehostIcon dimension={ 35 } color={'#3575d3'}/> : <Brand className="wppbh-logo nfd-w-full nfd-h-auto"/> }
			style={ { width: isIcon ? '35px' : '160px', height: 'auto' } }
			onMouseUp={ defocus }
			className="logo-mark nfd-p-0"
			href="#/home"
			aria-label="Bluehost"
		/>
	);
};

const Logo = ( { variant = 'wordmark' } ) => {
	return (
		<div className="wppbh-logo-wrap nfd-flex nfd-items-center nfd-justify-center">
			<Mark variant={ variant }/>
			<Title as="h2" className="nfd-sr-only">
				{ __( 'Bluehost WordPress Plugin', 'wp-plugin-bluehost' ) }
			</Title>
		</div>
	);
};

export default Logo;
