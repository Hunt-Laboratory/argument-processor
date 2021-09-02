const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const Settings = Component(function(setSettings, options, setOptions) {

	return html`<div class="modal-box">
		<div class="modal">
			<p>Select which language model to use for the automated argument operations.</p>

			<select onchange=${evt => {
				setOptions(prevOptions => {
					let options = {...prevOptions};
					options.model = evt.target.value;
					console.log(options.model);
					return options;
				})
			}}>
				<option value="GPT-Neo-2.7B" selected="${options.model == "GPT-Neo-2.7B"}">2.7B parameters (GPT-Neo-2.7B from EleutherAI)</option>
				<option value="j1-large" selected="${options.model == "j1-large"}">7.5B parameters (j1-large from AI21)</option>
				<option value="j1-jumbo" selected="${options.model == "j1-jumbo"}">178B parameters (j1-jumbo from AI21)</option>
			</select>

			<p class="click-to-close" onclick="${() => {setSettings(false)}}">Click here to close.</p>
		</div>
	</div>`;

});

export default Settings;