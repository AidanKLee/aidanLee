import * as L from 'leaflet';
import primary from '../../assets/images/primary.png';
import terrain from '../../assets/images/terrain.png';
import dark from '../../assets/images/dark.png';
import satellite from '../../assets/images/satellite.png';
import './map.css';

class Leaflet {

    _baseLayers = {}
    _L = L;
    _map = null;
    _root = null;

    constructor(id) {
        this.root = id;
    }

    get root() {
        return this._root;
    }

    set root(id) {
        this._root = id;
    }

    render() {
        this.L.map('map', {
            center: [51.505, -0.09],
            zoom: 12,
            minZoon: 3,
            maxZoom: 20,
            maxBounds: [
                [-90, 180],
                [90, -180]
            ],
            maxBoundsViscosity: 1.0
        });
    }
}

export default Leaflet;
