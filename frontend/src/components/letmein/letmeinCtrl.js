angular.module('funch').controller('LetmeinCtrl', function ($uibModalInstance) {
    var vm = this;

    vm.cancel = function () {
        $uibModalInstance.close();
    };
});
