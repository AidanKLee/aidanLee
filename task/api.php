<?php
    require('vendor/autoload.php');

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv -> load();

    $username = $_ENV['username'];

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    if ($_REQUEST['submit'] == 'postal-code') {
        $url = 'http://api.geonames.org/postalCodeSearchJSON?username=' . $username . '&placename=' . urlencode($_REQUEST['placename']) . '&country=' . $_REQUEST['country'] . '&maxRows=25';
    } elseif ($_REQUEST['submit'] == 'geo-code-address') {
        $url = 'http://api.geonames.org/geoCodeAddressJSON?username=' . $username . '&q=' . urlencode($_REQUEST['q']) . '&postalcode=' . urlencode($_REQUEST['postalcode']) . '&country=' . $_REQUEST['country'];
    } else {
        $url = 'http://api.geonames.org/countryInfoJSON?username=' . $username . '&country=' . $_REQUEST['country'];
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result, true);

    if ($_REQUEST['submit'] == 'postal-code') {
        $response = $decode['postalCodes'];
    } elseif ($_REQUEST['submit'] == 'geo-code-address') {
        $response = $decode['address'];
    } else {
        $response = $decode['geonames'];
    }

    $output['status']['code'] = '200';
    $output['status']['name'] = 'ok';
    $output['status']['description'] = 'success';
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . 'ms';
    $output['data'] = $response;

    header('Content-Type: application/json; charset: UTF-8');

    echo json_encode($output);
?>