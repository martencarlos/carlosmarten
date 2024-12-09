 add_action('draft_to_published', 'notify_nextjs_endpoint', 10, 2);
function notify_nextjs_endpoint($post_id, $post) {
    $url = 'https://carlosmarten.com/api/webhook';

    $body = array(
        'id' => $post_id,
        'content' => wp_strip_all_tags($post->post_content),
        'title' => $post->post_title,
        'secret' => '4bf420bba059ed220d85e03b994202379c8a9c50284d619b'
    );
    // Using form-data format instead of JSON
    $boundary = wp_generate_password(24);
    $payload = '';

    foreach($body as $name => $value) {
        $payload .= "--$boundary\r\n";
        $payload .= "Content-Disposition: form-data; name=\"$name\"\r\n\r\n";
        $payload .= "$value\r\n";
    }
    $payload .= "--$boundary--\r\n";
    wp_remote_post($url, array(
        'headers' => array(
            'Content-Type' => "multipart/form-data; boundary=$boundary"
        ),
        'body' => $payload
    ));
}