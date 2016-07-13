angular.module('funch').controller('CreateCtrl', function () {
    var vm = this;

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

    vm.lunch = {
        stoptime: ''
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
