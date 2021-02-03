<?php

# phrases for the pulsar
$phrases = file_get_contents("site_phrases.txt");
$phrase_list = explode("\n", $phrases);
$phrase_pick = rand(0, count($phrase_list) - 1);
$phrase = $phrase_list[$phrase_pick];

$page_ref = $_GET["_url"];

if(!isset($page_ref) || $page_ref == "") {
  $page_ref = "/startpage";
}

$template_root = 'templates';
$page_root = 'guts';

$php_watch = @file_get_contents("$template_root$page_ref.html");

if($php_watch === false) {
  header("HTTP/1.0 404 Not Found");
  echo file_get_contents("$page_root/404.html");
} else {
  while(preg_match("/%%.+%%/", $php_watch, $match_a) === 1) {
    $match = $match_a[0];
    
    $file_location = str_replace("%%", "", $match);
    $file_location = preg_replace("/(\.\.\/)/", "", $file_location);
    $match_file_contents = @file_get_contents($page_root."/".$file_location);
    
    if($match_file_contents === false) {
      $php_watch = str_replace($match, "<b style='color:red'>COULDN'T LOAD PATTERN $file_location</b>", $php_watch);
    } else {
      $php_watch = str_replace($match, $match_file_contents, $php_watch);
    }
  }
  
  $php_watch = str_replace("@random_phrase", $phrase, $php_watch);
  echo $php_watch;
}
# footer generation happens here

echo "<hr>";

echo "<div style='text-align:center'>&xi; This page was generated " . date("D M d, Y G:i") . "</div>";
?>
