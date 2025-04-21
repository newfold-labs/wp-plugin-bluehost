import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect, useContext, Fragment } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import AppStore from '../../data/store';
import { useNotification } from 'App/components/notifications';
import { getPlatformPathUrl, addUtmParams } from '../../util/helpers';

import { Container, Page } from '@newfold/ui-component-library';

import { default as NewfoldHosting } from '@modules/wp-module-hosting/components/Panel';

const HostingPage = () => {
	const moduleConstants = {};
	// methods to pass to module
	const moduleMethods = {
		apiFetch,
		useState,
		useEffect,
		useContext,
		NewfoldRuntime,
		useNotification,
		useUpdateEffect,
		AppStore,
		getPlatformPathUrl,
		addUtmParams,
	};

	const moduleComponents = {
		Fragment,
	};

	return (
		<Page
			title="Hosting"
			className="wppbh-app-settings-page nfd-border-0 nfd-shadow-none"
		>
			<Container className="wppbh-app-settings-container nfd-bg-transparent nfd-shadow-none">
				<NewfoldHosting
					constants={ moduleConstants }
					methods={ moduleMethods }
					Components={ moduleComponents }
				/>
			</Container>
		</Page>
	);
};

export default HostingPage;
