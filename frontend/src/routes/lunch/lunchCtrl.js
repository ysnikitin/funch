angular.module('funch').controller('LunchCtrl', function ($scope, $http, $interval, $stateParams, $state, $q, Favorites, GuestInvite, YelpSvc, toastr, Suggestions, Order, Lunch, User, Restaurant) {
    var vm = this;

    var code = angular.fromJson(atob($stateParams.code));
    var lunchId = code.lunchId;
    var userId = code.userId;
    vm.userId = userId;

    vm.ready = false;
    vm.locked = false;
    vm.userMap = {};
    vm.processing = false;

    // refresh countdown clock
    var countdown = function () {
        var s = moment(vm.lunch.stoptime).valueOf() - moment().valueOf();

        if (s < 1) {
            $interval.cancel(vm.countdownInterval)
            vm.locked = true;
        } else {
            vm.locked = false;
        }

        vm.timeWarning = (s <= 1800000);

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        vm.countdown = {
            h: hrs,
            m: mins,
            s: secs
        };
    };

    vm.order = new Order({
        lunchId: lunchId
    });

    // open print dialog
    vm.print = function () {
        var html = '<html><head><style>@media print {.noprint {display: none;}}</style></head><body>Order for <b>Ecova<b><br />101 Arch Street, Boston MA<br /><br />' + $('.allorders').html() + '</body></html>';
        var w = window.open('', '', 'width=900,height=900,resizeable,scrollbars');
        w.document.write(html);
        w.document.close();
        w.print();
        w.close();
    };

    // open favorites modal
    vm.openFavorites = function () {
        var m = Favorites.open(vm.restaurant);
        m.result.then(function (result) {
            if (result) {
                vm.order.order = result;
                vm.saveOrder();
            }
        });
    };

    // open the suggestions modal
    vm.openSuggestions = function () {
        console.log('u', vm.user);
        var m = Suggestions.open(vm.restaurant, vm.user);
        m.result.then(function (result) {
            if (result) {
                vm.order.order = result;
                vm.saveOrder();
            }
        });
    };

    // open the guests modal
    vm.openInviteGuests = function () {
        GuestInvite.open(vm.lunch);
    };

    // cancel lunch
    vm.cancelLunch = function () {
        if (confirm('Are you sure you want to cancel lunch?  This action cannot be undone.  All orders will be lost, along with most hopes and dreams.')) {
            vm.lunch.$delete().then(function () {
                $state.go('home');
            });
        }
    };

    // adds an extra 15 minutes
    vm.moreTime = function () {
        vm.lunch.stoptime = moment(vm.lunch.stoptime).add(15, 'minutes').toISOString();
        vm.lunch.$update().then(function () {
            toastr.success('Added another 15 minutes to the order due date.');
        });
    };

    // saves the user order
    vm.saveOrder = function () {
        if (vm.processing) {
            return;
        } else {
            vm.processing = true;
        }

        // make sure the order has the userid
        vm.order.userId = userId;

        vm.order.save().then(function () {
            toastr.success('Order saved!');
            vm.processing = false;
            return getOrders();
        }).catch(function () {
            toastr.error('Order could not be saved!');
            vm.processing = false;
        });
    };

    // fetches all orders
    var getOrders = function () {
        return Order.query({
            lunchId: vm.lunch.id
        }).$promise.then(function (orders) {
            vm.orders = _.cloneDeep(orders);
            for (var i = 0; i < vm.order.length; i++) {
                if (+order.userId === +userId) {
                    vm.order = vm.order[i];
                }
            }
        });
    };

    // fetch a Yelp record
    var getYelp = function (restaurant) {
        return YelpSvc.business(restaurant.yelpURL.split('/').pop()).then(function (record) {
            return {
                details: record,
                stars: (record.rating / 5 * 100) + '%'
            };
        });
    };

    // boot everything up
    Lunch.get({ id: lunchId }).$promise.then(function (lunch) {
        vm.lunch = lunch;

        return $q.all([
            User.query().$promise,
            getOrders(),
            Restaurant.get({ id: lunch.restaurantId }).$promise
        ]).then(function (res) {
            var users = res[0];
            var orders = res[1];
            var rest = res[2];

            // collect users
            vm.onduty = [];
            users.forEach(function (u) {
                u.id = +u.id;
                vm.userMap[u.id] = u;

                if (u.id === userId) {
                    vm.user = u;
                }

                if (~vm.lunch.onduty.indexOf(u.id.toString())) {
                    vm.onduty.push(u);
                }
            });

            // collect restaurant and related information
            vm.restaurant = rest;
            getYelp(vm.restaurant).then(function (y) {
                console.log(y);
                vm.yelp = y;
            });
        });
    }).then(function () {
        vm.countdownInterval = undefined;

        countdown();
        vm.countdownInterval = $interval(function () {
            countdown();
        }, 1000);

        $interval(function () {
            getOrders();
        }, 10000);

        vm.ready = true;
    });
});
