const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import examples from './examples.js';

const About = Component(function(setAbout, setTitle, setDoc) {

	function loadExample(name) {
		return () => {
			setDoc(_.cloneDeep(examples[name]));
			setTitle(name);
		}
	}

	return html`<div class="modal-box" onclick="${() => {setAbout(false)}}">
		<div class="modal">
			<p>This is a prototype <em>argument processor</em>.</p>

			<p>An argument processor is to analytic reasoning what a word processor is to arbitrary text.</p>

			<p>The tool is a work-in-progress. Please address any enquiries to Luke Thorburn at <a href="mailto:luke.thorburn@unimelb.edu.au">luke.thorburn@unimelb.edu.au</a>.</p>

			<p>Thank you to Ashley Barnett for contributing the following sample arguments (click to load).</p>

			<ul class="sample">
				<li><button onclick="${loadExample('Watson')}">Watson</button></li>
				<li><button onclick="${loadExample('Cyber Attribution')}">Cyber Attribution</button></li>
				<li><button onclick="${loadExample('Abbottabad')}">Abbottabad</button></li>
				<li><button onclick="${loadExample('Misinformation')}">Misinformation</button></li>
			</ul>


			<p class="click-to-close">Click anywhere to close.</p>
		</div>
	</div>`;

});

// <p>Demo examples:</p>

// <ul class="sample">
// 	<li><button onclick="${loadExample('Luke')}">Luke</button></li>
// 	<li><button onclick="${loadExample('Kabul 1')}">Kabul 1</button></li>
// 	<li><button onclick="${loadExample('Kabul 2')}">Kabul 2</button></li>
// </ul>

export default About;