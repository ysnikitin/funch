angular.module('funch').service('Favorites', function ($uibModal) {
    this.open = function (restaurantId) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/favorites/favorites.html',
            controller: 'FavoritesCtrl',
            size: 'md',
            controllerAs: 'vm'
        });

        m.restaurantId = restaurantId;

        return m;
    };
});
