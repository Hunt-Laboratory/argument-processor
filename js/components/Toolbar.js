const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Directory from './Directory.js';
import Shortcuts from './Shortcuts.js';
import Settings from './Settings.js';
import About from './About.js';

import utils from '../utils.js';
let { downloadObjectAsJson, randomString } = utils;

const Toolbar = Component(function(doc, setDoc, directory, setDirectory, docId, setDocId, title, setTitle, setMode, options, setOptions, updateNodeText) {

	let [modal, setModal] = useState(() => {
		if (!window.localStorage.hasOwnProperty('usedBefore')) {
			window.localStorage['usedBefore'] = true;
			return 'about';
		} else {
			return false;
		}
	});

	function Button(icon, action, callback) {
		return html`<button onclick="${callback}" data-action="${action}"><i class="fas fa-${icon}"></i></button>`;
	}

	function changeMode(mode) {
		setMode(mode);
		document.body.setAttribute('data-mode', mode);
	}

	// ${Button('calculator', 'Suggest conclusion', () => {
	// 		updateNodeText();
	// 		changeMode('suggest-conclusion');
	// 	})}

		

	return html`<div class="toolbar">

		<div class="group">

		${Button('folder-open', 'Open file', () => {
			updateNodeText();
			setModal('directory');
		})}
	
		${Button('download', 'Download', () => {
			updateNodeText();
			downloadObjectAsJson(directory[docId], `${title}.argx`);
		})}

		${Button('i-cursor', 'Rename', () => {
			updateNodeText();
			let newTitle = prompt("Edit the file name and click 'OK'.", title);
			setTitle(newTitle ? newTitle : title);
		})}

		</div>
		<div class="group ${options.keyIsValid ? '' : 'hide'}">

		${false ? Button('route', 'Suggest intermediary claims', () => {
			updateNodeText();
			changeMode('generate-reasoning');
		}) : ''}

		${Button('comment-slash', 'Suggest copremise', () => {
			updateNodeText();
			changeMode('complete-enthymeme');
		})}

		${Button('hammer fa-flip-horizontal', 'Suggest reasons', () => {
			updateNodeText();
			changeMode('suggest-reasons');
		})}

		${Button('axe fa-flip-horizontal', 'Suggest objections', () => {
			updateNodeText();
			changeMode('suggest-objections');
		})}

		${false ? Button('shapes', 'Suggest abstraction', () => {
			updateNodeText();
			changeMode('suggest-abstraction');
		}) : ''}

		</div>
		<div class="group">

		${Button('cog', 'Settings', () => {
			updateNodeText();
			setModal('settings');
		})}

		${Button('keyboard', 'Shortcuts', () => {
			updateNodeText();
			setModal('shortcuts');
		})}
	
		${Button('question', 'About this tool', () => {
			updateNodeText();
			setModal('about');
		})}

		</div>

		<input id="file-input" type="file" name="open-file" class="hide" onchange="${(ev) => {
			let file = ev.target.files[0], // FileList object
				reader = new FileReader();
			

			reader.onload = function(e) {
				let data = JSON.parse(e.target.result);
				setDirectory(prevDirectory => {
					let newDirectory = {...prevDirectory};
					newDirectory[randomString()] = data;
					window.localStorage.files = JSON.stringify(newDirectory);
					return newDirectory;
				})
			}

			reader.readAsText(file)
		}}"/>
	
	</div>

	${modal == 'directory' ? Directory(directory, setDirectory, docId, setDocId, doc, setDoc, title, setTitle, setModal, options, setOptions) : ''}
	${modal == 'settings' ? Settings(setModal, options, setOptions) : ''}
	${modal == 'shortcuts' ? Shortcuts(setModal) : ''}
	${modal == 'about' ? About(setModal, setTitle, setDoc, directory, setDirectory, setDocId) : ''}

	`;

});

export default Toolbar;