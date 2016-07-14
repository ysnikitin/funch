angular.module('funch').controller('HomeCtrl', function (LunchSvc) {
    var vm = this;

    LunchSvc.getActive().then(function (lunch) {
        if (lunch) {
            LunchSvc.get(lunch.id).then(function (lunch) {
                vm.activeLunch = lunch;
                vm.activeDate = moment(vm.activeLunch.stoptime).format('MMMM Do');
            });
        }
    });
});
