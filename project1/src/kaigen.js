import * as $ from 'jquery';

class K {

	static camelToTitle(text) {
		const result = text.replace(/([A-Z])/g, ' $1');
		const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
		return finalResult;
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

// class K {
// 	static _componentCount = 0;
// 	static _connector = null;
// 	static _components = [];
	
// 	static connect = (root) => {
// 		this._connector = new Connect(root);
// 		return this._connector;
// 	}

// 	static createElement = (component, props = {}, children = []) => {
// 		props = { ...props, children, id: this._componentCount };
// 		component = new component(props);
// 		this._components.push(component);
// 		this._componentCount ++;
// 		return this.renderLifecycle(component);
// 	}

// 	static removeElement = element => {
// 		this._components = this._components(component => component.props.id !== element.props.id);
// 	}

// 	static updateElement(id) {
// 		this._connector.update(this.updateLifecycle(this._components[id]));
// 	}

// 	static renderLifecycle(component) {
// 		component._container = component.render();
// 		component.rendered();
// 		return component._container;
// 	}

// 	static updateLifecycle(component) {
// 		this.derenderLifecycle(component);
// 		component._container = component.render();
// 		component.updated();
// 		return component._container;
// 	}

// 	static derenderLifecycle(component) {
// 		component.removing();
// 		component.remove();
// 	}
// }

// class Connect {
// 	_rootParent = null;
// 	_root = null;

// 	constructor(rootId) {
// 		this.setRoot(rootId);
// 	}

// 	get rootParent() {
// 		return this._rootParent;
// 	}

// 	setRoot(rootId) {
// 		if ($(`#${rootId}`)[0] instanceof HTMLDivElement) {
// 			this._rootParent = $(`#${rootId}`);
// 		} else {
// 			throw new Error(`You must supply the id of your root HTML div element.`);
// 		}
// 	}

// 	update(component) {
// 		this._rootParent.append(component);
// 	}

// 	render(component) {
// 		$(() => {
// 			this._rootParent.append(component);
// 		})
// 	}
// }

// class Component {
// 	_container = null;
// 	_type = this.constructor.name;
// 	props = {};
// 	_state = {};
// 	_update = null;
	
// 	constructor(props, id) {
// 		props ? this.props = props : this.props = {};
// 	}

// 	get element() {
// 		return this._container;
// 	}

// 	get state() {
// 		return this._state
// 	}

// 	set state(state) {
// 		this._state = state;
// 	}

// 	setState(updater, callback) {
// 		if (typeof updater === 'function') {
// 			this._state = updater(this.state);
// 		} else if (typeof updater === 'object') {
// 			this._state = updater;
// 		}

// 		if (callback) {
// 			callback()
// 		}

// 		K.updateElement(this.props.id);
// 	}

// 	render() {}

// 	rendered() {}

// 	updated() {}

// 	remove() {
// 		this._container.remove();
// 	}

// 	removing() {}
// }

// K.Component = Component;





//////////////////////////////////////////////////////////////////
// class K {
// 	static _connector = null;
// 	static _components = [];

// 	static render(component) {
// 		const render = component.render();
// 		this._components.push(render);
// 		component.rendered();
// 		return render;
// 	}

// 	static derender(component) {
// 		const derender = this._components.filter(comp => comp === component)[0];
// 	}

// 	static update(component) {
// 		const prevComponent = this._components.filter(comp => comp === component)[0];
// 		prevComponent.replaceWith(component);
// 		component.updated();
// 	}

// 	static element(tag, props = {}, children = []) {
// 		if (typeof tag !== 'string') {
// 			const component = new tag({ ...props, children });
// 			const render = this.render(component);
// 			return render;
// 		}

// 		const render = $(document.createElement(tag));

// 		for (let key in props) {
// 			render.attr(key, props[key]);
// 		}

// 		children.forEach(child => {
// 			render.append(child)
// 		})

// 		return render;
// 	}

// 	static connect(id) {
// 		return this._connector = new Connect(id);
// 	}
// }

// class Connect {
// 	_DOMParent = null;
// 	_DOM = null;
	
// 	constructor(id) {
// 		this.setDOMParent(id);
// 	}

// 	setDOMParent(id) {
// 		if ($(`#${id}`)[0] instanceof HTMLDivElement) {
// 			this._DOMParent = $(`#${id}`);
// 		} else {
// 			throw new Error('Provide the id of an HTMLDivElement');
// 		}
// 	}

// 	render(component) {
// 		$(() => {
// 			this._DOM = component;
// 			this._DOMParent.append(component);
// 		})
// 	}
// }

// class Component {
// 	constructor(props = {}) {
// 		this.props = props;
// 		this.state = {};
// 	}

// 	setState(updater, cb) {
// 		if (typeof updater === 'function') {
// 			this.state = updater(this.state);
// 		} else if (typeof updater === 'object') {
// 			this.state = updater;
// 		}

// 		if (cb) {
// 			cb(this.state);
// 		}
// 	}

// 	render() {}

// 	rendered() {}

// 	updated() {}

// 	removing() {}
// }


// K.Component = Component;

export default K;