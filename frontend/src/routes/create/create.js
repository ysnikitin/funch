angular.module('funch').controller('CreateCtrl', function (RestaurantsSvc, Restaurant, Lunch, LunchSvc, UserSvc, $q, toastr, $state) {
    var vm = this;

    vm.ready = false;
    vm.creating = false;
    vm.step = 1;

    vm.next = function () {
        var valid = true;

        if (vm.step === 1) {
            if (vm.restaurant.name === '' || vm.restaurant.address === '' || vm.restaurant.menu === '' || vm.restaurant.phone === '') {
                valid = false;
            }

            if (!vm.restaurant.name || !vm.restaurant.address || !vm.restaurant.menu || !vm.restaurant.phone) {
                valid = false;
            }
        }

        if (vm.step === 2) {
            var curfound = false;
            var ondutyfound = false;
            vm.users.forEach(function (u) {
                if (u.onduty) {
                    ondutyfound = true;
                }

                if (u.iscurrent) {
                    curfound = true;
                }
            });

            valid = curfound && ondutyfound;
        }

        if (valid) {
            vm.step++;
        } else {
            toastr.error('Looks like you forgot something on this step...')
        }
    };

    vm.prev = function () {
        vm.step--;
    };

    vm.otherLabel = 'Something else...';

    vm.limit = {
        options: {
            floor: 5,
            ceil: 20,
            hideLimitLabels: true,
            translate: function (v) {
                return '$' + v;
            }
        }
    };

    vm.datePopup = {};
    vm.openDate = function() {
        vm.datePopup.opened = true;
    };

    vm.due = {
        date: new Date(moment().day('Friday')),
        time: '10:30'
    };

    vm.pickRestaurant = function (r) {
        vm.restaurant = r;
        var good = ['Good choice!', 'Sounds good...', 'Delicious!', 'Can\'t wait to eat...'];
        vm.otherLabel = good[Math.floor(Math.random() * good.length)];
        vm.disableRestaurantFields = true;
    };

    vm.resetRestaurant = function () {
        vm.restaurant = new Restaurant();
        vm.disableRestaurantFields = false;
        vm.otherLabel = 'Something else...';
    };

    vm.create = function () {
        if (vm.creating) {
            return;
        }

        vm.creating = true;
        var timespl = vm.due.time.split(':');

        vm.lunch.stoptime = moment(vm.due.date).hour(+timespl[0]).minute(+timespl[1]);
        vm.lunch.onduty = vm.users.filter(function (u) {
            return u.onduty;
        }).map(function (u) {
            return u.id;
        });

        var ensureRest = $q.defer();

        if (!vm.restaurant.id) {
            RestaurantsSvc.create(vm.restaurant).then(function (r) {
                return RestaurantsSvc.get(r.id);
            }).then(function (rest) {
                vm.restaurant = rest;
                ensureRest.resolve();
            }).catch(function () {
                ensureRest.reject();
            });
        } else {
            ensureRest.resolve();
        }

        ensureRest.promise.then(function () {
            vm.lunch.restaurantId = vm.restaurant.id;
            return LunchSvc.create(vm.lunch);
        }).then(function (lunch) {
            var currentUser = vm.users.filter(function (u) {
                return u.iscurrent;
            })[0];

            var code = btoa(JSON.stringify({
                lunchId: lunch.id,
                userId: currentUser.id
            }));

            toastr.success('Lunch session created!');
            vm.creating = false;

            $state.go('main.lunch', {
                code: code
            });
        }).catch(function () {
            vm.creating = false;
            toastr.error('There was a problem creating your lunch session.');
        });
    };

    vm.toggleOnDuty = function (user) {
        user.onduty = !user.onduty;
    };

    vm.toggleIsCurrent = function (user) {
        vm.users.forEach(function (u) {
            return u.iscurrent = false;
        });

        user.iscurrent = !user.iscurrent;

        if (user.iscurrent) {
            user.onduty = true;
        }
    };


    vm.restaurant = new Restaurant();
    vm.lunch = new Lunch({
        limit: 8
    });

    var defers = [];

    vm.restaurants = [];
    defers.push(RestaurantsSvc.getAll().then(function (r) {
        vm.restaurants = r;
    }));

    vm.users = [];
    defers.push(UserSvc.getAll().then(function (u) {
        u = u.map(function (z) {
            z.onduty = false;
            return z;
        }).sort(function (a, b) {
            return a.initials.charCodeAt(0) - b.initials.charCodeAt(0);
        });
        vm.users = u;
    }));

    $q.all(defers).then(function () {
        vm.ready = true;
    });
});
