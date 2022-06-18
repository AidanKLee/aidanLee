import * as $ from 'jquery';
import * as L from 'leaflet';
import * as bootstrap from 'bootstrap';
import FormHandler from './formHandler';

import logo from './assets/images/logo192.png';
import primary from './assets/images/primary.png';
import terrain from './assets/images/terrain.png';
import dark from './assets/images/dark.png';
import satellite from './assets/images/satellite.png';

import './style.css';
// import './leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

$(() => {
    // ############################################################
    // Head Icons
    // ############################################################
	const head = $('head');
	const favicon = $(`<link rel="icon" type="image/png" href="${logo}"/>`);
	const appletouchicon = $(`<link rel="apple-touch-icon" sizes="192x192" type="image/png" href="${logo}">`);
	head.append(favicon);
	head.append(appletouchicon);

    // ############################################################
    // Top Layers
    // ############################################################
    // Specify root container
    const root = $('#root');

    // create and append map countainer
    const mapContainer = $('<div id="map"></div>');
    root.append(mapContainer);

    // Create and append control containers
    const topControls = $('<div class="controls top"></div>');
    const bottomLeftControls = $('<div class="controls bottom-left"></div>');
    const bottomRightControls = $('<div class="controls bottom-right"></div>');
    const bottomCentreControls = $('<div class="controls bottom-centre"></div>');

    [topControls, bottomCentreControls, bottomLeftControls, bottomRightControls].forEach(container => {
        root.append(container);
    })

    // Create a map
    const map = L.map('map', {
        center: [51.505, -0.09],
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        maxBoundsViscosity: 1,
        zoom: 13,
        zoomControl: false
    })

    // On a single mouse click hide/show the ui
    let clickTimeout = null;
    let clickCount = 0;
    map.addEventListener('click', e => {
        clickCount ++;
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        clickTimeout = setTimeout(() => {
            if (clickCount === 1) {
                const controls = $('.controls');
                controls.toggleClass('hide');
            }
            clickCount = 0;
        }, 500)
    })

    // ############################################################
    // Custom map controls and overlays
    // ############################################################
    // Specify tile data
    const tiles = [
        {
            name: 'primary',
            img: primary,
            key: process.env.JAWG,
            href: `https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=`,
            attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
        },
        {
            name: 'terrain',
            img: terrain,
            key: process.env.THUNDERFOREST,
            href: `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=`,
            attribution: '<a href="https://www.thunderforest.com/" title="Tiles Courtesy of Thunderforest Maps" target="_blank" class="jawg-attrib">&copy; <b>Thunderforest</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
        },
        {
            name: 'dark',
            key: process.env.THUNDERFOREST,
            img: dark,
            href: `https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=`,
            attribution: '<a href="https://www.thunderforest.com/" title="Tiles Courtesy of Thunderforest Maps" target="_blank" class="jawg-attrib">&copy; <b>Thunderforest</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
        },
        {
            name: 'satellite',
            img: satellite,
            href: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
            attribution: '<a href="https://www.arcgis.com/" title="Tiles Courtesy of Esri World Imagery" target="_blank" class="jawg-attrib">&copy; <b>Esri </b>World Imagery</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
        }
    ]

    // ############################################################
    // Zoom Controls
    // ############################################################
    // Create and append zoom container
    const zoomControls = $('<div id="zoom-control" class="btn-group-vertical shadows"></div>');
    bottomRightControls.append(zoomControls);

    // Create and append buttons
    const zoomIn = $('<button class="btn btn-primary border" type="button" title="Zoom In"></button>');
    zoomIn.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-in"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>');
    const zoomOut = $('<button class="btn btn-light border" type="button" title="Zoom Out"></button>');
    zoomOut.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-out"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>');

    zoomControls.append(zoomIn);
    zoomControls.append(zoomOut);

    // Create click listeners
    zoomIn.on('click', e => {
        map.zoomIn();
    })

    zoomOut.on('click', e => {
        map.zoomOut();
    })

    // ############################################################
    // More Info Button
    // ############################################################
    // Create and prepend the button
    const moreInfo = $('<button id="more-info" class="btn btn-secondary border round" title="More Info"></button>');
    moreInfo.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>');
    bottomRightControls.prepend(moreInfo);

    // ############################################################
    // More Info Menu
    // ############################################################
    // Create and prepend the button
    const moreInfoMenu = $('<div id="more-info-menu"></div>')


    // ############################################################
    // Navigation Button
    // ############################################################
    // Create and prepend the button
    const navigation = $('<button id="navigation" class="btn btn-secondary border round" title="navigation"></button>');
    navigation.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>');
    bottomRightControls.prepend(navigation);

    // ############################################################
    // Mt Location Button
    // ############################################################
    // Create and prepend the button
    const myLocation = $('<button id="my-location" class="btn btn-light border round" title="My Location"></button>');
    myLocation.html('<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48"><path d="M22.5 46V42.25Q15.65 41.55 11.1 37Q6.55 32.45 5.85 25.6H2.1V22.6H5.85Q6.55 15.75 11.1 11.2Q15.65 6.65 22.5 5.95V2.2H25.5V5.95Q32.35 6.65 36.9 11.2Q41.45 15.75 42.15 22.6H45.9V25.6H42.15Q41.45 32.45 36.9 37Q32.35 41.55 25.5 42.25V46ZM24 39.3Q30.25 39.3 34.725 34.825Q39.2 30.35 39.2 24.1Q39.2 17.85 34.725 13.375Q30.25 8.9 24 8.9Q17.75 8.9 13.275 13.375Q8.8 17.85 8.8 24.1Q8.8 30.35 13.275 34.825Q17.75 39.3 24 39.3Z"/></svg>');
    bottomRightControls.prepend(myLocation);

    // On button click go to the users location
    myLocation.on('click', e => {
        goToUserLocation();
    })

    // Change the my location marker to found
    const myLocationFound = () => {
        myLocation.empty();
        myLocation.html('<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48"><path d="M22.5 45.9V42.15Q15.65 41.45 11.1 36.9Q6.55 32.35 5.85 25.5H2.1V22.5H5.85Q6.55 15.65 11.1 11.1Q15.65 6.55 22.5 5.85V2.1H25.5V5.85Q32.35 6.55 36.9 11.1Q41.45 15.65 42.15 22.5H45.9V25.5H42.15Q41.45 32.35 36.9 36.9Q32.35 41.45 25.5 42.15V45.9ZM24 39.2Q30.25 39.2 34.725 34.725Q39.2 30.25 39.2 24Q39.2 17.75 34.725 13.275Q30.25 8.8 24 8.8Q17.75 8.8 13.275 13.275Q8.8 17.75 8.8 24Q8.8 30.25 13.275 34.725Q17.75 39.2 24 39.2ZM24 31.5Q20.85 31.5 18.675 29.325Q16.5 27.15 16.5 24Q16.5 20.85 18.675 18.675Q20.85 16.5 24 16.5Q27.15 16.5 29.325 18.675Q31.5 20.85 31.5 24Q31.5 27.15 29.325 29.325Q27.15 31.5 24 31.5Z"/></svg>');
    }

    // Change the my location marker to searching
    const myLocationLeft = () => {
        myLocation.empty();
        myLocation.html('<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewbox="0 0 48 48"><path d="M22.5 46V42.25Q15.65 41.55 11.1 37Q6.55 32.45 5.85 25.6H2.1V22.6H5.85Q6.55 15.75 11.1 11.2Q15.65 6.65 22.5 5.95V2.2H25.5V5.95Q32.35 6.65 36.9 11.2Q41.45 15.75 42.15 22.6H45.9V25.6H42.15Q41.45 32.45 36.9 37Q32.35 41.55 25.5 42.25V46ZM24 39.3Q30.25 39.3 34.725 34.825Q39.2 30.35 39.2 24.1Q39.2 17.85 34.725 13.375Q30.25 8.9 24 8.9Q17.75 8.9 13.275 13.375Q8.8 17.85 8.8 24.1Q8.8 30.35 13.275 34.825Q17.75 39.3 24 39.3Z"/></svg>');
    }

    // Event listener to change the location icon to searching
    map.addEventListener('move', e => {
        myLocationLeft();
    })

    // ############################################################
    // Base Layer Controls
    // ############################################################
    // Create base layers
    const baseLayers = {};
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

    // Create base tile layer controls
    const baseLayersControl = L.control.layers(baseLayers).addTo(map);    

    // Render the new base layer controls
    const renderBaseLayerControls = (elements, rerender) => {
        // If rerendering clear the parent element
        if (rerender) {
            $("#base-layer-control").remove();
        }

        // Add on input listener to rerender when selected
        elements.on('input', e => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            renderBaseLayerControls(elements, true);
        });

        // Separate radio buttons into checked and unchecked
        let selectedBaseLayer = null;
        let unselectedBaseLayers = [];
        
        elements.each(i => {
            const radio = elements[i];

            // Insert the images and insert into labels
            const image = $(`<img src="${tiles[i].img}" alt="${tiles[i].name}"  title="${tiles[i].name.split('').map((char, i) => i === 0 ? char.toUpperCase() : char).join('')}"/>`);

            // Separate the buttons
            if (radio.checked) {
                const button = $(`<button class="btn btn-clear border shadows" type="button"></button>`);
                button.append(image);
                button.append(radio);
                selectedBaseLayer = button;
            } else {
                const label = $(`<label class="btn btn-clear border shadows"></label>`);
                label.append(image);
                label.append(radio);
                unselectedBaseLayers.push(label);
            }
        })

        // Create a collapsable container and parent
        const baseLayerControl = $('<div id="base-layer-control"></div>');
        const baseLayerControlDropdown = $('<div class="collapse"></div>');
        baseLayerControl.append(baseLayerControlDropdown);
        bottomRightControls.prepend(baseLayerControl);

        baseLayerControl.append(selectedBaseLayer);
        unselectedBaseLayers.forEach(layer => baseLayerControlDropdown.prepend(layer));
        const collapse = new bootstrap.Collapse(baseLayerControlDropdown, {
            toggle: false
        });

        // Add click event for button to toggle collapse
        selectedBaseLayer.on('click', () => {
            collapse.toggle();
        })

        collapse.hide()
    }
    
    // Get radio buttons
    const baseLayerRadioButtons = $('.leaflet-control-layers-base input').remove();

    // Replace default base layer control with new
    $('.leaflet-control-layers.leaflet-control').remove();
    renderBaseLayerControls(baseLayerRadioButtons)

    // ############################################################
    // Top Left Section
    // ############################################################
    const topLeftControls = $('<div class="left"></div>');
    const topRightControls = $('<div class="right"></div>');
    topControls.append(topLeftControls);
    topControls.append(topRightControls);

    // ############################################################
    // Search Bar
    // ############################################################
    // Create and append, search bar container, search bar and search results
    const searchBarContainer = $('<div id="search-bar-container" class="mb-2"></div>')
    const searchBar = $('<div id="search-bar" class="input-group shadows"></div>');
    const searchResults = $('<div id="search-results" class="shadows-light"></div>');
    topLeftControls.append(searchBarContainer);
    searchBarContainer.append(searchBar);
    searchBarContainer.append(searchResults);

    // Make the search results a BootStrap collapse
    const resultsCollapse = new bootstrap.Collapse(searchResults);
    
    // Initialise a BootStrap list
    const resultList = $('<div id="result-list" class="list-group"></div>');

    // Create menu button, input and search label
    const menuButton = $('<button class="btn btn-primary" type="button" title="Menu"></button>');
    const input = $('<input id="q" type="text" class="form-control" placeholder="Go XPlore" aria-label="Search">');
    const searchLabel = $('<label for="q" class="btn btn-light border" title="Search"></label>');

    menuButton.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>');
    searchLabel.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>');

    searchBar.append(menuButton);
    searchBar.append(input);
    searchBar.append(searchLabel);

    // Event handlers for the input to open and close the search results collapse element
    input.on('focus', e => {
        resultsCollapse.show();
    })

    input.on('blur', e => {
        resultsCollapse.hide();
    })

    // Fullscreen button and API
    // Create and append fullscreen button
    const maximize = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
    const minmize = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>';
    const fullscreenButton = $('<button class="btn btn-secondary" type="button" title="Full Screen"></button>');
    fullscreenButton.html(maximize);
    searchBar.append(fullscreenButton);

    // Integrate fullscreen API
    // Fullscreen checker
    const isFullscreen = () => {
        return document.fullscreenElement !== null;
    }

    // Toggle function
    const toggleFullscreen = () => {
        if (isFullscreen()) {
            document.exitFullscreen();
        } else {
            document.querySelector('body').requestFullscreen();
        }
    }

    // Assign event handlers
    fullscreenButton.on('click', e => {
        toggleFullscreen();
    });
    $('body').on('fullscreenchange', e => {
        fullscreenButton.empty();
        if (isFullscreen()) {
            fullscreenButton.html(minmize);
        } else {                
            fullscreenButton.html(maximize);
        }
    })
    
    // ############################################################
    // Search Bar Results
    // ############################################################
    // Render results method
    const renderResults = (res, query) => {
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
                    getCurrentAddress(lat, lng, data => {
                        newToast({name: 'XPlore', src: logo, text: `Going to ${data.results[0].formatted}.`});
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

    // Get addresses endpoint
    const autocompleteAddresses = data => $.ajax({
        url: process.env.BACKEND_HOST + '/address_autocomplete.php',
        type: 'GET',
        dataType: 'json',
        data,
        // success: (res) => {
        //     // renderResults(res.data.features || [], res.data.query || {});
        // },
        // error: (jqXHR, textStatus, err) => {
        //     // preloader.fadeOut(1000);
        //     console.error(jqXHR);
        //     console.error(textStatus);
        //     console.error(err);
        // }
    })

    // Get businesses endpoint
    const autoCompleteBusinesses = data => {
        let { lat, lng } = map.getCenter();
        if (location) {
            ({ lat, lng } = location.latLng);
        }

        data = { ...data, lat, lng };
        return $.ajax({
            url: process.env.BACKEND_HOST + '/business_autocomplete.php',
            type: 'GET',
            dataType: 'json',
            data,
        })
    }

    // Create a search timeout for autocomplete/autosearch
    let timeout = null;

    // Assign an on input handler
    input.on('input', e => {
        // Close if value length is more than 0
        if (e.target.value.length === 0) {
            resultsCollapse.hide();
        }

        // If there's a timeout clear it so it doesn't trigger for every keypress/input
        if (timeout) {
            clearTimeout(timeout);
        }

        // Set timeout and function to call the API
        timeout = setTimeout(() => {
            // Get data from the event
            const data = FormHandler.getInputData(e);
            // Make API calls
            $.when(autocompleteAddresses(data)).then((addresses, businesses) => {
                renderResults(addresses.data.features || [], addresses.data.query || {})
            })
        }, 500)
    })

    // ############################################################
    // Toast
    // ############################################################
    // Create a toast container
    const toastContainer = $('<div class="toast-container"></div>');
    topLeftControls.append(toastContainer);

    // New toast element method
    const newToast = (options = {}) => {
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

    // ############################################################
    // Centre Address
    // ############################################################
    // Create a bootstrap alert and append it to the bottom centre
    const currentAddressMarker = $('<div class="alert alert-light d-flex align-items-center border shadows-light" role="alert"></div>');
    const icon ='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
    currentAddressMarker.html(icon);
    bottomLeftControls.append(currentAddressMarker);
    let centre = {};

    // Get address of the centre of the map
    const getCurrentAddress = (lat, lng, cb) => {
        $.ajax({
            url: process.env.BACKEND_HOST + '/reverse_geocoding.php',
            type: 'GET',
            dataType: 'json',
            data: { lat, lng },
            success: (res) => {
                cb(res.data);
                // renderResults(res.data.features || [], res.data.query || {});
            },
            error: (jqXHR, textStatus, err) => {
                // preloader.fadeOut(1000);
                console.error(jqXHR);
                console.error(textStatus);
                console.error(err);
            }
        })
    }

    // Render address to alert element
    const appendAlertAddress = data => {
        currentAddressMarker.empty();
        currentAddressMarker.html(icon);
        const text = data.results[0].formatted;
        currentAddressMarker.append($(`<div>${text}</div>`));
    }

    // Get information about the current country
    let currentCountry = null;
    const getCountryData = (country, isCentre, cb) => {
        if (country !== currentCountry) {
            if (isCentre) {
                currentCountry = country;
                $.ajax({
                    url: `${process.env.BACKEND_HOST}/country_info.php`,
                    type: 'POST',
                    dataType: 'json',
                    data: { country },
                    success: (res) => {
                        cb(res.data[0]);
                    },
                    error: (jqXHR, textStatus, err) => {
                        console.error(jqXHR);
                        console.error(textStatus);
                        console.error(err);
                    }
                });
            }
        }
    }

    // Event listener to change address on alert element when the map stops moving
    map.addEventListener('moveend', e => {
        let { lat, lng } = map.getCenter();
        getCurrentAddress(lat, lng, data => {
            centre.data = data.results[0];
            appendAlertAddress(data);
            getCountryData(data.results[0].country_code, true, data => {
                centre.country = data;
                console.log(centre)
            })
        });
    })

    // ############################################################
    // On Load User Geolocation Initiation
    // ############################################################
    // Geolocation response to LatLng
    const getGeoData = geo => {
        const latLng = L.latLng(geo.coords.latitude, geo.coords.longitude);
        const marker = L.marker(latLng);
        const circle = L.circle(latLng, { 
            radius: geo.coords.accuracy,
            color: '#0d6efd',
            fillOpacity: .08
        });
        const latLngBounds = latLng.toBounds(geo.coords.accuracy);
        return { latLng, marker, circle, latLngBounds };
    }

    // Set path style
    const setPathStyle = path => {
        path.setStyle({ 
            color: '#0d6efd',
            opacity: .1
        })
    }

    // Get current position
    let location = null;
    let found = false;

    const goToUserLocation = () => {
        const geolocation = navigator.geolocation;
        geolocation.getCurrentPosition(res => {
            location = getGeoData(res);
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

            // Event listener for when the flyto animation finishes
            map.addEventListener('zoomend', e => {
                if (!found) {
                    // If the location has not already been found 
                    // while the app has been open add a circle, add a marker, create a found location toast
                    location.circle.addTo(map);
                    location.marker.addTo(map);
                    const { latitude: lat, longitude: lng } = res.coords;
                    getCurrentAddress(lat, lng, data => {
                        newToast({name: 'XPlore', src: logo, text: `Hey! We think we've found your location within ${Math.round(res.coords.accuracy)}m of ${data.results[0].formatted}.`});
                    })
                    found = true;
                }

                // Change the my location icon to found
                myLocationFound();
            })
        });
    }

    goToUserLocation();

    // Go to location
    const goToLocation = (latLng, latLngBounds) => {
        // Add marker
        const marker = L.marker(latLng);
        marker.addTo(map);

        // Go to location
        map.flyToBounds(latLngBounds);
    }
})