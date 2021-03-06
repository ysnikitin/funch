angular.module('funch').service('GuestInvite', function ($uibModal) {
    this.open = function (lunch) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/guestinvite/guestinvite.html',
            controller: 'GuestInviteCtrl',
            size: 'md',
            controllerAs: 'vm',
            backdrop: 'static',
            keyboard: false
        });

        m.lunch = lunch;

        return m;
    };
});
