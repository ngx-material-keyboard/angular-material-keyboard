angular
    .module('mdKeyboard')
    .provider('mdKeyboard', MdKeyboardProvider);

function MdKeyboardProvider(keyboardLayouts, keyboardDeadkey) {
    var self = this;

    this.layouts = keyboardLayouts;
    this.deadkey = keyboardDeadkey;
    this.themable = true;
    this.layout = 'US International';
    this.symbols = {
        '\u00a0': "NB\nSP", '\u200b': "ZW\nSP", '\u200c': "ZW\nNJ", '\u200d': "ZW\nJ"
    };
    this.numpad = [
        [["$"], ["\u00a3"], ["\u20ac"], ["\u00a5"]],
        [["7"], ["8"], ["9"], ["/"]],
        [["4"], ["5"], ["6"], ["*"]],
        [["1"], ["2"], ["3"], ["-"]],
        [["0"], ["."], ["="], ["+"]]
    ];

    console.log(this.deadkey);

    this.setThemable = function (value) {
        this.themable = !!value;
    };
    this.setLayout = function (value) {
        this.layout = value || 'US International';
    };

    this.$get = function () {
        return {
            getLayout: function (value) {
                return self.layouts[value || self.layout];
            }
        };
    };
}
