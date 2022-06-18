import $ from 'jquery';
import './searchBar.css';

class SearchBar {
    _fullscreen = {
        button: null,
        icons: {
            on: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>',
            off: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>'
        }
    }

    constructor(options = {}) {
        const { fullscreen } = options;
        this.fullscreenButton = fullscreen;
    }

    get isFullscreen() {
        return document.fullscreenElement !== null;
    }

    get fullscreenButton() {
        return this._fullscreen.button;
    }

    set fullscreenButton(id) {
        if (document.getElementById(id) instanceof HTMLButtonElement) {
            this._fullscreen.button = $(`#${id}`);
            this._fullscreen.button.on('click', e => {
                this.toggleFullscreen();
            });
            $('body').on('fullscreenchange', e => {
                const button = this.fullscreenButton;
                button.empty();
                if (this.isFullscreen) {
                    button.append(this._fullscreen.icons.on)
                } else {                
                    button.append(this._fullscreen.icons.off)
                }
            })
        } else {
            throw new Error('You must supply the ID of an HTMLButtonElement.')
        }
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            document.exitFullscreen()
            .then(() => this._fullscreen.enabled = document.fullscreenElement)
            .catch(err => console.log(err));
        } else {
            document.querySelector('body').requestFullscreen()
            .then(() => this._fullscreen.enabled = document.fullscreenElement)
            .catch(err => console.log(err));
        }
    }

    render() {

    }
}

export default SearchBar;