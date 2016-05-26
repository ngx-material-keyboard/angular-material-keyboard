angular
    .module('material.components.keyboard')
    .config(MdAutocompleteDecorator);

function MdAutocompleteDecorator($provide) {
    // decorate md-autocomplete directive
    // with use-keyboard behavior
    $provide.decorator('mdAutocompleteDirective', function ($q, $delegate, $timeout, $compile, $mdUtil) {
        var directive = $delegate[0];
        var compile = directive.compile;

        directive.compile = function () {
            var link = compile.apply(this, arguments);

            return function (scope, element, attrs, MdAutocompleteCtrl) {
                // call original link
                // function if existant
                if (angular.isDefined(link)) {
                    link.apply(this, arguments);
                }

                if (angular.isDefined(attrs.useKeyboard)) {
                    $timeout(function () {
                        var input = angular.element(element[0].querySelector('input[type="search"]:not(use-keyboard)'));
                        var cloned = input
                            .clone(true, true)
                            .attr('use-keyboard', attrs.useKeyboard);
                        var compiled = $compile(cloned)(scope);
                        input.replaceWith(compiled);

                        MdAutocompleteCtrl.select = function (index) {
                            $mdUtil.nextTick(function () {
                                getDisplayValue(MdAutocompleteCtrl.matches[index]).then(function (val) {
                                    var ngModel = compiled.controller('ngModel');
                                    ngModel.$setViewValue(val);
                                    ngModel.$render();
                                }).finally(function () {
                                    scope.selectedItem = MdAutocompleteCtrl.matches[index];
                                    MdAutocompleteCtrl.loading = false;
                                    MdAutocompleteCtrl.hidden = true;
                                });
                            }, false);

                            function getDisplayValue(item) {
                                return $q.when(getItemText(item) || item);
                            }

                            function getItemText(item) {
                                return (item && scope.itemText) ? scope.itemText(getItemAsNameVal(item)) : null;
                            }

                            function getItemAsNameVal(item) {
                                if (!item) return undefined;

                                var locals = {};
                                if (MdAutocompleteCtrl.itemName) locals[MdAutocompleteCtrl.itemName] = item;

                                return locals;
                            }
                        };
                    });
                }
            };
        };

        return $delegate;
    });
}
