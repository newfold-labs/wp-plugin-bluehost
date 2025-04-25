import './stylesheet.scss';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { useNotification } from 'App/components/notifications';
// component sourced from staging module
import { default as NewfoldStaging } from '@modules/wp-module-staging/components/staging/';

const Staging = () => {
	// methods to pass to module
	const moduleMethods = {
		apiFetch,
		classNames,
		useState,
		useEffect,
		NewfoldRuntime,
		useNotification,
	};

	return <NewfoldStaging methods={ moduleMethods } />;
};

export default Staging;
