<?php
header('Content-Type: application/rss+xml; charset=UTF-8');
header('Cache-Control: public, max-age=900');
$base='https://www.zemzem.al';
$api='https://ysvtrhizgcioyycwlkrk.supabase.co/rest/v1/blog_posts?select=title,slug,excerpt,published_at,created_at,cover_url&status=eq.published&order=published_at.desc.nullslast,created_at.desc&limit=50';
$key='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
function get_json($url,$key){
  if(function_exists('curl_init')){
    $ch=curl_init($url);
    curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>8,CURLOPT_HTTPHEADER=>['apikey: '.$key,'Accept: application/json']]);
    $out=curl_exec($ch); curl_close($ch);
  } else {
    $ctx=stream_context_create(['http'=>['timeout'=>8,'header'=>"apikey: $key\r\nAccept: application/json\r\n"]]);
    $out=@file_get_contents($url,false,$ctx);
  }
  $j=json_decode($out?:'[]',true); return is_array($j)?$j:[];
}
function x($v){return htmlspecialchars((string)$v,ENT_XML1|ENT_QUOTES,'UTF-8');}
$rows=get_json($api,$key);
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
echo "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\"><channel>";
echo "<title>ZemZem Blog</title><link>".x($base.'/blog.html')."</link><description>Artikuj, recensione dhe tema nga ZemZem.al</description><language>sq</language>";
echo "<atom:link href=\"".x($base.'/rss.xml')."\" rel=\"self\" type=\"application/rss+xml\"/>";
foreach($rows as $p){
  $link=$base.'/article.html?slug='.rawurlencode($p['slug']??'');
  $date=$p['published_at']??$p['created_at']??null;
  echo "<item><title>".x($p['title']??'')."</title><link>".x($link)."</link><guid isPermaLink=\"true\">".x($link)."</guid>";
  echo "<description>".x($p['excerpt']??'')."</description>";
  if($date) echo "<pubDate>".gmdate(DATE_RSS,strtotime($date))."</pubDate>";
  echo "</item>";
}
echo "</channel></rss>";
?>