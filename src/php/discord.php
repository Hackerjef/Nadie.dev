<?php

require __DIR__ . '/../vendor/autoload.php';
use RestCord\DiscordClient;
use RedisClient\RedisClient;

//Redis key
$REDIS_KEY = "homepage-data";


$mimes = new \Mimey\MimeTypes;

try {
   $Redis = new RedisClient([
      'server' => '127.0.0.1:6379',
      'timeout' => 2
   ]);
   $sdata = $Redis->get($REDIS_KEY);
} catch (Exception $e) {
   $Redis = NULL;
   $sdata = NULL;
}

if($sdata === NULL) {
   // Because fuck you anyone else looking at this :)
   if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
      $config = include 'D:\KEYS\discord.php';
   } else {
      $config = include '/home/discord.php';
   }

   $discord = new DiscordClient($config);
   $user = $discord->user->getUser(['user.id' => 142721776458137600]);

   $request = Requests::get('https://cdn.discordapp.com/avatars/' . $user->id . '/' . $user->avatar);
   $content_type = $mimes->getExtension($request->headers['content-type']);

   $sdata = json_encode((object) [
      'discriminator' => $user->discriminator,
      'username' => $user->username,
      'id' => $user->id,
      'avatarid' => $user->avatar,
      'avatarurl' => 'https://cdn.discordapp.com/avatars/' . $user->id . '/' . $user->avatar . '.' . $content_type,
   ]);
   if ($Redis !== NULL) {
      $Redis->set($REDIS_KEY, $sdata, 86400);
   }
}


$data = json_decode($sdata);

if(isset($_GET['data']))
{
   $data->tsr = 86400 - $Redis->ttl($REDIS_KEY);
   echo json_encode($data);
   exit;
}

if(isset($_GET['image']))
{
   $request = Requests::get($data->avatarurl);
   $headers = array();
   $headers['content-type'] = $request->headers['content-type'];
   $headers['content-length'] = $request->headers['content-length'];
   $headers['cache-control'] = 'no-store';
   $headers['Content-Disposition'] = 'inline; filename="wai_U_downloadin_lol.' . $mimes->getExtension($request->headers['content-type']) . '"';

   foreach ($headers as $headerType => $headerValue)
   {
      header($headerType . ': ' . $headerValue);
   }

   echo $request->body;
   exit;
}

$obj = (object) [];
echo json_encode($obj);
exit;