/*!
 * windows: a handy, loosely-coupled jQuery plugin for full-screen scrolling windows.
 * Version: 0.0.1
 * Original author: @nick-jonas
 * Website: http://www.workofjonas.com
 * Licensed under the MIT license
 */

;(function ( $, window, document, undefined ) {


var that = this,
        pluginName = 'windows',
        defaults = {
            snapping: true,
            snapSpeed: 500,
            snapInterval: 1100,
            onScroll: function(){},
            onSnapComplete: function(){},
            onWindowEnter: function(){}
        },
        options = {},
        $w = $(window),
        s = 0, // scroll amount
        t = null, // timeout
        $windows = [];

    /**
     * Constructor
     * @param {jQuery Object} element       main jQuery object
     * @param {Object} customOptions        options to override defaults
     */
    function windows( element, customOptions ) {

        this.element = element;
        options = options = $.extend( {}, defaults, customOptions) ;
        this._defaults = defaults;
        this._name = pluginName;
        $windows.push(element);
        var isOnScreen = $(element).isOnScreen();
        $(element).data('onScreen', isOnScreen);
        if(isOnScreen) options.onWindowEnter($(element));

    }

    /**
     * Get ratio of element's visibility on screen
     * @return {Number} ratio 0-1
     */
    $.fn.ratioVisible = function(){
        var s = $w.scrollTop();
        if(!this.isOnScreen()) return 0;
        var curPos = this.offset();
        var curTop = curPos.top - s;
        var screenHeight = $w.height();
        var ratio = (curTop + screenHeight) / screenHeight;
        if(ratio > 1) ratio = 1 - (ratio - 1);
        return ratio;
    };

    /**
     * Is section currently on screen?
     * @return {Boolean}
     */
    $.fn.isOnScreen = function(){
        var s = $w.scrollTop(),
            screenHeight = $w.height(),
            curPos = this.offset(),
            curTop = curPos.top - s;
        return (curTop >= screenHeight || curTop <= -screenHeight) ? false : true;
    };

    /**
     * Get section that is mostly visible on screen
     * @return {jQuery el}
     */
    var _getCurrentWindow = $.fn.getCurrentWindow = function(){
        var maxPerc = 0,
            maxElem = $windows[0];
        $.each($windows, function(i){
            var perc = $(this).ratioVisible();
            if(Math.abs(perc) > Math.abs(maxPerc)){
                maxElem = $(this);
                maxPerc = perc;
            }
        });
        return $(maxElem);
    };


    // PRIVATE API ----------------------------------------------------------

    /**
     * Window scroll event handler
     * @return null
     */
    var _onScroll = function(){
        s = $w.scrollTop();

        _snapWindow();

        options.onScroll(s);

        // notify on new window entering
        $.each($windows, function(i){
            var $this = $(this),
                isOnScreen = $this.isOnScreen();
            if(isOnScreen){
                if(!$this.data('onScreen')) options.onWindowEnter($this);
            }
            $this.data('onScreen', isOnScreen);
        });
    };

    var _onResize = function(){
        _snapWindow();
    };

    var _snapWindow = function(){
        // clear timeout if exists
        if(t){clearTimeout(t);}
        // check for when user has stopped scrolling, & do stuff
        if(options.snapping){
            t = setTimeout(function(){
                var $visibleWindow = _getCurrentWindow(), // visible window
                    scrollTo = $visibleWindow.offset().top, // top of visible window
                    completeCalled = false;
                // animate to top of visible window
                $('html:not(:animated),body:not(:animated)').animate({scrollTop: scrollTo }, options.snapSpeed, function(){
                    if(!completeCalled){
                        if(t){clearTimeout(t);}
                        t = null;
                        completeCalled = true;
                        options.onSnapComplete($visibleWindow);
                    }
                });
            }, options.snapInterval);
        }
    };


    /**
     * A really lightweight plugin wrapper around the constructor,
        preventing against multiple instantiations
     * @param  {Object} options
     * @return {jQuery Object}
     */
    $.fn[pluginName] = function ( options ) {

        $w.scroll(_onScroll);
        $w.resize(_onResize);

        return this.each(function(i) {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new windows( this, options ));
            }
        });
    };
    

})( jQuery, window, document );

jQuery(document).ready(function() {
    var offset = 220;
    var duration = 500;
    jQuery(window).scroll(function() {
        if (jQuery(this).scrollTop() > offset) {
            jQuery('.back-to-top').fadeIn(duration);
        } else {
            jQuery('.back-to-top').fadeOut(duration);
        }
    });
    
    jQuery('.back-to-top').click(function(event) {
        event.preventDefault();
        jQuery('html, body').animate({scrollTop: 0}, duration);
        return false;
    })
});


$(function() {

    var $sidebar   = $("#sidebar"), 
        $window    = $(window),
        offset     = $sidebar.offset(),
        topPadding = 5;

    $window.scroll(function() {
        if ($window.scrollTop() > offset.top) {
            $sidebar.stop().animate({
                marginTop: $window.scrollTop() - offset.top + topPadding
            });
        } else {
            $sidebar.stop().animate({
                marginTop: 0
            });
        }
    });
    
});

window.smoothScroll = (function (window, document, undefined) {

    'use strict';

    // Default settings
    // Private {object} variable
    var _defaults = {
        speed: 500,
        easing: 'easeInOutCubic',
        updateURL: false,
        callbackBefore: function () {},
        callbackAfter: function () {}
    };

    // Merge default settings with user options
    // Private method
    // Returns an {object}
    var _mergeObjects = function ( original, updates ) {
        for (var key in updates) {
            original[key] = updates[key];
        }
        return original;
    };

    // Calculate the easing pattern
    // Private method
    // Returns a decimal number
    var _easingPattern = function ( type, time ) {
        if ( type == 'easeInQuad' ) return time * time; // accelerating from zero velocity
        if ( type == 'easeOutQuad' ) return time * (2 - time); // decelerating to zero velocity
        if ( type == 'easeInOutQuad' ) return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time; // acceleration until halfway, then deceleration
        if ( type == 'easeInCubic' ) return time * time * time; // accelerating from zero velocity
        if ( type == 'easeOutCubic' ) return (--time) * time * time + 1; // decelerating to zero velocity
        if ( type == 'easeInOutCubic' ) return time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // acceleration until halfway, then deceleration
        if ( type == 'easeInQuart' ) return time * time * time * time; // accelerating from zero velocity
        if ( type == 'easeOutQuart' ) return 1 - (--time) * time * time * time; // decelerating to zero velocity
        if ( type == 'easeInOutQuart' ) return time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time; // acceleration until halfway, then deceleration
        if ( type == 'easeInQuint' ) return time * time * time * time * time; // accelerating from zero velocity
        if ( type == 'easeOutQuint' ) return 1 + (--time) * time * time * time * time; // decelerating to zero velocity
        if ( type == 'easeInOutQuint' ) return time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time; // acceleration until halfway, then deceleration
        return time; // no easing, no acceleration
    };

    // Calculate how far to scroll
    // Private method
    // Returns an integer
    var _getEndLocation = function ( anchor, headerHeight ) {
        var location = 0;
        if (anchor.offsetParent) {
            do {
                location += anchor.offsetTop;
                anchor = anchor.offsetParent;
            } while (anchor);
        }
        location = location - headerHeight;
        if ( location >= 0 ) {
            return location;
        } else {
            return 0;
        }
    };

    // Convert data-options attribute into an object of key/value pairs
    // Private method
    // Returns an {object}
    var _getDataOptions = function ( options ) {

        if ( options === null || options === undefined  ) {
            return {};
        } else {
            var settings = {}; // Create settings object
            options = options.split(';'); // Split into array of options

            // Create a key/value pair for each setting
            options.forEach( function(option) {
                option = option.trim();
                if ( option !== '' ) {
                    option = option.split(':');
                    settings[option[0]] = option[1].trim();
                }
            });

            return settings;
        }

    };

    // Update the URL
    // Private method
    // Runs functions
    var _updateURL = function ( anchor, url ) {
        if ( (url === true || url === 'true') && history.pushState ) {
            history.pushState( {pos:anchor.id}, '', anchor );
        }
    };

    // Start/stop the scrolling animation
    // Public method
    // Runs functions
    var animateScroll = function ( toggle, anchor, options, event ) {

        // Options and overrides
        options = _mergeObjects( _defaults, options || {} ); // Merge user options with defaults
        var overrides = _getDataOptions( toggle ? toggle.getAttribute('data-options') : null );
        var speed = overrides.speed || options.speed;
        var easing = overrides.easing || options.easing;
        var updateURL = overrides.updateURL || options.updateURL;

        // Selectors and variables
        var fixedHeader = document.querySelector('[data-scroll-header]'); // Get the fixed header
        var headerHeight = fixedHeader === null ? 0 : (fixedHeader.offsetHeight + fixedHeader.offsetTop); // Get the height of a fixed header if one exists
        var startLocation = window.pageYOffset; // Current location on the page
        var endLocation = _getEndLocation( document.querySelector(anchor), headerHeight ); // Scroll to location
        var animationInterval; // interval timer
        var distance = endLocation - startLocation; // distance to travel
        var timeLapsed = 0;
        var percentage, position;

        // Prevent default click event
        if ( toggle && toggle.tagName === 'A' && event ) {
            event.preventDefault();
        }

        // Update URL
        _updateURL(anchor, updateURL);

        // Stop the scroll animation when it reaches its target (or the bottom/top of page)
        // Private method
        // Runs functions
        var _stopAnimateScroll = function (position, endLocation, animationInterval) {
            var currentLocation = window.pageYOffset;
            if ( position == endLocation || currentLocation == endLocation || ( (window.innerHeight + currentLocation) >= document.body.scrollHeight ) ) {
                clearInterval(animationInterval);
                options.callbackAfter( toggle, anchor ); // Run callbacks after animation complete
            }
        };

        // Loop scrolling animation
        // Private method
        // Runs functions
        var _loopAnimateScroll = function () {
            timeLapsed += 16;
            percentage = ( timeLapsed / speed );
            percentage = ( percentage > 1 ) ? 1 : percentage;
            position = startLocation + ( distance * _easingPattern(easing, percentage) );
            window.scrollTo( 0, Math.floor(position) );
            _stopAnimateScroll(position, endLocation, animationInterval);
        };

        // Set interval timer
        // Private method
        // Runs functions
        var _startAnimateScroll = function () {
            options.callbackBefore( toggle, anchor ); // Run callbacks before animating scroll
            animationInterval = setInterval(_loopAnimateScroll, 16);
        };

        // Reset position to fix weird iOS bug
        // https://github.com/cferdinandi/smooth-scroll/issues/45
        if ( window.pageYOffset === 0 ) {
            window.scrollTo( 0, 0 );
        }

        // Start scrolling animation
        _startAnimateScroll();

    };

    // Initialize Smooth Scroll
    // Public method
    // Runs functions
    var init = function ( options ) {

        // Feature test before initializing
        if ( 'querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {

            // Selectors and variables
            options = _mergeObjects( _defaults, options || {} ); // Merge user options with defaults
            var toggles = document.querySelectorAll('[data-scroll]'); // Get smooth scroll toggles

            // When a toggle is clicked, run the click handler
            Array.prototype.forEach.call(toggles, function (toggle, index) {
                toggle.addEventListener('click', animateScroll.bind( null, toggle, toggle.getAttribute('href'), options ), false);
            });

        }

    };

    // Return public methods
    return {
        init: init,
        animateScroll: animateScroll
    };

})(window, document);

function fadeNav(){  
  var offset = getScrollXY();
  //if y offset is greater than 0, set opacity to desired value, otherwise set to 1
  offset[1] > 0 ? setNavOpacity(0.5) : setNavOpacity(1.0); 
}

function setNavOpacity(newOpacity){
  var navBar = document.getElementById("header_bar");
  navBar.style.opacity = newOpacity
}

function getScrollXY() {
  var scrOfX = 0, scrOfY = 0;
if( typeof( window.pageYOffset ) == 'number' ) {
  //Netscape compliant
  scrOfY = window.pageYOffset;
  scrOfX = window.pageXOffset;
} else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
  //DOM compliant
  scrOfY = document.body.scrollTop;
  scrOfX = document.body.scrollLeft;
} else if( document.documentElement && ( document.documentElement.scrollLeft ||     
  document.documentElement.scrollTop ) ) {
  //IE6 standards compliant mode
  scrOfY = document.documentElement.scrollTop;
  scrOfX = document.documentElement.scrollLeft;
}

  return [ scrOfX, scrOfY ];
}

