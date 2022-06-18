import * as $ from 'jquery';
import xPlore from '../map';
import SearchBar from '../searchBar';
// import searchBar from '../searchBar';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import '../searchBar/searchBar.css';
import TileSelect from '../tileSelect';

class App {
    _xPlore = xPlore;
    _searchBar = new SearchBar({fullscreen: 'fullscreen'});

    render() {
        console.log(this._xPlore)
        this._xPlore.render();
        
    }
}


$(async () => {
    new App().render();
})