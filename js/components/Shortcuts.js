const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const Shortcuts = Component(function(setShortcuts) {

	return html`<div class="modal-box" onclick="${() => {setShortcuts(false)}}">
		<div class="modal">
			<div class="shortcuts">
				<span class="key">↑</span> <span>Move focus up</span>
				<span class="key">Tab</span> <span>Indent</span>
				<span class="key">↓</span> <span>Move focus down</span>
				<span class="key">Shift+Tab</span> <span>Outdent</span>
				<span class="key">+</span> <span>Change type</span>
				<span class="key">Enter</span> <span>Insert below</span>
				<span class="key">=</span> <span>Toggle open/close</span>
			</div>

			<p class="click-to-close">Click anywhere to close.</p>
		</div>
	</div>`;

});

export default Shortcuts;