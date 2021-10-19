const {neverland: Component, render, html, useState} = window.neverland;

import Router from './Router.js';

const App = Component(function() {
	
	return html`${Router()}`;

});

export default App;