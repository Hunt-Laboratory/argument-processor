const {neverland: Component, render, html, useState, useEffect} = window.neverland;

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
		deleteNode
	} = props;

	function children(node) {
		return doc.filter(d => d.parent == node.id);
	}

	function handleKeydown(e) {

		if (e.key == 'Enter') {
			e.stopPropagation();
			e.preventDefault();
			let newId = insertNode(idx, 'after')();
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = newId;
				focus.caret = [0, 0];
				return focus;
			})
		} else if (e.key == 'Tab') {
			e.stopPropagation();
			e.preventDefault();
			indentNode(idx, e.shiftKey ? -1 : 1);
		} else if (e.key == 'ArrowDown') {
			e.stopPropagation();
			e.preventDefault();
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = doc[(idx + 1) % doc.length].id;
				focus.caret = [0, 0];
				return focus;
			})
		} else if (e.key == 'ArrowUp') {
			e.stopPropagation();
			e.preventDefault();
			setFocus(prevFocus => {
				let focus = {...prevFocus};
				focus.node = doc[(idx + doc.length - 1) % doc.length].id;
				focus.caret = [0, 0];
				return focus;
			})
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

	return html.for(node)`
	<div
		class="node type-${node.type} ${node.transparent ? 'transparent' : ''}"
		id="node-${node.id}"
		style="display: ${node.display ? 'grid' : 'none'};">

		<div
			class="caret ${node.open ? 'open' : ''} ${children(node).length == 0 ? 'inactive' : ''}"
			id="caret-${node.id}"
			onclick="${children(node).length > 0 ? (node.open ? close(idx) : open(idx)) : ''}"
			style="width: calc(${gutterWidth}px + 20px + ${3*node.indent}*var(--p));">
				${ children(node).length > 0 ? html`<i class="fas fa-caret-right"></i>` : ''}
			</div>
		
		<div class="controls">
			<div class="inbetween above" onclick="${insertNode(idx, 'before')}">
				<i class="fal fa-plus"></i>
			</div>
			${children(node).length == 0 ? html`<div class="inbetween below" onclick="${insertNode(idx, 'after')}">
				<i class="fal fa-plus"></i>
			</div>` : ''}
			${children(node).length > 0 ? html`<div class="inbetween indented" onclick="${insertNode(idx, 'after')}">
				<i class="fal fa-plus"></i>
			</div>` : ''}
		</div>

		<div
			class="textarea"
			contenteditable
			onclick="${stealFocus}"
			onkeydown="${handleKeydown}">${node.text}</div>
		
		<div
			class="padding"
			onclick="${deleteNode(idx)}">

			<button>
				<i class="far fa-bars"></i>
			</button>

		</div>
		
		<div class="handle">
		</div>


	</div>`;

})

export default Claim;