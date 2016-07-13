angular.module('funch').controller('LunchCtrl', function () {
    var vm = this;

    vm.orders = [{
        name: 'MD',
        order: 'Cheeseburger and fries'
    },{
        name: 'JN',
        order: 'Nothing if it\'s Bonapita'
    },{
        name: 'AK',
        order: 'Caesar salad'
    },{
        name: 'McD',
        order: 'Anything but tomatoes'
    }, {
        name: 'AF',
        order: undefined
    }, {
        name: 'SR',
        order: undefined
    }, {
        name: 'TS',
        order: 'Pepperoni pizza'
    }, {
        name: 'JM',
        order: 'Boars Head sandwhich'
    }];
});
