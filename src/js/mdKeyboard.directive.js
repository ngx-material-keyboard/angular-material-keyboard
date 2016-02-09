angular
    .module('mdKeyboard')
    .directive('mdKeyboard', MdKeyboardDirective);

function MdKeyboardDirective($injector, $animate, $mdConstant, $mdUtil, $mdTheming, $mdBottomSheet, $rootElement, $mdGesture) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            clickOutsideToClose: '=',
            escapeToClose: '=',
            preserveScope: '=',
            showInMobile: '=',
            useBackdrop: '='
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }

            var bottomSheet;

            // Don't show virtual keyboard in mobile devices (default)
            //TODO: test detection and reimplement if neccessary
            //TODO: dissolve dependency to UAParser if possible / use angular or material utils
            if ($injector.has('UAParser')) {
                var UAParser = $injector.get('UAParser');
                var results = new UAParser().getResult();
                var isMobile = results.device.type === 'mobile' || results.device.type === 'tablet';
                isMobile = isMobile || (results.os && (results.os.name === 'Android'));
                isMobile = isMobile || (results.os && (results.os.name === 'iOS'));
                isMobile = isMobile || (results.os && (results.os.name === 'Windows Phone'));
                isMobile = isMobile || (results.os && (results.os.name === 'Windows Mobile'));
                if (isMobile && attrs.showInMobile !== true) {
                    return;
                }
            }

            /*
             ngVirtualKeyboardService.attach(elements[0], scope.config, function() {
             $timeout(function() {
             ngModelCtrl.$setViewValue(elements[0].value);
             });
             });
             */

            // open bottomsheet with keyboard on focus TODO: and without backdrop
            element
                .bind('focus', showKeyboard)
                .bind('blur', hideKeyboard);

            function showKeyboard() {
                bottomSheet = $mdBottomSheet.show({
                    templateUrl: '../view/mdKeyboard.view.html',
                    controller: KeyboardController,
                    clickOutsideToClose: attrs.clickOutsideToClose || false,
                    escapeToClose: attrs.escapeToClose || false,
                    preserveScope: attrs.preserveScope || true,
                    useBackdrop: attrs.useBackdrop || false,
                    onShow: onShowKeyboard
                });
            }

            function hideKeyboard() {
                if (bottomSheet) {
                    $mdBottomSheet.hide();
                    bottomSheet = undefined;
                }
            }

            function onShowKeyboard(scope, element, options, controller) {
                $log.debug(element);
                element = $mdUtil.extractElementByName(element, 'md-bottom-sheet');

                // Add a backdrop that will close on click
                backdrop = $mdUtil.createBackdrop(scope, "md-bottom-sheet-backdrop md-opaque");

                if (options.clickOutsideToClose) {
                    backdrop.on('click', function () {
                        $mdUtil.nextTick($mdBottomSheet.cancel, true);
                    });
                }

                $mdTheming.inherit(backdrop, options.parent);

                $animate.enter(backdrop, options.parent, null);

                var bottomSheet = new BottomSheet(element, options.parent);
                options.bottomSheet = bottomSheet;

                $mdTheming.inherit(bottomSheet.element, options.parent);

                if (options.disableParentScroll) {
                    options.restoreScroll = $mdUtil.disableScrollAround(bottomSheet.element, options.parent);
                }

                return $animate
                    .enter(bottomSheet.element, options.parent)
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
                                    $mdUtil.nextTick($mdBottomSheet.cancel, true);
                                }
                            };
                            $rootElement.on('keyup', options.rootElementKeyupCallback);
                        }
                    });
            }

            function KeyboardController($scope, $log, mdKeyboard) {
                //element.blur();
                //element.focus();

                $scope.keyboard = mdKeyboard.getLayout();
                $scope.pressed = function ($event) {
                    $log.debug($event);
                }
            }

            // When navigation force destroys an element, then
            // listen and hide the keyboard...
            scope.$on('$destroy', function () {
                hideKeyboard();
            });
        }
    }
}
