import $ from 'jquery';
import './index.css';

$(() => {
    const root = $('#root');
    const hello = $('<h1>Hello World!</h1>');
    const env = $(`<p>We are currently in ${process.env.NODE_ENV} mode!</p>`)

    root.append(hello);
    root.append(env);
});