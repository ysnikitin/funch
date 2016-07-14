angular.module('funch').controller('GuestInviteCtrl', function ($uibModalInstance, $q) {
    var vm = this;
    console.log($uibModalInstance.lunch);

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
            defers.push($uibModalInstance.lunch.inviteGuest(g));
        });

        $q.all(defers).then(function () {
            $uibModalInstance.close(vm.guests);
        });
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
