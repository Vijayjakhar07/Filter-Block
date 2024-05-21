jQuery(document).ready(function($) {
    $(document).on('input', '.advanced-ajax-search-block input[type="text"]', function() {
        var searchQuery = $(this).val();
        var block = $(this).closest('.advanced-ajax-search-block');
        var searchOptions = block.data('search-options');
        
        // Convert searchOptions to JSON string
        var searchOptionsJson = JSON.stringify(searchOptions);

        $.ajax({
            url: ajax_object.ajax_url, // Use ajax_url from ajax_object
            type: 'POST',
            data: {
                action: 'advanced_ajax_search',
                query: searchQuery,
                search_options: searchOptionsJson // Pass searchOptions as JSON string
            },
            success: function(response) {
                $('.advanced-ajax-search-results').html(response);
            },
            error: function() {
                $('.advanced-ajax-search-results').html('An error occurred while processing your request.');
            }
        });
    });
});
