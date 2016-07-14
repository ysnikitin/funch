angular.module('funch').service('GuestInvite', function ($uibModal) {
    this.open = function (lunch) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/guestinvite/guestinvite.html',
            controller: 'GuestInviteCtrl',
            size: 'lg',
            controllerAs: 'vm'
        });

        m.lunch = lunch;

        return m;
    };
});
