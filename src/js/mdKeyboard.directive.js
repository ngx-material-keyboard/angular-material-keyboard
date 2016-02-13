angular
    .module('material.components.keyboard')
    .directive('mdKeyboard', MdKeyboardDirective)
    .directive('useKeyboard', useKeyboardDirective);

function MdKeyboardDirective($mdKeyboard, $mdTheming) {
    return {
        restrict: 'E',
        link: function postLink(scope, element, attr) {
            $mdTheming(element);
            // When navigation force destroys an interimElement, then
            // listen and $destroy() that interim instance...
            scope.$on('$destroy', function () {
                $mdKeyboard.destroy();
            });
        }
    };
}

function useKeyboardDirective($mdKeyboard, $injector) {
    return {
        restrict: 'A',
        require: '?ngModel',
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

            // open keyboard on focus
            element
                .bind('focus', showKeyboard)
                .bind('blur', hideKeyboard);

            function showKeyboard() {
                keyboard = $mdKeyboard.show({
                    templateUrl: '../view/mdKeyboard.view.html',
                    controller: function mdKeyboardCtrl($scope) {
                        this.resolve = function () {
                            $mdKeyboard.hide('ok');
                        };
                        if (attrs.useKeyboard) {
                            $mdKeyboard.setLayout(attrs.useKeyboard);
                        }
                        $scope.keyboard = $mdKeyboard.getLayout();
                        $scope.pressed = function ($event) {
                            $event.preventDefault();
                            console.log($event);
                        }
                    },
                    bindToController: true
                });
            }

            function hideKeyboard() {
                if (keyboard) {
                    $mdKeyboard.hide();
                    keyboard = undefined;
                }
            }
        }
    }
}
