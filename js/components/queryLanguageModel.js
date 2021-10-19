
function tidy(text) {

	let regex;

	// Remove any parentheses.
	regex = /\(.*?\)/gi;
	text = text.replace(regex, '');

	// Remove any symbols.
	regex = /(\*|\_|`)/gi;
	text = text.replace(regex, '');	

	// Remove leading gibberish.
	regex = /^[0-9]\.\s*/i;
	text = text.replace(regex, '');

	regex = /^[^a-zA-Z0-9]*/i;
	text = text.replace(regex, '');

	// Remove trailing whitespace.
	regex = /\s*$/i;
	text = text.replace(regex, '');

	if (text.length > 0) {
		text = text[0].toUpperCase() + text.substring(1)
	}

	return text;
}


function completeEnthymemePrompt(context) {
	let prompt = `Identify assumptions with the following arguments.

Premises:
* All men are mortal.
Conclusion: Socrates is mortal.
Assumptions:
* Socrates is a man.

Premises:
* Digital literacy of the population improves.
Conclusion: Misinformation and conspiracy theories become less prevalent.
Assumptions:
* The only reason people believe misinformation is that they lack digital literacy.
* Improved digital literacy will not exacerbate confirmation bias.

Premises:
* I want a PhD from a recognised university.
* London has lots of organisations and networking opportunities in my field.
Conclusion: I should do a PhD in London.
Assumptions:
* I can afford to live in London.
* I will have the flexibility to pursue research that interests me.

Premises:
* ${context.premise}
Conclusion: ${context.conclusion}
Assumptions:
* `;

	return prompt;
}

function generateReasoningPrompt(context) {
	let prompt = `Reason from the start claim to the end claim.

Start and end claim: A cyclone hit Queensland, Australia. ~ The price of bananas increased.
Completed chain of reasoning:
* A cyclone hit Queensland, Australia. ~ The cyclone destroyed banana crops. ~ Supply of bananas went down, whilst demand stayed constant. ~ The price of bananas increased.

Start and end claim: Education levels improve. ~ Society becomes more politically polarised.
Completed chain of reasoning:
* Education levels improve. ~ People become more skilled at finding high-quality justifications for their existing beliefs (confirmation bias). ~ Society becomes more politically polarised.

Start and end claim: People move out of cities and into the countryside. ~ Greenhouse gas emissions increase.
Completed chain of reasoning:
* People move out of cities and into the countryside. ~ Population density decreases. ~ Both people and products need to be transported further. ~ They are transported using vehicles that burn fossil fuels. ~ Greenhouse gas emissions increase.

Start and end claim: ${context.start} ~ ${context.end}
Completed chain of reasoning:
*`;

	return prompt;
}

async function query(context, options, task, n) {

	let { model } = options;

	// Build prompt.

	let prompt = '';
	switch(task) {
		case 'complete-enthymeme':
			prompt = completeEnthymemePrompt(context);
			break;
		case 'generate-reasoning':
			prompt = generateReasoningPrompt(context);
			break;
		default:
			break;
	}

	// Query model.

	let output;
	let call = await fetch(`https://o32orqaa79.execute-api.ap-southeast-2.amazonaws.com/default/huggingface?model=${model}&n=${n}&prompt=${encodeURIComponent(prompt)}&key=${options.key}`)
		.then(response => response.json())
		.then(data => {
			output = data;
		});

	console.log(call);
	console.log(output);

	// Refactor output.

	if (['GPT-Neo-2.7B'].includes(model)) {
		output = output.map(d => tidy(d.generated_text));
	} else if (['j1-large', 'j1-jumbo'].includes(model)) {
		output = output.completions.map(d => tidy(d.data.text));
	} else if (['ada','babbage','curie','davinci']) {
		output = output.choices.map(d => tidy(d.text));
	}

	output = output.filter(d => d.length > 0);
	output = [...new Set(output)];

	// Return generated text.

	return output;

};

export default query;