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
            $response = $db->one('SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) WHERE p.id = ? ORDER BY p.lastName, p.firstName, d.name, l.name', [$_REQUEST["id"]], "i");
        } else {
            $response = $db->query('SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) ORDER BY p.lastName, p.firstName, d.name, l.name');
        }
    } elseif ($method === "POST") {
        parse_str(file_get_contents("php://input"),$_POST);
        $response = $db->none('INSERT INTO personnel (firstName, lastName, email, jobTitle, departmentID) VALUES (?, ?, ?, ?, ?)', [$_POST["firstName"], $_POST["lastName"], $_POST["email"], $_POST["jobTitle"], $_POST["departmentID"]], "ssssi");
    } elseif ($method === "PUT") {
        parse_str(file_get_contents("php://input"),$_PUT);
        $response = $db->none('UPDATE personnel SET firstName = ?, lastName = ?, email = ?, jobTitle = ?, departmentID = ? WHERE id = ?', [$_PUT["firstName"], $_PUT["lastName"], $_PUT["email"], $_PUT["jobTitle"], $_PUT["departmentID"], $_PUT["id"]], "ssssii");
    } elseif ($method === "DELETE") {
        parse_str(file_get_contents("php://input"),$_DELETE);
        $response = $db->none('DELETE FROM personnel WHERE id = ?', [$_DELETE["id"]], "i");
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