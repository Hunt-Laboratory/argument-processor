const {neverland: $, render, html, useState} = window.neverland;

import App from './components/App.js';

render(document.body, html`
	${App()}
`);

