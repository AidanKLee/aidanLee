<?php

    class Database {

        public $conn;

        function __construct($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket) {
            $this->conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
        }

        function handleConnectionError() {
            $output['status']['code'] = "300";
            $output['status']['name'] = "failure";
            $output['status']['description'] = "database unavailable";
            $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
            $output['data'] = [];

            mysqli_close($conn);

            echo json_encode($output);

            exit;
        }

        function handleFailedQuery() {

            $output['status']['code'] = "400";
            $output['status']['name'] = "executed";
            $output['status']['description'] = "query failed";	
            $output['data'] = [];
    
            mysqli_close($this->conn);
    
            echo json_encode($output); 
    
            exit;

        }

        function sqlQuery($query, $params = null, $dataTypes = null, $hasOutput = true) {

            if ($params) {
                $query = $this->conn->prepare($query);
                $query->bind_param($dataTypes, ...$params);
                $query->execute();

                if (false === $query) {
                    $this->handleFailedQuery();
                }
    
                $result = $query->get_result();

            } else {

                $result = $this->conn->query($query);

                if (!$result) {
                    $this->handleFailedQuery();
                }

            }
            
            $data = [];

            if ($hasOutput) {
    
                while ($row = mysqli_fetch_assoc($result)) {
                    array_push($data, $row);
                }

            }

            mysqli_close($this->conn);

            return $data;

        }

        function query($query, $params = null, $dataTypes = null) {
            return $this->sqlQuery($query, $params, $dataTypes, true);
        }

        function one($query, $params = null, $dataTypes = null) {
            return $this->sqlQuery($query, $params, $dataTypes, true)[0];
        }

        function none($query, $params = null, $dataTypes = null) {
            return $this->sqlQuery($query, $params, $dataTypes, false);
        }

    }

?>