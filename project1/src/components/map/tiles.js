import primary from '../../assets/images/primary.png';
import terrain from '../../assets/images/terrain.png';
import dark from '../../assets/images/dark.png';
import satellite from '../../assets/images/satellite.png';

const tiles = [
    {
        name: 'terrain',
        img: terrain,
        key: process.env.THUNDERFOREST,
        href: `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=`,
        attribution: '<a href="https://www.thunderforest.com/" data-bs-toggle="tooltip" title="Tiles Courtesy of Thunderforest Maps" target="_blank" class="jawg-attrib">&copy; <b>Thunderforest</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" data-bs-toggle="tooltip" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
    },
    {
        name: 'primary',
        img: primary,
        key: process.env.JAWG,
        href: `https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=`,
        attribution: '<a href="http://jawg.io" data-bs-toggle="tooltip" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" data-bs-toggle="tooltip" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>'
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

export default tiles;