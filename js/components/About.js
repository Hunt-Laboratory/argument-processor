const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const About = Component(function(setAbout) {

	return html`<div class="modal-box" onclick="${() => {setAbout(false)}}">
		<div class="modal">
			<p>This is a prototype <em>argument processor</em>.</p>

			<p>An argument processor is to analytic reasoning what a word processor is to arbitrary text.</p>

			<p>The tool is a work-in-progress. Please address any enquiries to Luke Thorburn at <a href="mailto:luke.thorburn@unimelb.edu.au">luke.thorburn@unimelb.edu.au</a>.</p>

			<p>Thank you to Ashley Barnett for contributing the sample arguments.</p>

			<p class="click-to-close">Click anywhere to close.</p>
		</div>
	</div>`;

});

export default About;