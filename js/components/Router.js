const {neverland: $, render, html, useState} = window.neverland;

import Processor from './Processor.js';

const Router = $(function(appStatus, setAppStatus) {

	return html`
		${Processor(appStatus.corpus, setAppStatus)}
	`;

});

export default Router;