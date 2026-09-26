<?php
header('Content-Type: application/xml; charset=UTF-8');
header('Cache-Control: public, max-age=900');
$base='https://www.zemzem.al';
$api='https://ysvtrhizgcioyycwlkrk.supabase.co/rest/v1/blog_posts?select=slug,updated_at,published_at,created_at&status=eq.published&order=published_at.desc.nullslast,created_at.desc&limit=500';
$key='sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
function get_json($url,$key){
  if(function_exists('curl_init')){
    $ch=curl_init($url); curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>8,CURLOPT_HTTPHEADER=>['apikey: '.$key,'Accept: application/json']]); $out=curl_exec($ch); curl_close($ch);
  } else {
    $ctx=stream_context_create(['http'=>['timeout'=>8,'header'=>"apikey: $key\r\nAccept: application/json\r\n"]]); $out=@file_get_contents($url,false,$ctx);
  }
  $j=json_decode($out?:'[]',true); return is_array($j)?$j:[];
}
function x($v){return htmlspecialchars((string)$v,ENT_XML1|ENT_QUOTES,'UTF-8');}
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
$staticFile=__DIR__.'/sitemap-static.xml';
if(is_file($staticFile)){
  $xml=@simplexml_load_file($staticFile);
  if($xml){foreach($xml->url as $u){echo '<url><loc>'.x((string)$u->loc).'</loc>';if(isset($u->lastmod)&&trim((string)$u->lastmod)!=='')echo '<lastmod>'.x((string)$u->lastmod).'</lastmod>';if(isset($u->changefreq)&&trim((string)$u->changefreq)!=='')echo '<changefreq>'.x((string)$u->changefreq).'</changefreq>';if(isset($u->priority)&&trim((string)$u->priority)!=='')echo '<priority>'.x((string)$u->priority).'</priority>';echo '</url>';}}
}
foreach(get_json($api,$key) as $p){
  $slug=$p['slug']??''; if(!$slug)continue;
  $lm=$p['updated_at']??$p['published_at']??$p['created_at']??null;
  echo '<url><loc>'.x($base.'/article.html?slug='.rawurlencode($slug)).'</loc>';
  if($lm)echo '<lastmod>'.x(gmdate('Y-m-d',strtotime($lm))).'</lastmod>';
  echo '<changefreq>monthly</changefreq><priority>0.70</priority></url>';
}
echo '</urlset>';
?>