angular
    .module('mdKeyboard')
    .directive('mdKeyboard', MdKeyboardDirective);

function MdKeyboardDirective($injector, $animate, $mdConstant, $mdUtil, $mdTheming, $mdKeyboardProvider, $rootElement, $mdGesture) {
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

            var keyboard;

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
                /*.bind('blur', hideKeyboard)*/;

            function showKeyboard() {
                keyboard = $mdKeyboardProvider.show({
                    templateUrl: '../view/mdKeyboard.view.html',
                    controller: KeyboardController,
                    clickOutsideToClose: attrs.clickOutsideToClose || false,
                    escapeToClose: attrs.escapeToClose || false,
                    preserveScope: attrs.preserveScope || true,
                    useBackdrop: attrs.useBackdrop || false
                });
            }

            function hideKeyboard() {
                if (keyboard) {
                    $mdKeyboardProvider.hide();
                    keyboard = undefined;
                }
            }

            function KeyboardController($scope, $log, mdKeyboard) {
                //$log.debug(mdKeyboard, element);
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

            // When navigation force destroys an interimElement, then
            // listen and $destroy() that interim instance...
            scope.$on('$destroy', function () {
                $mdKeyboardProvider.destroy();
            });
        }
    }
}
