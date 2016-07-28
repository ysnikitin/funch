angular.module('funch').controller('LunchCtrl', function ($scope, $http, $interval, $stateParams, $state, $q, Favorites, GuestInvite, YelpSvc, toastr, Suggestions, Order, Lunch, User, Resend, Restaurant, HashSvc) {
    var vm = this;

    vm.ready = false;
    vm.locked = false;
    vm.userMap = {};
    vm.processing = false;
    vm.isOnDuty = false;
    vm.lastKnownOrder = '';

    // refresh countdown clock
    var countdown = function () {
        var s = moment(vm.lunch.stoptime).valueOf() - moment().valueOf();

        if (s < 1) {
            $interval.cancel(vm.countdownInterval);
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
            h: hrs > 0 ? hrs : 0,
            m: mins > 0 ? mins : 0,
            s: secs > 0 ? secs : 0
        };
    };

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
                if (vm.locked) {
                    toastr.error('Sorry, time\'s up!');
                    return;
                }

                vm.order.order = result;
                vm.saveOrder();
            }
        });
    };

    // open resend modal
    vm.openResend = function () {
        var m = Resend.open(vm.restaurant);
        m.lunch = vm.lunch;
        m.users = vm.userMap;
    };

    // open the suggestions modal
    vm.openSuggestions = function () {
        var m = Suggestions.open(vm.restaurant, vm.user);
        m.result.then(function (result) {
            if (result) {
                if (vm.locked) {
                    toastr.error('Sorry, time\'s up!');
                    return;
                }

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

        if (vm.locked) {
            toastr.error('Sorry, time\'s up!');
            return;
        }

        // make sure the order has the userid
        vm.order.userId = vm.user.id;

        vm.order.$saveOrUpdate().then(function () {
            toastr.success('Order saved!');
            vm.processing = false;
            vm.lastKnownOrder = vm.order.order;
            return getOrders();
        }).catch(function () {
            toastr.error('Order could not be saved!');
            vm.processing = false;
        });
    };

    // cancels your order
    vm.cancelOrder = function () {
        if (confirm('Are you sure you want to cancel your order?')) {
            vm.order.$delete().then(function () {
                toastr.success('Order cancelled!');

                vm.order = new Order({
                    lunchId: vm.lunch.id
                });
                vm.lastKnownOrder = '';

                getOrders();
            }).catch(function () {
                toastr.error('Order could not be cancelled!');
            });
        }
    };

    // upvotes the restaurant
    vm.upvote = function () {
        return vm.restaurant.upvote(vm.user.id).then(function () {
            return getVotes();
        });
    };

    // downvotes the restaurant
    vm.downvote = function () {
        return vm.restaurant.downvote(vm.user.id).then(function () {
            return getVotes();
        });
    };

    // fetches all orders
    var getOrders = function () {
        return Order.query({
            lunchId: vm.lunch.id
        }).$promise.then(function (orders) {
            vm.orders = _.cloneDeep(orders);

            vm.orders.sort(function (a, b) {
                var ai = vm.userMap[a.userId].initials;
                var bi = vm.userMap[b.userId].initials;

                if (ai < bi) return -1;
                if (ai > bi) return 1;
                return 0;
            });

            for (var i = 0; i < vm.orders.length; i++) {
                if (+vm.orders[i].userId === +vm.user.id) {
                    vm.order = _.cloneDeep(vm.orders[i]);
                    vm.lastKnownOrder = vm.order.order;
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

    // fetches the voting records
    var getVotes = function () {
        return $q.all([
            vm.restaurant.votes(),
            vm.restaurant.userVotes(vm.user.id)
        ]).then(function (votes) {
            vm.votes = votes[0];
            vm.userVotes = votes[1];
        });
    };

    // boot everything up
    HashSvc.decrypt($stateParams.code).then(function (hash) {
        vm.hash = hash;
        return Lunch.get({ id: vm.hash.lunch.id }).$promise;
    }).then(function (lunch) {
        vm.lunch = lunch;

        vm.order = new Order({
            lunchId: vm.lunch.id
        });

        return $q.all([
            User.query().$promise,
            Restaurant.get({ id: lunch.restaurantId }).$promise
        ]);
    }).then(function (res) {
        var users = res[0];
        vm.restaurant = res[1];

        // collect users
        vm.onduty = [];
        users.forEach(function (u) {
            u.id = +u.id;
            vm.userMap[u.id] = u;

            if (u.id === vm.hash.user.id) {
                vm.user = u;

                if (~vm.lunch.onduty.indexOf(vm.user.id.toString())) {
                    vm.isOnDuty = true;
                }
            }

            if (~vm.lunch.onduty.indexOf(u.id.toString())) {
                vm.onduty.push(u);
            }
        });
    }).then(function () {
        return getOrders();
    }).then(function () {
        var dy = $q.defer();
        getYelp(vm.restaurant).then(function (y) {
            vm.yelp = y;
            dy.resolve();
        }, function () {
            dy.resolve();
        });
        return dy.promise;
    }).then(function () {
        return getVotes();
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
    }).catch(function () {
        $state.go('main.error');
    });
});
