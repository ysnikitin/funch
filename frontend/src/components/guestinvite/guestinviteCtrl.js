angular.module('funch').controller('GuestInviteCtrl', function ($uibModalInstance, $q) {
    var vm = this;

    vm.guests = [{}];

    vm.newGuest = function () {
        vm.guests.push({});
    };

    vm.invite = function () {
        vm.guests = vm.guests.filter(function (g) {
            return (g.name && g.initials && g.email);
        });

        var defers = [];

        vm.guests.forEach(function (g) {
            defers.push($uibModalInstance.lunch.email(g).$promise);
        });

        $q.all(defers).then(function () {
            $uibModalInstance.close(vm.guests);
        });
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
