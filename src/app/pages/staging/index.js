import './stylesheet.scss';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { useNotification } from 'App/components/notifications';
// component sourced from staging module
import { default as NewfoldStaging } from '@modules/wp-module-staging/components/staging/';

const Staging = () => {
	// constants to pass to module
	const moduleConstants = {
		text: {
			cancel: __( 'Cancel', 'wp-plugin-bluehost' ),
			clone: __( 'Clone', 'wp-plugin-bluehost' ),
			cloneConfirm: __( 'Confirm Clone Action', 'wp-plugin-bluehost' ),
			cloneDescription: __(
				'This will overwrite anything in staging and update it to an exact clone of the current production site. Are you sure you want to proceed?',
				'wp-plugin-bluehost'
			),
			cloneNoticeCompleteText: __(
				'Cloned to Staging',
				'wp-plugin-bluehost'
			),
			cloneNoticeStartText: __(
				'Cloning production to staging, this should take about a minute.',
				'wp-plugin-bluehost'
			),
			cloneStagingSite: __( 'Clone to staging', 'wp-plugin-bluehost' ),
			created: __( 'Created', 'wp-plugin-bluehost' ),
			createNoticeCompleteText: __(
				'Staging Created',
				'wp-plugin-bluehost'
			),
			createNoticeStartText: __(
				'Creating a staging site, this should take about a minute.',
				'wp-plugin-bluehost'
			),
			createStagingSite: __(
				'Create staging site',
				'wp-plugin-bluehost'
			),
			currentlyEditing: __( 'Currently editing', 'wp-plugin-bluehost' ),
			delete: __( 'Delete', 'wp-plugin-bluehost' ),
			deleteConfirm: __( 'Confirm Delete', 'wp-plugin-bluehost' ),
			deleteDescription: __(
				"This will permanently delete staging site. Are you sure you want to proceed? You can recreate another staging site at any time, but any specific changes you've made to this staging site will be lost.",
				'wp-plugin-bluehost'
			),
			deleteNoticeCompleteText: __(
				'Deleted Staging',
				'wp-plugin-bluehost'
			),
			deleteNoticeStartText: __(
				'Deleting the staging site, this should take about a minute.',
				'wp-plugin-bluehost'
			),
			deleteSite: __( 'Delete Staging Site', 'wp-plugin-bluehost' ),
			deploy: __( 'Deploy', 'wp-plugin-bluehost' ),
			deployAll: __( 'Deploy all changes', 'wp-plugin-bluehost' ),
			deployConfirm: __( 'Confirm Deployment', 'wp-plugin-bluehost' ),
			deployDatabase: __( 'Deploy database only', 'wp-plugin-bluehost' ),
			deployDescription: __(
				'This will deploy staging to production and overwrite current production site. Are you sure you want to proceed?',
				'wp-plugin-bluehost'
			),
			deployFiles: __( 'Deploy files only', 'wp-plugin-bluehost' ),
			deployNoticeCompleteText: __( 'Deployed', 'wp-plugin-bluehost' ),
			deployNoticeStartText: __(
				'Deploying from staging to production, this should take about a minute.',
				'wp-plugin-bluehost'
			),
			deploySite: __( 'Deploy Site', 'wp-plugin-bluehost' ),
			error: __( 'Error', 'wp-plugin-bluehost' ),
			noStagingSite: __(
				"You don't have a staging site yet.",
				'wp-plugin-bluehost'
			),
			notCurrentlyEditing: __(
				'Not currently editing',
				'wp-plugin-bluehost'
			),
			proceed: __( 'Proceed', 'wp-plugin-bluehost' ),
			productionSiteTitle: __( 'Production Site', 'wp-plugin-bluehost' ),
			stagingSiteTitle: __( 'Staging Site', 'wp-plugin-bluehost' ),
			subTitle: __(
				'A staging site is a duplicate of your live site, offering a secure environment to experiment, test updates, and deploy when ready.',
				'wp-plugin-bluehost'
			),
			switch: __( 'Switch', 'wp-plugin-bluehost' ),
			switching: __( 'Switching', 'wp-plugin-bluehost' ),
			switchToProduction: __(
				'Switch to Production',
				'wp-plugin-bluehost'
			),
			switchToProductionDescription: __(
				'This will navigate you to the production environment',
				'wp-plugin-bluehost'
			),
			switchToProductionNoticeCompleteText: __(
				'Loading the production environment now.',
				'wp-plugin-bluehost'
			),
			switchToProductionNoticeStartText: __(
				'Switching to the production environment, this should take about a minute.',
				'wp-plugin-bluehost'
			),
			switchToStaging: __( 'Switch to Staging', 'wp-plugin-bluehost' ),
			switchToStagingDescription: __(
				'This will navigate you to the staging environment',
				'wp-plugin-bluehost'
			),
			switchToStagingNoticeCompleteText: __(
				'Loading the staging environment now.',
				'wp-plugin-bluehost'
			),
			switchToStagingNoticeStartText: __(
				'Switching to the staging environment, this should take about a minute.',
				'wp-plugin-bluehost'
			),
			title: __( 'Staging', 'wp-plugin-bluehost' ),
			unknownErrorMessage: __(
				'An unknown error has occurred.',
				'wp-plugin-bluehost'
			),
			working: __( 'Working…', 'wp-plugin-bluehost' ),
		},
	};

	// methods to pass to module
	const moduleMethods = {
		apiFetch,
		classNames,
		useState,
		useEffect,
		NewfoldRuntime,
		useNotification,
	};

	return (
		<NewfoldStaging
			constants={ moduleConstants }
			methods={ moduleMethods }
		/>
	);
};

export default Staging;
