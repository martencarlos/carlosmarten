add_action('transition_post_status', 'notify_nextjs_endpoint', 10, 3);
function notify_nextjs_endpoint($new_status, $old_status, $post) {
    // Only trigger when transitioning from non-publish to publish
    if ($new_status !== 'publish' || $old_status === 'publish') {
        return;
    }
    
    $post_id = $post->ID;
    $url = 'https://carlosmarten.com/api/webhook';
    $body = array(
        'id' => $post_id,
        'slug' => $post->post_name,
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

add_action('init', 'my_custom_cors_headers');
function my_custom_cors_headers() {
    $allowed_origins = [
        'https://www.carlosmarten.com',
        'http://localhost:3000'
    ];

    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true"); // solo si necesitas cookies/autenticación
    }

    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}

/**
 * Deletes the associated audio file from the Media Library when a post is permanently deleted.
 *
 * This function hooks into 'before_delete_post'. It constructs the expected title
 * of the audio file (e.g., "My Post Title Audio") and searches the Media Library
 * for an attachment with that exact title. If found, it is permanently deleted.
 *
 * @param int $post_id The ID of the post being deleted.
 */
function delete_associated_audio_on_post_delete($post_id) {
    // Get the full post object that is about to be deleted.
    $post_to_delete = get_post($post_id);

    // Ensure it's a valid post and is the correct post type before proceeding.
    if (!$post_to_delete || $post_to_delete->post_type !== 'post') {
        return;
    }

    // Construct the expected title of the associated audio file.
    // This MUST match the title format set in the Next.js `uploadAudioToWordPress` server action.
    $expected_audio_title = $post_to_delete->post_title . ' Audio';

    // Prepare arguments to find the audio attachment by its specific title.
    $args = array(
        'post_type'      => 'attachment',
        'post_status'    => 'inherit', // Standard status for attachments.
        'posts_per_page' => 1,         // We only expect one match, so this is efficient.
        'title'          => $expected_audio_title,
        'post_mime_type' => 'audio/mpeg',
    );

    // Query for the specific attachment.
    $audio_attachments = get_posts($args);

    // If we found a matching audio attachment, loop through and delete it.
    if ($audio_attachments) {
        foreach ($audio_attachments as $attachment) {
            // The 'true' parameter forces a permanent deletion from the media library and the server.
            wp_delete_attachment($attachment->ID, true);
        }
    }
}

// Hook the function to run just before a post is permanently deleted.
add_action('before_delete_post', 'delete_associated_audio_on_post_delete', 10, 1);
