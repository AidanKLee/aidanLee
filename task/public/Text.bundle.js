"use strict";
(self["webpackChunk"] = self["webpackChunk"] || []).push([["Text"],{

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

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/modules/Text.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxJQUFJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL21vZHVsZXMvVGV4dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUZXh0IHtcclxuXHRzdGF0aWMgY2FtZWxUb1RpdGxlKHRleHQpIHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IHRleHQucmVwbGFjZSgvKFtBLVpdKS9nLCAnICQxJyk7XHJcblx0XHRjb25zdCBmaW5hbFJlc3VsdCA9IHJlc3VsdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHJlc3VsdC5zbGljZSgxKTtcclxuXHRcdHJldHVybiBmaW5hbFJlc3VsdDtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRleHQ7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9