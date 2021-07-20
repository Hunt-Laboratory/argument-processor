const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const Toolbar = Component(function(corpus, setAppStatus) {

	function Button(icon, action, callback) {
		return html`<button onclick="${callback}" data-action="${action}"><i class="fas fa-${icon}"></i></button>`;
	}

	return html`<div class="toolbar">
		${Button('edit', 'Edit', () => {})}
		${Button('acorn', 'Seed', () => {})}
		${Button('adjust', 'Contrast', () => {})}
		${Button('air-freshener', 'Freshen Up', () => {})}
	</div>`;

});

export default Toolbar;