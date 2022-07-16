const {neverland: Component, render, html, useState, useEffect} = window.neverland;

const Settings = Component(function(setModal, options, setOptions) {

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
				<option value="text-davinci-002" selected="${options.model == "text-davinci-002"}"> 175B parameters (GPT-3 Davinci) </option>
				<option value="text-curie-001"   selected="${options.model == "text-curie-001"}">   6.7B parameters (GPT-3 Curie)   </option>
				<option value="text-babbage-001" selected="${options.model == "text-babbage-001"}"> 1.3B parameters (GPT-3 Babbage) </option>
				<option value="text-ada-001"     selected="${options.model == "text-ada-001"}">	    350M parameters (GPT-3 Ada)     </option>
			</select>

			<p class="click-to-close" onclick="${() => {setModal(false)}}">Click here to close.</p>
		</div>
	</div>`;

	// Note: GPT-3 model size estimates are taken from https://blog.eleuther.ai/gpt3-model-sizes/.

});

export default Settings;