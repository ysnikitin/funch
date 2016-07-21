angular.module('funch').controller('GuestInviteCtrl', function ($uibModalInstance, $q, toastr) {
    var vm = this;

    vm.name = '';
    vm.initials = '';
    vm.email = '';

    vm.invite = function () {
        $uibModalInstance.lunch.inviteGuest({
            name: vm.name,
            initials: vm.initials,
            email: vm.email
        }).then(function () {
            toastr.success('Invite sent!');
            $uibModalInstance.close();
        }).catch(function () {
            toastr.error('Could not send the invite!');
        })
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
