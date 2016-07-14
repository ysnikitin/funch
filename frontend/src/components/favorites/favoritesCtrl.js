angular.module('funch').controller('FavoritesCtrl', function ($uibModalInstance, RestaurantsSvc) {
    var vm = this;

    RestaurantsSvc.get($uibModalInstance.restaurantId).then(function (r) {
        vm.restaurant = r;

        r.getQuickPicks().then(function (qp) {
            vm.favorites = qp;
        });
    });

    vm.order = function (name) {
        $uibModalInstance.close(name);
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
