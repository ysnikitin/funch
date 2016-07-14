angular.module('funch').controller('CreateCtrl', function (RestaurantsSvc, Restaurant, Lunch, UserSvc) {
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
    };

    vm.create = function () {
        vm.lunch.stoptime = vm.due.date + ' ' + vm.due.time;

        console.log('rest', vm.restaurant);
        console.log('create', vm.lunch);
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
