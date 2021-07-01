'use strict';

function <%= upperCamelCaseName %>Controller() {
    var vm = this;
  
    // FIXME: remove this sample property
    vm.foo = 'bar';

    vm.$onInit = function () {
        // TODO: Controller Initalization
    };

    vm.$onChanges = function (changes) {
        // TODO: React to Input changes
    };

    vm.$onDestroy = function () {
        // TODO: Free event subscriptions
    };    
}
  
angular
    .module('app')
    .component('<%= lowerCamelCaseName %>', {
        templateUrl: '/<%= destinationPath %>/<%= name %>.html',
        controller: <%= upperCamelCaseName %>Controller,
        bindings: {
            // Input Definitions:
            //
            // title: '<', // one-way binding
            // title: '@', // special binding for strings
            // title: '=', // two-way model binding

            // Output Definitions:
            //
            // onTitleChange: '&',
        },
    });
