import * as $ from 'jquery';
import K from '../../kaigen';

class ControlInterface extends K.Component {
    constructor(props) {
        super(props);
        this.timeout = null;
    }

    render() {
        return $(`<h1>This is a title.${this.state.message ? this.state.message : ''}</h1>`)
    }

    rendered() {
        setTimeout(() => {
            this.setState({ message: ' This was appended to the second element after the render' });
        }, 5000)
    }

    removing() {
        clearTimeout(this.timeout);
    }
}

// class ControlInterface {
//     _controlContainers = {};
//     _root = null;

//     constructor({ classNames, root } = {}) {
//         if (Array.isArray) {
//             classNames.forEach(name => {
//                 this.addControlContainer(name);
//             })
//         } else if (typeof classNames === 'string') {
//             this.addControlContainer(classNames);
//         }

//         this.setRoot(root);
//     }

//     get controlContainers() {
//         return this._controlContainers;
//     }

//     get root() {
//         return this._root;
//     }

//     addControlContainer(name) {
//         this._controlContainers[name] = new ControlContainer(name, this);
//     }

//     removeControlContainer(name) {
//         delete this._controlContainers(name);
//     }  

//     setRoot(root) {
//         if ($(`#${root}`)[0] instanceof HTMLDivElement) {
//             this._root = $(`#root`);
//         } else {
//             throw new Error('You need to set the root as an HTML div element.');
//         }
//     }

//     render() {
//         for (let container in this.controlContainers) {
//             this.controlContainers[container].render();
//         }
//     }
// }

// class ControlContainer {
//     _element = null;
//     _className = null;
//     _controlInterface = null;

//     constructor(className, controlInterface) {
//         this.setElement(className);
//         this.setClassName(className);
//         if (controlInterface) {
//             this.addToInterface(controlInterface);
//         }
//     }

//     get className() {
//         return this.className;
//     }

//     get controlInterface() {
//         return this._controlInterface;
//     }

//     get element() {
//         return this._element;
//     }

//     setClassName(className) {
//         if (typeof className === 'string') {
//             this._className = className;
//         } else {
//             throw new Error('ClassNames must be a string.')
//         }
//     }

//     setElement(className) {
//         if (typeof className ==='string') {
//             this._element = $(`<div></div>`);
//             this._element.addClass(className);
//         } else {
//             throw new Error('ClassNames must be a string.')
//         }
//     }

//     addToInterface(controlInterface) {
//         if (controlInterface instanceof ControlInterface) {
//             this._controlInterface = controlInterface;
//         } else {
//             throw new Error('An controlInterface must be an instance of a ControlInterface.')
//         }
//     }

//     render() {
//         this.controlInterface.root.append(this.element);
//     }
// }

export default ControlInterface;