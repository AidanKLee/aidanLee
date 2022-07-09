<?php

    include("db.php");

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $method = $_SERVER["REQUEST_METHOD"];

    $response;

    header('Content-Type: application/json; charset=UTF-8');

    if ($method === "GET") {
        parse_str(file_get_contents("php://input"),$_GET);
        if (isset($_GET["id"])) {
            $response = $db->one('SELECT id, name FROM location WHERE id = ?', [$_GET["id"]], "i");
        } else {
            $response = $db->query('SELECT id, name FROM location');
        }
    } elseif ($method === "POST") {
        parse_str(file_get_contents("php://input"),$_POST);
        $response = $db->none('INSERT INTO location (name) VALUES (?)', [$_POST["name"]], "s");
    } elseif ($method === "PUT") {
        parse_str(file_get_contents("php://input"),$_PUT);
        $response = $db->none('UPDATE location SET name = ? WHERE id = ?', [$_PUT["name"], $_PUT["id"]], "si");
    } elseif ($method === "DELETE") {
        parse_str(file_get_contents("php://input"),$_DELETE);
        $response = $db->none('DELETE FROM location WHERE id = ?', [$_DELETE["id"]], "i");
    } else {
        die("A valid method wasn't supplied");
    }

    $output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $response;

    echo json_encode($output);
    
?>