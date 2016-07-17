angular.module('funch').controller('CreateCtrl', function (Restaurant, Lunch, User, $q, toastr, $state) {
    var vm = this;

    // validate restaurant information
    var validateRestaurant = function () {
        var keys = ['name', 'address', 'menu', 'phone'];
        for (var i = 0; i < keys.length; i++) {
            if (vm.restaurant[i] === '' || !vm.restaurant) {
                return false;
            }
        }
        return true;
    };

    // validate onduty
    var validateStaff = function () {
        var cur = vm.users.filter(function (u) {
            return u.iscurrent;
        });

        var onduty = vm.users.filter(function (u) {
            return u.onduty;
        });

        return cur.length > 0 && onduty.length > 0;
    };

    // progress to next stop
    vm.next = function () {
        var valid;

        if (vm.step === 1) {
            valid = validateRestaurant();
        }

        if (vm.step === 2) {
            valid = validateStaff();
        }

        if (valid) {
            vm.step++;
        } else {
            toastr.error('Looks like you forgot something on this step...')
        }
    };

    // back to previous step
    vm.prev = function () {
        vm.step--;
    };

    // date popups
    vm.datePopup = {};
    vm.openDate = function() {
        vm.datePopup.opened = true;
    };

    // due date defaults
    vm.due = {
        date: new Date(moment().day('Friday')),
        time: '10:30'
    };

    // select a restaurant
    vm.pickRestaurant = function (r) {
        vm.restaurant = r;
    };

    // unselect a restaurant
    vm.resetRestaurant = function () {
        vm.restaurant = new Restaurant();
    };

    // toggle the currently selected user
    vm.toggleIsCurrent = function (user) {
        vm.users.forEach(function (u) {
            return u.iscurrent = false;
        });

        user.iscurrent = !user.iscurrent;

        if (user.iscurrent) {
            user.onduty = true;
        }
    };

    // create the lunch session
    vm.create = function () {
        if (vm.processing) {
            return;
        } else {
            vm.processing = true;
        }

        // parse due time
        var timeParts = vm.due.time.split(':');
        vm.lunch.stoptime = moment(vm.due.date).hour(+timeParts[0]).minute(+timeParts[1]);

        // determine who is on duty
        vm.lunch.onduty = vm.users.filter(function (u) {
            return u.onduty;
        }).map(function (u) {
            return u.id;
        });

        // save the restaurant, make the lunch session
        vm.restaurant.$save().$promise.then(function () {
            vm.lunch.restaurantId = vm.restaurant.id;
            return vm.lunch.$save().$promise;
        }).then(function (lunch) {
            var currentUser = vm.users.filter(function (u) {
                return u.iscurrent;
            })[0];

            var code = btoa(JSON.stringify({
                lunchId: lunch.id,
                userId: currentUser.id
            }));

            toastr.success('Lunch session created!');
            vm.processing = false;

            $state.go('main.lunch', {
                code: code
            });
        }).catch(function () {
            vm.processing = false;
            toastr.error('There was a problem creating your lunch session.');
        });
    };

    vm.ready = false;
    vm.processing = false;
    vm.step = 1;

    // slider options
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

    vm.restaurants = [];
    vm.users = [];

    vm.restaurant = new Restaurant();
    vm.lunch = new Lunch({
        limit: 8
    });

    $q.all([
        Restaurant.query().$promise,
        User.query().$promise
    ]).then(function (res) {
        vm.restaurants = res[0];

        vm.users = res[1].map(function (u) {
            u.onduty = false;
            return u;
        }).sort(function (a, b) {
            return a.initials.charCodeAt(0) - b.initials.charCodeAt(0);
        });

        vm.ready = true;
    });
});
