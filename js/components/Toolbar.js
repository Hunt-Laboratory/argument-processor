const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Shortcuts from './Shortcuts.js';
import Settings from './Settings.js';
import About from './About.js';

function downloadObjectAsJson(exportObj, exportName){
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href",     dataStr);
	downloadAnchorNode.setAttribute("download", exportName);
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

const Toolbar = Component(function(doc, setDoc, title, setTitle, setMode, options, setOptions, updateNodeText) {

	let [shortcuts, setShortcuts] = useState(false);
	let [settings, setSettings] = useState(false);
	let [about, setAbout] = useState(false);

	function Button(icon, action, callback) {
		return html`<button onclick="${callback}" data-action="${action}"><i class="fas fa-${icon}"></i></button>`;
	}

	function changeMode(mode) {
		setMode(mode);
		document.body.setAttribute('data-mode', mode);
	}

	return html`<div class="toolbar">

		<div class="group">

		${Button('folder-open', 'Open file', () => {
			updateNodeText();
			document.getElementById('file-input').click();
		})}
	
		${Button('download', 'Download', () => {
			updateNodeText();
			downloadObjectAsJson(doc, `${title}.argx`);
		})}

		${Button('i-cursor', 'Rename', () => {
			updateNodeText();
			setTitle(prompt("Edit the file name and click 'OK'.", title));
		})}

		</div>
		<div class="group">

		${Button('route', 'Suggest intermediary claims', () => {
			updateNodeText();
			changeMode('generate-reasoning');
		})}

		${Button('comment-slash', 'Suggest assumptions', () => {
			updateNodeText();
			changeMode('complete-enthymeme');
		})}

		</div>
		<div class="group">

		${Button('cog', 'Settings', () => {
			updateNodeText();
			setSettings(true);
		})}

		${Button('keyboard', 'Shortcuts', () => {
			updateNodeText();
			setShortcuts(true);
		})}
	
		${Button('question', 'About this tool', () => {
			updateNodeText();
			setAbout(true);
		})}

		</div>

		<input id="file-input" type="file" name="open-file" class="hide" onchange="${(ev) => {
			let file = ev.target.files[0], // FileList object
				reader = new FileReader();
			
			setTitle(file.name.replace('.argx', ''));

			reader.onload = function(e) {
				let data = JSON.parse(e.target.result);
				setDoc(data);
			}

			reader.readAsText(file)
		}}"/>
	
	</div>

	${settings ? Settings(setSettings, options, setOptions) : ''}
	${shortcuts ? Shortcuts(setShortcuts) : ''}
	${about ? About(setAbout, setTitle, setDoc) : ''}

	`;

});

export default Toolbar;