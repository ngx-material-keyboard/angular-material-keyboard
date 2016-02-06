/**
 * angular-material-keyboard
 * Onscreen virtual keyboard for Angular (https://angularjs.org/) using Material (https://material.angularjs.org/)inspired by the Angular Virtual Keyboard by the-darc (https://github.com/the-darc/angular-virtual-keyboard).
 * @version v0.0.1
 * @author David Enke <postdavidenke.de>
 * @link https://github.com/davidenke/angular-material-keyboard
 * @license MIT
 */
(function (angular) {

angular
    .module('mdKeyboard', ['material.components.bottomSheet'])
    .directive('mdKeyboard', MdKeyboardDirective)
    .provider('$mdKeyboard', MdKeyboardProvider);


function MdKeyboardDirective($mdKeyboard, $mdBottomSheet, $timeout, $injector, $log) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            clickOutsideToClose: '=',
            preserveScope: '=',
            showInMobile: '='
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }

            var bottomSheet;

            // Don't show virtual keyboard in mobile devices (default)
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

            $log.debug(attrs);
            element
                .bind('focus', showKeyboard)
                .bind('blur', hideKeyboard);

            function showKeyboard() {
                $log.info('showKeyboard');
                bottomSheet = $mdBottomSheet
                    .show({
                        template: '<md-bottom-sheet class="md-grid"  layout="column" ng-cloak>{{keyboard}}</md-bottom-sheet>',
                        controller: KeyboardController,
                        clickOutsideToClose: attrs.clickOutsideToClose || false,
                        preserveScope: attrs.preserveScope || true
                    })
                    .then(function () {

                    });
            }

            function hideKeyboard() {
                $log.info('hideKeyboard');
                if (bottomSheet) {
                    $mdBottomSheet.hide();
                    delete bottomSheet;
                }
            }

            function KeyboardController($scope, $mdBottomSheet) {
                $scope.keyboard = 'TEST';
            }
            scope.keyboard = 'test';

            // When navigation force destroys an interimElement, then
            // listen and $destroy() that interim instance...
            scope.$on('$destroy', function () {
                $mdKeyboard.destroy();
            });
        }
    };
}

function MdKeyboardProvider($$interimElementProvider) {
    return $$interimElementProvider('$mdKeyboard')
        .setDefaults({
            options: keyboardDefaults
        });

    function keyboardDefaults() {
        return {
            themable: true,
            layout: defaultLayout
        };

        function defaultLayout() {
            // get default language
            return 'en-us';
        }
    }
}

})(angular);
