( function( blocks, editor, element, components, i18n ) {
    var el = element.createElement;
    var InspectorControls = editor.InspectorControls;
    var CheckboxControl = components.CheckboxControl;
    var TextControl = components.TextControl;
    var PanelBody = components.PanelBody;
    var __ = i18n.__ || wp.i18n.__; // Fallback to wp.i18n.__ if i18n.__ is not defined

    var registerBlockType = blocks.registerBlockType;

    registerBlockType( 'advanced-ajax-search/block', {
        title: __( 'Advanced Ajax Search', 'advanced-ajax-search' ),
        icon: 'search',
        category: 'widgets',
        attributes: {
            icon: {
                type: 'string',
                default: '🔍'
            },
            height: {
                type: 'string',
                default: '40px'
            },
            query: {
                type: 'string',
                default: ''
            },
            searchOptions: {
                type: 'object',
                default: {
                    posts: true,
                    taxonomies: false,
                    pages: false,
                    products: false
                }
            }
        },
        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            function onChangeIcon( newIcon ) {
                setAttributes( { icon: newIcon } );
            }

            function onChangeHeight( newHeight ) {
                setAttributes( { height: newHeight } );
            }

            function onChangeSearchOptions( newOptions ) {
                setAttributes( { searchOptions: newOptions } );
            }

            function performSearch(event) {
                var searchQuery = event.target.value;
                var searchOptions = attributes.searchOptions;
                var searchData = {
                    query: searchQuery,
                    search_options: searchOptions,
                    icon: {
                        id: attributes.icon
                    }
                };

                // Send AJAX request to the server to perform the search
                wp.ajax.post( 'advanced_ajax_search', searchData ).done( function( response ) {
                    // Handle the search results here
                    var searchResultsContainer = document.querySelector( '.advanced-ajax-search-results' );
                    if ( response ) {
                        searchResultsContainer.innerHTML = response;
                    } else {
                        searchResultsContainer.innerHTML = 'No results found.';
                    }
                }).fail( function() {
                    // Handle the error if the AJAX request fails
                    var searchResultsContainer = document.querySelector( '.advanced-ajax-search-results' );
                    searchResultsContainer.innerHTML = 'An error occurred while processing your request.';
                });
            }

            return [
                el( InspectorControls, { key: 'inspector' },
                    el( PanelBody, { title: __( 'Settings', 'advanced-ajax-search' ), initialOpen: true },
                        el( TextControl, {
                            label: __( 'Search Icon', 'advanced-ajax-search' ),
                            value: attributes.icon,
                            onChange: onChangeIcon
                        } ),
                        el( TextControl, {
                            label: __( 'Search Bar Height', 'advanced-ajax-search' ),
                            value: attributes.height,
                            onChange: onChangeHeight
                        } ),
                        el( 'h3', {}, __('Search Options') ), // Heading for Search Options
                        el( CheckboxControl, {
                            label: __( 'Posts', 'advanced-ajax-search' ),
                            checked: attributes.searchOptions.posts,
                            onChange: ( value ) => onChangeSearchOptions( { ...attributes.searchOptions, posts: value } )
                        } ),
                        el( CheckboxControl, {
                            label: __( 'Taxonomies', 'advanced-ajax-search' ),
                            checked: attributes.searchOptions.taxonomies,
                            onChange: ( value ) => onChangeSearchOptions( { ...attributes.searchOptions, taxonomies: value } )
                        } ),
                        el( CheckboxControl, {
                            label: __( 'Pages', 'advanced-ajax-search' ),
                            checked: attributes.searchOptions.pages,
                            onChange: ( value ) => onChangeSearchOptions( { ...attributes.searchOptions, pages: value } )
                        } ),
                        el( CheckboxControl, {
                            label: __( 'Products', 'advanced-ajax-search' ),
                            checked: attributes.searchOptions.products,
                            onChange: ( value ) => onChangeSearchOptions( { ...attributes.searchOptions, products: value } )
                        } )
                    )
                ),
                el( 'div', { 
                    className: 'advanced-ajax-search-block', 
                    'data-search-options': JSON.stringify(attributes.searchOptions),
                    'data-icon': attributes.icon
                },
                    el( 'div', { style: { height: attributes.height, display: 'flex', alignItems: 'center', border: '1px solid #ddd', padding: '5px' } },
                        el( 'span', { style: { marginRight: '10px' } }, attributes.icon ),
                        el( 'input', { type: 'text', value: attributes.query, placeholder: __( 'Search...', 'advanced-ajax-search' ), style: { flex: '1', height: '100%' }, onInput: performSearch } )
                    ),
                    el( 'div', { className: 'advanced-ajax-search-results' } )
                )
            ];
        },        
        save: function( props ) {
            var attributes = props.attributes;
            return el( 'div', { 
                className: 'advanced-ajax-search-block',
                'data-search-options': JSON.stringify(attributes.searchOptions),
                'data-icon': attributes.icon
            },
                el( 'div', { style: { height: attributes.height, display: 'flex', alignItems: 'center', border: '1px solid #ddd', padding: '5px' } },
                    el( 'span', { style: { marginRight: '10px' } }, attributes.icon ),
                    el( 'input', { type: 'text', value: attributes.query, placeholder: __( 'Search...', 'advanced-ajax-search' ), style: { flex: '1', height: '100%' } } )
                ),
                el( 'div', { className: 'advanced-ajax-search-results' } )
            );
        }
    } );
} )( window.wp.blocks, window.wp.editor, window.wp.element, window.wp.components, window.wp.i18n );
