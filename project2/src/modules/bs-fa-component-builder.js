class Component {

    static container = (size = '') => {
        const sizes = ['sm','md','lg','xl','xxl','fluid'];
        let className = '.container';
        const element = document.createElement('div');
        if (size !== '' && sizes.inclues(size)) {
            className += `-${size}`;
        }
        element.classList.add(className);
        return element;
    }

    static icon = (className) => {
        className = className.split(' ')
        const element = document.createElement('i');
        if (className) {
            className.forEach(name => element.classList.add(name));
        }
        return element;
    }

}