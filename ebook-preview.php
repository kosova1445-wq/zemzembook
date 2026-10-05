<?php
// Serve the existing eBook page with metadata available before JavaScript runs.
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, must-revalidate');
$html = file_get_contents(__DIR__ . '/ebook.html');
$id = isset($_GET['id']) && is_string($_GET['id']) ? $_GET['id'] : '';
if (!preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i', $id)) {
    echo $html;
    exit;
}
$key = 'sb_publishable_HosI5ns0isB0FyQHrGbXwA_9LKzaFMD';
$url = 'https://ysvtrhizgcioyycwlkrk.supabase.co/rest/v1/storefront_ebooks?id=eq.' . rawurlencode($id)
    . '&select=id,title,author_name,short_description,description,cover_url&limit=1';
$out = false;
$status = 0;
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => ['apikey: ' . $key, 'Accept: application/json']
    ]);
    $out = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
} else {
    $ctx = stream_context_create(['http' => [
        'timeout' => 8, 'header' => "apikey: $key\r\nAccept: application/json\r\n"
    ]]);
    $out = @file_get_contents($url, false, $ctx);
    if ($out !== false) $status = 200;
}
$rows = json_decode($out ?: '[]', true);
if ($status !== 200 || !is_array($rows) || empty($rows[0]['id']) || empty($rows[0]['title'])) {
    // Keep the storefront usable and prevent caching an incomplete preview.
    header('Cache-Control: no-store');
    echo $html;
    exit;
}
$book = $rows[0];
$escape = function ($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
};
$title = $book['title'] . ' – eBook | ZemZem';
$desc = trim(preg_replace('/\s+/u', ' ', strip_tags(
    $book['short_description'] ?: ($book['description'] ?: ($book['title'] . ' nga ' . ($book['author_name'] ?: 'ZemZem')))
)));
if (function_exists('mb_substr')) $desc = mb_substr($desc, 0, 200, 'UTF-8');
$canonical = 'https://www.zemzem.al/ebook.html?id=' . rawurlencode($book['id']);
$image = trim((string) ($book['cover_url'] ?? ''));
if ($image !== '' && strpos($image, 'https://') !== 0 && strpos($image, 'http://') !== 0) {
    $image = 'https://www.zemzem.al/' . ltrim($image, '/');
}
$html = preg_replace_callback('/<title>.*?<\/title>/is', function () use ($escape, $title) { return '<title>' . $escape($title) . '</title>'; }, $html, 1);
$html = preg_replace('/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/i', '', $html);
$meta = "\n<!-- ZemZem server eBook preview v1 -->\n";
$meta .= '<link rel="canonical" href="' . $escape($canonical) . '">' . "\n";
$fields = ['og:type' => 'book', 'og:site_name' => 'ZemZem', 'og:title' => $title,
    'og:description' => $desc, 'og:url' => $canonical];
if ($image !== '') {
    $fields['og:image'] = $image;
    $fields['og:image:alt'] = 'Kopertina e librit ' . $book['title'];
}
foreach ($fields as $name => $value) {
    $meta .= '<meta property="' . $escape($name) . '" content="' . $escape($value) . '">' . "\n";
}
foreach (['description' => $desc, 'twitter:card' => 'summary_large_image',
    'twitter:title' => $title, 'twitter:description' => $desc, 'twitter:image' => $image] as $name => $value) {
    if ($value !== '') $meta .= '<meta name="' . $escape($name) . '" content="' . $escape($value) . '">' . "\n";
}
echo str_replace('</head>', $meta . '</head>', $html);
