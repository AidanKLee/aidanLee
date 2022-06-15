import L from 'leaflet';
import $ from 'jquery';

class Map {
    _leaflet = L;
    _map = null;
    _parent = '';
    _selectedTile = null;
    _tiles = {};
    _tileSelector = null;
    _view = new View();

    constructor(options = {}) {
        const { parent, selectedTile, selector, selectorDropdown, tiles, view } = options;
        this.parent = parent;
        this.options({selectedTile, selector, selectorDropdown, tiles, view})
    }

    get leaflet() {
        return this._leaflet;
    }

    get map() {
        return this._map;
    }

    get parent() {
        return this._parent;
    }

    set parent(id) {
        const element = document.getElementById(id);
        if (element instanceof HTMLDivElement) {
            this._parent = id;
        } else {
            throw new Error('You must supply the ID of an instance of an HTMLDivElement.');
        }
    }
    
    get selectedTile() {
        return this._selectedTile;
    }

    set selectedTile(tile) {
        if (tile instanceof Tile) {
            this._selectedTile = tile;

            const noTiles = Object.keys(this.tiles).length === 0;
            if (noTiles) {
                this.addTile(tile);
            }
        } else {
            throw new Error('You must set the selected tile to an instance of a Tile.')
        }
    }

    get tiles() {
        return this._tiles;
    }

    addTile(tile) {
        const { name } = tile;
        if (tile instanceof Tile) {
            this.tiles[name] = tile;
        } else {
            this._tiles[name] = new Tile(tile);
        }

        if (!this.selectedTile) {
            this.selectedTile = this.tiles[name];
        }
        return this.tiles[name];
    }

    addTiles(tiles) {
        if (tiles instanceof Tile) {
            const tile = tiles;
            this.tiles[tile.name] = tile;
        } else if (tiles instanceof Array) {
            tiles.forEach(tile => {
                this.addTile(tile);
            })
        } else if (tiles instanceof Object) {
            for (let tile in tiles) {
                tile = tiles[tile];
                this.addTile(tile);
            }
        } else {
            throw new Error('You must supply a tile, or an array/object with instances of tiles or tile constructor objects.')
        }
        return tiles;
    }

    removeTile(tile) {
        if (tile instanceof Tile) {
            delete this._tiles[tile.name];
            return this.tiles;
        } else if (typeof tile === 'string') {
            const name = tile;
            if (name in this.tiles) {
                delete this.tiles[name];
                return this.tiles;
            }
        }
        throw new Error('You must supply an instance of a tile or the name of a tile.');
    }

    get tileSelector() {
        return this._tileSelector;
    }

    set tileSelector(selector) {
        if (selector instanceof TileSelector) {
            console.log(this._tileSelector)
            if (!this._tileSelector) {
                this._tileSelector = selector
            } else {
                throw new Error('You can only instantiate one tile selector for each map.');
            }
        } else {
            throw new error("You must set the tile selector to an instance of a TileSelector.");
        }
    }

    get view() {
        return this._view;
    }

    setView(x, y, z) {
        this.view.set(x, y, z);
        return this.view;
    }

    options(options = {}) {
        const { parent, selector, selectorDropdown, selectedTile, tiles, view } = options;
        if (parent) {
            this.parent = parent;
        } if (this.tiles) {
            this._tiles = {}
            this.addTiles(tiles);
        } if (selectedTile) {
            this.selectedTile = selectedTile;
        } if (selector && selectorDropdown) {
            new TileSelector({map: this, id: selector, dropdownId: selectorDropdown});
        } else if (selector || selectorDropdown) {
            throw new Error('You must supply the ID for two div elements, a selector and a selectorDropdown');
        } if (view) {
            this.setView(x, y, z);
        }
    }

    render(rerender) {
        
        if (this.selectedTile instanceof Tile) {
            const { x, y, z } = this.view;
            const { attribution, href, key, maxZoom, minZoom } = this.selectedTile;
          
            if (!rerender) {
                this._map = this.leaflet.map(this.parent).setView([x, y], z);
            }

            this.leaflet.tileLayer(`${href}${key ? key : ''}`, {
                // attribution: attribution,
                maxZoom: maxZoom,
                minZoom: minZoom,
                preferCanvas: true
            }).addTo(this.map);

            this.tileSelector.render();

            if (!rerender) {
                document.querySelector('.leaflet-control-attribution').remove();
            }

            

            // var latlngs =  [
            //     [[45.51, -122.68],
            //      [37.77, -122.43],
            //      [34.04, -118.2]],
            //     [[40.78, -73.91],
            //      [41.83, -87.62],
            //      [32.76, -96.72]]
            // ];
            // var path = this.leaflet.polyline(latlngs,{"delay":400,"weight":`2`,"color":"black","paused":true,"reverse":false}
            // ).addTo(this.map);
            // this.map.addLayer(path);
            // this.map.fitBounds(path.getBounds())

            // this.leaflet.marker([50.5, 30.5]).addTo(this.map);
            
        } else {
            throw new Error('You must add at least one tile to this class.');
        }
    }
}

//map.fitBounds() to move to a specific area with zoom
//map.flyTo(), map.flyToBounds for smooth animation to a specified point

//map.getCenter(), map.getZoom(), map.getBounds(), getSize() for geolocation data
//getSize(), getPixelBounds(), getPixelOrigin(), getPixelWorldBounds();

//map.locate({watch: true, setView: true}), map.watch(), map.setView() to watch user current location

//polyfill() to create paths

class View {
    _x = 50;
    _y = 0;
    _z = 3;

    constructor(x = 50, y = 0, z = 3) {
        this.set(x, y, z);
    }

    get x() {
        return this._x;
    }

    set x(x) {
        if (!Number.isNaN(x) && x >= -180 && x <= 180) {
            this._x = x;
        } else {
            throw new Error('x must be a number between -180 and 180.');
        }
    }

    get y() {
        return this._y;
    }

    set y(y) {
        if (!Number.isNaN(y) && y >= -90 && y <= 90) {
            this._y = y;
        } else {
            throw new Error('y must be a number between -90 and 90.');
        }
    }

    get z() {
        return this._z;
    }

    set z(z) {
        if (!Number.isNaN(z) && z >= 3 && z <= 22) {
            this._z = z;
        } else {
            throw new Error('z must be a number between 3 and 22');
        }
    }

    set(x, y, z) {
        if (x instanceof View) {
            const view = x;
            this.x = view.x;
            this.y = view.y;
            this.z = view.z;
        } else if (Array.isArray(x)) {
            const [x, y, z] = x;
            this.x = x;
            this.y = y;
            this.z = z;
        } else if (x instanceof Object) {
            const { x, y, z } = x;
            this.x = x;
            this.y = y;
            this.z = z;
        } else {
            if (x) {
                this.x = x;
            } if (y) {
                this.y = y;
            } if (z) {
                this.z = z;
            }
        }
    }
}

class Tile {
    _attribution = null;
    _href = null;
    _img = null;
    _key = null;
    _maxZoom = 22;
    _minZoom = 3;
    _name = null;

    constructor(options = {}) {
        if (options instanceof Object) {
            const { attribution, img, key, href, name, minZoom, maxZoom } = options;
            this.name = name;
            this.href = href;
            this.options({ attribution, img, key, minZoom, maxZoom });
        } else {
            throw new Error('You must construct a tile with an options object with name and href as key/value pairs.');
        }
    }

    get attribution() {
        return this._attribution;
    }

    set attribution(attribution) {
        if (typeof attribution === 'string') {
            this._attribution = attribution;
        } else {
            throw new Error('The attribution must be a string');
        }
    }

    get href() {
        return this._href;
    }

    set href(href) {
        if (typeof href === 'string') {
            this._href = href;
        } else {
            throw new Error('The href must be a string');
        }
    }

    get img() {
        return this._img;
    }

    set img(src) {
        this._img = src;
    }

    get key() {
        return this._key;
    }

    set key(key) {
        if (typeof key === 'string') {
            this._key = key;
        } else {
            throw new Error('The key must be a string');
        }
    }

    get name() {
        return this._name;
    }

    set name(name) {
        if (typeof name === 'string') {
            this._name = name;
        } else {
            throw new Error('The name must be a string');
        }
    }

    get minZoom() {
        return this._minZoom;
    }

    set minZoom(minZoom) {
        if (!Number.isNaN(minZoom) && minZoom >= 3 && minZoom <= 22) {
            this._minZoom = minZoom;
        } else {
            throw new Error('The min zoom must be a number between 3 and 22');
        }
    }

    get maxZoom() {
        return this._maxZoom;
    }

    set maxZoom(maxZoom) {
        if (!Number.isNaN(maxZoom) && maxZoom >= 3 && maxZoom <= 22) {
            this._maxZoom = maxZoom;
        } else {
            throw new Error('The max zoom must be a number between 3 and 22');
        }
    }

    options(options = {}) {
        const { attribution, img, key, href, name, minZoom, maxZoom } = options;
        if (attribution) {
            this.attribution = attribution;
        } if (img) {
            this.img = img;
        } if (key) {
            this.key = key;
        } if (href) {
            this.href = href;
        } if (name) {
            this.name = name;
        } if (minZoom) {
            this.minZoom = minZoom;
        } if (maxZoom) {
            this.maxZoom = maxZoom;
        }
    }
}

class TileSelector {
    _dropdown = null;
    _map = null;
    _parent = null;
    _toggle = $('<button class="btn btn-clear toggle" type="button" data-bs-toggle="collapse" data-bs-target="#tile-select-dropdown" aria-expanded="false" aria-controls="tile-select-dropdown"></button>');
    _images = {};

    constructor(options = {}) {
        const { map, id, dropdownId } = options;
        if (map instanceof Map) {
            this._map = map;
            if (!map.tileSelector) {
                map.tileSelector = this;
            } else {
                throw new Error('You can only instantiate one tile selector per map.')
            }
            this.parent = id;
            this.dropdown = dropdownId;
            for (let tile in map.tiles) {
                tile = map.tiles[tile];
                tile.img = $(`<img src="${tile.img}" alt="${tile.name}" />`);
            };
        } else {
            throw new Error('You can only construct a TileSelect with an instance of a Map.')
        }
    }

    get dropdown() {
        return this._dropdown;
    }

    set dropdown(id) {
        const element = document.getElementById(id);
        if (element instanceof HTMLDivElement) {
            this._dropdown = $(`#${id}`);
        } else {
            throw new Error('You must supply the ID of an instance of an HTMLDivElement for the dropdown menu.');
        }
    }

    get parent() {
        return this._parent;
    }

    set parent(id) {
        const element = document.getElementById(id);
        if (element instanceof HTMLDivElement) {
            this._parent = $(`#${id}`);
        } else {
            throw new Error('You must supply the ID of an instance of an HTMLDivElement of the parent container.');
        }
    }

    get map() {
        return this._map;
    }

    set map(map) {
        if (map instanceof Map) {
            this._map = map;
        }
    }

    get selected() {
        return this.map.selectedTile;
    }

    set selected(tile) {
        this.map.selectedTile = tile;
    }

    get toggle() {
        return this._toggle;
    }

    get unselected() {
        const tiles = { ...this.map.tiles };
        delete tiles[this.selected.name]
        return tiles;
    }

    render() {
        for (let name in this.unselected) {
            const tile = this.unselected[name];
            const button = $(`<button class="btn btn-clear" type="button" data-bs-toggle="collapse" data-bs-target="#tile-select-dropdown" aria-expanded="false" aria-controls="tile-select-dropdown"></button>`);
            button.on('click', () => {
                this.selected = tile;
                this.toggle.empty();
                this.dropdown.empty();
                // this.render();
                this._map.render(true);
            })
            button.append(tile.img);
            this.dropdown.append(button);
        }

        this.toggle.append(this.selected.img);
        this.parent.append(this.toggle);
    }
}

export default Map;
export { Tile, View };