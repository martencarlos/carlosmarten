<?php
/**
 * Plugin Name: WordPress to LinkedIn Auto-Share
 * Description: Automatically shares WordPress posts to LinkedIn when published
 * Version: 1.2
 * Author: Your Name
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit('Direct access not allowed.');
}

/**
 * Debug logging function
 */
function linkedin_debug_log($message) {
    if (WP_DEBUG === true) {
        if (is_array($message) || is_object($message)) {
            error_log('LinkedIn Debug: ' . print_r($message, true));
        } else {
            error_log('LinkedIn Debug: ' . $message);
        }
    }
}

/**
 * Add LinkedIn settings page to WordPress admin menu
 */
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

/**
 * Create the settings page HTML
 */
function linkedin_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <div class="card" style="max-width: 800px; margin-bottom: 20px; padding: 10px;">
            <h2>Setup Instructions</h2>
            <ol>
                <li>Go to <a href="https://www.linkedin.com/developers/" target="_blank">LinkedIn Developers</a> and create an app</li>
                <li>Set the redirect URL to: <code><?php echo admin_url('options-general.php?page=linkedin-auto-share'); ?></code></li>
                <li>Request the scopes: r_liteprofile w_member_social</li>
                <li>Copy your Client ID and Client Secret below</li>
                <li>Click "Generate Auth URL" and visit the link to get your authorization code</li>
                <li>Enter the authorization code and click "Exchange for Access Token"</li>
            </ol>
        </div>

        <form method="post" action="options.php">
            <?php
            settings_fields('linkedin_settings_group');
            do_settings_sections('linkedin-auto-share');
            submit_button('Save Settings');
            ?>
        </form>
    </div>
    <?php
}

/**
 * Register plugin settings
 */
function linkedin_register_settings() {
    // Register the settings
    register_setting('linkedin_settings_group', 'linkedin_client_id', 'sanitize_text_field');
    register_setting('linkedin_settings_group', 'linkedin_client_secret', 'sanitize_text_field');
    register_setting('linkedin_settings_group', 'linkedin_auth_code', 'sanitize_text_field');
    register_setting('linkedin_settings_group', 'linkedin_access_token', 'sanitize_text_field');
    register_setting('linkedin_settings_group', 'linkedin_profile_id', 'sanitize_text_field');

    // Add settings section
    add_settings_section(
        'linkedin_settings_section',
        'LinkedIn API Configuration',
        'linkedin_settings_section_callback',
        'linkedin-auto-share'
    );

    // Add settings fields
    add_settings_field(
        'linkedin_client_id',
        'Client ID',
        'linkedin_client_id_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );

    add_settings_field(
        'linkedin_client_secret',
        'Client Secret',
        'linkedin_client_secret_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );

    add_settings_field(
        'linkedin_auth_url',
        'Authorization URL',
        'linkedin_auth_url_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );

    add_settings_field(
        'linkedin_auth_code',
        'Authorization Code',
        'linkedin_auth_code_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );

    add_settings_field(
        'linkedin_access_token',
        'Access Token',
        'linkedin_access_token_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );

    add_settings_field(
        'linkedin_profile_id',
        'LinkedIn Profile ID',
        'linkedin_profile_id_callback',
        'linkedin-auto-share',
        'linkedin_settings_section'
    );
}
add_action('admin_init', 'linkedin_register_settings');

/**
 * Settings section description
 */
function linkedin_settings_section_callback() {
    echo '<p>Configure your LinkedIn API credentials and authorization settings below.</p>';
}

/**
 * Client ID field callback
 */
function linkedin_client_id_callback() {
    $client_id = get_option('linkedin_client_id');
    ?>
    <input type='text' 
           name='linkedin_client_id' 
           value='<?php echo esc_attr($client_id); ?>' 
           class='regular-text'>
    <p class="description">Enter your LinkedIn App's Client ID</p>
    <?php
}

/**
 * Client Secret field callback
 */
function linkedin_client_secret_callback() {
    $client_secret = get_option('linkedin_client_secret');
    ?>
    <input type='text' 
           name='linkedin_client_secret' 
           value='<?php echo esc_attr($client_secret); ?>' 
           class='regular-text'>
    <p class="description">Enter your LinkedIn App's Client Secret</p>
    <?php
}

/**
 * Authorization URL generator callback
 */
function linkedin_auth_url_callback() {
    $client_id = get_option('linkedin_client_id');
    $redirect_uri = admin_url('options-general.php?page=linkedin-auto-share');
    
    // Only request w_member_social scope
    $auth_url = 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query([
        'response_type' => 'code',
        'client_id' => $client_id,
        'redirect_uri' => $redirect_uri,
        'scope' => 'w_member_social',
        'state' => wp_create_nonce('linkedin_auth_state')
    ]);
    ?>
    <div class="linkedin-auth-section">
        <button type='button' 
                id='generate_auth_url' 
                class='button button-secondary'
                onclick="window.open('<?php echo esc_js($auth_url); ?>', '_blank')">
            Generate & Open Auth URL
        </button>
        
        <p class="description">
            Before clicking:<br>
            1. Make sure you've added this exact URL to your LinkedIn App's Redirect URLs:<br>
            <code><?php echo esc_html($redirect_uri); ?></code><br>
            2. Verify your Client ID is correct<br>
            3. Ensure you've requested the "Share on LinkedIn" product access
        </p>
    </div>
    <?php
}

/**
 * Authorization Code field callback
 */
function linkedin_auth_code_callback() {
    $auth_code = get_option('linkedin_auth_code');
    ?>
    <input type='text' 
           name='linkedin_auth_code' 
           value='<?php echo esc_attr($auth_code); ?>' 
           class='regular-text'>
    <button type='button' 
            id='exchange_token' 
            class='button button-secondary'>
        Exchange for Access Token
    </button>
    <span id='token_status' style='margin-left: 10px;'></span>

    <script>
    jQuery(document).ready(function($) {
        $('#exchange_token').on('click', function() {
            var client_id = $('input[name="linkedin_client_id"]').val();
            var client_secret = $('input[name="linkedin_client_secret"]').val();
            var auth_code = $('input[name="linkedin_auth_code"]').val();
            var status = $('#token_status');
            
            if (!client_id || !client_secret || !auth_code) {
                status.html('<span style="color: red;">Please enter all required fields</span>');
                return;
            }
            
            status.html('<span style="color: blue;">Exchanging token...</span>');
            
            $.post(ajaxurl, {
                action: 'exchange_linkedin_token',
                client_id: client_id,
                client_secret: client_secret,
                auth_code: auth_code,
                nonce: '<?php echo wp_create_nonce("linkedin_exchange_token"); ?>'
            }, function(response) {
                if (response.success) {
                    status.html('<span style="color: green;">Token exchanged successfully!</span>');
                    $('input[name="linkedin_access_token"]').val(response.data.access_token);
                } else {
                    status.html('<span style="color: red;">Error: ' + response.data.message + '</span>');
                }
            });
        });
    });
    </script>
    <?php
}

/**
 * Access Token field callback
 */
function linkedin_access_token_callback() {
    $access_token = get_option('linkedin_access_token');
    ?>
    <input type='text' 
           name='linkedin_access_token' 
           value='<?php echo esc_attr($access_token); ?>' 
           class='regular-text'>
    <p class="description">Your LinkedIn Access Token (automatically populated after exchange)</p>
    <?php
}

/**
 * Profile ID field callback
 */
function linkedin_profile_id_callback() {
    $profile_id = get_option('linkedin_profile_id');
    ?>
    <input type='text' 
           id='linkedin_profile_id' 
           name='linkedin_profile_id' 
           value='<?php echo esc_attr($profile_id); ?>' 
           class='regular-text'>
    <button type='button' 
            id='fetch_profile_id' 
            class='button button-secondary'>
        Fetch Profile ID
    </button>
    <span id='profile_id_status' style='margin-left: 10px;'></span>
    <div id='debug_info' style='margin-top: 10px; display: none;'>
        <pre style='background: #f0f0f0; padding: 10px; overflow: auto;'></pre>
    </div>

    <script>
    jQuery(document).ready(function($) {
        $('#fetch_profile_id').on('click', function() {
            var access_token = $('input[name="linkedin_access_token"]').val();
            var status = $('#profile_id_status');
            var debugInfo = $('#debug_info');
            
            if (!access_token) {
                status.html('<span style="color: red;">Please enter access token first</span>');
                return;
            }
            
            status.html('<span style="color: blue;">Fetching...</span>');
            debugInfo.hide();
            
            $.post(ajaxurl, {
                action: 'fetch_linkedin_profile',
                access_token: access_token,
                nonce: '<?php echo wp_create_nonce("linkedin_fetch_profile"); ?>'
            })
            .done(function(response) {
                if (response.success) {
                    $('#linkedin_profile_id').val(response.data.profile_id);
                    status.html('<span style="color: green;">Profile ID fetched successfully!</span>');
                } else {
                    status.html('<span style="color: red;">Error: ' + response.data.message + '</span>');
                    // Show debug info
                    debugInfo.show().find('pre').text(JSON.stringify(response.data.debug_info, null, 2));
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                status.html('<span style="color: red;">AJAX Error: ' + textStatus + '</span>');
                debugInfo.show().find('pre').text('Request failed: ' + errorThrown);
            });
        });
    });
    </script>
    <?php
}

/**
 * AJAX handler for token exchange
 */
add_action('wp_ajax_exchange_linkedin_token', 'exchange_linkedin_token');
function exchange_linkedin_token() {
    check_ajax_referer('linkedin_exchange_token', 'nonce');
    
    $client_id = sanitize_text_field($_POST['client_id']);
    $client_secret = sanitize_text_field($_POST['client_secret']);
    $auth_code = sanitize_text_field($_POST['auth_code']);
    $redirect_uri = admin_url('options-general.php?page=linkedin-auto-share');
    
    $response = wp_remote_post('https://www.linkedin.com/oauth/v2/accessToken', array(
        'body' => array(
            'grant_type' => 'authorization_code',
            'code' => $auth_code,
            'client_id' => $client_id,
            'client_secret' => $client_secret,
            'redirect_uri' => $redirect_uri
        )
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => $response->get_error_message()));
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    
    if (isset($body['access_token'])) {
        update_option('linkedin_access_token', $body['access_token']);
        wp_send_json_success(array('access_token' => $body['access_token']));
    } else {
        wp_send_json_error(array('message' => 'Invalid response from LinkedIn'));
    }
}

/**
 * AJAX handler for fetching profile ID
 */
add_action('wp_ajax_fetch_linkedin_profile', 'fetch_linkedin_profile');
function fetch_linkedin_profile() {
    check_ajax_referer('linkedin_fetch_profile', 'nonce');
    
    $access_token = sanitize_text_field($_POST['access_token']);
    
    // First attempt - /v2/me endpoint
    $response = wp_remote_get('https://api.linkedin.com/v2/me', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $access_token,
            'X-Restli-Protocol-Version' => '2.0.0',
            'LinkedIn-Version' => '202304'
        )
    ));
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    
    if ($response_code === 200 && !empty($response_body)) {
        $body = json_decode($response_body, true);
        if (!empty($body['id'])) {
            update_option('linkedin_profile_id', $body['id']);
            wp_send_json_success(array(
                'profile_id' => $body['id'],
                'debug_info' => 'Retrieved from /v2/me endpoint'
            ));
            return;
        }
    }
    
    // Second attempt - /v2/userinfo endpoint
    $response2 = wp_remote_get('https://api.linkedin.com/v2/userinfo', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $access_token
        )
    ));
    
    $response_code2 = wp_remote_retrieve_response_code($response2);
    $response_body2 = wp_remote_retrieve_body($response2);
    
    // Send detailed error information
    wp_send_json_error(array(
        'message' => 'Could not retrieve profile ID from any endpoint',
        'debug_info' => array(
            'first_attempt' => array(
                'endpoint' => '/v2/me',
                'status_code' => $response_code,
                'response' => $response_body
            ),
            'second_attempt' => array(
                'endpoint' => '/v2/userinfo',
                'status_code' => $response_code2,
                'response' => $response_body2
            )
        )
    ));
}

/**
 * Share post to LinkedIn when published
 */
function share_post_to_linkedin($post_ID, $post, $update) {
    linkedin_debug_log('Starting LinkedIn share process for post ID: ' . $post_ID);
    
    if ($update) {
        linkedin_debug_log('Skipping - this is an update to existing post');
        return;
    }
    
    if ($post->post_status !== 'publish') {
        linkedin_debug_log('Skipping - post status is not publish: ' . $post->post_status);
        return;
    }
    
    $access_token = get_option('linkedin_access_token');
    $profile_id = get_option('linkedin_profile_id');
    
    if (!$access_token || !$profile_id) {
        linkedin_debug_log('Missing credentials - Access Token or Profile ID not set');
        return;
    }
    
    $post_url = get_permalink($post_ID);
    $post_title = $post->post_title;
    $post_excerpt = has_excerpt($post_ID) ? 
        get_the_excerpt($post_ID) : 
        wp_trim_words($post->post_content, 20);
    
    $linkedin_post = array(
        'author' => "urn:li:person:{$profile_id}",
        'lifecycleState' => 'PUBLISHED',
        'specificContent' => array(
            'com.linkedin.ugc.ShareContent' => array(
                'shareCommentary' => array(


                    'text' => $post_title . "\n\n" . $post_excerpt . "\n\nRead more: " . $post_url
                ),
                'shareMediaCategory' => 'ARTICLE',
                'media' => array(
                    array(
                        'status' => 'READY',
                        'originalUrl' => $post_url,
                        'title' => array(
                            'text' => $post_title
                        ),
                        'description' => array(
                            'text' => $post_excerpt
                        )
                    )
                )
            )
        ),
        'visibility' => array(
            'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
        )
    );

    // Add featured image if available
    if (has_post_thumbnail($post_ID)) {
        $featured_image_url = get_the_post_thumbnail_url($post_ID, 'full');
        if ($featured_image_url) {
            $linkedin_post['specificContent']['com.linkedin.ugc.ShareContent']['media'][0]['thumbnailUrl'] = $featured_image_url;
        }
    }
    
    linkedin_debug_log('Prepared LinkedIn post data: ' . json_encode($linkedin_post));
    
    $response = wp_remote_post('https://api.linkedin.com/v2/ugcPosts', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json',
            'X-Restli-Protocol-Version' => '2.0.0',
        ),
        'body' => json_encode($linkedin_post),
        'timeout' => 15
    ));
    
    if (is_wp_error($response)) {
        linkedin_debug_log('Error sharing to LinkedIn: ' . $response->get_error_message());
        update_post_meta($post_ID, '_linkedin_share_status', 'error');
        update_post_meta($post_ID, '_linkedin_share_error', $response->get_error_message());
        return;
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    linkedin_debug_log('LinkedIn API Response Code: ' . $response_code);
    linkedin_debug_log('LinkedIn API Response Body: ' . $response_body);
    
    if ($response_code === 201) {
        linkedin_debug_log('Successfully shared to LinkedIn');
        update_post_meta($post_ID, '_linkedin_share_status', 'shared');
        update_post_meta($post_ID, '_linkedin_share_time', current_time('mysql'));
    } else {
        linkedin_debug_log('Error sharing to LinkedIn. Response code: ' . $response_code);
        update_post_meta($post_ID, '_linkedin_share_status', 'error');
        update_post_meta($post_ID, '_linkedin_share_error', $response_body);
    }
}
add_action('wp_insert_post', 'share_post_to_linkedin', 10, 3);

/**
 * Add settings link on plugin page
 */
function linkedin_settings_link($links) {
    $settings_link = '<a href="options-general.php?page=linkedin-auto-share">Settings</a>';
    array_unshift($links, $settings_link);
    return $links;
}
$plugin = plugin_basename(__FILE__);
add_filter("plugin_action_links_$plugin", 'linkedin_settings_link');

/**
 * Add meta box to post editor to show sharing status
 */
function add_linkedin_status_meta_box() {
    add_meta_box(
        'linkedin_share_status',
        'LinkedIn Sharing Status',
        'display_linkedin_status_meta_box',
        'post',
        'side',
        'high'
    );
}
add_action('add_meta_boxes', 'add_linkedin_status_meta_box');

/**
 * Display the sharing status in the meta box
 */
function display_linkedin_status_meta_box($post) {
    $status = get_post_meta($post->ID, '_linkedin_share_status', true);
    $share_time = get_post_meta($post->ID, '_linkedin_share_time', true);
    $error = get_post_meta($post->ID, '_linkedin_share_error', true);
    
    if (!$status) {
        echo '<p>Not yet shared to LinkedIn</p>';
        return;
    }
    
    if ($status === 'shared') {
        echo '<p style="color: green;">✓ Shared to LinkedIn</p>';
        if ($share_time) {
            echo '<p>Shared on: ' . esc_html($share_time) . '</p>';
        }
    } else if ($status === 'error') {
        echo '<p style="color: red;">✗ Error sharing to LinkedIn</p>';
        if ($error) {
            echo '<p>Error message: ' . esc_html($error) . '</p>';
        }
    }
    
    // Add manual share button
    if (current_user_can('publish_posts')) {
        wp_nonce_field('linkedin_manual_share', 'linkedin_manual_share_nonce');
        echo '<button type="button" id="linkedin_manual_share" class="button button-secondary">';
        echo 'Share Now to LinkedIn</button>';
        echo '<span id="linkedin_manual_share_status" style="margin-left: 10px;"></span>';
        
        ?>
        <script>
        jQuery(document).ready(function($) {
            $('#linkedin_manual_share').on('click', function() {
                var button = $(this);
                var status = $('#linkedin_manual_share_status');
                
                button.prop('disabled', true);
                status.html('<span style="color: blue;">Sharing...</span>');
                
                $.post(ajaxurl, {
                    action: 'manual_linkedin_share',
                    post_id: <?php echo $post->ID; ?>,
                    nonce: $('#linkedin_manual_share_nonce').val()
                }, function(response) {
                    if (response.success) {
                        status.html('<span style="color: green;">Shared successfully!</span>');
                        location.reload();
                    } else {
                        status.html('<span style="color: red;">Error: ' + response.data.message + '</span>');
                        button.prop('disabled', false);
                    }
                });
            });
        });
        </script>
        <?php
    }
}

/**
 * Handle manual sharing AJAX request
 */
add_action('wp_ajax_manual_linkedin_share', 'handle_manual_linkedin_share');
function handle_manual_linkedin_share() {
    check_ajax_referer('linkedin_manual_share', 'nonce');
    
    if (!current_user_can('publish_posts')) {
        wp_send_json_error(array('message' => 'Permission denied'));
        return;
    }
    
    $post_id = intval($_POST['post_id']);
    $post = get_post($post_id);
    
    if (!$post) {
        wp_send_json_error(array('message' => 'Post not found'));
        return;
    }
    
    // Share the post
    share_post_to_linkedin($post_id, $post, false);
    
    // Check if sharing was successful
    $status = get_post_meta($post_id, '_linkedin_share_status', true);
    if ($status === 'shared') {
        wp_send_json_success();
    } else {
        $error = get_post_meta($post_id, '_linkedin_share_error', true);
        wp_send_json_error(array('message' => $error));
    }
}

/**
 * Add activation hook to check requirements
 */
register_activation_hook(__FILE__, 'linkedin_autoshare_activation');
function linkedin_autoshare_activation() {
    if (version_compare(PHP_VERSION, '5.6', '<')) {
        deactivate_plugins(basename(__FILE__));
        wp_die('This plugin requires PHP version 5.6 or higher.');
    }
}           