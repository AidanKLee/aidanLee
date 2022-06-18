import $ from 'jquery';

class K {

	static getInputData(inputEvent, callback) {
		if (inputEvent.type === 'input' && inputEvent.target.tagName === 'INPUT') {
			const value = inputEvent.currentTarget.value;

			if (callback) {
				callback()
			}

			return { q: value };
		} else {
			throw new Error('getInputHandler requires a input event as its first arguement.');
		}
	}

	static getFormData(formEvent, callback) {
		const target = formEvent.currentTarget;

		if (formEvent.type === 'submit' && target.tagName === 'FORM') {
			const data = {};
			let isData = true;

			for (let i = 0; isData; i++) {
				data[target[i].name] = target[i].value;
				if (!target[i + 1]) {
					isData = false;
				}
			}

			if (callback) {
				callback();
			}

			return data;
		} else {
			throw new Error('getK requires a form submit event as its first arguement.');
		}
	}

	static handleResponse(response, parentSelector, header = 'Results') {
		// Fade out the previous parent element if it exists
		const parentElement = $(parentSelector);
		parentElement.fadeOut(500);
		setTimeout(() => {
			// Empty the previous element and replace the header
			parentElement.empty();
			parentElement.append($(`<h2>${header}</h2>`));
			if (response.status.name === 'ok') {
				// If data isn't an array put it in an array.
				if (!Array.isArray(response.data)) {
					response.data = [response.data];
				}

				if (response.data.length > 0) {
					// Create the list and put it within the results parent
					const resultsList = $('<ol></ol>');
					parentElement.append(resultsList);

					// Put each result in an li element
					response.data.forEach(result => {
						const resultElement = $('<li class="result"></li>');
						
						// Map out every key value pair.
						for (let key in result) {
							const value = result[key];
							const keyValue = ($('<div></div>'));
							resultElement.append(keyValue);
							keyValue.append($(`<h3>${K.camelToTitle(key)}</h3>`));
							keyValue.append($(`<p>${value}</p>`));
						}
						resultsList.append(resultElement);
					});
				} else {
					parentElement.append($('<p class="none">There are no results that meet your search criteria.</p>'));
				}
			}

			// Fade in the new parent element
			parentElement.fadeIn(500);
		}, 500);
	}

	static camelToTitle(text) {
		const result = text.replace(/([A-Z])/g, ' $1');
		const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
		return finalResult;
	}

}

export default K;