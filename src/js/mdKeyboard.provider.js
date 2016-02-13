angular
    .module('mdKeyboard')
    .provider('$mdKeyboardProvider', MdKeyboardProvider);

function MdKeyboardProvider(keyboardLayouts, keyboardDeadkey, keyboardSymbols, keyboardNumpad) {
    // how fast we need to flick down to close the sheet, pixels/ms
    var CLOSING_VELOCITY = 0.5;
    var PADDING = 80; // same as css

    return keyboardProvider = {
        themable: true,
        onShow: onShow,
        onRemove: onRemove,
        clickOutsideToClose: true,
        disableParentScroll: true,

        layouts: keyboardLayouts,
        deadkey: keyboardDeadkey,
        symbols: keyboardSymbols,
        numpad: keyboardNumpad,
        layout: 'US International',

        setNonce: function(nonceValue) {
            nonce = nonceValue;
        },
        setDefaultTheme: function(theme) {
            defaultTheme = theme;
        },
        alwaysWatchTheme: function(alwaysWatch) {
            alwaysWatchTheme = alwaysWatch;
        },
        generateThemesOnDemand: function(onDemand) {
            generateOnDemand = onDemand;
        },
        $get: function () {}
    };

    function onShow(scope, element, options, controller) {

        element = $mdUtil.extractElementByName(element, 'md-keyboard');

        if (options.clickOutsideToClose) {
            backdrop.on('click', function () {
                $mdUtil.nextTick($mdKeyboard.cancel, true);
            });
        }

        $mdTheming.inherit(backdrop, options.parent);

        var keyboard = new Keyboard(element, options.parent);
        options.keyboard = keyboard;

        $mdTheming.inherit(keyboard.element, options.parent);

        if (options.disableParentScroll) {
            options.restoreScroll = $mdUtil.disableScrollAround(keyboard.element, options.parent);
        }

        return $animate.enter(keyboard.element, options.parent)
            .then(function () {
                var focusable = $mdUtil.findFocusTarget(element) || angular.element(
                        element[0].querySelector('button') ||
                        element[0].querySelector('a') ||
                        element[0].querySelector('[ng-click]')
                    );
                focusable.focus();

                if (options.escapeToClose) {
                    options.rootElementKeyupCallback = function (e) {
                        if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
                            $mdUtil.nextTick($mdKeyboard.cancel, true);
                        }
                    };
                    $rootElement.on('keyup', options.rootElementKeyupCallback);
                }
            });

    }

    function onRemove(scope, element, options) {

        var keyboard = options.keyboard;

        $animate.leave(backdrop);
        return $animate.leave(keyboard.element).then(function () {
            if (options.disableParentScroll) {
                options.restoreScroll();
                delete options.restoreScroll;
            }

            keyboard.cleanup();
        });
    }

    /**
     * Keyboard class to apply bottom-sheet behavior to an element
     */
    function Keyboard(element, parent) {
        var deregister = $mdGesture.register(parent, 'drag', {horizontal: false});
        parent
            .on('$md.dragstart', onDragStart)
            .on('$md.drag', onDrag)
            .on('$md.dragend', onDragEnd);

        return {
            element: element,
            cleanup: function cleanup() {
                deregister();
                parent.off('$md.dragstart', onDragStart);
                parent.off('$md.drag', onDrag);
                parent.off('$md.dragend', onDragEnd);
            }
        };

        function onDragStart(ev) {
            // Disable transitions on transform so that it feels fast
            element.css($mdConstant.CSS.TRANSITION_DURATION, '0ms');
        }

        function onDrag(ev) {
            var transform = ev.pointer.distanceY;
            if (transform < 5) {
                // Slow down drag when trying to drag up, and stop after PADDING
                transform = Math.max(-PADDING, transform / 2);
            }
            element.css($mdConstant.CSS.TRANSFORM, 'translate3d(0,' + (PADDING + transform) + 'px,0)');
        }

        function onDragEnd(ev) {
            if (ev.pointer.distanceY > 0 &&
                (ev.pointer.distanceY > 20 || Math.abs(ev.pointer.velocityY) > CLOSING_VELOCITY)) {
                var distanceRemaining = element.prop('offsetHeight') - ev.pointer.distanceY;
                var transitionDuration = Math.min(distanceRemaining / ev.pointer.velocityY * 0.75, 500);
                element.css($mdConstant.CSS.TRANSITION_DURATION, transitionDuration + 'ms');
                $mdUtil.nextTick($mdKeyboard.cancel, true);
            } else {
                element.css($mdConstant.CSS.TRANSITION_DURATION, '');
                element.css($mdConstant.CSS.TRANSFORM, '');
            }
        }
    }
}
