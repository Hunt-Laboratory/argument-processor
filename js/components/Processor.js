const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Claim from './Claim.js';
import Toolbar from './Toolbar.js';

import utils from '../utils.js';
let { randomString, setCaret } = utils;

import examples from './examples.js';

const Processor = Component(function() {
	
	let [title, setTitle] = useState(() => {
		if (Object.keys(window.localStorage).includes('fileId')) {
			return JSON.parse(window.localStorage.files)[window.localStorage.fileId].title;
		} else {
			return 'Socrates';
		}
	});

	let [mode, setMode] = useState('auto');

	let [options, setOptions] = useState({
		model: 'text-davinci-002',
		key: localStorage.getItem('key') ? localStorage.getItem('key') : '',
		keyIsValid: false
	});

	useEffect(() => {

		fetch(
			"https://api.openai.com/v1/engines", {
				headers: {
					Authorization: `Bearer ${options.key}`
				}
			}
		)
		.then(response => response.json())
		.then(data => {
			setOptions(prevOptions => {
				let options = {...prevOptions};
				options.keyIsValid = data.hasOwnProperty('data');
				return options;
			})
		})
		
	}, [options.key]);

	function defaultNode(indent, text = '', suggestion = false, joint = false, type = 'pro') {

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

	function getParent(doc, k) {

		let parentIdx = doc.map((d, i) => {
				return {
					idx: i,
					indent: d.indent
				}
			}).filter(d => d.indent == doc[k].indent - 1)
			.filter(d => d.idx < k).pop().idx;

		return doc[parentIdx];

	}

	function allParentsOpen(node) {

		let visible = true,
			parent = doc.filter(d => d.id == node.parent)[0];

		while (parent.parent != null) {
			visible = visible & parent.open;
			parent = doc.filter(d => d.id == parent.parent)[0];
		}
		visible = visible & parent.open;

		return visible;
	}

	function annotate(doc) {

		for (let k = 0; k < doc.length; k++) {

			if (k == 0) {
				doc[k].indent = 0;
			} else if (doc[k].indent > doc[k-1].indent + 1) {
				doc[k].indent = doc[k-1].indent + 1;
			}

			if (doc[k].indent == 0) {
				doc[k].parent = null;
				doc[k].type = 'claim';
				doc[k].joint = false;
			} else {
				doc[k].parent = getParent(doc, k).id;
				doc[k].type = doc[k].label;
			}

		}

		// Ensure that there are no 'half-joins'.
		for (let k = 0; k < doc.length; k++) {
			if (doc[k].joint) {
				let siblings = children({ id: doc[k].parent }, doc).map(d => d.id);
				if (siblings.indexOf(doc[k].id) == siblings.length - 1) {
					doc[k].joint = false;
				}
			}
		}

		return doc;
	}

	let [directory, setDirectory] = useState(() => {
		// Remember, you can only store strings in local storage, so need to stringify JSON first.

		if (Object.keys(window.localStorage).includes('files')) {
			return JSON.parse(window.localStorage.files);
		} else {
			let newDirectory = {};
			newDirectory[randomString()] = {
				title: 'Socrates',
				lastEdited: Date.parse(String(new Date())),
				doc: annotate(_.cloneDeep(examples["New Argument"]))
			};
			window.localStorage.files = JSON.stringify(newDirectory);
			return newDirectory;
		}
	});

	let [docId, setDocId] = useState(() => {

		if (Object.keys(window.localStorage).includes('fileId')) {
			let id = window.localStorage.fileId;
			return id;
		} else {
			let id = Object.keys(directory)[0];
			window.localStorage.fileId = id;
			return id;
		}
	})
	let [doc, setDoc] = useState(directory[docId].doc);

	// When doc or title is updated, update directory and write to local storage.
	useEffect(() => {
		setDirectory(oldDirectory => {
			let newDirectory = {...oldDirectory};
			newDirectory[docId].doc = _.cloneDeep(doc);
			newDirectory[docId].lastEdited = Date.parse(String(new Date()));
			newDirectory[docId].title = title;
			window.localStorage.files = JSON.stringify(newDirectory);
			return newDirectory;
		})
	}, [JSON.stringify(doc), title])

	// When docId is updated, update title and local storage.
	useEffect(() => {
		setTitle(directory[docId].title);
		window.localStorage.fileId = docId;
	}, [docId])

	useEffect(() => {
		document.title = title;
	}, [title]);

	let [focus, setFocus] = useState({
		node: null,
		caret: [0, 0],
		editable: true
	});

	useEffect(() => {
		let el = document.querySelector(`#node-${focus.node} .textarea`);
		if (el === null) {
		
			document.activeElement.blur();
		
		} else {
		
			// Focus on element.
			el.focus();

			// Set caret position.
			setCaret(el, focus.caret);
		}
	})

	function getMaxDepth(doc) {
		return Math.max(...doc.filter(d => d.display).map(d => d.indent)) + 1;
	}

	function getGutterWidth(doc) {
		let maxDepth = getMaxDepth(doc);
		return Math.max(( window.innerWidth - (600 + 54 + (maxDepth-1)*60 + 120) ) / 2, 0);
	}

	let [gutterWidth, setGutterWidth] = useState(getGutterWidth(doc));

	function getNodeWidth(doc) {
		let maxDepth = getMaxDepth(doc);
		return Math.max( window.innerWidth, 120 + 600 + 54 + (maxDepth-1)*60);
	}

	let [nodeWidth, setNodeWidth] = useState(getNodeWidth(doc));

	function updateNodeText() {
		setDoc(prevDoc => {
			let doc = [...prevDoc];

			for (let k = 0; k < doc.length; k++) {
				doc[k].text = document.querySelector(`#node-${doc[k].id} .textarea`).textContent;
			}

			return doc;
		})
	}

	// Update on window size change;
	let [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
	useEffect(() => {
		window.addEventListener('resize', () => {
			setSize({
				width: window.innerWidth,
				height: window.innerHeight
			})
		})
	}, [])
	useEffect(() => {
		updateNodeText();
		setGutterWidth(getGutterWidth(doc));
		setNodeWidth(getNodeWidth(doc));
	}, [size.width, size.height]);


	function children(node, doc) {
		return doc.filter(d => d.parent == node.id);
	}

	function descendents(node, doc) {


		let kids = children(node, doc),
			grandkids = [];

		for (let kid of kids) {
			grandkids = grandkids.concat(descendents(kid, doc));
		}

		return kids.concat(grandkids);

	}

	function close(idx) {
		return () => {

			updateNodeText();

			let updater = prevDoc => {
				let doc = [...prevDoc],
					closeIds = descendents(doc[idx], doc).map(d => d.id);
				
				for (let k = 0; k < doc.length; k++) {
					if (closeIds.includes(doc[k].id)) {
						doc[k].display = false;
					}
				}

				return doc;
			};

			let closeIds = descendents(doc[idx], doc).map(d => d.id);
			
			// document.querySelector(`#caret-${doc[idx].id}`).classList.toggle('open');
			
			setDoc(prevDoc => {
				let doc = [...prevDoc],
					closeIds = descendents(doc[idx], doc).map(d => d.id);
				
				for (let k = 0; k < doc.length; k++) {
					if (closeIds.includes(doc[k].id)) {
						doc[k].transparent = true;
					}
				}

				doc[idx].open = false;

				return doc;
			})

			setGutterWidth(getGutterWidth(updater(_.cloneDeep(doc))));
			setNodeWidth(getNodeWidth(updater(_.cloneDeep(doc))));

			for (let id of closeIds) {
				$(`#node-${id}`).slideUp(200);
			}

			setTimeout(() => {
				setDoc(updater)
			}, 200)

		}
	}

	function open(idx) {
		return () => {

			updateNodeText();

			let updater = prevDoc => {
				let doc = [...prevDoc],
					openIds = descendents(doc[idx], doc).filter(d => allParentsOpen(d)).map(d => d.id);
				
				for (let k = 0; k < doc.length; k++) {
					if (openIds.includes(doc[k].id)) {
						doc[k].display = true;
					}
				}
				
				return doc;
			};

			setDoc(prevDoc => {
				let doc = [...prevDoc];
				doc[idx].open = true;
				return doc;
			});

			setGutterWidth(getGutterWidth(updater(_.cloneDeep(doc))));
			setNodeWidth(getNodeWidth(updater(_.cloneDeep(doc))));

			let openIds = descendents(doc[idx], doc).filter(d => allParentsOpen(d)).map(d => d.id);
			for (let id of openIds) {
				$(`#node-${id}`).slideDown(200);
			}

			setTimeout(() => {
				setDoc(prevDoc => {
					let doc = [...prevDoc],
						openIds = descendents(doc[idx], doc).filter(d => allParentsOpen(d)).map(d => d.id);
					
					for (let k = 0; k < doc.length; k++) {
						if (openIds.includes(doc[k].id)) {
							doc[k].transparent = false;
						}
					}

					return doc;
				})
			}, 100)

			setTimeout(() => {
				setDoc(updater)
			}, 200)

		}
	}

	function indentNode(idx, delta) {

		let updater = prevDoc => {
			let doc = [...prevDoc],
				indentIds = descendents(doc[idx], doc).map(d => d.id);

			if (idx == 0) {
				delta = 0; // No parent, so can't indent.
			} else if (doc[idx].indent - doc[idx - 1].indent == 1 & delta == 1) {
				delta = 0; // Would indent too far, so cancel.
			} else if (doc[idx].indent == 0 & delta == -1) {
				delta = 0; // Would produce negative indent, so cancel.
			}

			doc[idx].indent = doc[idx].indent + delta;
			for (let id of indentIds) {
				idx = doc.map(d => d.id).indexOf(id);
				doc[idx].indent = doc[idx].indent + delta;
			}

			doc = annotate(doc);

			setGutterWidth(getGutterWidth(doc));
			setNodeWidth(getNodeWidth(doc));

			return doc;
		}

		setDoc(updater);

		// setGutterWidth(getGutterWidth(updater(_.cloneDeep(doc))));
		// setNodeWidth(getNodeWidth(updater(_.cloneDeep(doc))));
	}

	function insertAfterIdx(idx, doc) {
		let afterNodes = doc.map((d,i) => { 
			return {
				display: d.display,
				index: i
			}
		}).filter((d,i) => i > idx & d.display);
		if (afterNodes.length == 0) {
			return doc.length;
		} else {
			return afterNodes[0].index;
		}
	}

	function insertNode(idx, relation, indent, text = '', suggestion = false, joint = false, type = 'pro') {
		return () => {

			let newNode;
			newNode = defaultNode(indent, text, suggestion, joint, type);

			setDoc(prevDoc => {
				let doc = _.cloneDeep(prevDoc);

				if (relation == 'before') {
					doc.splice(idx, 0, newNode);
				} else if (relation == 'after') {
					doc.splice(insertAfterIdx(idx, doc), 0, newNode);
				}

				doc = annotate(doc);

				setGutterWidth(getGutterWidth(doc));
				setNodeWidth(getNodeWidth(doc));

				return doc;
			})

			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = newNode.id;
				focus.caret = [0, 0];
				focus.editable = true;
				return focus;
			})

			return newNode.id;
		}
	}

	function deleteNode(idx, includeDescendents = true) {
		return () => {
			setDoc(prevDoc => {
				let doc = _.cloneDeep(prevDoc),
					deleteIds;

				if (includeDescendents) {
					deleteIds = descendents(doc[idx], doc).map(d => d.id).concat([doc[idx].id]);
				} else {
					deleteIds = doc[idx].id;
				}

				doc = doc.filter(d => !deleteIds.includes(d.id));
				doc = annotate(doc);

				setGutterWidth(getGutterWidth(doc));
				setNodeWidth(getNodeWidth(doc));

				return doc;
			})
		}
	}

	function acceptSuggestion(idx) {
		return () => {
			setDoc(prevDoc => {
				let doc = [...prevDoc];
				doc[idx].suggestion = false;
				return annotate(doc);
			})
		}
	}

	function cycleType(idx) {
		return () => {
			let types = ['pro', 'con'];
			setDoc(prevDoc => {
				let doc = [...prevDoc];
				doc[idx].label = types[(types.indexOf(doc[idx].label) + 1) % types.length];
				return annotate(doc);
			})
		}
	}

	function toggleJoin(idx) {
		setDoc(prevDoc => {
			let doc = [...prevDoc];
			doc[idx].joint = !doc[idx].joint;
			return annotate(doc);
		})
	}

	function orderUpdateFunction(fromIndex, toIndex) {
		return (prevDoc) => {
			let doc = _.cloneDeep(prevDoc);
			if (doc[fromIndex].open) {
				doc.splice(toIndex, 0, ...doc.splice(fromIndex, 1));
			} else {
				let nDescendents = descendents(doc[fromIndex], doc).length;
				doc.splice(toIndex, 0, ...doc.splice(fromIndex, 1 + nDescendents));
			}
			return annotate(doc);
		}
	}

	let [sortable, setSortable] = useState(null);

	// Manage sortablejs sequence fields.
	useEffect(() => {
		if (sortable === null) {
			setSortable(
				Sortable.create(
					document.querySelector('main'),	
					{
						draggable: '.node',
						handle: '.handle',
						animation: 150,
						delay: 0,
						direction: 'vertical',
						// multiDrag: true,
						// selectedClass: 'selected',
						// onSelect: function(evt) {
						// 	let idx = Number(evt.item.getAttribute("data-index")),
						// 		ids = descendents(doc[idx], doc).map(d => d.id);
						// 	for (let id of ids) {
						// 		Sortable.utils.select(document.querySelector(`#node-${id}`));
						// 	}
						// },
						// onDeselect: function(evt) {
						// 	let idx = Number(evt.item.getAttribute("data-index")),
						// 		ids = descendents(doc[idx], doc).map(d => d.id);
						// 	for (let id of ids) {
						// 		Sortable.utils.deselect(document.querySelector(`#node-${id}`));
						// 	}
						// },
						onEnd: function(evt) {

							updateNodeText();

							// Undo sortablejs reordering of elements, so that it is instead handled by neverland state.

							let element = evt.item,
								parent = element.parentNode,
								elements = parent.children,
								old_idx = evt.oldIndex,
								new_idx = evt.newIndex;

							// let old_idxs = evt.oldIndicies.map(d => d.index),
							// 	new_idxs = evt.newIndicies.map(d => d.index);

							if (old_idx > new_idx) {
								parent.insertBefore(element, elements[old_idx].nextSibling);
							} else {
								parent.insertBefore(element, elements[old_idx])
							}

							// Update neverland state.

							setDoc(orderUpdateFunction(old_idx, new_idx));

							// setGutterWidth(getGutterWidth(orderUpdateFunction(old_idx, new_idx)(doc)));

						}
					}
				)
			);
		}

	}, [])

	useEffect(() => {
		if (doc.length == 0) {
			let newNode = defaultNode(0);
			setDoc(prevDoc => {
				let doc = annotate([newNode]);

				setGutterWidth(getGutterWidth(doc));
				setNodeWidth(getNodeWidth(doc));

				return doc;
			});
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = newNode.id;
				focus.caret = [0, 0];
				return focus;
			})
		}	
	}, [doc.length])

	useEffect(() => {
		
		// Set initial mode.
		document.body.setAttribute('data-mode', mode);

		// Set listener to return to auto cursor when escape key is pressed.
		document.addEventListener("keydown", function(e) {
			if (e.key === 'Escape') {
				setMode('auto');
				document.body.setAttribute('data-mode', 'auto');
			}
		});

	}, [])

	let props = {
		maxDepth: getMaxDepth(doc),
		gutterWidth,
		nodeWidth,
		open,
		close,
		focus,
		setFocus,
		indentNode,
		insertNode,
		updateNodeText,
		deleteNode,
		cycleType,
		toggleJoin,
		setMode,
		acceptSuggestion,
		mode,
		options
	}

	return html`
		<main>
			${doc.map((d, i) => Claim(d, i, doc, props))}
		</main>

		<div class="hint ${mode == 'auto' ? 'hide' : ''}">Press <div class="key">Esc</div> to exit tool.</div>

		<div id="loader" class="loader hide"></div>
		
		${Toolbar(doc, setDoc, directory, setDirectory, docId, setDocId, title, setTitle, setMode, options, setOptions, updateNodeText)}

	`;

});

export default Processor;