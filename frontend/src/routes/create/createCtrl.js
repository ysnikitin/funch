angular.module('funch').controller('CreateCtrl', function ($rootScope, Restaurant, Lunch, User, $q, toastr, $state, BrowserDetectSvc, $window, md5) {
    var vm = this;

    // scrolls to top of the page
    var scrollTop = function () {
        $window.scrollTo(0, 0);
    };

    // validate password
    var validatePw = function (against) {
        return md5.createHash(against || '') === '78d097a14fd5d1ffb7a94c9c90847f08';
    };

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
        return vm.duty.me && vm.duty.others && vm.duty.me.length === 1 && vm.duty.others.length > 0;
    };

    vm.queryUserList = function (query) {
        var u = vm.users.filter(function (us) {
            return ~us.name.toUpperCase().indexOf(query.toUpperCase());
        });
        return $q.resolve(u);
    };

    // progress to next stop
    vm.next = function () {
        var valid;
        var error = '';

        if (vm.step === 0) {
            valid = validatePw(vm.password);
            error = 'That password doesn\'t look right...';
        }

        if (vm.step === 1) {
            valid = validateRestaurant();
            error = 'Looks like you forgot something on this step...';
        }

        if (vm.step === 2) {
            valid = validateStaff();
            error = 'Looks like you forgot something on this step...';
        }

        if (valid) {
            vm.step++;
            if ($rootScope.isMobile) {
                scrollTop();
            }
        } else {
            toastr.error(error);
        }
    };

    // back to previous step
    vm.prev = function () {
        vm.step--;
        if ($rootScope.isMobile) {
            scrollTop();
        }
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
        vm.lunch.onduty = [];

        vm.duty.me.forEach(function (u) {
            vm.lunch.onduty.push(u.id);
        });

        vm.duty.others.filter(function (u) {
            return u.id !== vm.duty.me[0].id;
        }).forEach(function (u) {
            vm.lunch.onduty.push(u.id);
        });

        // save the restaurant, make the lunch session
        vm.restaurant.$saveOrUpdate().then(function () {
            vm.lunch.restaurantId = vm.restaurant.id;
            return vm.lunch.$save();
        }).then(function (lunch) {
            return vm.lunch.getUserHash(vm.duty.me[0].id);
        }).then(function (hash) {
            toastr.success('Lunch session created!');
            vm.processing = false;

            $state.go('main.lunch', {
                code: hash
            });
        }).catch(function () {
            vm.processing = false;
            toastr.error('There was a problem creating your lunch session.');
        });
    };

    vm.ready = false;
    vm.processing = false;
    vm.step = 0;

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

    vm.duty = {
        me: undefined,
        others: undefined
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
        vm.users = res[1];
        vm.ready = true;
    });
});
