<?php
/**
 * Plugin Name: Advanced Ajax Search
 * Description: A custom Gutenberg block for Ajax search.
 * Version: 1.0
 * Author: Mohammad Zaid
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enqueue Block Script (React component)
function advanced_ajax_search_enqueue_block_editor_assets()
{
    wp_enqueue_script(
        'advanced-ajax-search-block',
        plugins_url('block.js', __FILE__), // Use block.js for the Gutenberg block
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        filemtime(plugin_dir_path(__FILE__) . 'block.js')
    );

    wp_enqueue_style(
        'advanced-ajax-search-editor-style',
        plugins_url('editor.css', __FILE__),
        array('wp-edit-blocks'),
        filemtime(plugin_dir_path(__FILE__) . 'editor.css')
    );
}
add_action('enqueue_block_editor_assets', 'advanced_ajax_search_enqueue_block_editor_assets');


// Enqueue Frontend Script
function advanced_ajax_search_enqueue_frontend_assets()
{
    wp_enqueue_script(
        'advanced-ajax-search-frontend',
        plugins_url('frontend.js', __FILE__),
        array('jquery'),
        filemtime(plugin_dir_path(__FILE__) . 'frontend.js'),
        true
    );

    wp_localize_script(
        'advanced-ajax-search-frontend',
        'ajax_object',
        array('ajax_url' => admin_url('admin-ajax.php'))
    );
}
add_action('wp_enqueue_scripts', 'advanced_ajax_search_enqueue_frontend_assets');

function pre($arr, $die = false)
{
    echo '<pre>';
    print_r($arr);
    echo '</pre>';
    if ($die) {
        die("KILL !!");
    }
}
add_action('wp_ajax_advanced_ajax_search', 'advanced_ajax_search_callback');
add_action('wp_ajax_nopriv_advanced_ajax_search', 'advanced_ajax_search_callback');

function advanced_ajax_search_callback() {
    $query = sanitize_text_field($_POST['query']);
    
    // Get the search options as JSON string
    $search_options_json = isset($_POST['search_options']) ? $_POST['search_options'] : '';
    $search_options_json = stripslashes($search_options_json);

    // Debug: Print the raw JSON string
    error_log('Raw JSON: ' . $search_options_json);

    // Decode JSON string to PHP array
    $search_options = json_decode($search_options_json, true);

    // Debug: Print the decoded JSON array
    error_log('Decoded JSON: ' . print_r($search_options, true));

    // Ensure we have a valid array after decoding
    if (!is_array($search_options)) {
        echo 'Error decoding JSON: ' . json_last_error_msg();
        wp_die();
    }

    // Extract desired data
    $search_options_data = array();
    foreach ($search_options as $key => $value) {
        if ($value === true) {
            $search_options_data[$key] = $value;
        }
    }

    // Debug: Print the filtered search options
    error_log('Filtered Search Options: ' . print_r($search_options_data, true));

    // Perform a search query based on the selected options
    $search_results = array();

    if (isset($search_options_data['posts']) && $search_options_data['posts'] === true) {
        $post_results = new WP_Query(
            array(
                'post_type' => 'post',
                's' => $query,
            )
        );
        if ($post_results->have_posts()) {
            while ($post_results->have_posts()) {
                $post_results->the_post();
                $search_results[] = array(
                    'title' => get_the_title(),
                    'link' => get_permalink(),
                    // 'icon' => $icon_url,
                );
            }
        }
    }

    if (isset($search_options_data['taxonomies']) && $search_options_data['taxonomies'] === true) {
        $taxonomy_results = new WP_Query(
            array(
                'post_type' => 'post',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'category',
                        'field' => 'name', // You can use 'name', 'slug', or 'term_id'
                        'terms' => $query,
                    ),
                ),
            )
        );
        if ($taxonomy_results->have_posts()) {
            while ($taxonomy_results->have_posts()) {
                $taxonomy_results->the_post();
                $search_results[] = array(
                    'title' => get_the_title(),
                    'link' => get_permalink(),
                    // 'icon' => $icon_url,
                );
            }
        }
    }

    if (isset($search_options_data['pages']) && $search_options_data['pages'] === true) {
        $page_results = new WP_Query(
            array(
                'post_type' => 'page',
                's' => $query,
            )
        );
        if ($page_results->have_posts()) {
            while ($page_results->have_posts()) {
                $page_results->the_post();
                $search_results[] = array(
                    'title' => get_the_title(),
                    'link' => get_permalink(),
                    // 'icon' => $icon_url,
                );
            }
        }
    }

    if (isset($search_options_data['products']) && $search_options_data['products'] === true) {
        // Replace 'product' with the name of your WooCommerce product post type
        $product_results = new WP_Query(
            array(
                'post_type' => 'product',
                's' => $query,
            )
        );
        if ($product_results->have_posts()) {
            while ($product_results->have_posts()) {
                $product_results->the_post();
                $search_results[] = array(
                    'title' => get_the_title(),
                    'link' => get_permalink(),
                    // 'icon' => $icon_url,
                );
            }
        }
    }

    // Construct and output the search results
    if (!empty($search_results)) {
        foreach ($search_results as $result) {
            echo '<div class="search-result">';
            echo '<a href="' . esc_url($result['link']) . '">' . esc_html($result['title']) . '</a>';
            echo '</div>';
        }
    } else {
        echo 'No results found.';
    }

    wp_die();
}
