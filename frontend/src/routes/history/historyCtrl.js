angular.module('funch').controller('HistoryCtrl', function ($q, Lunch, Restaurant) {
    var vm = this;
    vm.ready = false;

    vm.lunches = [];

    Lunch.query().$promise.then(function (lunches) {
        var prs = [];
        lunches.forEach(function (lunch) {
            prs.push(Restaurant.get({ id: lunch.restaurantId }).$promise.then(function (r) {
                lunch.restaurant = r;
            }));
        });
        return $q.all(prs).then(function () {
            return lunches;
        })
    }).then(function (lunches) {
        lunches = lunches.map(function (lunch) {
            lunch.date = moment(lunch.stoptime).format('M/D');
            return lunch;
        });
        return lunches;
    }).then(function (lunches) {
        vm.lunches = lunches;
        vm.ready = true;
    })
});
