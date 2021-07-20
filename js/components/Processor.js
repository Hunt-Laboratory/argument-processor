const {neverland: Component, render, html, useState, useEffect} = window.neverland;

import Claim from './Claim.js';
import Toolbar from './Toolbar.js';

import utils from '../utils.js';
let { randomString, setCaret } = utils;

const Processor = Component(function(corpus, setAppStatus) {
	
	function defaultNode(indent) {
		return {
			id: randomString(),
			text: '',
			type: 'claim',
			open: true,
			display: true,
			indent: indent
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

			if (doc[k].indent == 0) {
				doc[k].parent = null;
			} else {
				doc[k].parent = getParent(doc, k).id;
			}

		}

		return doc;
	}

	let [doc, setDoc] = useState(annotate([
		{
			id: randomString(),
			text: 'Sed sint tempore 33 repellat omnis qui omnis facere vel voluptatem soluta.',
			type: 'claim',
			open: true,
			display: true,
			transparent: false,
			indent: 0
		},
		{
			id: randomString(),
			text: 'Id corporis dolores et animi culpa aut voluptatem expedita id obcaecati commodi ab pariatur quia aut enim consequatur ut laudantium inventore.',
			type: 'support',
			open: true,
			display: true,
			transparent: false,
			indent: 1
		},
		{
			id: randomString(),
			text: 'Qui soluta odio dignissimos accusamus a tempore doloribus. Est quos reprehenderit aut accusamus alias vel optio omnis.',
			type: 'attack',
			open: true,
			display: true,
			transparent: false,
			indent: 2
		},
		{
			id: randomString(),
			text: 'Sed sint tempore 33 repellat omnis qui omnis facere vel voluptatem soluta.',
			type: 'attack',
			open: true,
			display: true,
			transparent: false,
			indent: 3
		},
		{
			id: randomString(),
			text: 'Id corporis dolores et animi culpa aut voluptatem expedita id obcaecati commodi ab pariatur quia aut enim consequatur ut laudantium inventore.',
			type: 'claim',
			open: true,
			display: true,
			transparent: false,
			indent: 0
		},
		{
			id: randomString(),
			text: 'Qui soluta odio dignissimos accusamus a tempore doloribus. Est quos reprehenderit aut accusamus alias vel optio omnis.',
			type: 'attack',
			open: true,
			display: true,
			transparent: false,
			indent: 1
		}
	]));

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
		return Math.max(( window.innerWidth - (600 + 40 + (maxDepth-1)*60) ) / 2, 0);
	}

	let [gutterWidth, setGutterWidth] = useState(getGutterWidth(doc));

	useEffect(() => {
		window.addEventListener('resize', () => {setGutterWidth(getGutterWidth(doc))});
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
		setDoc(prevDoc => {
			let doc = _.cloneDeep(prevDoc),
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
		})
	}

	function insertNode(idx, relation) {
		return () => {

			let newNode;
			if (relation == 'before') {
				newNode = defaultNode(doc[idx].indent);
			} else if (relation == 'after') {
				newNode = defaultNode(doc[Math.min(idx + 1, doc.length - 1)].indent);
			}

			setDoc(prevDoc => {
				let doc = _.cloneDeep(prevDoc);

				if (relation == 'before') {
					doc.splice(idx, 0, newNode);
				} else if (relation == 'after') {
					doc.splice(idx + 1, 0, newNode);
				}

				return annotate(doc);
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

	useEffect(() => {
		if (doc.length == 0) {
			setDoc(annotate([defaultNode(0)]));
		}	
	})

	let props = {
		maxDepth: getMaxDepth(doc),
		gutterWidth,
		open,
		close,
		setFocus,
		indentNode,
		insertNode,
		updateNodeText,
		deleteNode
	}

	return html`
		<main>
			${doc.map((d, i) => Claim(d, i, doc, props))}
		</main>

		${Toolbar()}
	`;

});

export default Processor;