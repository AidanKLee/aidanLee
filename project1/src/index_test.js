import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';

import Map from './components/map/map';
import ControlInterface from './components/controls/controls';

import logo from './assets/images/logo192.png';

import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// class App {
//     _root = null;
    
// }

// $(() => {

// 	const head = $('head');
// 	const favicon = $(`<link rel="icon" type="image/png" href="${logo}"/>`);
// 	const appletouchicon = $(`<link rel="apple-touch-icon" sizes="192x192" type="image/png" href="${logo}">`);
//     const preloader = $('#preloader');
//     const map = new Map({
//         hideBaseLayerControls: true,
//         root: 'root'
//     })
//     const controls = new ControlInterface({
//         classNames: ['controls top', 'controls bottom-left', 'controls bottom-right'],
//         root: 'root'
//     });

//     // Append favicon and applce touch icon to the head
//     // ############################################################
// 	head.append(favicon);
// 	head.append(appletouchicon);

//     // Hide preloader on document load
//     // ############################################################
//     preloader.addClass('hide');

//     // Render map
//     // ############################################################
//     map.render();

//     // Create control interface
//     // ############################################################
//     controls.render();

// })