angular.module('funch').service('Resend', function ($uibModal) {
    this.open = function (lunch, user) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/resend/resend.html',
            controller: 'ResendCtrl',
            size: 'md',
            controllerAs: 'vm',
            backdrop: 'static',
            keyboard: false
        });

        m.lunch = lunch;
        m.user = user;

        return m;
    };
});
