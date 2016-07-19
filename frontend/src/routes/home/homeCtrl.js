angular.module('funch').controller('HomeCtrl', function (Lunch, LetmeinSvc) {
    var vm = this;

    Lunch.active().$promise.then(function (lunch) {
        if (lunch) {
            vm.lunch = lunch;
            vm.lunchDate = moment(vm.lunch.stoptime).format('MMMM Do');
        }
    });

    vm.letmein = function () {
        LetmeinSvc.open();
    };
});
