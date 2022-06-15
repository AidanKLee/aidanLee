import Map, { Tile } from "../map/Map";
import $ from 'jquery';
import '../tileSelect/tileSelect.css';

// class TileSelect {
//     _dropdown = null;
//     _map = null;
//     _parent = null;
//     _toggle = $('<button class="btn btn-clear toggle" type="button" data-bs-toggle="collapse" data-bs-target="#tile-select-dropdown" aria-expanded="false" aria-controls="tile-select-dropdown"></button>');
//     _images = {};

//     constructor(options = {}) {
//         const { map, id, dropdownId } = options;
//         if (map instanceof Object) {
//             this._map = map;
//             this.parent = id;
//             this.dropdown = dropdownId;
//             for (let tile in map.tiles) {
//                 tile = map.tiles[tile];
//                 tile.img = $(`<img src="${tile.img}" alt="${tile.name}" />`);
//             };
//         } else {
//             throw new Error('You can only construct a TileSelect with an instance of a Map.')
//         }
//     }

//     get dropdown() {
//         return this._dropdown;
//     }

//     set dropdown(id) {
//         const element = document.getElementById(id);
//         if (element instanceof HTMLDivElement) {
//             this._dropdown = $(`#${id}`);
//         } else {
//             throw new Error('You must supply the ID of an instance of an HTMLDivElement for the dropdown menu.');
//         }
//     }

//     get parent() {
//         return this._parent;
//     }

//     set parent(id) {
//         const element = document.getElementById(id);
//         if (element instanceof HTMLDivElement) {
//             this._parent = $(`#${id}`);
//         } else {
//             throw new Error('You must supply the ID of an instance of an HTMLDivElement of the parent container.');
//         }
//     }

//     get map() {
//         return this._map;
//     }

//     set map(map) {
//         if (map instanceof Map) {
//             this._map = map;
//         }
//     }

//     get selected() {
//         return this.map.selectedTile;
//     }

//     set selected(tile) {
//         this.map.selectedTile = tile;
//     }

//     get toggle() {
//         return this._toggle;
//     }

//     get unselected() {
//         const tiles = { ...this.map.tiles };
//         delete tiles[this.selected.name]
//         return tiles;
//     }

//     render() {
//         for (let name in this.unselected) {
//             const tile = this.unselected[name];
//             const button = $(`<button class="btn btn-clear type="button" data-bs-toggle="collapse" data-bs-target="#tile-select-dropdown" aria-expanded="false" aria-controls="tile-select-dropdown"></button>`);
//             button.on('click', () => {
//                 this.selected = tile;
//                 this.toggle.empty();
//                 this.dropdown.empty();
//                 this.render();
//                 this._map.render(true);
//             })
//             button.append(tile.img);
//             this.dropdown.append(button);
//         }

//         this.toggle.append(this.selected.img);
//         this.parent.append(this.toggle);
//     }
// }

// export default TileSelect;