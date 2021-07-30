const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Shortcuts from './Shortcuts.js';
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

const Toolbar = Component(function(doc, setDoc, title, setTitle) {

	let [shortcuts, setShortcuts] = useState(false);
	let [about, setAbout] = useState(false);

	function Button(icon, action, callback) {
		return html`<button onclick="${callback}" data-action="${action}"><i class="fas fa-${icon}"></i></button>`;
	}

	return html`<div class="toolbar">

		${Button('folder-open', 'Open file', () => {
			document.getElementById('file-input').click();
		})}
	
		${Button('download', 'Download', () => { downloadObjectAsJson(doc, `${title}.argx`) })}
	
		${Button('i-cursor', 'Rename', () => {
			setTitle(prompt("Edit the file name and click 'OK'.", title));
		})}
	
		${Button('keyboard', 'Shortcuts', () => { setShortcuts(true) })}
	
		${Button('question', 'About this tool', () => { setAbout(true) })}

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

	${shortcuts ? Shortcuts(setShortcuts) : ''}
	${about ? About(setAbout, setTitle, setDoc) : ''}

	`;

});

export default Toolbar;