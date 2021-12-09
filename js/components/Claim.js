const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Caret from './Caret.js';

import utils from '../utils.js';
let { getCaret } = utils;

import query from './queryLanguageModel.js';

function stop(e) {
	e.stopPropagation();
	e.preventDefault();
}

const Claim = Component(function(node, idx, doc, props) {

	let {
		maxDepth,
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
		acceptSuggestion,
		setMode,
		mode,
		options,
	} = props;

	const [menu, setMenu] = useState(false);

	function children(node) {
		return doc.filter(d => d.parent == node.id);
	}

	function descendents(node, doc) {

		let kids = children(node),
			grandkids = [];

		for (let kid of kids) {
			grandkids = grandkids.concat(descendents(kid, doc));
		}

		return kids.concat(grandkids);

	}
	
	function parent(node) {
		let parents = doc.filter(d => d.id == node.parent);
		if (parents.length > 0) {
			return parents[0];
		} else {
			return null;
		}
	}

	function ancestors(node) {

		let as = [],
			p = parent(node);

		while (p !== null) {
			as = [p].concat(as);
			p = parent(p);
		}

		return as;

	}

	function handleKeydown(e) {

		// function enterEditMode() {
		// 	setFocus(prevFocus => {
		// 		let focus = {...prevFocus};
		// 		focus.editable = true;
		// 		return focus;
		// 	})
		// }

		// function exitEditMode() {
		// 	updateNodeText();
		// 	setFocus(prevFocus => {
		// 		let focus = {...prevFocus};
		// 		focus.editable = false;
		// 		return focus;
		// 	})
		// }


		// if (focus.editable) {


			let actions = {
				// 'Escape': () => {
				// 	stop(e);
				// 	exitEditMode();
				// },
				'Enter': () => {
					stop(e);
					updateNodeText();
					insertNode(idx, 'after', node.indent)();
				},
				'Tab': () => {
					stop(e);

					// Maintain caret position.
					let caret = getCaret(document.querySelector(`#node-${node.id} .textarea`));
					if (caret === undefined) {
						caret = [0, 0];
					}

					updateNodeText();

					setFocus(prevFocus => {
						let focus = {...prevFocus};
						focus.caret = caret;
						return focus;
					})

					// Indent node.
					indentNode(idx, e.shiftKey ? -1 : 1);

				},
				'ArrowDown': () => {
					if (e.ctrlKey) {
						stop(e);
						updateNodeText();
						setFocus(prevFocus => {
							let focus = {...prevFocus};
							let nodesBelow = doc.filter((d, i) => i > idx & d.display);
							focus.node = nodesBelow.length > 0 ? nodesBelow[0].id : doc[0].id;
							let n = doc.filter(d => d.id == focus.node)[0].text.length;
							focus.caret = [n, n];
							return focus;
						})
					}
				},
				'ArrowUp': () => {
					if (e.ctrlKey) {
						stop(e);
						updateNodeText();
						setFocus(prevFocus => {
							let focus = {...prevFocus};
							let nodesAbove = doc.filter((d, i) => i < idx & d.display),
								nodesBelow = doc.filter((d, i) => i >= idx & d.display);
							focus.node = nodesAbove.length > 0 ? nodesAbove[nodesAbove.length-1].id : nodesBelow[nodesBelow.length-1].id;
							let n = doc.filter(d => d.id == focus.node)[0].text.length;
							focus.caret = [n, n];
							return focus;
						})
					}
				},
				'=': () => {
					if (!e.ctrlKey) {
						stop(e);
						updateNodeText();
						if (node.open) {
							close(idx)();
						} else {
							open(idx)();
						}
					}
				},
				'+': () => {
					stop(e);
					updateNodeText();
					cycleType(idx)();
				}
			};

			if (['Enter', 'Tab', 'ArrowDown', 'ArrowUp', '+', '='].includes(e.key)) {
				actions[e.key]();
			}

		// } // else {

		// 	let actions = {
		// 		'Escape': () => {
		// 			stop(e);
		// 			setFocus(prevFocus => {
		// 				let focus = {...prevFocus};
		// 				focus.node = null;
		// 				focus.editable = false;
		// 				return focus;
		// 			})
		// 		},
		// 		' ': () => {
		// 			stop(e);
		// 			setFocus(prevFocus => {
		// 				let focus = {...prevFocus};
		// 				focus.editable = true;
		// 				let n = node.text.length;
		// 				focus.caret = [n, n];
		// 				return focus;
		// 			})
		// 		},
		// 		'Enter': () => {
		// 			stop(e);
		// 			insertNode(idx, 'after', node.indent)();
		// 		},
		// 		'Tab': () => {
		// 			stop(e);
		// 			indentNode(idx, e.shiftKey ? -1 : 1);
		// 		},
		// 		'ArrowDown': () => {
		// 			stop(e);
		// 			setFocus(prevFocus => {
		// 				let focus = {...prevFocus};
		// 				let nodesBelow = doc.filter((d, i) => i > idx & d.display);
		// 				focus.node = nodesBelow.length > 0 ? nodesBelow[0].id : doc[0].id;
		// 				focus.caret = [0, 0];
		// 				return focus;
		// 			})
		// 		},
		// 		'ArrowUp': () => {
		// 			stop(e);
		// 			setFocus(prevFocus => {
		// 				let focus = {...prevFocus};
		// 				let nodesAbove = doc.filter((d, i) => i < idx & d.display),
		// 					nodesBelow = doc.filter((d, i) => i >= idx & d.display);
		// 				focus.node = nodesAbove.length > 0 ? nodesAbove[nodesAbove.length-1].id : nodesBelow[nodesBelow.length-1].id;
		// 				focus.caret = [0, 0];
		// 				return focus;
		// 			})
		// 		},
		// 		'=': () => {
		// 			if (!e.ctrlKey) {
		// 				stop(e);
		// 				if (node.open) {
		// 					close(idx)();
		// 				} else {
		// 					open(idx)();
		// 				}
		// 			}
		// 		},
		// 		'+': () => {
		// 			stop(e);
		// 			cycleType(idx)();
		// 		}
		// 	}

		// 	if (['Escape', ' ', 'Enter', 'Tab', 'ArrowDown', 'ArrowUp', '=', '+'].includes(e.key)) {
		// 		actions[e.key]();
		// 	}

		// }


		// setTimeout(() => {
		// 	let caret = getCaret(document.querySelector(`#node-${node.id} .textarea`));
		// 	if (caret === undefined) {
		// 		caret = [0, 0];
		// 	}
		// 	setFocus(prevFocus => {
		// 		let focus = {...prevFocus};
		// 		focus.caret = caret;
		// 		return focus;
		// 	})
		// 	updateNodeText();
		// }, 0)


		return;
	}

	function getConnectorSpecs(direction) {

		let i = node.indent;

		if (i == 0) {

			return `width: 0;`;

		} else {

			let s = `width: calc(${3*(i-1) + 1}*var(--p) + var(--h) + 2px);background: repeating-linear-gradient(to right`;

			let as = ancestors(node),
				px = 0;

			// Define ancestor lines.

			for (let k = 1; k < as.length; k++) {

				let colour = 'transparent';
				if (as[k].joint & as[k].type == 'pro') {
					colour = '#dee4bb';
				} else if (as[k].joint & as[k].type == 'con') {
					colour = '#f6c8c7';
				}

				s = s + `,${colour} ${px}px,${colour} ${px + 4}px`;
				s = s + `,transparent ${px + 4}px,transparent ${px + 60}px`;
				px = px + 60;
			}

			// Define sibling line.

			function prevSibling(node) {
				let prevSiblings = doc.filter((d,i) => d.parent == node.parent & i < idx);
				if (prevSiblings.length == 0) {
					return null;
				} else {
					return prevSiblings[prevSiblings.length-1];
				}
			}

			let colour = 'transparent',
				refNode;

			if (direction == 'up') {
				refNode = prevSibling(node);
			} else {
				refNode = node;
			}
			
			if (refNode !== null) {
				if (refNode.joint) {
					if (node.type == 'pro') {
						colour = '#dee4bb';
					} else if (node.type == 'con') {
						colour = '#f6c8c7';
					}			
				}
			}
			
			s = s + `,${colour} ${px}px,${colour} ${px + 4}px`;
			s = s + `,transparent ${px + 4}px,transparent ${px + 120}px`;

			s = s + `);`;

			// console.log(s);

			return s;
		}

	}

	let stealFocus = () => {

		let caret = getCaret(document.querySelector(`#node-${node.id} .textarea`));
		// console.log(caret);
		// console.log(focus.node == node.id);

		// if (focus.editable) {
			updateNodeText();
		// }
		
		setFocus(prevFocus => {
			let focus = {...prevFocus};
			// if (!focus.editable && focus.node == node.id) {
			// 	focus.editable = true;
			// };
			focus.node = node.id;
			focus.caret = caret;
			return focus;
		})
	}

	useEffect(() => {
		let childNodes = document.querySelector(`#node-${node.id} .textarea`).childNodes;
		if (childNodes.length > 2) {
			childNodes[0].remove();
		}
	})

	function Button(icon, action, callback) {
		return html`<button onclick="${callback}" data-action="${action}"><i class="fas fa-${icon}"></i></button>`;
	}

	function nextVisibleNode(node) {
		let afterNodes = doc.filter((d,i) => i > idx & d.display);
		if (afterNodes.length == 0) {
			return node;
		} else {
			return afterNodes[0];
		}
	}

	function prevVisibleNode(node) {
		let beforeNodes = doc.filter((d,i) => (i < idx) & d.display);
		if (beforeNodes.length == 0) {
			return node;
		} else {
			// console.log(beforeNodes[beforeNodes.length - 1]);
			return beforeNodes[beforeNodes.length - 1];
		}
	}

	function nodeClickHandler(node) {

		switch(mode) {
			case 'generate-reasoning':
				return async function() {
					document.querySelector('#loader').classList.remove('hide');

					let context = {
						start: node.text,
						end: parent(node).text
					};

					console.log(context);
					let q = await query(context, options, 'generate-reasoning', 1);
					// let q = ["A -> B -> C -> D -> E"];
					
					console.log(q);

					q = q.map(d => d.split(' -> '))[0];

					// Reverse and trim.
					q.shift();
					if (q[q.length-1].toLowerCase() == context.end.toLowerCase()) {
						q.pop();
					}
					q.reverse();

					// Insert new nodes.
					for (let k = 0; k < q.length; k++) {
						insertNode(idx + k, 'before', node.indent + k, q[k], true)();
					}

					indentNode(idx + q.length, q.length);

					setMode('auto');
					document.body.setAttribute('data-mode', 'auto');

					setFocus({ node: null, caret: [0, 0] });

					document.querySelector('#loader').classList.add('hide');
				}
				break;
			case 'complete-enthymeme':
				return async function() {
					document.querySelector('#loader').classList.remove('hide');

					let context = {
						premise: node.text,
						conclusion: parent(node).text
					};
					let q = await query(context, options, 'complete-enthymeme', 6);

					for (let k = 0; k < q.length; k++) {
						insertNode(idx + k, 'after', node.indent, q[k], true)();
					}
					
					for (let k = 0; k < q.length; k++) {
						toggleJoin(idx + k);
					}

					setMode('auto');
					document.body.setAttribute('data-mode', 'auto');

					setFocus({ node: null, caret: [0, 0] });

					document.querySelector('#loader').classList.add('hide');
				}
				break;
			case 'suggest-reasons':
				return async function() {
					document.querySelector('#loader').classList.remove('hide');

					let context = {
						pros: children(node).filter(d => d.label == 'pro').map(d => d.text),
						conclusion: node.text
					}
					let q = await query(context, options, 'suggest-reasons', 6);
					let nChildren = children(node).length;

					for (let k = 0; k < q.length; k++) {
						insertNode(idx + nChildren + k, 'after', node.indent + 1, q[k], true)();
					}

					setMode('auto');
					document.body.setAttribute('data-mode', 'auto');

					setFocus({ node: null, caret: [0, 0] });

					document.querySelector('#loader').classList.add('hide');
				}
				break;
			case 'suggest-objections':
				return async function() {
					document.querySelector('#loader').classList.remove('hide');

					let context = {
						cons: children(node).filter(d => d.label == 'con').map(d => d.text),
						conclusion: node.text
					}
					let q = await query(context, options, 'suggest-objections', 6);
					let nChildren = children(node).length;

					for (let k = 0; k < q.length; k++) {
						insertNode(idx + nChildren + k, 'after', node.indent + 1, q[k], true, false, 'con')();
					}

					setMode('auto');
					document.body.setAttribute('data-mode', 'auto');

					setFocus({ node: null, caret: [0, 0] });

					document.querySelector('#loader').classList.add('hide');
				}
				break;
			case 'suggest-abstraction':
				return async function() {
					document.querySelector('#loader').classList.remove('hide');

					let context = {
						claim: node.text
					};
					let q = await query(context, options, 'suggest-abstraction', 3);

					for (let k = 0; k < q.length; k++) {
						insertNode(idx + k, 'after', node.indent, q[k], true)();
					}
					
					for (let k = 0; k < q.length; k++) {
						toggleJoin(idx + k);
					}

					setMode('auto');
					document.body.setAttribute('data-mode', 'auto');

					setFocus({ node: null, caret: [0, 0] });

					document.querySelector('#loader').classList.add('hide');
				}
				break;
			default:
				return '';
		}
	}

	return html.for(node)`
	<div
		class="node type-${node.type} ${node.transparent ? 'transparent' : ''} ${node.suggestion ? 'suggestion' : ''}"
		id="node-${node.id}"
		data-index="${idx}"
		style="display: ${node.display ? 'grid' : 'none'}; width: ${nodeWidth}px;"
		onclick="${nodeClickHandler(node)}">

		<div
			class="caret ${children(node).length == 0 ? 'inactive' : ''}"
			id="caret-${node.id}"
			onclick="${mode === 'auto' ? (children(node).length > 0 ? (node.open ? close(idx) : open(idx)) : '') : ''}"
			style="width: calc(${gutterWidth}px + 60px + ${3*node.indent}*var(--p));">
		
			<div
				class="connectors up"
				style="${getConnectorSpecs('up')}"></div>
			<div
				class="connectors down"
				style="${getConnectorSpecs('down')}"></div>

			<div class="dot ${node.open ? 'open' : ''} type-${node.type}">
				${Caret(children(node).length == 0)}
			</div>
		</div>
		
		<div class="controls">
			<div class="inbetween above" onclick="${insertNode(idx, 'before', node.indent)}">
				<i class="fal fa-plus"></i>
			</div>
			<div class="inbetween above ${node.indent >= prevVisibleNode(node).indent ? 'hide' : ''}" onclick="${insertNode(idx, 'before', prevVisibleNode(node).indent)}" style="left: ${60*(prevVisibleNode(node).indent - node.indent)}px;">
				<i class="fal fa-plus"></i>
			</div>
			<div class="inbetween below ${nextVisibleNode(node).indent > node.indent ? 'hide' : ''}" onclick="${insertNode(idx, 'after', node.indent)}">
				<i class="fal fa-plus"></i>
			</div>
			<div class="inbetween below ${nextVisibleNode(node).indent < node.indent || nextVisibleNode(node).indent == node.indent + 1 ? '' : 'hide'}" onclick="${insertNode(idx, 'after', nextVisibleNode(node).indent)}" style="left: ${60*(nextVisibleNode(node).indent - node.indent)}px">
				<i class="fal fa-plus"></i>
			</div>
		</div>

		<div
			class="textarea"
			contenteditable="${focus.node == node.id}"
			tabindex="0"
			onclick="${mode === 'auto' ? stealFocus : () => {}}"
			onkeydown="${handleKeydown}">${node.text}</div>
		
		<div
			class="padding">

			<button
				class="${node.suggestion ? 'hide' : ''}"
				onclick="${mode === 'auto' ? () => {setMenu(!menu)} : () => {}}">
				<i class="far fa-bars"></i>
			</button>

			<div class="curtain ${menu ? '' : 'hide'}" onclick="${() => setMenu(false)}"></div>

			<div class="menu ${menu ? '' : 'hide'}">
				${Button('paint-brush', 'Change type', () => {
					setMenu(false);
					setFocus({ node: null, caret: [0, 0] });
					cycleType(idx)();
				})}
				${Button(node.joint ? 'unlink' : 'link', node.joint ? 'Disconnect from below' : 'Connect to below', () => {
					setMenu(false);
					setFocus({ node: null, caret: [0, 0] });
					toggleJoin(idx);
				})}
				${Button('angle-double-up', 'Collapse all children', () => {
					setMenu(false);
					let ids = descendents(node, doc).map(d => d.id),
						idxs = [];
					for (let k = 0; k < doc.length; k++) {
						if (ids.includes(doc[k].id)) {
							idxs.push(k);
						}
					}
					for (let idx of idxs) {
						if (doc[idx].open) {
							close(idx)();
						}
					}
				})}
				${Button('trash', 'Delete', () => {
					setMenu(false);
					deleteNode(idx)();
				})}
			</div>

			<button
				class="${node.suggestion ? '' : 'hide'}"
				onclick="${acceptSuggestion(idx)}">
				<i class="far fa-check"></i>
			</button>
			<button
				class="${node.suggestion ? '' : 'hide'}"
				onclick="${deleteNode(idx, false)}">
				<i class="far fa-times"></i>
			</button>

		</div>
		
		<div class="handle">
		</div>


	</div>`;

})

				// ${Button('angle-double-down', 'Expand all children', () => {
				// 	setMenu(false);
				// 	open(idx)();
				// 	let ids = descendents(node, doc).map(d => d.id),
				// 		idxs = [];
				// 	for (let k = 0; k < doc.length; k++) {
				// 		if (ids.includes(doc[k].id)) {
				// 			idxs.push(k);
				// 		}
				// 	}
				// 	for (let idx of idxs) {
				// 		if (!doc[idx].open) {
				// 			open(idx)();
				// 		}
				// 	}
				// })}

export default Claim;