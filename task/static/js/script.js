// import $ from '../../node_modules/jquery/jquery.min';
import countryList from './countryList.js';

// Add country and countrycode options
const countrySelect = document.getElementById('country-1');

for (let code in countryList) {
    let country = countryList[code];

    const option = document.createElement('option');
    option.setAttribute('value', code);
    option.textContent = country;
    countrySelect.appendChild(option);
}