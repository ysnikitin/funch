angular.module('funch').service('Favorites', function ($uibModal) {
    this.open = function (restaurant) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/favorites/favorites.html',
            controller: 'FavoritesCtrl',
            size: 'md',
            controllerAs: 'vm',
            backdrop: 'static',
            keyboard: false
        });

        m.restaurant = restaurant;

        return m;
    };
});
