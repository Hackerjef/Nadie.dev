<?php
  require __DIR__ . '/../vendor/autoload.php';

  if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    exit;
  }

  $commands = array(
    "motd" => (object) [
      'helptext' => "Displays message of the day",
      'run' => function () {
        echo "Welcome to AugustLabs, It's safer here.";
      },
      'hidden' => false
    ],
    "time" => (object) [
      'helptext' => "Displays Server time",
      'run' => function () {
        echo date('m/d/y H:i:s');
      },
      'hidden' => false
    ],
    "lilly" => (object) [
      'helptext' => "The Love of my life",
      'run' => function () {
        echo "<img src=\"https://i.nadie.dev/7nqXDQLO2juXZcuicpB.png\" alt=\"love you bb\">";
      },
      'hidden' => true
    ],
    "uptime" => (object) [
      'helptext' => "current uptime of the server",
      'run' => function () {
        echo shell_exec('uptime -p');
      },
      'hidden' => false
    ],
    "avatar" => (object) [
      'helptext' => "get my avatar",
      'run' => function () {
        echo "<img src=\"/php/discord.php?image\" alt=\"owo\" height=\"128\" width=\"128\">";
      },
      'hidden' => false
    ],
    "notfound" => (object) [
      'helptext' => "NotFound",
      'run' => function () {
        echo "Command not found...";
      },
      'hidden' => true
    ],
    "help" => (object) [
      'helptext' => "Displaces this command",
      'run' => function () {
        // if ($_POST['argstring']){
        //   echo $commands[$_POST['argstring']->helptext];
        //   die;
        // }
        echo "Help is not made yet :P but uh motd, time, avatar, notfound, and ofc help :p";
      },
      'hidden' => false
    ],
    "pigeon" => (object) [
      'helptext' => "Mr.Pigeon",
      'run' => function () {
        echo "<img src=\"https://i.nadie.dev/vIgFPYe.gif\" alt=\"owo\" height=\"128\" width=\"128\">";
      },
      'hidden' => false
    ],
  );
  
  // die;
  // php sucks
  if (array_key_exists($_POST['command'], $commands)){
    call_user_func($commands[$_POST['command']]->run);
    die;
  } else {
    call_user_func($commands["notfound"]->run);
    die;
  }
?>