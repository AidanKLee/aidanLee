import K from "../kaigen";
import * as $ from 'jquery';

const e = K.element;

class App extends K.Component {
    constructor(props) {
        super(props);
        this.state = { question: ' Whats up?!' }
        this.timeout = null;
    }

    render() {
        return e('div', { id: 'app' }, [
            `${this.props.greeting} ${this.state.question}`
        ]);
    }
}

export default App;