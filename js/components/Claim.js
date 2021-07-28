const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Caret from './Caret.js';

import utils from '../utils.js';
let { getCaret } = utils;

const Claim = Component(function(node, idx, doc, props) {

	let {
		maxDepth,
		gutterWidth,
		open,
		close,
		setFocus,
		indentNode,
		insertNode,
		updateNodeText,
		deleteNode,
		cycleType
	} = props;

	const [menu, setMenu] = useState(false);

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

	function handleKeydown(e) {

		if (e.key == 'Enter') {
			e.stopPropagation();
			e.preventDefault();
			insertNode(idx, 'after')();
		} else if (e.key == 'Tab') {
			e.stopPropagation();
			e.preventDefault();
			indentNode(idx, e.shiftKey ? -1 : 1);
		} else if (e.key == 'ArrowDown') {
			e.stopPropagation();
			e.preventDefault();
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				let nodesBelow = doc.filter((d, i) => i > idx & d.display);
				focus.node = nodesBelow.length > 0 ? nodesBelow[0].id : doc[0].id;
				focus.caret = [0, 0];
				return focus;
			})
		} else if (e.key == 'ArrowUp') {
			e.stopPropagation();
			e.preventDefault();
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				let nodesAbove = doc.filter((d, i) => i < idx & d.display),
					nodesBelow = doc.filter((d, i) => i >= idx & d.display);
				focus.node = nodesAbove.length > 0 ? nodesAbove[nodesAbove.length-1].id : nodesBelow[nodesBelow.length-1].id;
				focus.caret = [0, 0];
				return focus;
			})
		} else if (e.key == '=' & !e.ctrlKey) {
			e.stopPropagation();
			e.preventDefault();
			if (node.open) {
				close(idx)();
			} else {
				open(idx)();
			}
		} else if (e.key == '+') {
			e.stopPropagation();
			e.preventDefault();
			cycleType(idx)();
		}


		setTimeout(() => {
			let caret = getCaret(document.querySelector(`#node-${node.id} .textarea`));
			if (caret === undefined) {
				caret = [0, 0];
			}
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.caret = caret;
				return focus;
			})
			updateNodeText(idx)(e);
		}, 0)


		return;
	}

	let stealFocus = () => {
		let caret = getCaret(document.querySelector(`#node-${node.id} .textarea`));
		setFocus(prevFocus => {
			let focus = {...prevFocus};
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

	return html.for(node)`
	<div
		class="node type-${node.type} ${node.transparent ? 'transparent' : ''}"
		id="node-${node.id}"
		data-index="${idx}"
		style="display: ${node.display ? 'grid' : 'none'};">

		<div
			class="caret ${children(node).length == 0 ? 'inactive' : ''}"
			id="caret-${node.id}"
			onclick="${children(node).length > 0 ? (node.open ? close(idx) : open(idx)) : ''}"
			style="width: calc(${gutterWidth}px + 20px + ${3*node.indent}*var(--p));">
				<div class="dot ${node.open ? 'open' : ''} type-${node.type}">
					${Caret(children(node).length == 0)}
				</div>
			</div>
		
		<div class="controls">
			<div class="inbetween above" onclick="${insertNode(idx, 'before')}">
				<i class="fal fa-plus"></i>
			</div>
			<div class="inbetween below ${children(node).length > 0 ? 'hide' : ''}" onclick="${insertNode(idx, 'after')}">
				<i class="fal fa-plus"></i>
			</div>
			<div class="inbetween indented ${children(node).length == 0 ? 'hide' : ''}" onclick="${insertNode(idx, 'after')}">
				<i class="fal fa-plus"></i>
			</div>
		</div>

		<div
			class="textarea"
			contenteditable
			onclick="${stealFocus}"
			onkeydown="${handleKeydown}">${node.text}</div>
		
		<div
			class="padding">

			<button onclick="${() => {setMenu(!menu)}}">
				<i class="far fa-bars"></i>
			</button>

			<div class="curtain ${menu ? '' : 'hide'}" onclick="${() => setMenu(false)}"></div>

			<div class="menu ${menu ? '' : 'hide'}">
				${Button('paint-brush', 'Change type', () => {
					setMenu(false);
					setFocus({ node: null, caret: [0, 0] });
					cycleType(idx)();
				})}
				${Button('angle-double-up', 'Collapse all children', () => {
					setMenu(false);
					let ids = descendents(node).map(d => d.id),
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

		</div>
		
		<div class="handle">
		</div>


	</div>`;

})

				// ${Button('angle-double-down', 'Expand all children', () => {
				// 	setMenu(false);
				// 	open(idx)();
				// 	let ids = descendents(node).map(d => d.id),
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