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

function useKeyboardDirective($mdKeyboard, $injector, $log, $rootScope) {
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
                if (!keyboard) {
                    keyboard = $mdKeyboard.show({
                        templateUrl: '../view/mdKeyboard.view.html',
                        controller: mdKeyboardController,
                        bindToController: true
                    });
                }
            }

            function mdKeyboardController($scope) {
                if (attrs.useKeyboard) {
                    $mdKeyboard.useLayout(attrs.useKeyboard);
                }

                var toggleCaps = function() {
                    $scope.caps = !$scope.caps;
                };

                var toggleCapsLock = function() {
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
                };

                _init();
            }

            function triggerKey($event, key) {
                $event.preventDefault();
                $log.debug('key pressed: ' + key);

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

                        ngModelCtrl.$setViewValue((ngModelCtrl.$viewValue || '') + "\t");
                        ngModelCtrl.$validate();
                        ngModelCtrl.$render();

                        break;

                    case "Bksp":
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

                        ngModelCtrl.$setViewValue((ngModelCtrl.$viewValue || '').slice(0, -1));
                        ngModelCtrl.$validate();
                        ngModelCtrl.$render();

                        break;

                    case "Enter":
                        // submit form or insert \n new line
                        //if (self.VKI_target.nodeName != "TEXTAREA") {
                        //    if (typeof self.VKI_enterSubmit === 'function') {
                        //        self.VKI_enterSubmit.apply({}, [self.VKI_target.value]);
                        //    } else if (self.VKI_enterSubmit && self.VKI_target.form) {
                        //        for (var z = 0, subm = false; z < self.VKI_target.form.elements.length; z++)
                        //            if (self.VKI_target.form.elements[z].type == "submit") subm = true;
                        //        if (!subm) self.VKI_target.form.submit();
                        //    }
                        //    self.VKI_close(false);
                        //} else self.VKI_insert("\n");
                        //return true;

                        if (element[0].nodeName.toUpperCase() != 'TEXTAREA') {
                            // TODO: Trigger form submit
                            scope.$broadcast('$submit');
                            scope.$root.$broadcast('$submit');
                        } else {
                            ngModelCtrl.$setViewValue((ngModelCtrl.$viewValue || '') + "\n");
                            ngModelCtrl.$validate();
                            ngModelCtrl.$render();
                        }

                        break;

                    default:
                        //var event = new window.KeyboardEvent('keydown', {
                        //    bubbles: true,
                        //    cancelable: true,
                        //    shiftKey: true,
                        //    keyCode: key[0].charCodeAt(0)
                        //});
                        //element[0].dispatchEvent(event);

                        ngModelCtrl.$setViewValue((ngModelCtrl.$viewValue || '') + key[0]);
                        ngModelCtrl.$validate();
                        ngModelCtrl.$render();
                }
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
