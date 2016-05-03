angular
    .module('material.components.keyboard')
    .provider('$mdKeyboard', MdKeyboardProvider);

function MdKeyboardProvider($$interimElementProvider, $injector, keyboardLayouts, keyboardDeadkey, keyboardSymbols, keyboardNumpad) {
    // how fast we need to flick down to close the sheet, pixels/ms
    var SCOPE;
    var CLOSING_VELOCITY = 0.5;
    var PADDING = 80; // same as css
    var LAYOUT = 'US International';
    var LAYOUTS = keyboardLayouts;
    var DEADKEY = keyboardDeadkey;
    var SYMBOLS = keyboardSymbols;
    var NUMPAD = keyboardNumpad;
    var VISIBLE = false;

    var $mdKeyboard = $$interimElementProvider('$mdKeyboard')
        .setDefaults({
            methods: ['themable', 'disableParentScroll', 'clickOutsideToClose', 'layout'],
            options: keyboardDefaults
        })
        .addMethod('getLayout', getLayout)
        .addMethod('getLayouts', getLayouts)
        .addMethod('useLayout', useLayout)
        .addMethod('addLayout', addLayout)
        .addMethod('isVisible', isVisible);

    // should be available in provider (config phase) not only
    // in service as defined in $$interimElementProvider
    $mdKeyboard.getLayout = getLayout;
    $mdKeyboard.getLayouts = getLayouts;
    $mdKeyboard.useLayout = useLayout;
    $mdKeyboard.addLayout = addLayout;
    $mdKeyboard.isVisible = isVisible;

    // get currently used layout object
    function getLayout() {
        return LAYOUTS[LAYOUT];
    }

    // get names of available layouts
    function getLayouts() {
        var layouts = [];
        angular.forEach(LAYOUTS, function (obj, layout) {
            layouts.push(layout);
        });
        return layouts;
    }

    // set name of layout to use
    function useLayout(layout) {
        if (LAYOUTS[layout]) {
            LAYOUT = layout;
            if (SCOPE) {
                SCOPE.$broadcast('$mdKeyboardLayoutChanged', layout);
            }
            //console.log($injector.get('$rootScope'), $injector.get('$scope'));
            //$rootScope = $injector.get('$rootScope');
            //$rootScope.$broadcast('$mdKeyboardLayoutChanged', layout);
        } else {
            var msg = "" +
                "The keyboard layout '" + layout + "' does not exists. \n" +
                "To get a list of the available layouts use 'showLayouts'.";
            console.warn(msg);
        }
    }

    // add a custom layout
    function addLayout(layout, keys) {
        if (!LAYOUTS[layout]) {
            LAYOUTS[layout] = keys;
        } else {
            var msg = "" +
                "The keyboard layout '" + layout + "' already exists. \n" +
                "Please use a different name.";
            console.warn(msg);
        }
    }

    // return if keyboard is visible
    function isVisible() {
        return VISIBLE;
    }

    return $mdKeyboard;

    /* @ngInject */
    function keyboardDefaults($animate, $mdConstant, $mdUtil, $mdTheming, $mdKeyboard, $rootElement, $mdGesture) {

        return {
            onShow: onShow,
            onRemove: onRemove,

            themable: true,
            disableParentScroll: true,
            clickOutsideToClose: true,
            layout: LAYOUT,
            layouts: LAYOUTS,
            deadkey: DEADKEY,
            symbols: SYMBOLS,
            numpad: NUMPAD
        };

        function onShow(scope, element, options, controller) {

            //if (options.clickOutsideToClose) {
            //    document.body.on('click', function () {
            //        $mdUtil.nextTick($mdKeyboard.cancel, true);
            //    });
            //}

            var keyboard = new Keyboard(element, options.parent);
            options.keyboard = keyboard;
            options.parent.prepend(keyboard.element);

            SCOPE = scope;
            VISIBLE = true;

            $mdTheming.inherit(keyboard.element, options.parent);

            if (options.disableParentScroll) {
                options.restoreScroll = $mdUtil.disableScrollAround(keyboard.element, options.parent);
            }

            return $animate
                .enter(keyboard.element, options.parent)
                .then(function () {
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

            return $animate
                .leave(keyboard.element)
                .then(function () {
                    VISIBLE = false;

                    if (options.disableParentScroll) {
                        options.restoreScroll();
                        delete options.restoreScroll;
                    }

                    keyboard.cleanup();
                });
        }

        /**
         * Keyboard class to apply keyboard behavior to an element
         */
        function Keyboard(element, parent) {
            var deregister = $mdGesture.register(parent, 'drag', {horizontal: false});

            element
                .on('mousedown', onMouseDown);
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
                    parent.triggerHandler('focus');
                }
            };

            function onMouseDown(ev) {
                ev.preventDefault();
            }

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
}
