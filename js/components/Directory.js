const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import utils from '../utils.js';
let { randomString, recency, downloadObjectAsJson } = utils;

function defaultNode(indent, text = '', suggestion = false, joint = false, type = 'claim') {

	return {
		id: randomString(),
		text: text,
		type: type,
		label: type,
		open: true,
		display: true,
		indent: indent,
		joint: joint,
		suggestion: suggestion
	}
}

const Directory = Component(function(directory, setDirectory, docId, setDocId, doc, setDoc, title, setTitle, setModal, options, setOptions) {

	return html`<div class="modal-box">
		<div class="modal directory">
			<p>Files are saved automatically as you edit to the local storage in your browser. However, local storage may be cleared if you clear your browser history or cache. To ensure you don't lose your work, please download a copy of the files you want to keep at the end of each editing session.</p>

			<div class="file-list">

				<div class="top-actions">
					<button data-action="Open local file" onclick="${() => {
							document.getElementById('file-input').click();
						}}">
						<i class="fas fa-folder-open"></i>
					</button>
					<button data-action="New file" onclick="${() => {
							let newId = randomString();
							setDirectory(prevDirectory => {
								let newDirectory = {...prevDirectory};
								newDirectory[newId] = {
									title: 'New Argument',
									lastEdited: Date.parse(String(new Date())),
									doc: [defaultNode(0)]
								};
								window.localStorage.files = JSON.stringify(newDirectory);
								return newDirectory;
							});
						}}">
						<i class="fas fa-plus"></i>
					</button>
				</div>

				${Object.keys(directory)
						.sort((a, b) => {
							return directory[b].lastEdited - directory[a].lastEdited;
						})
						.map(fileId => {
					let file = directory[fileId];
					return html`<div class="file">
						<div class="open" onclick="${() => {
								setDocId(fileId);
								setDoc(_.cloneDeep(directory[fileId].doc));
								setModal(false);
							}}">
							<span class="title">${file.title}</span>
							<span class="edited">${recency(file.lastEdited)}</span>

						</div>
						<div class="actions">
							<button onclick="${() => {
									let newTitle = prompt("Edit the file name and click 'OK'.", file.title);
									newTitle = newTitle ? newTitle : file.title;
									setDirectory(prevDirectory => {
										let newDirectory = {...prevDirectory};
										newDirectory[fileId].title = newTitle;
										window.localStorage.files = JSON.stringify(newDirectory);
										return newDirectory;
									});
									if (fileId == docId) {
										setTitle(newTitle);
									}
								}}">
								<i class="fas fa-i-cursor"></i>
							</button>
							<button onclick="${() => {
								downloadObjectAsJson(file, `${file.title}.argx`);
							}}">
								<i class="fas fa-download"></i>
							</button>
							<button onclick="${() => {
									
									if (fileId == docId) {
									
										if (Object.keys(directory).length > 1) {

											// Delete and open the next most recently edited file.

											let newId = Object.keys(directory)
												.filter(d => d != fileId)
												.sort((a, b) => {
													return directory[b].lastEdited - directory[a].lastEdited;
												})[0];

											setDoc(_.cloneDeep(directory[newId].doc));
											setDocId(newId);

											setDirectory(prevDirectory => {
												let newDirectory = {...prevDirectory};
												delete newDirectory[fileId];
												window.localStorage.files = JSON.stringify(newDirectory);
												return newDirectory;
											})

										} else {

											// "Delete" and replace with an empty file.

											setTitle('New Argument');
											setDoc([defaultNode(0)]);

										}
									
									} else {

										setDirectory(prevDirectory => {
											let newDirectory = {...prevDirectory};
											delete newDirectory[fileId];
											window.localStorage.files = JSON.stringify(newDirectory);
											return newDirectory;
										})

									}

								}}">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>`
				})}

			</div>

			<p class="click-to-close" onclick="${() => {setModal(false)}}">Click here to close.</p>
		</div>
	</div>`;

	// Note: GPT-3 model size estimates are taken from https://blog.eleuther.ai/gpt3-model-sizes/.

});

export default Directory;