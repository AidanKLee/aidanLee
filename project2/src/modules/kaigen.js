class K {

	static camelToTitle(text) {
		const result = text.replace(/([A-Z])/g, ' $1');
		const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
		return finalResult;
	}

	static toCamel(text) {
		return text.split(' ').map((word,i) => i === 0 ? word.toLowerCase() : word).join('');
	}

	static getDayFromInt = int => {
		switch (int) {
			case 0:
			  return "Sunday";
			case 1:
			  return "Monday";
			case 2:
			   return "Tuesday";
			case 3:
			  return "Wednesday";
			case 4:
			  return "Thursday";
			case 5:
			  return "Friday";
			case 6:
			  return "Saturday";
		}
	}

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

	static farToCel(f) {
		return  5 / 9 * (f - 32)
	}

	static farToKel(f) {
		return 273.15 + ((5 * (f - 32)) / 9)
	}

	static kelToCel(k) {
		return k - 273.15;
	}

	static kelToFar(k) {
		return 1.8 * (k - 273) + 32;
	}

	static celToFar(c) {
		return 9 / 5 + 32;
	}

	static celToKel(c) {
		return c + 273.15;
	}

	static pajax(url, options = {}) {
		const { data, method, type} = options;
		return new Promise((res, rej) => {
			$.ajax({
				data,
				dataType: type,
				type: method,
				url,
				success: response => {
					res(response);
				},
				error: (jqXHR, textStatus, err) => {
					rej({jqXHR, textStatus, err})
				}
			})
		}) 
	}

	static toTitle = text => {
		if (text) {
			return text.split(' ').map(word => word.slice(0,1).toUpperCase() + word.slice(1)).join(' ');
		}
	}

}

export default K;