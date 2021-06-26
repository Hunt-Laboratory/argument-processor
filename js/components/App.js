const {neverland: $, render, html, useState} = window.neverland;

import Router from './Router.js';

const App = $(function() {
	
	const [appStatus, setAppStatus] = useState({
		isLoggedIn: false,
		corpus: null,
		payload: {
			'docs': []
		}
	});
	
	return html`${Router(appStatus, setAppStatus)}`;

});

export default App;