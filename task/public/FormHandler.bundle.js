"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["FormHandler"],{

/***/ "./src/modules/Text.js":
/*!*****************************!*\
  !*** ./src/modules/Text.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Text {
	static camelToTitle(text) {
		const result = text.replace(/([A-Z])/g, ' $1');
		const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
		return finalResult;
	}
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Text);

/***/ }),

/***/ "./src/modules/formHandler.js":
/*!************************************!*\
  !*** ./src/modules/formHandler.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/jquery/jquery.min.js */ "./src/modules/jquery/jquery.min.js");
/* harmony import */ var _modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Text_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Text.js */ "./src/modules/Text.js");



class FormHandler {

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
			throw new Error('getFormHandler requires a form submit event as its first arguement.');
		}
	}

	static handleResponse(response, parentSelector, header = 'Results') {
		// Fade out the previous parent element if it exists
		const parentElement = _modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()(parentSelector);
		parentElement.fadeOut(500);
		setTimeout(() => {
			// Empty the previous element and replace the header
			parentElement.empty();
			parentElement.append(_modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()(`<h2>${header}</h2>`));
			if (response.status.name === 'ok') {
				// If data isn't an array put it in an array.
				if (!Array.isArray(response.data)) {
					response.data = [response.data];
				}

				// Create the list and put it within the results parent
				const resultsList = _modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()('<ol></ol>');
				parentElement.append(resultsList);

				// Put each result in an li element
				response.data.forEach(result => {
					const resultElement = _modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()('<li class="result"></li>');
                    
					// Map out every key value pair.
					for (let key in result) {
						const value = result[key];
						const keyValue = (_modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()('<div></div>'));
						resultElement.append(keyValue);
						keyValue.append(_modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()(`<h3>${_Text_js__WEBPACK_IMPORTED_MODULE_1__["default"].camelToTitle(key)}</h3>`));
						keyValue.append(_modules_jquery_jquery_min_js__WEBPACK_IMPORTED_MODULE_0___default()(`<p>${value}</p>`));
					}
					resultsList.append(resultElement);
				});
			}

			// Fade in the new parent element
			parentElement.fadeIn(500);
		}, 500);
	}

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FormHandler);

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["src_modules_jquery_jquery_min_js"], () => (__webpack_exec__("./src/modules/formHandler.js")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybUhhbmRsZXIuYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUVBQWUsSUFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNSNkI7QUFDbkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixvRUFBQztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixvRUFBQyxRQUFRLE9BQU87QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isb0VBQUM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsb0VBQUM7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isb0VBQUM7QUFDekI7QUFDQSxzQkFBc0Isb0VBQUMsUUFBUSw2REFBaUIsTUFBTTtBQUN0RCxzQkFBc0Isb0VBQUMsT0FBTyxNQUFNO0FBQ3BDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxXQUFXIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvVGV4dC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kdWxlcy9mb3JtSGFuZGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUZXh0IHtcclxuXHRzdGF0aWMgY2FtZWxUb1RpdGxlKHRleHQpIHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IHRleHQucmVwbGFjZSgvKFtBLVpdKS9nLCAnICQxJyk7XHJcblx0XHRjb25zdCBmaW5hbFJlc3VsdCA9IHJlc3VsdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHJlc3VsdC5zbGljZSgxKTtcclxuXHRcdHJldHVybiBmaW5hbFJlc3VsdDtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRleHQ7IiwiaW1wb3J0ICQgZnJvbSAnLi4vbW9kdWxlcy9qcXVlcnkvanF1ZXJ5Lm1pbi5qcyc7XHJcbmltcG9ydCBUZXh0IGZyb20gJy4vVGV4dC5qcyc7XHJcblxyXG5jbGFzcyBGb3JtSGFuZGxlciB7XHJcblxyXG5cdHN0YXRpYyBnZXRGb3JtRGF0YShmb3JtRXZlbnQsIGNhbGxiYWNrKSB7XHJcblx0XHRjb25zdCB0YXJnZXQgPSBmb3JtRXZlbnQuY3VycmVudFRhcmdldDtcclxuXHJcblx0XHRpZiAoZm9ybUV2ZW50LnR5cGUgPT09ICdzdWJtaXQnICYmIHRhcmdldC50YWdOYW1lID09PSAnRk9STScpIHtcclxuXHRcdFx0Y29uc3QgZGF0YSA9IHt9O1xyXG5cdFx0XHRsZXQgaXNEYXRhID0gdHJ1ZTtcclxuXHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpc0RhdGE7IGkrKykge1xyXG5cdFx0XHRcdGRhdGFbdGFyZ2V0W2ldLm5hbWVdID0gdGFyZ2V0W2ldLnZhbHVlO1xyXG5cdFx0XHRcdGlmICghdGFyZ2V0W2kgKyAxXSkge1xyXG5cdFx0XHRcdFx0aXNEYXRhID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoY2FsbGJhY2spIHtcclxuXHRcdFx0XHRjYWxsYmFjaygpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZGF0YTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignZ2V0Rm9ybUhhbmRsZXIgcmVxdWlyZXMgYSBmb3JtIHN1Ym1pdCBldmVudCBhcyBpdHMgZmlyc3QgYXJndWVtZW50LicpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBwYXJlbnRTZWxlY3RvciwgaGVhZGVyID0gJ1Jlc3VsdHMnKSB7XHJcblx0XHQvLyBGYWRlIG91dCB0aGUgcHJldmlvdXMgcGFyZW50IGVsZW1lbnQgaWYgaXQgZXhpc3RzXHJcblx0XHRjb25zdCBwYXJlbnRFbGVtZW50ID0gJChwYXJlbnRTZWxlY3Rvcik7XHJcblx0XHRwYXJlbnRFbGVtZW50LmZhZGVPdXQoNTAwKTtcclxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xyXG5cdFx0XHQvLyBFbXB0eSB0aGUgcHJldmlvdXMgZWxlbWVudCBhbmQgcmVwbGFjZSB0aGUgaGVhZGVyXHJcblx0XHRcdHBhcmVudEVsZW1lbnQuZW1wdHkoKTtcclxuXHRcdFx0cGFyZW50RWxlbWVudC5hcHBlbmQoJChgPGgyPiR7aGVhZGVyfTwvaDI+YCkpO1xyXG5cdFx0XHRpZiAocmVzcG9uc2Uuc3RhdHVzLm5hbWUgPT09ICdvaycpIHtcclxuXHRcdFx0XHQvLyBJZiBkYXRhIGlzbid0IGFuIGFycmF5IHB1dCBpdCBpbiBhbiBhcnJheS5cclxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocmVzcG9uc2UuZGF0YSkpIHtcclxuXHRcdFx0XHRcdHJlc3BvbnNlLmRhdGEgPSBbcmVzcG9uc2UuZGF0YV07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBDcmVhdGUgdGhlIGxpc3QgYW5kIHB1dCBpdCB3aXRoaW4gdGhlIHJlc3VsdHMgcGFyZW50XHJcblx0XHRcdFx0Y29uc3QgcmVzdWx0c0xpc3QgPSAkKCc8b2w+PC9vbD4nKTtcclxuXHRcdFx0XHRwYXJlbnRFbGVtZW50LmFwcGVuZChyZXN1bHRzTGlzdCk7XHJcblxyXG5cdFx0XHRcdC8vIFB1dCBlYWNoIHJlc3VsdCBpbiBhbiBsaSBlbGVtZW50XHJcblx0XHRcdFx0cmVzcG9uc2UuZGF0YS5mb3JFYWNoKHJlc3VsdCA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCByZXN1bHRFbGVtZW50ID0gJCgnPGxpIGNsYXNzPVwicmVzdWx0XCI+PC9saT4nKTtcclxuICAgICAgICAgICAgICAgICAgICBcclxuXHRcdFx0XHRcdC8vIE1hcCBvdXQgZXZlcnkga2V5IHZhbHVlIHBhaXIuXHJcblx0XHRcdFx0XHRmb3IgKGxldCBrZXkgaW4gcmVzdWx0KSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gcmVzdWx0W2tleV07XHJcblx0XHRcdFx0XHRcdGNvbnN0IGtleVZhbHVlID0gKCQoJzxkaXY+PC9kaXY+JykpO1xyXG5cdFx0XHRcdFx0XHRyZXN1bHRFbGVtZW50LmFwcGVuZChrZXlWYWx1ZSk7XHJcblx0XHRcdFx0XHRcdGtleVZhbHVlLmFwcGVuZCgkKGA8aDM+JHtUZXh0LmNhbWVsVG9UaXRsZShrZXkpfTwvaDM+YCkpO1xyXG5cdFx0XHRcdFx0XHRrZXlWYWx1ZS5hcHBlbmQoJChgPHA+JHt2YWx1ZX08L3A+YCkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmVzdWx0c0xpc3QuYXBwZW5kKHJlc3VsdEVsZW1lbnQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBGYWRlIGluIHRoZSBuZXcgcGFyZW50IGVsZW1lbnRcclxuXHRcdFx0cGFyZW50RWxlbWVudC5mYWRlSW4oNTAwKTtcclxuXHRcdH0sIDUwMCk7XHJcblx0fVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRm9ybUhhbmRsZXI7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9