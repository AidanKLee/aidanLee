import * as L from 'leaflet';
import * as $ from 'jquery';

import tiles from './tiles';

class Map {
    _baseLayers = {};
    _baseLayerControls = null;
    _container = $('<div id="map"></div>');
    _hideBaseLayerControls = true;
    _leaflet = L.map(this._container[0], {
        center: [51.505, -0.09],
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        maxBoundsViscosity: 1,
        zoom: 13,
        zoomControl: false
    })
    _root = null;

    constructor({ hideBaseLayerControls: hideControls, root } = {}) {
        this.setRoot(root);
        if (hideControls) {
            this.hideBaseLayerControls(true);
        }
    }

    get hideBaseLayerControls() {
        return this._hideBaseLayerControls;
    }

    get leaflet() {
        return this._leaflet;
    }

    get root() {
        return this._root;
    }

    hideBaseLayerControls(hide) {
        if (typeof hide === 'boolean') {
            if (hide) {
                this._hideBaseLayerControls = false;
            } else {
                this._hideBaseLayerControls = true;
            }
        } else {
            if (hide === undefined) {
                this._hideBaseLayerControls = !this._hideBaseLayerControls;
            } else {
                throw new Error('Toggle base layer controls by leaving undefined or set to true to hide or false to show.')
            }
        }
    }

    setRoot(root) {
        if ($(`#${root}`)[0] instanceof HTMLDivElement) {
            this._root = $(`#root`);
        } else {
            throw new Error('You need to set the root as an HTML div element.');
        }
    }

    render() {
        // append the map container to the root.
        this.root.append(this._container);

        // set the base layers
        tiles.forEach((tile, i) => {
            const { href, key = '', name } = tile
            this._baseLayers[name] = L.tileLayer(href + key, {
                detectRetina: true,
                minZoom: 3,
                maxZoom: 20
            })
            if (i === 0) {
                this._baseLayers[name].addTo(this._leaflet);
            }
        })

        // add the base layer controls to the leafley map
        L.control.layers(this._baseLayers).addTo(this._leaflet); 

        // hide layer controls if the option
        if (!this._hideBaseLayerControls) {
            $('.leaflet-control-layers.leaflet-control').remove();
        }

        // fix any sizing issues on render
        this._leaflet.invalidateSize();
    }
}

export default Map;