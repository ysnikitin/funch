angular.module('funch').controller('CreateCtrl', function (RestaurantsSvc, Restaurant, Lunch) {
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
        value: 8,
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

    vm.restaurants = [];
    RestaurantsSvc.getAll().then(function (r) {
        console.log(r);
        vm.restaurants = r;
    });

    vm.restaurant = new Restaurant();

    vm.pickRestaurant = function (r) {
        vm.restaurant = r;

        var good = ['Good choice!', 'Sounds good...', 'Delicious!', 'Can\'t wait to eat...'];
        vm.otherLabel = good[Math.floor(Math.random() * good.length)];
    };

    vm.lunch = new Lunch({});

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
