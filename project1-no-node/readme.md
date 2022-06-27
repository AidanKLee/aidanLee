# XPlore - Gazetteer App
by Aidan Lee

## About
This app helps the client find their location on a world map and identify other countries, cities, towns and locations. It will also give them the latest information for the area including geographical data, nearby places, weather data, news, exchange rates and wikipedia links.

## Walkthrough
### Startup & General Use
- Upon opening you will be prompted to allow the app to find your location.
    - Allowing permission will lead the app to move the map to your current location.
    - Denying permission will lead the app to prompt you once more. Press close to continue using the app without location services.
- You are now able to access and use the app.
- There is a crosshair in the middle of the screen. This represents where the app is looking to pick up data for places/businesses and the data/information in the "more info menu".
- If you click on the map or on a "place icon" this will disable the centre crosshair and the map will begin picking up data for this location/area.
- To go back to using the crosshair/centre of the screen by simply clicking anywhere on the map or on the icon you previously clicked on.
- The app fetches data whenever you move the map or zoom in and out. You can tell when the app is fetching data by the spinner around the crosshair.

### Searchbar
- For mobile devices only the dropdown menu on the searchbar will be displayed. To access the text input simply click on the maginfying glass.
- The text input on the searchbar allows you to either search for a location (from as large as a country, to as small as a street).
- You can instead use the dropdown menu to select a country that you would like the map to pan to.
- To the right of the searchbar you can also enter fullscreen, this helps for viewing on mobiles for a more user friendly and immersive experience.
- To the right (on a large screen), or just underneath the searchbar (on a tablet/mobile screen) is a category selector which allows you to filter the places/businesses that appear on the map as clickable icons. They appear translucent when not active and an opaque solid colour when they're enabled.

### Bottom Right Controls/Buttons
- On the bottom right there are simple controls to adjust the UI (user interface). From top to bottom you can find controls to:
    - Change the map appearance between "primary", "terrain", "dark" and "satellite".
    - Hide or show the crosshair at the centre of the screen.
    - Hide or show the outline of the country you are currently viewing.
    - Show or hide the "more info menu".
    - Go to your current location (if you allowed the app to use your location at the beginning, otherwise it will show a prompt).
    - Zoom in and out on the map.

### More Info Menu
- The more info menu provides data and information for the location you're currently viewing (either from the centre of your screen/the crosshair or the area you currently have selected - represented as a green icon with an "i" or a "place icon").
- Here you will see:
    - The current location with an address if applicable.
    - Information about the country you're viewing (if you're over sea or water this will remain as information about the last country you were viewing).
    - Weather for the selected location (whether that be with the crosshair or by selecting by clicking).
    - Links to the latest news for the current country.
    - Exchange rates for the current country compared to several of the most widely used/traded currencies as default. You can change these with the dropdown menu.
    - Wikipedia links for the selected location. Note that if you are zoomed to far in you are unlikely to get any links (unless you're in a famous building). The further you zoom out the broader range of results you will get. For example if a town is viewable you will get results for that town, if you're viewing a country you will get results for that country, if you're viewing several countries you will get results for all the countries viewable.

## Developers
These are instructions to download and view the app on your own workstation (ensure `node.js`, `npm`, `php` and `composer`) are installed on your local workmachine. Apart from index.html and server.js, all source code is kept in the `src` folder.

### Run the app on a dev server
1. Clone the repo to a local folder/workspace.
2. In the console navigate to the root project folder `project1`.
3. Run `npm install` for node/js dependencies.
4. Run `composer install` for composer/php dependencies.
5. Run `npm start` to create a development build in the `dist` folder and start the local development server on `http://localhost:3000`.
6. Run `php -S localhost:3001` to start the php server.
7. Go to a browser and see the app in action.

### Create a production build
8. If you would like to make a production build press `Ctrl` + `C` to stop the dev and php server.
9. Run `npm run build`, you can then access the final production build in the `dist` folder. To go back to the development build simply run `npm start` in the console.

### Host a development build
10. To host a development build you will need to make sure the prod.env variables are correct before running the build.
    - All API keys must be valid keys obtained from the relevent sources.
    - `BACKEND_HOST` must be set to the domain you're hosting the app or the backend of the app (all the `.php` files which are currently kept in the root directory).
    - `NODE_ENV` must be set to production.
11. Create a production build (step 8 and 9).
12. Move the contents of the `dist` folder to the host.
13. Move all of the `.php` files into your backend host.
14. Move the `composer.json` file into your backend host in the same folder as your php files and run `composer install` to install the php dependencies.
15. Move the `prod.env` file into the backend host and rename it to `.env`.

NOTE: You can choose whether to host the app on one single domain for the frontend and backend or separate domains but be sure to change the `BACKEND_HOST` variable in the `.env` file.

### Root Folder Files & Directories
- `dist` is created on the first build and contains the current build of the app whether that be development or production.
- `src` contains the original source code and assets for the app.
- `.env` contains the development environment variables.
- `prod.env` contains the default production environment variables.
- `example.env` contains a template for the environment variables. This file is referenced by webpack when creating builds to ensure no variables are missing.
- Files ending in `.php` contain backend script for fetching from external API's.
- `composer.json` contains the PHP dependencies to be installed by running `composer install`.
- `index.html` contains the main HTML document with the `root` container for all components and the preloader.
- `package.json` contians all of the JavaScript dependencies.
- `server.js` contains the script for the development JavaScript server.
- `webpack.common.js` contains the global settings for webpack when it comes to building, transpiling and minifying.
- `webpack.prod.js` contains the production/distribution settings for webpack.
- `webpack.dev.js` contains the development settings for webpack.