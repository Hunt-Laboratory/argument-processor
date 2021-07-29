const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const Toolbar = Component(function(corpus, setAppStatus) {

	function Button(icon, action, callback) {
		return html`<button onclick="${callback}" data-action="${action}"><i class="fas fa-${icon}"></i></button>`;
	}

	return html`<div class="toolbar">
		${Button('save', 'Save', () => {})}
		${Button('download', 'Download', () => {})}
		${Button('keyboard', 'Shortcuts', () => {})}
		${Button('question', 'About this tool', () => {})}
	</div>`;

});

export default Toolbar;