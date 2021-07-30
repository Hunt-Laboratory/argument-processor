const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Claim from './Claim.js';
import Toolbar from './Toolbar.js';

import utils from '../utils.js';
let { randomString, setCaret } = utils;

import example from './example.js';

const Processor = Component(function(corpus, setAppStatus) {
	
	function defaultNode(indent) {
		return {
			id: randomString(),
			text: '',
			type: 'pro',
			label: 'pro',
			open: true,
			display: true,
			indent: indent,
			joint: false
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
			} else {
				doc[k].parent = getParent(doc, k).id;
				doc[k].type = doc[k].label;
			}

		}

		return doc;
	}

	let [doc, setDoc] = useState(annotate(example));

	let [focus, setFocus] = useState({
		node: null,
		caret: [0, 0]
	});

	useEffect(() => {
		let el = document.querySelector(`#node-${focus.node} .textarea`);
		if (el !== null) {

			// Focus on element.
			el.focus();

			// Set caret position.
			// try {
				setCaret(el, focus.caret);
			// }

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

	useEffect(() => {
		window.addEventListener('resize', () => {
			setGutterWidth(getGutterWidth(doc));
			setNodeWidth(getNodeWidth(doc));
		});
	}, [])

	function children(node) {
		return doc.filter(d => d.parent == node.id);
	}

	function descendents(node) {

		let kids = children(node),
			grandkids = [];

		for (let kid of kids) {
			grandkids = grandkids.concat(descendents(kid));
		}

		return kids.concat(grandkids);

	}

	function close(idx) {
		return () => {

			setFocus({ node: null, caret: [0, 0] });

			let updater = prevDoc => {
				let doc = [...prevDoc],
					closeIds = descendents(doc[idx]).map(d => d.id);
				
				for (let k = 0; k < doc.length; k++) {
					if (closeIds.includes(doc[k].id)) {
						doc[k].display = false;
					}
				}

				return doc;
			};

			let closeIds = descendents(doc[idx]).map(d => d.id);
			
			// document.querySelector(`#caret-${doc[idx].id}`).classList.toggle('open');
			
			setDoc(prevDoc => {
				let doc = [...prevDoc],
					closeIds = descendents(doc[idx]).map(d => d.id);
				
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

			setFocus({ node: null, caret: [0, 0] });

			let updater = prevDoc => {
				let doc = [...prevDoc],
					openIds = descendents(doc[idx]).filter(d => allParentsOpen(d)).map(d => d.id);
				
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

			let openIds = descendents(doc[idx]).filter(d => allParentsOpen(d)).map(d => d.id);
			for (let id of openIds) {
				$(`#node-${id}`).slideDown(200);
			}

			setTimeout(() => {
				setDoc(prevDoc => {
					let doc = [...prevDoc],
						openIds = descendents(doc[idx]).filter(d => allParentsOpen(d)).map(d => d.id);
					
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

	function updateNodeText(idx) {
		return (evt) => {
			setDoc(prevDoc => {
				let doc = [...prevDoc];

				doc[idx].text = evt.target.textContent;

				return doc;
			})
		}
	}

	function indentNode(idx, delta) {
		
		let updater = prevDoc => {
			let doc = [...prevDoc],
				indentIds = descendents(doc[idx]).map(d => d.id);

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

			return annotate(doc);
		}

		setDoc(updater);

		setGutterWidth(getGutterWidth(updater(_.cloneDeep(doc))));
		setNodeWidth(getNodeWidth(updater(_.cloneDeep(doc))));
	}

	function insertAfterIdx(idx) {
		let afterNodes = doc.map((d,i) => { 
			return {
				display: d.display,
				index: i
			}
		}).filter((d,i) => i > idx & d.display);
		if (afterNodes.length == 0) {
			return idx + 1;
		} else {
			return afterNodes[0].index;
		}
	}

	function insertNode(idx, relation, indent) {
		return () => {

			let newNode;
			if (relation == 'before') {
				newNode = defaultNode(indent);
			} else if (relation == 'after') {
				newNode = defaultNode(indent);
			}

			setDoc(prevDoc => {
				let doc = _.cloneDeep(prevDoc);

				if (relation == 'before') {
					doc.splice(idx, 0, newNode);
				} else if (relation == 'after') {
					doc.splice(insertAfterIdx(idx), 0, newNode);
				}

				return annotate(doc);
			})

			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = newNode.id;
				focus.caret = [0, 0];
				return focus;
			})

			return newNode.id;
		}
	}

	function deleteNode(idx) {
		return () => {
			setDoc(prevDoc => {
				let doc = _.cloneDeep(prevDoc),
					deleteIds = descendents(doc[idx]).map(d => d.id).concat([doc[idx].id]);

				doc = doc.filter(d => !deleteIds.includes(d.id));

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
			return doc;
		})
	}

	function orderUpdateFunction(fromIndex, toIndex) {
		return (prevDoc) => {
			let doc = _.cloneDeep(prevDoc);
			if (doc[fromIndex].open) {
				doc.splice(toIndex, 0, ...doc.splice(fromIndex, 1));
			} else {
				let nDescendents = descendents(doc[fromIndex]).length;
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
						// 		ids = descendents(doc[idx]).map(d => d.id);
						// 	for (let id of ids) {
						// 		Sortable.utils.select(document.querySelector(`#node-${id}`));
						// 	}
						// },
						// onDeselect: function(evt) {
						// 	let idx = Number(evt.item.getAttribute("data-index")),
						// 		ids = descendents(doc[idx]).map(d => d.id);
						// 	for (let id of ids) {
						// 		Sortable.utils.deselect(document.querySelector(`#node-${id}`));
						// 	}
						// },
						onEnd: function(evt) {

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
			setDoc(annotate([newNode]));
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = newNode.id;
				focus.caret = [0, 0];
				return focus;
			})
		}	
	})

	let props = {
		maxDepth: getMaxDepth(doc),
		gutterWidth,
		nodeWidth,
		open,
		close,
		setFocus,
		indentNode,
		insertNode,
		updateNodeText,
		deleteNode,
		cycleType,
		toggleJoin
	}

	return html`
		<main>
			${doc.map((d, i) => Claim(d, i, doc, props))}
		</main>

		${Toolbar()}
	`;

});

export default Processor;