(function($, viewport){
    $(document).ready(function() {
        var visibilityDivs = {
            'xs': $('<div class="d-xs-block d-sm-none d-md-none d-lg-none d-xl-none"></div>'),
            'sm': $('<div class="d-none d-sm-block d-md-none d-lg-none d-xl-none"></div>'),
            'md': $('<div class="d-none d-md-block d-sm-none d-lg-none d-xl-none"></div>'),
            'lg': $('<div class="d-none d-lg-block d-sm-none d-md-none d-xl-none"></div>'),
            'xl': $('<div class="d-none d-xl-block d-sm-none d-md-none d-lg-none"></div>'),
        };
        viewport.use('custom', visibilityDivs);

        myInterval = setInterval(checkForSize, 1000);

        function checkForSize() {
            if (viewport.current() != 'unrecognized') {
                $('html').removeClass().addClass(viewport.current());
                console.log('Current breakpoint: ', viewport.current());
                clearInterval(myInterval);
            }
        }
    });

    $(window).resize(
        viewport.changed(function() {
            console.log('Current breakpoint: ', viewport.current());
            $('html').removeClass().addClass(viewport.current());
        })
    );

})(jQuery, ResponsiveBootstrapToolkit);
