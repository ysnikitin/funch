angular.module('funch').service('LetmeinSvc', function ($uibModal) {
    this.open = function (lunch) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/letmein/letmein.html',
            controller: 'LetmeinCtrl',
            size: 'md',
            controllerAs: 'vm'
        });

        m.lunch = lunch;

        return m;
    };
});
