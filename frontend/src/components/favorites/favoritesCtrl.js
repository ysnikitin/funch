angular.module('funch').controller('FavoritesCtrl', function ($uibModalInstance, Restaurant) {
    var vm = this;

    $uibModalInstance.restaurant.getQuickPicks().$promise.then(function (qp) {
        vm.favorites = qp;
    });

    vm.order = function (name) {
        $uibModalInstance.close(name);
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
