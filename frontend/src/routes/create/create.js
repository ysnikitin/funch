angular.module('funch').controller('CreateCtrl', function (RestaurantsSvc, Restaurant, Lunch, LunchSvc, UserSvc, $q, toastr, $state) {
    var vm = this;

    vm.step = 1;

    vm.next = function () {
        vm.step++;
    };

    vm.prev = function () {
        vm.step--;
    };

    vm.otherLabel = 'Something else...';

    vm.limit = {
        options: {
            floor: 5,
            ceil: 20,
            step: 0.5,
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
        var timespl = vm.due.time.split(':');

        vm.lunch.stoptime = moment(vm.due.date).hour(+timespl[0]).minute(+timespl[1]);
        vm.lunch.onduty = vm.users.filter(function (u) {
            return u.onduty;
        }).map(function (u) {
            return u.id;
        });

        var ensureRest = $q.defer();

        if (!vm.restaurant.id) {
            RestaurantsSvc.create(vm.restuarant).then(function (r) {
                vm.restuarant = r;
                ensureRest.resolve();
            });
        } else {
            ensureRest.resolve();
        }

        ensureRest.promise.then(function () {
            vm.lunch.restaurantId = vm.restaurant.id;
            LunchSvc.create(vm.lunch).then(function (lunch) {
                var currentUser = vm.users.filter(function (u) {
                    return u.iscurrent;
                })[0];

                var code = btoa(JSON.stringify({
                    lunchId: lunch.id,
                    userId: currentUser.id
                }));

                toastr.success('Lunch session created!');

                $state.go('main.lunch', {
                    code: code
                });
            });
        });
    };


    vm.restaurant = new Restaurant();
    vm.lunch = new Lunch({
        limit: 8
    });

    vm.restaurants = [];
    RestaurantsSvc.getAll().then(function (r) {
        vm.restaurants = r;
    });

    vm.users = [];
    UserSvc.getAll().then(function (u) {
        u = u.map(function (z) {
            z.onduty = false;
            return z;
        });
        vm.users = u;
    });

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

    vm.names = [
        'Aaron Panzer',
        'Adam Kernander',
        'Arthur Fisher',
        'Bennett Fisher',
        'Bill Hines',
        'Brian Simmons',
        'Bryan Long',
        'Chris Muth',
        'David Mason',
        'Gabe Rivera',
        'Jarvis Lee',
        'Jen Morris',
        'Jenny Zhao',
        'Jeremy Nikitin',
        'Jim Johnson',
        'Joe Dorfman',
        'Joel Travis',
        'John Marco',
        'Justin Peczkowski',
        'Kalyana Vattikuti',
        'Lacey Kloster',
        'Larry Simpson',
        'Leah Puklin',
        'Mark Cormier',
        'Maryette Haggerty Perrault',
        'Matt McDaniel',
        'Mike Deroche',
        'Mike Kaplan',
        'Paul Gagne',
        'Seamus Reynolds',
        'Shobin Uralil',
        'Stephen Mannhard',
        'Tina Dietrich',
        'Torey Stapleton',
        'W.H.Gaasch'
    ];
});
