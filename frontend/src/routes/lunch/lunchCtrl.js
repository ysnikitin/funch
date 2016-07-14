angular.module('funch').controller('LunchCtrl', function ($scope, LunchSvc, RestaurantsSvc, Favorites, $interval, $stateParams, $state, $q, GuestInvite, UserSvc, toastr) {
    var vm = this;

    var code = angular.fromJson(atob($stateParams.code));
    var lunchId = code.lunchId;
    var userId = code.userId;

    vm.ready = false;
    vm.locked = false;
    vm.userMap = {};
    vm.processingOrder = false;

    var refreshCountdown = function () {
        var stoptime = moment(vm.lunch.stoptime).valueOf();
        var curtime = moment().valueOf();

        var s = stoptime - curtime;

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

    vm.myorder = {
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
                vm.myorder.order = result;
            }
        });
    };

    vm.openInviteGuests = function () {
        GuestInvite.open(vm.lunch);
    };

    vm.cancelLunch = function () {
        if (confirm('Are you sure you want to cancel lunch?  This action cannot be undone.  All orders will be lost, along with most hopes and dreams.')) {
            vm.lunch.destroy().then(function () {
                $state.go('home');
            });
        }
    };

    vm.moreTime = function () {
        var newtime = moment(vm.lunch.stoptime).add(15, 'minutes').toISOString();

        vm.lunch.stoptime = newtime;
        vm.lunch.save();

        toastr.success('Added another 15 minutes to the order due date.');
    };

    vm.saveMyOrder = function () {
        if (vm.processingOrder) {
            return;
        }

        vm.processingOrder = true;
        vm.myorder.userId = userId;

        var pr;
        if (!vm.myorder.id) {
            pr = vm.lunch.makeOrder(vm.myorder);
        } else {
            pr = vm.lunch.updateOrder(vm.myorder);
        }

        pr.then(function (order) {
            if (order.id) {
                return vm.lunch.getOrder(order.id);
            }
        }).then(function (o) {
            vm.myorder = o;
            vm.processingOrder = false;
            getOrders();
            toastr.success('Order saved!');
        }).catch(function () {
            vm.processingOrder = false;
            toastr.error('Order could not be saved!');
        });
    };

    vm.orders = [];
    var getOrders = function () {
        return vm.lunch.getOrders().then(function (o) {
            if (o) {
                vm.orders = _.cloneDeep(o);
                o.forEach(function (order) {
                    if (+order.userId === +userId) {
                        vm.myorder = order;
                    }
                });
            }
        });
    };

    vm.onduty = '';
    $scope.$watch(function () {
        return vm.ondutyUsers;
    }, function () {
        if (vm.ondutyUsers) {
            vm.onduty = vm.ondutyUsers.map(function (u) {
                return u.initials;
            }).join(', ');
        }
    }, true);

    var defers = [];

    defers.push(LunchSvc.get(lunchId).then(function (l) {
        vm.lunch = l;

        var dusers = UserSvc.getAll().then(function (us) {
            vm.ondutyUsers = [];
            us.forEach(function (u) {
                vm.userMap[u.id] = u;

                if (+u.id === +userId) {
                    vm.user = u;
                }

                if (~vm.lunch.onduty.indexOf(u.id)) {
                    vm.ondutyUsers.push(u);
                }
            });
        });

        var dorders = getOrders();

        var drest = RestaurantsSvc.get(vm.lunch.restaurantId).then(function (r) {
            vm.restaurant = r;
        });

        return $q.all([ dusers, dorders, drest ]);
    }));


    vm.countdownInterval = undefined;

    $q.all(defers).then(function () {
        refreshCountdown();
        vm.ready = true;

        vm.countdownInterval = $interval(function () {
            refreshCountdown();
        }, 1000);

        $interval(function () {
            getOrders();
        }, 10000);
    });
});
