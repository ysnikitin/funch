angular.module('funch').controller('FavoritesCtrl', function ($uibModalInstance, Restaurant) {
    var vm = this;

    vm.restaurant = $uibModalInstance.restaurant;

    vm.restaurant.quickpicks().then(function (qp) {
        vm.favorites = qp;
    });

    vm.order = function (name) {
        $uibModalInstance.close(name);
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
