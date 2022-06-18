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
            const image = $(`<img src="${tiles[i].img}" alt="${tiles[i].name}" />`);

            // Separate the buttons
            if (radio.checked) {
                const button = $('<button class="btn btn-clear border shadows" type="button"></button>');
                button.append(image);
                button.append(radio);
                selectedBaseLayer = button;
            } else {
                const label = $('<label class="btn btn-clear border shadows"></label>');
                label.append(image);
                label.append(radio);
                unselectedBaseLayers.push(label);
            }
        })

        // Create a collapsable container and parent
        const baseLayerControl = $('<div id="base-layer-control"></div>');
        const baseLayerControlDropdown = $('<div class="collapse"></div>');
        baseLayerControl.append(baseLayerControlDropdown);
        bottomLeftControls.append(baseLayerControl);

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
    // Zoom Controls
    // ############################################################
    // Create and append zoom container
    const zoomControls = $('<div id="zoom-control" class="btn-group-vertical shadows"></div>');
    bottomRightControls.append(zoomControls);

    // Create and append buttons
    const zoomIn = $('<button class="btn btn-primary border" type="button"></button>');
    zoomIn.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zoom-in"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>');
    const zoomOut = $('<button class="btn btn-light border" type="button"></button>');
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
    const moreInfo = $('<button id="more-info" class="btn btn-secondary border round"></button>');
    moreInfo.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>');
    bottomRightControls.prepend(moreInfo);

    // ############################################################
    // Navigation Button
    // ############################################################
    // Create and prepend the button
    const navigation = $('<button id="navigation" class="btn btn-secondary border round"></button>');
    navigation.html('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>');
    bottomRightControls.prepend(navigation);


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
    const menuButton = $('<button class="btn btn-primary" type="button"></button>');
    const input = $('<input id="q" type="text" class="form-control" placeholder="Go XPlore" aria-label="Search">');
    const searchLabel = $('<label for="q" class="btn btn-light border"></label>');

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
    const fullscreenButton = $('<button class="btn btn-secondary" type="button"></button>');
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
        // console.log(res)
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
        console.log(lat, lng)
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
    bottomCentreControls.append(currentAddressMarker);

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

    // Event listener to change address on alert element when the map stops moving
    map.addEventListener('moveend', e => {
        let { lat, lng } = map.getCenter();
        getCurrentAddress(lat, lng, data => {
            appendAlertAddress(data);
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

    const geolocation = navigator.geolocation;
    geolocation.getCurrentPosition(res => {
        location = getGeoData(res);

        // Add marker
        location.marker.addTo(map);
    
        // Fly to location bounds
        map.flyToBounds(location.latLngBounds);

        // Add bounds circle on zoom end
        map.addEventListener('zoomend', e => {
            location.circle.addTo(map);
        })

        const { latitude: lat, longitude: lng } = res.coords;
        getCurrentAddress(lat, lng, data => {
            newToast({name: 'XPlore', src: logo, text: `Hey! We think we've found your location within ${Math.round(res.coords.accuracy)}m of ${data.results[0].formatted}.`});
        })

    });

    // Go to location
    const goToLocation = (latLng, latLngBounds) => {
        // Add marker
        const marker = L.marker(latLng);
        marker.addTo(map);

        // Go to location
        map.flyToBounds(latLngBounds);
    }
})