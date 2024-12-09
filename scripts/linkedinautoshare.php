<?php
/**
 * Plugin Name: WordPress to LinkedIn Auto-Share
 * Description: Automatically shares WordPress posts to LinkedIn when published
 * Version: 1.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

// Add LinkedIn settings page to WordPress admin
function linkedin_settings_menu() {
    add_options_page(
        'LinkedIn Auto-Share Settings',
        'LinkedIn Auto-Share',
        'manage_options',
        'linkedin-auto-share',
        'linkedin_settings_page'
    );
}
add_action('admin_menu', 'linkedin_settings_menu');

// Create the settings page
function linkedin_settings_page() {
    ?>
    <div class="wrap">
        <h2>LinkedIn Auto-Share Settings</h2>
        <form method="post" action="options.php">
            <?php
            settings_fields('linkedin_settings_group');
            do_settings_sections('linkedin-auto-share');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

// Register settings
function linkedin_register_settings() {
    register_setting('linkedin_settings_group', 'linkedin_access_token');
    
    add_settings_section(
        'linkedin_settings_section',
        'API Settings',
        'linkedin_settings_section_callback',
        'linkedin-auto-share'
    );
    
    add_settings_field(
        'linkedin_access_token',
        'LinkedIn Access Token',
        'linkedin_token_field_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );
}
add_action('admin_init', 'linkedin_register_settings');

function linkedin_settings_section_callback() {
    echo 'Enter your LinkedIn API credentials below:';
}

function linkedin_token_field_callback() {
    $token = get_option('linkedin_access_token');
    echo "<input type='text' name='linkedin_access_token' value='{$token}' class='regular-text'>";
}

// Share post to LinkedIn when published
function share_post_to_linkedin($post_ID, $post, $update) {
    // Only share on new publication, not updates
    if ($update) {
        return;
    }
    
    // Only share public posts
    if ($post->post_status != 'publish') {
        return;
    }
    
    $access_token = get_option('linkedin_access_token');
    if (!$access_token) {
        return;
    }
    
    // Prepare the post data
    $post_url = get_permalink($post_ID);
    $post_title = $post->post_title;
    $post_excerpt = has_excerpt($post_ID) ? 
        get_the_excerpt($post_ID) : 
        wp_trim_words($post->post_content, 20);
    
    // LinkedIn API endpoint
    $api_url = 'https://api.linkedin.com/v2/ugcPosts';
    
    // Prepare the post content
    $linkedin_post = array(
        'author' => 'urn:li:person:ACoAAAYKQ7cBMeGVJBYwqzBj41IMDbvyn68JshM', // Replace with actual author ID
        'lifecycleState' => 'PUBLISHED',
        'specificContent' => array(
            'com.linkedin.ugc.ShareContent' => array(
                'shareCommentary' => array(
                    'text' => $post_title . "\n\n" . $post_excerpt
                ),
                'shareMediaCategory' => 'ARTICLE',
                'media' => array(
                    array(
                        'status' => 'READY',
                        'originalUrl' => $post_url,
                    )
                )
            )
        ),
        'visibility' => array(
            'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
        )
    );
    
    // Make the API request
    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($linkedin_post)
    ));
    
    // Log errors if any
    if (is_wp_error($response)) {
        error_log('LinkedIn sharing failed: ' . $response->get_error_message());
    }
}
add_action('wp_insert_post', 'share_post_to_linkedin', 10, 3);