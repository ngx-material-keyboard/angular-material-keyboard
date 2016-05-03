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

function useKeyboardDirective($mdKeyboard, $injector, $timeout, $animate, $log, $rootScope) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            // requires ngModel silently
            if (!ngModelCtrl) {
                return;
            }

            // bind instance to that var
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
                if ($rootScope.keyboardTimeout) {
                    $timeout.cancel($rootScope.keyboardTimeout);
                }
                if ($rootScope.keyboardAnimation) {
                    $animate.cancel($rootScope.keyboardAnimation);
                }

                // no keyboard active, so add new
                if (!$mdKeyboard.isVisible()) {
                    $mdKeyboard.currentModel = ngModelCtrl;
                    $rootScope.keyboardAnimation = $mdKeyboard.show({
                        templateUrl: '../view/mdKeyboard.view.html',
                        controller: mdKeyboardController,
                        bindToController: true
                    });
                }

                // use existing keyboard
                else {
                    $mdKeyboard.currentModel = ngModelCtrl;
                    $mdKeyboard.useLayout(attrs.useKeyboard);
                }
            }

            function mdKeyboardController($scope) {
                if (attrs.useKeyboard) {
                    $mdKeyboard.useLayout(attrs.useKeyboard);
                }

                var toggleCaps = function () {
                    $scope.caps = !$scope.caps;
                };

                var toggleCapsLock = function () {
                    $scope.capsLocked = !$scope.capsLocked;
                };

                var getKeyClass = function (key) {
                    var k = key[0].toLowerCase();
                    var keys = ['bksp', 'tab', 'caps', 'enter', 'shift', 'alt', 'altgr', 'altlk'];

                    // space bar
                    if (k == ' ') {
                        k = 'space';
                    }
                    // special key
                    else if (keys.indexOf(k) < 0) {
                        k = 'char';
                    }
                    // spacer helper element
                    else if (k == 'spacer') {
                        return k;
                    }

                    return 'key-' + k;
                };

                var _init = function () {
                    $scope.resolve = function () {
                        $mdKeyboard.hide('ok');
                    };
                    $scope.getKeyClass = getKeyClass;
                    $scope.keyboard = $mdKeyboard.getLayout();
                    $scope.toggleCaps = toggleCaps;
                    $scope.toggleCapsLock = toggleCapsLock;
                    $scope.pressed = triggerKey;

                    $scope.$on('$mdKeyboardLayoutChanged', function () {
                        $scope.keyboard = $mdKeyboard.getLayout();
                        $scope.pressed = triggerKey;
                    });
                };

                _init();
            }

            function _getCaretPosition() {
                if ('selectionStart' in element) {
                    return element.selectionStart;
                } else if (document.selection) {
                    element.focus();
                    var sel = document.selection.createRange();
                    var selLen = document.selection.createRange().text.length;
                    sel.moveStart('character', -element.value.length);
                    return sel.text.length - selLen;
                }
            };

            function triggerKey($event, key) {
                $event.preventDefault();
                $log.info('key pressed: %s (%s)', key, key.charCodeAt(0));

                switch (key) {
                    case "Caps":
                    case "Shift":
                    case "Alt":
                    case "AltGr":
                    case "AltLk":
                        // modify input, visualize
                        //self.VKI_modify(type);
                        break;

                    case "Tab":
                        // TODO: handle text selection

                        // cycle through elements
                        // or insert \t tab
                        //if (self.VKI_activeTab) {
                        //    if (self.VKI_target.form) {
                        //        var target = self.VKI_target, elems = target.form.elements;
                        //        self.VKI_close(false);
                        //        for (var z = 0, me = false, j = -1; z < elems.length; z++) {
                        //            if (j == -1 && elems[z].getAttribute("VKI_attached")) j = z;
                        //            if (me) {
                        //                if (self.VKI_activeTab == 1 && elems[z]) break;
                        //                if (elems[z].getAttribute("VKI_attached")) break;
                        //            } else if (elems[z] == target) me = true;
                        //        }
                        //        if (z == elems.length) z = Math.max(j, 0);
                        //        if (elems[z].getAttribute("VKI_attached")) {
                        //            self.VKI_show(elems[z]);
                        //        } else elems[z].focus();
                        //    } else self.VKI_target.focus();
                        //} else self.VKI_insert("\t");
                        //return false;

                        $mdKeyboard.currentModel.$setViewValue(($mdKeyboard.currentModel.$viewValue || '') + "\t");
                        $mdKeyboard.currentModel.$validate();
                        $mdKeyboard.currentModel.$render();

                        break;

                    case "Bksp":
                        // TODO: handle text selection

                        // backspace
                        //self.VKI_target.focus();
                        //if (self.VKI_target.setSelectionRange && hasSelectionStartEnd(self.VKI_target) && !self.VKI_target.readOnly) {
                        //    var rng = [self.VKI_target.selectionStart, self.VKI_target.selectionEnd];
                        //    if (rng[0] < rng[1]) rng[0]++;
                        //    self.VKI_target.value = self.VKI_target.value.substr(0, rng[0] - 1) + self.VKI_target.value.substr(rng[1]);
                        //    self.VKI_target.setSelectionRange(rng[0] - 1, rng[0] - 1);
                        //} else if (self.VKI_target.createTextRange && !self.VKI_target.readOnly) {
                        //    try {
                        //        self.VKI_target.range.select();
                        //    } catch (e) {
                        //        self.VKI_target.range = document.selection.createRange();
                        //    }
                        //    if (!self.VKI_target.range.text.length) self.VKI_target.range.moveStart('character', -1);
                        //    self.VKI_target.range.text = "";
                        //} else self.VKI_target.value = self.VKI_target.value.substr(0, self.VKI_target.value.length - 1);
                        //if (self.VKI_shift) self.VKI_modify("Shift");
                        //if (self.VKI_altgr) self.VKI_modify("AltGr");
                        //self.VKI_target.focus();
                        //self.keyInputCallback();
                        //return true;

                        $mdKeyboard.currentModel.$setViewValue(($mdKeyboard.currentModel.$viewValue || '').slice(0, -1));
                        $mdKeyboard.currentModel.$validate();
                        $mdKeyboard.currentModel.$render();

                        break;

                    case "Enter":
                        if (element[0].nodeName.toUpperCase() != 'TEXTAREA') {
                            $timeout(function () {
                                angular.element(element[0].form).triggerHandler('submit');
                            });
                        } else {
                            $mdKeyboard.currentModel.$setViewValue(($mdKeyboard.currentModel.$viewValue || '') + "\n");
                            $mdKeyboard.currentModel.$validate();
                            $mdKeyboard.currentModel.$render();
                        }

                        break;

                    default:
                        // TODO: handle text selection

                        //$timeout(function () {
                        //var event = new window.KeyboardEvent('keypress', {
                        //    bubbles: true,
                        //    cancelable: true,
                        //    shiftKey: true,
                        //    keyCode: key.charCodeAt(0)
                        //});
                        // element[0].dispatchEvent(event);
                        //});

                        $mdKeyboard.currentModel.$setViewValue(($mdKeyboard.currentModel.$viewValue || '') + key[0]);
                        $mdKeyboard.currentModel.$validate();
                        $mdKeyboard.currentModel.$render();

                        scope.caps = false;
                }
            }

            function hideKeyboard() {
                if ($rootScope.keyboardTimeout) {
                    $timeout.cancel($rootScope.keyboardTimeout);
                }
                $rootScope.keyboardTimeout = $timeout(function () {
                    $rootScope.keyboardAnimation = $mdKeyboard.hide();
                }, 500);
            }
        }
    }
}
