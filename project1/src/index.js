import * as $ from 'jquery';
import * as L from 'leaflet';
import * as bootstrap from 'bootstrap';
import K from './kaigen';

import logo from './assets/images/logo192.png';

import primary from './assets/images/primary.png';
import terrain from './assets/images/terrain.png';
import dark from './assets/images/dark.png';
import satellite from './assets/images/satellite.png';

import bs from './assets/images/attribution/bootstrap.png';
import esri from './assets/images/attribution/esriworldimages.png';
import geoapify from './assets/images/attribution/geoapify.png';
import geonames from './assets/images/attribution/geonames.png';
import jawg from './assets/images/attribution/jawgmaps.png';
import leafletjs from './assets/images/attribution/leafletjs.png';
import openexchange from './assets/images/attribution/openexchangerates.png';
import openweather from './assets/images/attribution/openweather.png';
import thunderforest from './assets/images/attribution/thunderforest.png';

import currencies from './assets/json/currencies.json';
import geojson from './assets/geojson/countryBorders.geo.json';
import cats from './assets/json/mainCategories.json';
import allCats from './assets/json/categories.json';
import colours from './assets/json/colours.json';

import './style.css';

const categories = {};
const allCategories = {};

let colourIndex = 0;
cats.forEach(cat => {
    cat.colour = colours[colourIndex];
    categories[cat.alias] = cat
    colourIndex = colourIndex === 9 ? 0 : colourIndex + 1;
});

allCats.categories.forEach(cat => allCategories[cat.alias] = cat);


/***************************************************************************************************/
// Global Variables
/***************************************************************************************************/

// Attributions
/***************************************************************************************************/
const attributions = {
    bootstrap: {
        img: bs,
        href: 'https://getbootstrap.com/'
    },
    esri: {
        img: esri,
        href: 'https://www.esri.com'
    },
    geoapify: {
        img: geoapify,
        href: 'https://www.geoapify.com'
    },
    geonames: {
        img: geonames,
        href: 'https://www.geonames.org'
    },
    jawg: {
        img: jawg,
        href: 'http://jawg.io'
    },
    leaflet: {
        img: leafletjs,
        href: 'https://leafletjs.com'
    },
    openExchange: {
        img: openexchange,
        href: 'https://openexchangerates.org'
    },
    openWeather: {
        img: openweather,
        href: 'https://www.openweather.org'
    },
    thunderforest: {
        img: thunderforest,
        href: 'https://www.thunderforest.com'
    }
}

// Tile Layers
/***************************************************************************************************/
const tiles = [
    {
        name: 'primary',
        img: primary,
        key: process.env.JAWG,
        href: `https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=`,
        attribution: '<a href="http://jawg.io" data-bs-toggle="tooltip" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" data-bs-toggle="tooltip" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
    },
    {
        name: 'terrain',
        img: terrain,
        key: process.env.THUNDERFOREST,
        href: `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=`,
        attribution: '<a href="https://www.thunderforest.com/" data-bs-toggle="tooltip" title="Tiles Courtesy of Thunderforest Maps" target="_blank" class="jawg-attrib">&copy; <b>Thunderforest</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" data-bs-toggle="tooltip" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
    },
    {
        name: 'dark',
        key: process.env.THUNDERFOREST,
        img: dark,
        href: `https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=`,
        attribution: '<a href="https://www.thunderforest.com/" data-bs-toggle="tooltip" title="Tiles Courtesy of Thunderforest Maps" target="_blank" class="jawg-attrib">&copy; <b>Thunderforest</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" data-bs-toggle="tooltip" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
    },
    {
        name: 'satellite',
        img: satellite,
        href: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
        attribution: '<a href="https://www.arcgis.com/" data-bs-toggle="tooltip" title="Tiles Courtesy of Esri World Imagery" target="_blank" class="jawg-attrib">&copy; <b>Esri </b>World Imagery</a> | <a href="https://www.openstreetmap.org/copyright" data-bs-toggle="tooltip" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
    }
]

// Current State
/***************************************************************************************************/
let map = null;
let baseLayers = {};
let markerLayerGroup = null;
let businessLayerGroup = null;
let location = null;
let centre = {};
let found = false;
let currentCountry = '';
let currentCurrency = '';
let currentExchangeRates = null;
let geoLayer = null;
let moveTimeout = null;
let searchTimeout = null;

// Head & Icons
/***************************************************************************************************/
const head = $('head');
const favicon = $(`<link rel="icon" type="image/png" href="${logo}"/>`);
const appletouchicon = $(`<link rel="apple-touch-icon" sizes="192x192" type="image/png" href="${logo}">`);

// Bottom Level Containers
/***************************************************************************************************/
const preloader = $(`#preloader`);
const root = $('#root');

// Map Container & Controls
/***************************************************************************************************/
const mapContainer = $('<div id="map"></div>');

const crosshair = $('<svg id="crosshair" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-crosshair"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>');
const loader = $(`<div id="loader" class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`);
const topControls = $('<div class="controls top"></div>');
const bottomLeftControls = $('<div class="controls bottom-left"></div>');
const bottomRightControls = $('<div class="controls bottom-right"></div>');
const topLeftControls = $('<div class="left"></div>');
const topRightControls = $('<div class="right"></div>');

const zoomControls = $('<div id="zoom-control" class="btn-group-vertical shadows"></div>');
const zoomIn = $('<button class="btn btn-primary border" type="button" data-bs-toggle="tooltip" title="Zoom In"></button>');
const zoomOut = $('<button class="btn btn-light border" type="button" data-bs-toggle="tooltip" title="Zoom Out"></button>');

const moreInfo = $('<button id="more-info" class="btn btn-secondary border round" data-bs-toggle="tooltip" title="More Info"></button>');
// const navigation = $('<button id="navigation" class="btn btn-secondary border round" data-bs-toggle="tooltip" title="Navigation"></button>');
const myLocation = $('<button id="my-location" class="btn btn-secondary border round" data-bs-toggle="tooltip" title="My Location"></button>');
const outline = $('<button id="geolayer" class="btn btn-light border round active" data-bs-toggle="tooltip" title="My Location"></button>');
const crosshairButton = $('<button id="crosshair-button" class="btn btn-light border round active" data-bs-toggle="tooltip" title="Crosshair"></button>');

const baseLayerControl = $('<div id="base-layer-control"></div>');
const baseLayerControlDropdown = $('<div class="collapse"></div>');
const collapse = new bootstrap.Collapse(baseLayerControlDropdown, {
    toggle: false
});

// Search Bar
/***************************************************************************************************/
const searchBarContainer = $('<div id="search-bar-container" class="mb-2 rounded-pill"></div>')
const searchBar = $('<div id="search-bar" class="input-group shadows"></div>');
const searchResults = $('<div id="search-results" class="shadows-light"></div>');
const resultsCollapse = new bootstrap.Collapse(searchResults);
const resultList = $('<div id="result-list" class="list-group"></div>');
// const menuButton = $('<button class="btn btn-primary" type="button" data-bs-toggle="tooltip" title="Menu"></button>');
const input = $('<input id="q" type="text" class="form-control" placeholder="Go XPlore" aria-label="Search" autocomplete="off">');
const countrySelect = $(`<select id="country" class="form-select" aria-label=" aria-label="Country Select"></select>`);
const searchLabel = $('<label for="q" class="btn btn-light border" data-bs-toggle="tooltip" title="Search"></label>');
const maximize = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
const minmize = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>';
const fullscreenButton = $('<button class="btn btn-secondary" type="button" data-bs-toggle="tooltip" title="Full Screen"></button>');

// Notification Toast
/***************************************************************************************************/
const toastContainer = $('<div class="toast-container"></div>');
    
// Weather Display
/***************************************************************************************************/
const weatherContainer = $('<div id="weather-container" data-bs-toggle="tooltip" class="btn btn-light mb-1 rounded d-flex align-items-center shadows-light border" title="Weather"></div>');
const weatherIcon = $(`<img src="" alt="" />`);
const weatherholder = '<div class="placeholder-glow"><span class="placeholder col-12"></span></div>';
const weatherholder2 = weatherholder.slice();
    
// Current Address Display
/***************************************************************************************************/
const currentAddressMarker = $('<div class="alert alert-light d-flex align-items-center border shadows-light" role="alert"></div>');
const icon ='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
const placeholder = '<div class="placeholder-glow"><span class="placeholder col-12"></span></div>';
const placeholder2 = placeholder.slice();
const placeholders = $('<div class="placeholders"></div>');

// More Info Menu
/***************************************************************************************************/
const moreInfoMenu = $('<div id="more-info-menu" class="rounded-end border-end border-2 shadows-light collapse"></div>');
const moreInfoCollape = new bootstrap.Collapse(moreInfoMenu[0], {
    toggle: false
});
const info = $('<div id="info"></div>');
const infoHeader = $(`<header class="modal-header"></header>`);
const infoHeaderText = $(`<h1 class="fs-2 fw-semibold mb-0"></div>`);
const infoClose = $('<button type="button" class="btn-close" aria-label="Close"></button>');

const infoBody = $('<div class="modal-body"></div>');
const addressList = $(`<h2 class="modal-title mb-0 fs-6">Address</h2>`);
const formattedAddress = $(`<p></p>`); 
const countryState = $(`<h2 class="modal-title mb-0 fs-4"></h2>`);
const continent = $(`<p class="mb-0"></p>`);
const capital = $(`<p class="mb-0"></p>`);
const population = $(`<p class="mb-0"></p>`);
const areaSqKm = $(`<p></p>`);
const menuWeather = $(`<div class="weather d-flex border mb-3"></div>`);
const currencyList = $(`<div class="currency mb-3"></div>`);
const wikis = $(`<div class="wiki"></div>`);

const infoFooter = $('<div class="modal-footer d-block"></div>');
const powered = $(`<p class="fw-bold text-center">Powered By</p>`);
const attrib = $(`<div id="attribution" class ="d-flex justify-content-center"></div>`);





/***************************************************************************************************/
// Components
/***************************************************************************************************/

// No Location Modal
/***************************************************************************************************/
const renderNoLocation = () => {
    const startModal = $(`<div class="location modal fade" tabindex="-1"></div>`);
    const startModalDialog = $(`<div class="modal-dialog modal-dialog-centered"></div>`);
    const startModalContent = $(`<div class="modal-content"></div>`);
    const startModalHeader = $(`<div class="modal-header"></div>`);
    const startModalTitle = $(`<h5 class="modal-title">Location Services</h5>`);
    const startModalClose = $(`<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`);
    const startModalBody = $(`<div class="modal-body"><p>You didn't enable your location services or they're not available on your device. We aim to tailor your experience based on your location.</p><p class="mb-0">If you want the best experience enable your location and click below. If not, feel free to XPlore!</p></div>`);
    const startModalFooter = $(`<div class="modal-footer"></div>`);
    const startCancel = $(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`);
    const startLocating = $(`<button type="button" class="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48" fill="currentcolor"><path d="M22.5 46V42.25Q15.65 41.55 11.1 37Q6.55 32.45 5.85 25.6H2.1V22.6H5.85Q6.55 15.75 11.1 11.2Q15.65 6.65 22.5 5.95V2.2H25.5V5.95Q32.35 6.65 36.9 11.2Q41.45 15.75 42.15 22.6H45.9V25.6H42.15Q41.45 32.45 36.9 37Q32.35 41.55 25.5 42.25V46ZM24 39.3Q30.25 39.3 34.725 34.825Q39.2 30.35 39.2 24.1Q39.2 17.85 34.725 13.375Q30.25 8.9 24 8.9Q17.75 8.9 13.275 13.375Q8.8 17.85 8.8 24.1Q8.8 30.35 13.275 34.825Q17.75 39.3 24 39.3Z"/></svg></button>`);

    root.append(startModal);
    startModal.append(startModalDialog);
    startModalDialog.append(startModalContent);

    startModalContent.append(startModalHeader, startModalBody, startModalFooter);
    startModalHeader.append(startModalTitle, startModalClose);
    startModalFooter.append(startCancel, startLocating);

    const startModalControl = new bootstrap.Modal(startModal[0]);
    startModalControl.show();
    
    getCurrentLocation();

    startLocating.on('click', e => {
        goToMyLocation(map);
        startModalControl.hide();
    })
}





/***************************************************************************************************/
// Refreshable Components
/***************************************************************************************************/

// More Info Menu - Weather Section
/***************************************************************************************************/
const renderMenuWeather = async data => {
    const today = data[0];
    const week = data.slice(1);

    const left = $(`<div class="left"></div>`);
    const right = $(`<div class="right"></div>`);

    const rightTop = $(`<div class="top d-flex"></div>`);
    const rightBottom = $(`<div class="bottom"></div>`);

    const buildWeatherTile = async (elem, data, dayReplace) => {
        const { description, feels_like, humidity, icon, pressure, temp: t, temp_max, temp_min } = data;
        // Turn the image into a URLObject
        let img = await fetch(`http://openweathermap.org/img/w/${icon}.png`);
        img = await img.blob();
        img = URL.createObjectURL(img);
    
        // Clear the weather container
        elem.empty();

        // Extract the icon change src and alt
        const weatherIcon = $(`<img src="" alt="" />`);
        weatherIcon.attr('src', img);
        weatherIcon.attr('alt', description);

        // Append the day
        elem.append(
            weatherIcon,
            `<div class="day">${dayReplace ? dayReplace : data.day.slice(0,3)}</div>`,
            `<div class="temp bold">${Math.round(K.kelToCel(t))}<sup>°C</sup></div>`
        );
    }

    menuWeather.empty();
    menuWeather.append(left, right);

    right.append(rightTop, rightBottom);

    rightBottom.append(`<p>Real Feel: ${Math.round(K.kelToCel(today.feels_like))}<sup>°C</sup>.</p><p>${K.toTitle(today.description)}</p><p>Humidity: ${today.humidity}%</p>`)

    buildWeatherTile(left, today, 'Today')
    week.forEach(forecast => {
        const tile = $(`<div></div>`);
        rightTop.append(tile);
        buildWeatherTile(tile, forecast);
    })
}

// More Info Menu - Exchange Rates
/***************************************************************************************************/
const renderExchangeRates = data => {
    const { currency, rates } = data;
    const defaultRates = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD'];

    currencyList.empty();

    const base = $(`<h2 class="d-flex align-items-center overflow-hidden">${currency} <span class="d-inline badge rounded-pill bg-primary fw-semibold fs-6 ms-2">${currencies[currency]}</span></h2>`);

    const selectRates = $(`<div class='select-rates'></div>`);

    defaultRates.forEach(cur1 => {
        const container = $(`<div class="d-flex pb-1"></div>`);
        const rate = $(`<input disabled class="rate" value="${currentExchangeRates[cur1].toFixed(5)}" />`)
        const select = $(`<select class="form-select form-select-sm rounded-pill"></select>`);

        select.on('change', e => {
            rate.val(currentExchangeRates[e.currentTarget.value].toFixed(5))
        })

        selectRates.append(container);
        container.append(rate, select);

        Object.keys(currencies).forEach(cur2 => {
            select.append($(`<option value="${cur2}"${cur1 === cur2 ? " selected" : ""}>${cur2}: ${currencies[cur2]}</option>`));
        })

    })

    currencyList.append(base, selectRates);
}

// More Info Menu - Wiki Links
/***************************************************************************************************/
const renderWikis = async (entries = []) => {
    wikis.empty();
    const carousel = $(`<div id="wiki" class="carousel carousel-dark slide" data-bs-ride="true"></div>`);
    const indicators = $(`<div class="carousel-indicators">`);
    const inner = $(`<div class="carousel-inner">`);
    const prev = $(`<button class="carousel-control-prev" type="button" data-bs-target="#wiki" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="false"></span><span class="visually-hidden">Previous</span></button>`);
    const next = $(`<button class="carousel-control-next" type="button" data-bs-target="#wiki" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="false"></span><span class="visually-hidden">Next</span></button>`);

    wikis.append(carousel);
    [indicators, inner, prev, next].forEach(part => carousel.append(part));

    if (entries.length > 0) {
        entries.forEach((entry,i) => {
            const indicator = $(`<button type="button" data-bs-target="#wiki" data-bs-slide-to="${i}"${i===0 ? ' class="active" aria-current="true"' : ''} aria-label="Slide 1"></button>`)
            const card = $(`<figure class="card px-5 pb-3 rounded-3 bg-light bg-gradient carousel-item${i === 0 ? ' active' : ''}"></figure>`);
            const text = $(`<div class="card-body"><h5 class="card-title">${entry.title}</h5><p class="card-text">${entry.summary}</p><a class="stretched-link" href="${`https://${entry.wikipediaUrl}`}" target="_blank" class="row g-0"><p class="card-text"><small class="text-muted">${entry.wikipediaUrl}</small></p></a></div>`);
    
            indicators.append(indicator);
            inner.append(card);
            card.append(text);
        })
    } else {
        const indicator = $(`<button type="button" data-bs-target="#wiki" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>`)
        const card = $(`<figure class="card px-5 pb-3 rounded-3 bg-light bg-gradient carousel-item active"></figure>`);
        const text = $(`<div class="card-body"><h5 class="card-title">No Wikipedia Links</h5><p class="card-text">There's no Wikipedia links available for the current location. Try zooming out, viewing a wider area may find more results.</p><a class="stretched-link" href="#" target="_blank" class="row g-0"><p class="card-text"><small class="text-muted"></small></p></a></div>`);

        indicators.append(indicator);
        inner.append(card);
        card.append(text);
    }
}

// More Info Menu - Address
/***************************************************************************************************/
const renderMenuAddress = data => {
    infoHeaderText.html(data.address_line1);
    formattedAddress.html(`${data.address_line1}${data.city ? `, ${data.city}` : ''}${data.county ? `, ${data.county}` : ''}${!data.postcode ? '' : `, ${data.postcode}`}`);
    countryState.html(`${data.country ? data.country : data.address_line1}${(data && data.state && data.state.includes('-Capital')) || !data.state ? '' : `, <span class="fs-6">${data.state}</span>`}`)
}

// More Info Menu - Country Data
/***************************************************************************************************/
const renderCountryData = data => {
    continent.html(`<span class="fw-bolder">Continent: </span>${data.continentName}`);
    capital.html(`<span class="fw-bolder">Capital City: </span>${data.capital}`);
    population.html(`<span class="fw-bolder">Population: </span>${data.population}`);
    areaSqKm.html(`<span class="fw-bolder">Land Area: </span>${Math.round(data.areaInSqKm)} km<sup>2</sup>`);
}

// Custom Base Layer Controls
/***************************************************************************************************/
const renderBaseLayerControls = (elements, rerender) => {
    // If rerendering clear the parent and dropdown elements
    if (rerender) {
        baseLayerControl.empty();
        baseLayerControlDropdown.empty();
    }

    // Add on input listener to rerender when selected
    elements.on('input', e => {
        renderBaseLayerControls(elements, true);
    });

    // Separate radio buttons into checked and unchecked
    let selectedBaseLayer = null;
    let unselectedBaseLayers = [];
    
    elements.each(i => {
        const radio = elements[i];

        // Insert the images and insert into labels
        const image = $(`<img src="${tiles[i].img}" alt="${tiles[i].name}" data-bs-toggle="tooltip" title="${tiles[i].name.split('').map((char, i) => i === 0 ? char.toUpperCase() : char).join('')}"/>`);

        // Separate the buttons
        if (radio.checked) {
            const button = $(`<button class="btn btn-clear border shadows" type="button"></button>`);
            button.append(image, radio);
            selectedBaseLayer = button;
            if (image[0].title === 'Satellite' || image[0].title === 'Dark') {
                crosshair.addClass('light');
            } else {
                crosshair.removeClass('light');
            }
        } else {
            const label = $(`<label class="btn btn-clear border shadows"></label>`);
            label.append(image, radio);
            unselectedBaseLayers.push(label);
        }
    })

    // Create a collapsable container and parent
    baseLayerControl.append(baseLayerControlDropdown);
    bottomRightControls.prepend(baseLayerControl);

    baseLayerControl.append(selectedBaseLayer);
    unselectedBaseLayers.forEach(layer => baseLayerControlDropdown.prepend(layer));

    // Add click event for button to toggle collapse
    selectedBaseLayer.on('click', () => {
        collapse.toggle();
    })

    baseLayerControl.mouseleave(e => {
        collapse.hide();
    })

    collapse.hide()
}

// Search Bar Results
/***************************************************************************************************/
const renderResults = (res, map) => {
    resultList.empty();
    if (res.length > 0) {
        res.forEach(result => {
            // Extract geolocation data from the response
            const latLng = L.latLng(result.properties.lat, result.properties.lon);
            const corner1 = L.latLng(result.bbox[1], result.bbox[0]);
            const corner2 = L.latLng(result.bbox[3], result.bbox[2]);
            const latLngBounds = L.latLngBounds(corner1, corner2);
            const text = result.properties.formatted;

            // Create a list item make it a BootStap tab item and append it to the list
            const resultElement = $(`<button class="list-group-item list-group-item-action"></button>`);
            const resultTab = new bootstrap.Tab(resultElement);

            resultElement.html(text);
            resultList.append(resultElement);

            // On list item click, go to location
            resultElement.on('click', e => {
                const { lat, lng } = latLng;
                if (Object.keys(markerLayerGroup._layers).length > 0) {
                    markerLayerGroup.clearLayers();
                }
                addLocationMarker(latLng)
                getCurrentAddress(lat, lng, data => {
                    renderToast({name: 'XPlore', src: logo, text: `Moved to ${data.results[0].formatted}.`});
                })
                goToLocation(latLng, latLngBounds);
            })
        })

        // Append the list to the results container
        searchResults.append(resultList);

        // Highlist the first tab element
        const listElement = $('#result-list .list-group-item');
        bootstrap.Tab.getInstance(listElement[0]).show();

        // Assign the mouseover event for each tab
        listElement.each(i => {
            const element = listElement[i];
            element.addEventListener('mouseover', e => {
                bootstrap.Tab.getInstance(element).show();
            })
        })

        // Open the result container
        resultsCollapse.show();
    }
}

// Notification Toast Element
/***************************************************************************************************/
const renderToast = (options = {}) => {
    const { name = '', src = '', text = '' } = options;

    let time = 0;
    let timer = null;
    const toastElement = $('<div class="toast shadows-light" role="alert" aria-live="assertive" aria-atomic="true"></div>');
    const toastHeader = $('<div class="toast-header"></div>');
    const toastImg = $(`<img src="${src}" class="rounded me-2" alt="${name} Logo" />`);
    const headerText = $(`<strong class="me-auto">${name}</strong>`);
    let timerText = $(`<small class="text-muted">${time} seconds ago</small>`);
    const close = $('<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>');
    const toastBody = $(`<div class="toast-body">${text}</div>`);
    
    // Create bootsrap toast element
    const toast = new bootstrap.Toast(toastElement[0], {
        delay: 60000
    });

    // Assign close method
    close.on('click', e => {
        toast.hide();
    })

    // Render toast element
    toastContainer.append(toastElement)

    toastElement.append(toastHeader);
    toastElement.append(toastBody);

    toastHeader.append(toastImg);
    toastHeader.append(headerText);
    toastHeader.append(timerText);
    toastHeader.append(close);

    toast.show();

    // Start timer
    timer = setInterval(() => {
        time ++;
        toastHeader.empty();
        timerText = $(`<small class="text-muted">${time} seconds ago</small>`);
        toastHeader.append(toastImg);
        toastHeader.append(headerText);
        toastHeader.append(timerText);
        toastHeader.append(close);
    }, 1000);

    // Stop timer when closed
    toastElement[0].addEventListener('hidden.bs.toast', () => {
        clearInterval(timer);
        toastElement.remove();
    })
}

// Render Weather Window
/***************************************************************************************************/
const renderWeather = async data => {
    const { description, feels_like, humidity, icon, pressure, temp: t, temp_max, temp_min } = data;
    const averageTemp = (t + temp_max + temp_min) / 3
    const temp = $(`<span class="fs-1 bold ms-2">${Math.round(K.kelToCel(averageTemp))}<sup class="fs-6">°C</sup></span>`);
    
    // Turn the image into a URLObject
    let img = await fetch(`http://openweathermap.org/img/w/${icon}.png`);
    img = await img.blob();
    img = URL.createObjectURL(img);
    
    // Clear the weather container
    weatherContainer.empty();

    // Extract the icon change src and alt
    weatherIcon.attr('src', img);
    weatherIcon.attr('alt', description);
    weatherContainer.append(weatherIcon);

    // Extract the temperature and append it
    weatherContainer.append(temp);
}

// Render Weather Window
/***************************************************************************************************/
const renderAlertAddress = data => {
    currentAddressMarker.empty();
    currentAddressMarker.html(icon);
    const text = data.results[0].formatted;
    currentAddressMarker.append($(`<div>${text}</div>`));
}





/***************************************************************************************************/
// Global Functions
/***************************************************************************************************/

// Get Current Location When Map Stops Moving
/***************************************************************************************************/
const handleMapMoveEnd = e => {
    if (moveTimeout) {
        clearTimeout(moveTimeout);
    }

    moveTimeout = setTimeout(() => {
        getCurrentLocation();
    }, 1000);
}

// Change My Location Icon To Found
/***************************************************************************************************/
const myLocationFound = () => {
    myLocation.empty();
    myLocation.html('<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48" fill="currentcolor"><path d="M22.5 45.9V42.15Q15.65 41.45 11.1 36.9Q6.55 32.35 5.85 25.5H2.1V22.5H5.85Q6.55 15.65 11.1 11.1Q15.65 6.55 22.5 5.85V2.1H25.5V5.85Q32.35 6.55 36.9 11.1Q41.45 15.65 42.15 22.5H45.9V25.5H42.15Q41.45 32.35 36.9 36.9Q32.35 41.45 25.5 42.15V45.9ZM24 39.2Q30.25 39.2 34.725 34.725Q39.2 30.25 39.2 24Q39.2 17.75 34.725 13.275Q30.25 8.8 24 8.8Q17.75 8.8 13.275 13.275Q8.8 17.75 8.8 24Q8.8 30.25 13.275 34.725Q17.75 39.2 24 39.2ZM24 31.5Q20.85 31.5 18.675 29.325Q16.5 27.15 16.5 24Q16.5 20.85 18.675 18.675Q20.85 16.5 24 16.5Q27.15 16.5 29.325 18.675Q31.5 20.85 31.5 24Q31.5 27.15 29.325 29.325Q27.15 31.5 24 31.5Z"/></svg>');
}

// Change My Location Icon To Left/Searching
/***************************************************************************************************/
const myLocationLeft = () => {
    myLocation.empty();
    myLocation.html('<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48" fill="currentcolor"><path d="M22.5 46V42.25Q15.65 41.55 11.1 37Q6.55 32.45 5.85 25.6H2.1V22.6H5.85Q6.55 15.75 11.1 11.2Q15.65 6.65 22.5 5.95V2.2H25.5V5.95Q32.35 6.65 36.9 11.2Q41.45 15.75 42.15 22.6H45.9V25.6H42.15Q41.45 32.45 36.9 37Q32.35 41.55 25.5 42.25V46ZM24 39.3Q30.25 39.3 34.725 34.825Q39.2 30.35 39.2 24.1Q39.2 17.85 34.725 13.375Q30.25 8.9 24 8.9Q17.75 8.9 13.275 13.375Q8.8 17.85 8.8 24.1Q8.8 30.35 13.275 34.825Q17.75 39.3 24 39.3Z"/></svg>');
}

// Toggle More Info Menu
/***************************************************************************************************/
const toggleMenu = () => {
    moreInfo.toggleClass('active');
    bottomLeftControls.toggleClass('hide');
    moreInfoCollape.toggle();
}

// Show GeoJSON Layer
/***************************************************************************************************/
const showGeoLayer = (country) => {
    if (country) {
        const feature = geojson.features.filter(feature => feature.properties.iso_a2.toLowerCase() === country.toLowerCase());

        if (geoLayer) {
            geoLayer.removeFrom(map);
        }

        geoLayer = L.geoJSON(feature, {
            fillOpacity: 0,
            color: 'var(--bs-primary)'
        }).addTo(map);
    }
}

// Hide GeoJSON Layer
/***************************************************************************************************/
const hideGeoLayer =()=> {
    geoLayer.removeFrom(map);
    geoLayer = null;
}

// Toggle GeoJSON Layer
/***************************************************************************************************/
const toggleGeoLayer =()=> {
    if (geoLayer) {
        hideGeoLayer(map);
    } else {
        showGeoLayer(currentCountry);
    }
}

// Toggle GeoJSON Layer
/***************************************************************************************************/
const toggleCrosshair = e => {
    crosshairButton.toggleClass('active');
    crosshair.toggleClass('hide');
}

// Check If Is Fullscreen
/***************************************************************************************************/
const isFullscreen = () => {
    return document.fullscreenElement !== null;
}

// Toggle Fullscreen
/***************************************************************************************************/
const toggleFullscreen = () => {
    if (isFullscreen()) {
        document.exitFullscreen();
    } else {
        document.querySelector('body').requestFullscreen();
    }
}

// Handle Map Click
/***************************************************************************************************/
const handleMapClick = latLng => {
    if (Object.keys(markerLayerGroup._layers).length > 0) {
        removeMarkers();
    } else {
        addLocationMarker(latLng);
    }
}

// Create A Location Marker
/***************************************************************************************************/
const addLocationMarker = (latLng, html = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-info\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg>`) => {
    const icon = L.divIcon({ className: 'pin1 secondary', iconSize: [48, 48], html });
    const marker = L.marker(latLng, { icon, interactive: true }).addTo(markerLayerGroup);

    if (Object.keys(markerLayerGroup._layers).length === 1) {
        map.addEventListener('zoomend', () => {
            if (moveTimeout) {
                clearTimeout(moveTimeout);
            }
        
            moveTimeout = setTimeout(() => {
                getCurrentLocation(latLng);
            }, 1000);
        });
    }

    marker.clickCount = 0;

    getCurrentLocation(latLng);
    crosshair.fadeOut();

    marker.addEventListener('click', e => {
        marker.removeFrom(markerLayerGroup);
        handleRemovedMarker();
    })
    
    map.removeEventListener('moveend', handleMapMoveEnd);
}

// Clear All Markers
const removeMarkers = () => {
    markerLayerGroup.clearLayers();
    handleRemovedMarker();
}

// Cleanup For a Removed Marker
/***************************************************************************************************/
const handleRemovedMarker = () => {
    if (Object.keys(markerLayerGroup._layers).length === 0) {
        getCurrentLocation();
        crosshair.fadeIn();
        map.removeEventListener('zoomend', () => getCurrentLocation(latLng));
        map.addEventListener('moveend', handleMapMoveEnd);
    }
}

// Create Marker & Circle For My Location
/***************************************************************************************************/
const getMyLocationMarkers = geo => {
    const latLng = L.latLng(geo.coords.latitude, geo.coords.longitude);
    const icon = L.divIcon({ className: "pin1", iconSize: [48, 48], html: `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48" fill="currentcolor"><path d="M11.1 35.25Q14.25 33.05 17.35 31.875Q20.45 30.7 24 30.7Q27.55 30.7 30.675 31.875Q33.8 33.05 36.95 35.25Q39.15 32.55 40.075 29.8Q41 27.05 41 24Q41 16.75 36.125 11.875Q31.25 7 24 7Q16.75 7 11.875 11.875Q7 16.75 7 24Q7 27.05 7.95 29.8Q8.9 32.55 11.1 35.25ZM24 25.5Q21.1 25.5 19.125 23.525Q17.15 21.55 17.15 18.65Q17.15 15.75 19.125 13.775Q21.1 11.8 24 11.8Q26.9 11.8 28.875 13.775Q30.85 15.75 30.85 18.65Q30.85 21.55 28.875 23.525Q26.9 25.5 24 25.5ZM24 44Q19.9 44 16.25 42.425Q12.6 40.85 9.875 38.125Q7.15 35.4 5.575 31.75Q4 28.1 4 24Q4 19.85 5.575 16.225Q7.15 12.6 9.875 9.875Q12.6 7.15 16.25 5.575Q19.9 4 24 4Q28.15 4 31.775 5.575Q35.4 7.15 38.125 9.875Q40.85 12.6 42.425 16.225Q44 19.85 44 24Q44 28.1 42.425 31.75Q40.85 35.4 38.125 38.125Q35.4 40.85 31.775 42.425Q28.15 44 24 44ZM24 41Q26.75 41 29.375 40.2Q32 39.4 34.55 37.4Q32 35.6 29.35 34.65Q26.7 33.7 24 33.7Q21.3 33.7 18.65 34.65Q16 35.6 13.45 37.4Q16 39.4 18.625 40.2Q21.25 41 24 41ZM24 22.5Q25.7 22.5 26.775 21.425Q27.85 20.35 27.85 18.65Q27.85 16.95 26.775 15.875Q25.7 14.8 24 14.8Q22.3 14.8 21.225 15.875Q20.15 16.95 20.15 18.65Q20.15 20.35 21.225 21.425Q22.3 22.5 24 22.5ZM24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65Q24 18.65 24 18.65ZM24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Q24 37.35 24 37.35Z"/></svg>` });
    const marker = L.marker(latLng, { icon });
    const circle = L.circle(latLng, { 
        radius: geo.coords.accuracy,
        color: '#0d6efd',
        fillOpacity: .08
    });
    const latLngBounds = latLng.toBounds(geo.coords.accuracy);
    return { latLng, marker, circle, latLngBounds };
}

// Create Marker & Circle For My Location
/***************************************************************************************************/
const goToMyLocation =()=> {
    const geolocation = navigator.geolocation;
    geolocation.getCurrentPosition(res => {
        location = getMyLocationMarkers(res);
        getCurrentAddress(res.coords.latitude, res.coords.longitude, data => {
            location = {
                ...location,
                data: data.results[0]
            }
            getCountryData(location.data.country_code, false, data => {
                location = {
                    ...location,
                    country: data
                }
            })
        })

        // Fly to location bounds
        map.flyToBounds(location.latLngBounds);

        const handleZoomEnd = () => {
            if (location && !found) {
                // If the location has not already been found 
                // while the app has been open add a circle, add a marker, create a found location toast
                const { latitude: lat, longitude: lng } = res.coords;
                location.circle.addTo(map);
                location.marker.addTo(map);
                getCurrentAddress(lat, lng, data => {
                    renderToast({
                        name: 'XPlore',
                        src: logo, text: `Hey! We think we've found your location within ${Math.round(res.coords.accuracy)}m of ${data.results[0].formatted}.`
                    });
                })
                found = true;
            }

            // Change the my location icon to found
            myLocationFound();

            map.removeEventListener('zoomend', handleZoomEnd);
        }

        // Event listener for when the flyto animation finishes
        map.addEventListener('zoomend', handleZoomEnd);
    }, err => {
        // If it fails bring up a modal to get the users country
        renderNoLocation();
    });
}

// Go To Selected Location
/***************************************************************************************************/
const goToLocation = (latLng, latLngBounds) => {
    // Add marker
    // const marker = L.marker(latLng);
    // marker.addTo(map);

    // Go to location
    map.flyToBounds(latLngBounds);
}

// Convert USD To Current/Selected Countries Exchange Rates
/***************************************************************************************************/
const convertExchangeRates = (currency, rates) => {
    if (currency.toUpperCase() !== 'USD') {
        const newBase = rates.data.rates[currency];
        rates.data.rates.USD = (Math.round((1 / newBase + Number.EPSILON) * 100000) / 100000);
        for (let rate in rates.data.rates) {
            rates.data.rates[rate] = (Math.round((rates.data.rates[rate] / newBase + Number.EPSILON) * 100000) / 100000);
        }
    } else {
        rates.data.rates.USD = 1;
    }
    currentExchangeRates = rates.data.rates;
    return rates;
}

// Extract Relevent Forecast Data
/***************************************************************************************************/
const extractForecastData = (res) => {
    const forecast = [];
    let day = new Date().getDay();
    for (let i = 0; i < res.data.list.length; i+=8) {
        const results = res.data.list[i];
        forecast.push({
            ...results.weather[0], ...results.main, day: K.getDayFromInt(day)
        })
        day < 6 ? day ++ : day = 0;
    }
    return forecast;
}





/***************************************************************************************************/
// AJAX Request Functions
/***************************************************************************************************/
let AJAXQueue = [];

// Promisify AJAX
/***************************************************************************************************/
const pajax = ({ url, type, dataType, data }) => {
    if (AJAXQueue.length === 0) {
        loader.fadeIn();
    }
    return new Promise((resolved) => {
        const request = $.ajax({
            url, type, dataType, data,
            success: async res => {
                resolved(res);
                AJAXQueue = AJAXQueue.filter(req => req !== request);
                if (AJAXQueue.length === 0) {
                    loader.fadeOut();
                }
            },
            error: (jqXHR, textStatus, err) => handleAJAXErrors(jqXHR, textStatus, err, request)
        })
        AJAXQueue.push(request);
    })
}


// Handle AJAX Errors
/***************************************************************************************************/
const handleAJAXErrors = (jqXHR, textStatus, err, request) => {
    AJAXQueue = AJAXQueue.filter(req => req !== request);
    if (AJAXQueue.length === 0) {
        loader.fadeOut();
    }
    if (jqXHR.status !== 0) {
        console.error(jqXHR);
        console.error(textStatus);
        console.error(err);
    }
}

// Get Current Address/Selected Address
/***************************************************************************************************/
const getCurrentAddress = async (lat, lng, cb) => {
    const res = await pajax({
        url: process.env.BACKEND_HOST + '/reverse_geocoding.php',
        type: 'GET', dataType: 'json', data: { lat, lng }
    })
    if (cb) { cb(res.data) };
    return res.data;
}

// Get Country Data
/***************************************************************************************************/
const getCountryData = async (country, isCentre, cb) => {
    if (country && country.toLowerCase() !== currentCountry.toLowerCase()) {
        if (isCentre) {
            currentCountry = country;
            const res = await pajax({
                url: `${process.env.BACKEND_HOST}/country_info.php`,
                type: 'POST', dataType: 'json', data: { country }
            });
            if (cb) { cb(res.data[0]) };
            return res.data[0];
        }
    }
}

// Get Exchange Rates
/***************************************************************************************************/
const getExchangeRates = async (currency, cb) => {
    if (currency.toUpperCase() !== currentCurrency.toUpperCase()) {
        currentCurrency = currency.toUpperCase();
        let res = await pajax({
            url: process.env.BACKEND_HOST + '/exchange_rates.php',
            type: 'GET', dataType: 'json'
        })
        res = convertExchangeRates(currency, res);
        if (cb) { cb({base: res.data.base, rates: res.data.rates, currency}) };
        return {base: res.data.base, rates: res.data.rates, currency};
    }
}

// Get Weather Data
/***************************************************************************************************/
const getWeather = async (lat, lng, cb) => {
    const res = await pajax({
        url: process.env.BACKEND_HOST + '/weather.php',
        type: 'GET', dataType: 'json', data: { lat, lng }
    })
    if (cb) { cb({ ...res.data.weather[0], ...res.data.main }) };
    return { ...res.data.weather[0], ...res.data.main };
}

// Get Forecast Data
/***************************************************************************************************/
const getForecast = async (lat, lng, cb) => {
    let res = await pajax({
        url: process.env.BACKEND_HOST + '/forecast.php',
        type: 'GET', dataType: 'json', data: { lat, lng }
    })
    res = extractForecastData(res);
    if (cb) { cb(res) };
    return res;
}

// Get Wikpedia Links
/***************************************************************************************************/
const getWiki = async (latLngBounds, cb) => {
    const n = latLngBounds.getNorth();
    const e = latLngBounds.getEast();
    const s = latLngBounds.getSouth();
    const w = latLngBounds.getWest(); 
    const res = await pajax({
        url: process.env.BACKEND_HOST + '/wikipedia.php',
        type: 'GET', dataType: 'json', data: { n, e, s, w }
    })
    if (cb) { cb(res.data) }
    return res.data;
}   

// Search Bar
/***************************************************************************************************/
const autocompleteAddresses = data => {
    $.ajax({
        url: process.env.BACKEND_HOST + '/address_autocomplete.php',
        type: 'GET',
        dataType: 'json',
        data,
        success: (res) => renderResults(res.data.features || [], res.data.query || {}),
        error: handleAJAXErrors
    })
}

// Get Businesses
/***************************************************************************************************/
const getBusinesses = async (latLng, { categories = '', q = '' } = {}, cb) => {
    const { lat, lng } = latLng;
    const northEast = map.getBounds().getNorthEast();
    let radius = Math.round(northEast.distanceTo(latLng));
    radius = radius > 40000 && radius < 50000 ? 40000 : radius
    const res = radius <= 40000 ? await pajax({
        url: process.env.BACKEND_HOST + '/business_search.php',
        type: 'GET',
        dataType: 'json',
        data: { categories, lat, lng, q, radius },
    }) : {data: { businesses: [] }};
    res.data.businesses = res.data.businesses ? res.data.businesses.map(business => addIconsToBusiness(business)) : [];

    if (cb) { cb(res.data) };
    return res.data;
}

const addIconsToBusiness = business => {
    const icons = [];
    business.categories.forEach(category => {
        let { alias } = category;
        const getIcon = alias => {
            if (alias in categories) {
                icons.push({img: categories[alias].icon, colour: categories[alias].colour});
            } else {
                alias = allCategories[alias].parent_aliases[0];
                getIcon(alias);
            }
        }
        getIcon(alias);
    })
    return { ...business, icons: [ ...new Set(icons) ] };
}

const addBusinessMarkers = data => {
    if (businessLayerGroup) {
        businessLayerGroup.clearLayers();
    } else {
        businessLayerGroup = L.layerGroup().addTo(map);
    }

    const businessIcons = data.businesses.map(business => {
        let rating = '';
        const stars = new Array(Math.ceil(business.rating)).fill(`<svg class="star" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`);
        stars.forEach(star => {
            rating += star;
        })
        const latLng = L.latLng(business.coordinates.latitude, business.coordinates.longitude);
        const icon = L.divIcon({ className: `business ${business.icons[0].colour}`, iconSize: [48, 48], html: business.icons[0].img + `<div class="business-data card"><img src="${business.image_url}" alt=""/><div class="card-body"><p class="fs-6 fw-semibold mb-0 lh-1">${business.name}</p><div class="rating mb-1" style="width: ${business.rating * 16}px;">${rating}</div><p class="card-subtitle text-muted fw-semibold mb-0">${business.location.address1}</p><p class="card-text mb-0">${business.location.city}</p><p class="card-text mb-0">${business.location.zip_code}</p></div></div>`});
        const marker = L.marker(latLng, { icon, interactive: true }).addTo(businessLayerGroup);
    })

}

// Callback HELLLLLLLLLLLLL
// const getCurrentLocation = () => {
//     AJAXQueue.forEach(request => {
//         request.abort();
//     })
//     AJAXQueue = [];
//     let { lat, lng } = map.getCenter();
//     getCurrentAddress(lat, lng, data => {
//         centre.data = data.results[0];
//         renderAlertAddress(data);
//         renderMenuAddress(data.results[0]);
//         if (data.results[0].country_code && currentCountry.toLowerCase() !== data.results[0].country_code) {
//             // if (!currentCountry) {
//                 countrySelect.val(data.results[0].country_code.toUpperCase())
//             // }
//             if (outline.hasClass('active')) {
//                 showGeoLayer(data.results[0].country_code);
//             }
//         }
//         getCountryData(data.results[0].country_code, true, data => {
//             centre.country = data;
//             renderCountryData(data);
//             getExchangeRates(data.currencyCode, data => {
//                 renderExchangeRates(data)
//             })
//         })
//         getWeather(lat, lng, data => {
//             centre.weather = data;
//             renderWeather(data);
//         })
//         getForecast(lat, lng, data => {
//             centre.forecast = data;
//             renderMenuWeather(data);
//         })
//     });
        
//     const townBounds = L.latLng(lat,lng).toBounds(10000);
//     getWiki(townBounds, data => {
//         renderWikis(data);
//     });
// }

const getCurrentLocation = (latLng) => {
    AJAXQueue.forEach(request => {
        request.abort();
    })

    latLng = latLng ? latLng : map.getCenter();

    const { lat, lng } = latLng;

    getCurrentAddress(lat, lng, data => {
        centre.data = data.results[0];
        renderAlertAddress(data);
        renderMenuAddress(data.results[0]);
        if (data.results[0].country_code && currentCountry.toLowerCase() !== data.results[0].country_code) {
            countrySelect.val(data.results[0].country_code.toUpperCase())
            if (outline.hasClass('active')) {
                showGeoLayer(data.results[0].country_code);
            }
        }
        getCountryData(data.results[0].country_code, true, data => {
            centre.country = data;
            renderCountryData(data);
            getExchangeRates(data.currencyCode, data => {
                centre.exchangeRates = data;
                renderExchangeRates(data)
            })
        })
    });

    getBusinesses(latLng, {}, data => {
        addBusinessMarkers(data)
    });
    getWeather(lat, lng, data => {
        centre.weather = data;
        renderWeather(data);
    })
    getForecast(lat, lng, data => {
        centre.forecast = data;
        renderMenuWeather(data);
    })
    const bounds = map.getBounds();
    getWiki(bounds, data => {
        renderWikis(data);
    });
}



/********************************************************************************************************/
/********************************************************************************************************/
/* App Render Functions                                                                                 */
/********************************************************************************************************/
/********************************************************************************************************/

/********************************************************************************************************/
// Main Elements
/********************************************************************************************************/
const renderMainElements = () => {
    // Head Icons
    /***************************************************************************************************/
	head.append(favicon, appletouchicon);    
    
    // Map Container
    /***************************************************************************************************/
    root.append(mapContainer);

    // Control Interface Containers
    /***************************************************************************************************/
    [loader, crosshair, topControls, bottomLeftControls, bottomRightControls].forEach(container => {
        root.append(container);
    })
    topControls.append(topLeftControls, topRightControls);

    // Create a Leaflet Map and Add Event Listeners
    /***************************************************************************************************/
    map = L.map('map', {
        center: [51.505, -0.09],
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        maxBoundsViscosity: 1,
        zoom: 13,
        zoomControl: false
    })

    // Map # Create and add a marker to the map
    map.addEventListener('click', e => {
        handleMapClick(e.latlng)
    })

    // Map # Show The My Location Left Icon
    map.addEventListener('move', e => {
        myLocationLeft();
    })
    
    // Map # Get Current/Selected Location Data After Moving (If it has moved more than once within a second, cancel the initial call)
    map.addEventListener('moveend', handleMapMoveEnd);

    // Add a Layer Group To The Map For Markers
    /***************************************************************************************************/
    markerLayerGroup = L.layerGroup().addTo(map);

    // Add Initial Base Layer To The Map and Prep Controls
    /***************************************************************************************************/
    tiles.forEach((tile, i) => {
        const { attribution, href, img, key = '', name } = tile
        baseLayers[name] = L.tileLayer(href + key, {
            detectRetina: true,
            minZoom: 3,
            maxZoom: 19
        })
        if (i === 0) {
            baseLayers[name].addTo(map);
        }
    })

    // Navigation Button
    /***************************************************************************************************/
    // navigation.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>');
    // bottomRightControls.prepend(navigation);

    // My Location Button
    /***************************************************************************************************/
    myLocation.html('<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48" fill="currentcolor><path d="M22.5 46V42.25Q15.65 41.55 11.1 37Q6.55 32.45 5.85 25.6H2.1V22.6H5.85Q6.55 15.75 11.1 11.2Q15.65 6.65 22.5 5.95V2.2H25.5V5.95Q32.35 6.65 36.9 11.2Q41.45 15.75 42.15 22.6H45.9V25.6H42.15Q41.45 32.45 36.9 37Q32.35 41.55 25.5 42.25V46ZM24 39.3Q30.25 39.3 34.725 34.825Q39.2 30.35 39.2 24.1Q39.2 17.85 34.725 13.375Q30.25 8.9 24 8.9Q17.75 8.9 13.275 13.375Q8.8 17.85 8.8 24.1Q8.8 30.35 13.275 34.825Q17.75 39.3 24 39.3Z"/></svg>');
    bottomRightControls.prepend(myLocation);

    // More Info Menu
    /***************************************************************************************************/
    root.append(moreInfoMenu);
    moreInfoMenu.append(info);
    info.append(infoHeader, infoBody, infoFooter);
    infoHeader.append(infoHeaderText, infoClose);
    infoBody.append(addressList, formattedAddress, countryState, continent, capital, population, areaSqKm, menuWeather, currencyList, wikis);
    infoFooter.append(powered, attrib);

    for (let name in attributions) {
        let {img, href} = attributions[name];
        attrib.append($(`<a href="${href}" class="d-flex justify-content-center" target="_blank" title="${K.camelToTitle(name)}"><img src="${img}" alt="${K.camelToTitle(name)}" /></a>`));
    }

    // Hide the menu on initiation
    moreInfoCollape.hide();

    // Current/Selected Lcation Weather
    /***************************************************************************************************/
    weatherContainer.append(weatherholder, weatherholder2);
    bottomLeftControls.prepend(weatherContainer);

    // Current/Selected Address
    /***************************************************************************************************/
    currentAddressMarker.html(icon);
    placeholders.append(placeholder, placeholder2);
    currentAddressMarker.append(placeholders);
    bottomLeftControls.append(currentAddressMarker);
}





/********************************************************************************************************/
// Controls
/********************************************************************************************************/
const renderControls = () => {
    // Create Default Leaflet Base Layer Controls
    /***************************************************************************************************/
    L.control.layers(baseLayers).addTo(map);

    // Zoom Controls
    /***************************************************************************************************/
    bottomRightControls.append(zoomControls);

    zoomIn.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-in"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>');
    zoomOut.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-out"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>');

    zoomControls.append(zoomIn, zoomOut);

    // More Info Button
    /***************************************************************************************************/
    moreInfo.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>');
    bottomRightControls.prepend(moreInfo);

    // Country Outline Button
    /***************************************************************************************************/
    outline.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pen-tool"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>');
    bottomRightControls.prepend(outline);

    // crosshairButton Button
    /***************************************************************************************************/
    crosshairButton.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-crosshair"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>');
    bottomRightControls.prepend(crosshairButton);

    // Base Layer Controls
    /***************************************************************************************************/
    // Remove the defult controls and use them to render the new one
    const baseLayerRadioButtons = $('.leaflet-control-layers-base input').remove();
    $('.leaflet-control-layers.leaflet-control').remove();
    renderBaseLayerControls(baseLayerRadioButtons);

    // Search Bar
    /***************************************************************************************************/
    topLeftControls.append(searchBarContainer);
    searchBarContainer.append(searchBar, searchResults);
    // menuButton.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>');
    searchLabel.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>');
    searchBar.append(input, countrySelect, searchLabel/*, menuButton*/);
    fullscreenButton.html(maximize);
    searchBar.append(fullscreenButton);

    geojson.features.sort((a,b) => {
        a = a.properties.name;
        b = b.properties.name;
        return a<b ? -1 : a>b ? 1 : 0;
    })

    geojson.features.forEach(feature => {
        const country = feature.properties.name;
        const code = feature.properties.iso_a2;
        countrySelect.append($(`<option value="${code}">${country}</option>`))
    })

    // Toast
    /***************************************************************************************************/
    topLeftControls.append(toastContainer);
}





/***************************************************************************************************/
// Event Listeners
/***************************************************************************************************/

// Body # Change The Fullscreen Icon When Toggling Fullscreen
/***************************************************************************************************/
$('body').on('fullscreenchange', e => {
    fullscreenButton.empty();
    if (isFullscreen()) {
        fullscreenButton.html(minmize);
    } else {                
        fullscreenButton.html(maximize);
    }
})

// Zoom Buttons # Zoom In / Zoom Out
/***************************************************************************************************/
zoomIn.on('click', e => {
    map.zoomIn();
})

zoomOut.on('click', e => {
    map.zoomOut();
})

// More Info Button # Toggle More Info Menu
/***************************************************************************************************/
moreInfo.on('click', e => {
    toggleMenu();
})

// More Info Menu Close Button # Close The More Info Menu
/***************************************************************************************************/
infoClose.on('click', e => {
    toggleMenu();
})

// My Location Button # Go To Current Location
/***************************************************************************************************/
myLocation.on('click', e => {
    if (!location) {
        renderNoLocation()
    } else {
        goToMyLocation(map);
    }
})

// GeoLayer Outline Button # Toggle The Country Outline
/***************************************************************************************************/
outline.on('click', e => {
    outline.toggleClass('active');
    toggleGeoLayer(map);
})

// Crosshair Button # Toggle The Crosshair
/***************************************************************************************************/
crosshairButton.on('click', toggleCrosshair);

// Searchbar # Show & Hide Search Results on Focus and Blur
/***************************************************************************************************/
input.on('focus', e => {
    countrySelect.addClass('hide');
    resultsCollapse.show();
})

input.on('blur', e => {
    countrySelect.removeClass('hide');
    resultsCollapse.hide();
})

// Searchbar # Make A Call To Get Addresses (prev call is cancelled everytime the user presses a key)
/***************************************************************************************************/
input.on('input', e => {
    // Close if value length is more than 0
    if (e.target.value.length === 0) {
        resultsCollapse.hide();
    }

    // If there's a timeout clear it so it doesn't trigger for every keypress/input
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Set timeout and function to call the API
    searchTimeout = setTimeout(() => {
        // Get data from the event
        const data = K.getInputData(e);
        // Make API calls
        autocompleteAddresses(data);
    }, 500)
})

// Searchbar Fullscreen Button # Toggle Fullscreen
/*****************************************************************************************/
fullscreenButton.on('click', e => {
    toggleFullscreen();
});


// Country Select # Move To The Selected Country On Change
/*****************************************************************************************/
countrySelect.on('change', e => {
    getCountryData(e.target.value, true, data => {
        const { north, east, south, west } = data;
        const corner1 = L.latLng(north, east);
        const corner2 = L.latLng(south, west);

        removeMarkers();

        map.flyToBounds(L.latLngBounds(corner1, corner2));
        if (outline.hasClass('active')) {
            showGeoLayer(e.target.value);
        }

        centre.country = data;
        renderCountryData(data);
        getExchangeRates(data.currencyCode, data => {
            renderExchangeRates(data)
        })
    })
})


/*******************************************************************************************************/
/*******************************************************************************************************/
// On Document Ready
/*******************************************************************************************************/
/*******************************************************************************************************/
$(() => {
    
    // Render The Main Elements
    /***************************************************************************************************/
    renderMainElements();

    // Render The Controls
    /***************************************************************************************************/
    renderControls();

    // Hide the preloader
    /***************************************************************************************************/
    preloader.addClass('hide');

    // Got To Users Location
    /***************************************************************************************************/
    goToMyLocation(map);

    // Get Location Data For The Centre Of The Map
    /***************************************************************************************************/

    // On a single mouse click hide/show the ui
    // let clickTimeout = null;
    // let clickCount = 0;
    // map.addEventListener('click', e => {
    //     clickCount ++;
    //     if (clickTimeout) {
    //         clearTimeout(clickTimeout);
    //     }
    //     clickTimeout = setTimeout(() => {
    //         if (clickCount === 1) {
    //             const controls = $('.controls');
    //             controls.toggleClass('hide');
    //         }
    //         clickCount = 0;
    //     }, 500)
    // })


})