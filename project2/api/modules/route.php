<?php

    class Route {

        public $getCb;
        public $post;
        public $put;
        public $delete;

        public function get($cb) {
            $this->getCb = $cb;
        }

        public function post($cb) {
            $this->post = $cb;
        }

        public function put($cb) {
            $this->put = $cb;
        }

        public function delete($cb) {
            $this->delete = $cb;
        }

        public function listen() {

	        header('Content-Type: application/json; charset=UTF-8');

            $method = $_SERVER["REQUEST_METHOD"];
            $request["data"] = $_SERVER;
            $request["params"] = $_REQUEST;

            if ($method === 'GET') {
                $this->getCb($request, new Response());
            } elseif ($method === 'POST') {
                $this->post($request, new Response());
            } elseif ($method === 'PUT') {
                $this->put($request, new Response());
            } elseif ($method === 'DELETE') {
                $this->delete($request, new Response());
            }
        }

    }

    class Response {

        public $status;
        public $executionStartTime;

        function __construct() {
            $this->executionStartTime = microtime(true);
            $this->status = array(
                "code" => "200",
                "name" => "ok",
                "description" => "success"
            );
        }

        function status($code) {
            $this->status["code"] = $code;
        }

        function send($data) {
            $this->status["returnedIn"] = (microtime(true) - $this->executionStartTime) / 1000 . " ms";

            $output["status"] = $this->status;
            $output["data"] = $data;
            echo json_encode($output);
        }

    }

?>