import countryList from './countryList.js';
import FormHandler from '../modules/formHandler.js';
import logo from '../media/images/logo.png';
import $ from '../modules/jquery/jquery.min.js';
import '../css/index.css';

$(() => {
	// Initialise images for webpack
	const head = $('head');
	const favicon = $(`<link rel="icon" href="${logo}"/>`);
	const appletouchicon = $(`<link rel="apple-touch-icon" type="image/png" sizes="1000x1000" href="${logo}">`);
	head.append(favicon);
	head.append(appletouchicon);

	const preloader = $('#preloader');

	const logoLink = $('#logo-link');
	const logoImg = $(`<img src="${logo}" alt="GeoNames Logo" />`);
	logoLink.append(logoImg);

	$(window).on('load', () => {
		// Fade out preloader
		setTimeout(() => {
			preloader.fadeOut(1000);
		}, 500);
	});

	// Add country and countrycode options
	const countrySelect = $('.country');

	for (let code in countryList) {
		let country = countryList[code];

		countrySelect.each(function() {
			const option = $(`<option value="${code}">${country}</option>`);
			$(this).append(option);
		});
	}

	// Form handlers
	const forms = $('form');
	forms.each(function() {
		$(this).on('submit', e => {
			preloader.fadeIn(1000);
			e.preventDefault();
			const data = FormHandler.getFormData(e);
			$.ajax({
				// eslint-disable-next-line no-undef
				url: `${process.env.API_URL}/api.php`,
				type: 'POST',
				dataType: 'json',
				data,
				success: (res) => {
					const selector = '#results';
					FormHandler.handleResponse(res, selector);
					preloader.fadeOut(1000);
				},
				error: (jqXHR, textStatus, err) => {
					preloader.fadeOut(1000);
					console.error(jqXHR);
					console.error(textStatus);
					console.error(err);
				}
			});
		});
	});
});