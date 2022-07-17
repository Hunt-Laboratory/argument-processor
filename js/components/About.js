const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import examples from './examples.js';

import utils from '../utils.js';
let { randomString } = utils;

const About = Component(function(setModal, setTitle, setDoc, directory, setDirectory, setDocId) {

	function loadExample(name) {
		return () => {
			let newId = randomString();
			setDirectory(prevDirectory => {
				let newDirectory = {...prevDirectory};
				newDirectory[newId] = {
					title: name,
					lastEdited: Date.parse(String(new Date())),
					doc: _.cloneDeep(examples[name])
				};
				window.localStorage.files = JSON.stringify(newDirectory);
				return newDirectory;
			})
			setDocId(newId);
			setDoc(_.cloneDeep(examples[name]));
			setModal(false);
		}
	}

	return html`<div class="modal-box" onclick="${() => {setModal(false)}}">
		<div class="modal">
			<p>This is a prototype <em>argument processor</em>.</p>

			<p>An argument processor is to structured argumentation what a word processor is to arbitrary text.</p>

			<p>In the settings, you can add an OpenAI API key to enable language model functionality built on GPT-3.</p>

			<p>Please address any enquiries to <a href="https://lukethorburn.com">Luke Thorburn</a>.</p>

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

export default About;