angular.module('funch').controller('FavoritesCtrl', function ($uibModalInstance, RestaurantsSvc) {
    var vm = this;

    RestaurantsSvc.get($uibModalInstance.restaurantId).then(function (r) {
        vm.restaurant = r;

        vm.favorites = [{
            name: 'Cheeeseburger'
        }, {
            name: 'Killer Bee'
        }, {
            name: 'Cheese and Tomato Pizza'
        }];
    });

    vm.order = function (name) {
        $uibModalInstance.close(name);
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
