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
            var isMobile = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                    isMobile = true;
                }
            })(navigator.userAgent || navigator.vendor || window.opera);
            if (isMobile && attrs.showInMobile !== true) {
                return;
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
