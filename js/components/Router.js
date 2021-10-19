const {neverland: Component, render, html, useState} = window.neverland;

import Processor from './Processor.js';

const Router = Component(function() {

	return html`
		${Processor()}
	`;

});

export default Router;