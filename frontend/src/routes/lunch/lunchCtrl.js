angular.module('funch').controller('LunchCtrl', function (LunchSvc, RestaurantsSvc, Favorites, $interval) {
    var vm = this;

    var ID = 1;

    var refreshCountdown = function () {
        var stoptime = moment('07-15-2016 10:45:00');
        var curtime = moment();
        var duration = moment.duration((stoptime - curtime), 'milliseconds');

        vm.countdown = {
            h: duration.hours(),
            m: duration.minutes(),
            s: duration.seconds()
        };
    };

    $interval(function () {
        refreshCountdown();
    }, 1000);

    vm.myorder = {
        name: '',
        order: ''
    };

    RestaurantsSvc.get(1).then(function (r) {
        vm.restaurant = r;
    });

    vm.lunch = undefined;

    //LunchSvc.get(ID).then(function (l) {
        //vm.lunch = l;

        //var stoptime = moment(vm.lunch.stoptime);
        var stoptime = moment('07-15-2016 10:45:00');
        var curtime = moment();
        var duration = moment.duration((stoptime - curtime) * 1000, 'milliseconds');

        vm.countdown = {
            h: duration.hours(),
            m: duration.minutes(),
            s: duration.seconds()
        };

    //});

    vm.openFavorites = function () {
        var m = Favorites.open(vm.restaurant.id);
        m.result.then(function (result) {
            if (result) {
                vm.myorder = {
                    name: 'MD',
                    order: result
                };
            }
        });
    };

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
