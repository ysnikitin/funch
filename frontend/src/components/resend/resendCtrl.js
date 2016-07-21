angular.module('funch').controller('ResendCtrl', function ($uibModalInstance, $q, toastr) {
    var vm = this;

    vm.lunch = $uibModalInstance.lunch;
    vm.userMap = $uibModalInstance.users;

    vm.email = '';

    vm.resend = function () {
        var user;

        for (var k in vm.userMap) {
            if (vm.userMap[k].email.toLowerCase() === vm.email.toLowerCase()) {
                user = vm.userMap[k];
            }
        }

        if (user) {
            vm.lunch.resend(user.id).then(function () {
                toastr.success('E-mail has been resent!');
            }).catch(function () {
                toastr.error('Could not resend e-mail.');
            });
        } else {
            toastr.error('Could not resend e-mail.');
        }

        //vm.lunch.resend(vm.user.id);
        $uibModalInstance.close();
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
