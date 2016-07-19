angular.module('funch').directive('fRestaurantQuickpick', function () {
    return {
        restrict: 'E',
        templateUrl: 'components/restaurant-quickpick/restaurantQuickpick.html',
        controller: 'RestaurantQuickpickCtrl',
        controllerAs: 'vm',
        bindToController: true,
        scope: {
            restaurant: '='
        }
    };
});
