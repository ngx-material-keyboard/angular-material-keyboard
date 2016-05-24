# angular-material-keyboard
Onscreen virtual keyboard for [Angular](https://angularjs.org/) using [Angular Material](https://material.angularjs.org/) and the [Angular Virtual Keyboard by the-darc](https://github.com/the-darc/angular-virtual-keyboard) based on [GreyWyvern VKI](http://www.greywyvern.com/code/javascript/keyboard).

## demo
Checkout the [demo.html](https://cdn.rawgit.com/davidenke/angular-material-keyboard/0.0.4/demo.html)

## usage
* download or clone the latest release, or use your preferred packet manager
* add the javascript and css files to your project:
```html
  <script src="angular-material-keyboard/dist/mdKeyboard.min.js"></script>
  <link rel="stylesheet" href="angular-material-keyboard/dist/mdKeyboard.css">
  <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Material+Icons">
```
* register module:
```javascript
'use strict';

angular
    .module('myApp', [
        'ngAria',
        'ngAnimate',
        'ngMaterial',
        'material.components.keyboard'
    ]);
```
* use as directive
```html
<form name="myForm">
  <md-input-container>
      <input type="text"
             use-keyboard="Deutsch"
             ng-model="myModel">
  </md-input-container>
</form>
```

## configure
Use the `mdKeyboardProvider` to set your default layout or to add custom layouts:
```javascript
'use strict';

angular
  .module('myApp')
  .config(function ($mdKeyboardProvider) {
  
    // add layout for number fields
    $mdKeyboardProvider.addLayout('Numbers', {
      'name': 'Numbers', 'keys': [
            [['7', '7'], ['8', '8'], ['9', '9'], ['Bksp', 'Bksp']],
            [['4', '4'], ['5', '5'], ['6', '6'], ['-', '-']],
            [['1', '1'], ['2', '2'], ['3', '3'], ['+', '+']],
            [['0', '0'], ['Spacer'], [','], ['Enter', 'Enter']]
      ], 'lang': ['de']
    });

    // default layout is german
    $mdKeyboardProvider.defaultLayout('Deutsch');
  });
```
The first entry in each 'key' array is the default char. The second is used when pressing 'shift' or 'caps lock', the third when 'alt' is rpessed.
You can use the `spacer` key to provide a gap in the layout.

The `$mdKeyboardProvider` has the following methods:

`getLayout(layout:string):object` will give you the corresponding layout

`getCurrentLayout():string` will give you the current used layout

`getLayouts():array` returns all registered layouts

`defaultLayout(layout:string):void` tells the directive which layout to use as default

`useLayout(layout:string):void` tells the directive which layout to use

`addLayout(layout:string, keys:array):void` expects the name of a new layout to register along an 'keys' array

`isVisible():boolean` returns wether the keyboard is currently visible or not

## build
* install node.js (I recomend to use [nvm](https://github.com/creationix/nvm))
* get dependencies: `$ npm install && bower install`
* build with gulp task: `$ gulp build`
