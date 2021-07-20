const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Claim from './Claim.js';

const Inputs = Component(function(node, idxs, idx, props) {

	if (node.inputs.length > 0 & node.open) {
	
		return html`<div
			class="inputs"
			style="${!node.displayInputs ? 'display: none;' : ''}"
			id="inputs-${idxs.join('-') + '-' + idx}">${node.inputs.map((d, i) => Claim(d, idxs.concat([idx]), i, props))}</div>`;
	
	} else {
	
		return html``;
	
	}


})

export default Inputs;