<?php

    include("modules/database.php");
    include("config.php");

    $db = new Database($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

?>