angular.module('funch').controller('HomeCtrl', function (Lunch) {
    var vm = this;

    Lunch.active().$promise.then(function (lunch) {
        if (lunch) {
            vm.lunch = lunch;
            vm.lunchDate = moment(vm.lunch.stoptime).format('MMMM Do');
        }
    });
});
