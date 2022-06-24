import * as $ from 'jquery';
import K from "./kaigen";
import App from "./app/app";

// console.log(K.element(App, { greeting: 'Hello World' }))

K.connect('root').render(K.element(App, { greeting: 'Hello World' }));
    
// K.connect('root').render(app);