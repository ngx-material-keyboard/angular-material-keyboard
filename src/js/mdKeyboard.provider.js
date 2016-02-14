angular
    .module('material.components.keyboard')
    .provider('$mdKeyboard', MdKeyboardProvider);

function MdKeyboardProvider($$interimElementProvider, keyboardLayouts, keyboardDeadkey, keyboardSymbols, keyboardNumpad) {
    // how fast we need to flick down to close the sheet, pixels/ms
    var CLOSING_VELOCITY = 0.5;
    var PADDING = 80; // same as css
    var LAYOUT = 'US International';
    var LAYOUTS = keyboardLayouts;
    var DEADKEY = keyboardDeadkey;
    var SYMBOLS = keyboardSymbols;
    var NUMPAD = keyboardNumpad;

    return $$interimElementProvider('$mdKeyboard')
        .setDefaults({
            methods: ['themable', 'disableParentScroll', 'clickOutsideToClose', 'layout'],
            options: keyboardDefaults
        })
        .addMethod('getLayout', getLayout)
        .addMethod('setLayout', setLayout);

    function getLayout() {
        return LAYOUTS[LAYOUT];
    }

    function setLayout(layout) {
        if (LAYOUTS[LAYOUT]) {
            LAYOUT = layout;
        }
    }

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

            $mdTheming.inherit(keyboard.element, options.parent);

            if (options.disableParentScroll) {
                options.restoreScroll = $mdUtil.disableScrollAround(keyboard.element, options.parent);
            }

            return $animate.enter(keyboard.element, options.parent)
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

            return $animate.leave(keyboard.element).then(function () {
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
