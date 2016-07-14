angular.module('funch').controller('LunchCtrl', function (LunchSvc, RestaurantsSvc, Favorites, $interval, $stateParams, $state, $q) {
    var vm = this;

    var code = angular.fromJson(atob($stateParams.code));
    var lunchId = code.lunchId;
    var userId = code.userId;

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

    vm.myorder = {
        name: '',
        order: ''
    };

    vm.print = function () {
        var html = '<html><head><style>@media print {.noprint {display: none;}}</style></head><body>Order for <b>Ecova<b><br />101 Arch Street, Boston MA<br /><br />' + $('.allorders').html() + '</body></html>';
        var w = window.open('', '', 'width=900,height=900,resizeable,scrollbars');
        w.document.write(html);
        w.document.close();
        w.print();
        w.close();
    };

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

    vm.cancelLunch = function () {
        if (confirm('Are you sure you want to cancel lunch?  This action cannot be undone.  All orders will be lost, along with most hopes and dreams.')) {
            vm.lunch.destroy().then(function () {
                $state.go('home');
            });
        }
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


    var defers = [];

    defers.push(RestaurantsSvc.get(1).then(function (r) {
        vm.restaurant = r;
    }));

    defers.push(LunchSvc.get(lunchId).then(function (l) {
        vm.lunch = l;

        var stoptime = moment(vm.lunch.stoptime);
        var curtime = moment();
        var duration = moment.duration((stoptime - curtime) * 1000, 'milliseconds');

        vm.countdown = {
            h: duration.hours(),
            m: duration.minutes(),
            s: duration.seconds()
        };

        refreshCountdown();
        $interval(function () {
            refreshCountdown();
        }, 1000);
    }));

    $q.all(defers).then(function () {

    });
});
