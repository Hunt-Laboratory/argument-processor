const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const Settings = Component(function(setSettings, options, setOptions) {

	let {
		key,
		keyIsValid
	} = options;

	return html`<div class="modal-box">
		<div class="modal">
			<p>Enter your OpenAI API key to enable language model tools.</p>

			<div class="key">
				<input
					type="password"
					value="${key}"
					id="key"
					class="${keyIsValid ? 'correct' : 'incorrect'}"
					></input>

				<button
					class="${keyIsValid ? 'hide' : ''}"
					onclick=${evt => {
						setOptions(prevOptions => {
							let options = {...prevOptions},
								key = document.getElementById('key').value;
							options.key = key;
							localStorage.setItem('key', key);
							return options;
						})
					}}>
					Save
				</button>

				<button
					class="${keyIsValid ? '' : 'hide'}"
					onclick=${evt => {
						setOptions(prevOptions => {
							let options = {...prevOptions};
							options.key = '';
							options.keyIsValid = false;
							localStorage.removeItem('key');
							return options;
						})
					}}>
					Forget
				</button>

			</div>


			<p>Select which language model to use.</p>

			<select onchange=${evt => {
				setOptions(prevOptions => {
					let options = {...prevOptions};
					options.model = evt.target.value;
					return options;
				})
			}}>
				<option value="ada" selected="${options.model == "ada"}">350M parameters (GPT-3 Ada from OpenAI)</option>
				<option value="babbage" selected="${options.model == "babbage"}">1.3B parameters (GPT-3 Babbage from OpenAI)</option>
				<option value="GPT-Neo-2.7B" selected="${options.model == "GPT-Neo-2.7B"}">2.7B parameters (GPT-Neo-2.7B from EleutherAI)</option>
				<option value="curie" selected="${options.model == "curie"}">6.7B parameters (GPT-3 Curie from Open AI)</option>
				<option value="curie-instruct-beta" selected="${options.model == "curie-instruct-beta"}">6.7B parameters (GPT-3 Curie Instruct from Open AI)</option>
				<option value="j1-large" selected="${options.model == "j1-large"}">7.5B parameters (j1-large from AI21)</option>
				<option value="davinci" selected="${options.model == "davinci"}">175B parameters (GPT-3 Davinci from OpenAI)</option>
				<option value="davinci-instruct-beta" selected="${options.model == "davinci-instruct-beta"}">175B parameters (GPT-3 Davinci Instruct from OpenAI)</option>
				<option value="j1-jumbo" selected="${options.model == "j1-jumbo"}">178B parameters (j1-jumbo from AI21)</option>
			</select>

			<p class="click-to-close" onclick="${() => {setSettings(false)}}">Click here to close.</p>
		</div>
	</div>`;

	// Note: GPT-3 model size estimates are taken from https://blog.eleuther.ai/gpt3-model-sizes/.

});

export default Settings;