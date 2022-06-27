<?php
    require('../vendor/autoload.php');

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv -> load();

    $username = $_ENV['GEONAMES_USERNAME'];

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    
    $url = 'http://api.geonames.org/countryInfoJSON?username=' . $username . '&country=' . $_REQUEST['country'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result, true);

    $response = $decode['geonames'];

    $output['status']['code'] = '200';
    $output['status']['name'] = 'ok';
    $output['status']['description'] = 'success';
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . 'ms';
    $output['data'] = $response;

    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);
?>