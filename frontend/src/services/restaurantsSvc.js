angular.module('funch').service('RestaurantsSvc', function (Restaurant) {
    this.get = function (id) {
        return $http.get('/restaurants/' + id).then(function (d) {
            return new Restaurant(d.data.data);
        });
    };

    this.getAll = function () {
        return $http.get('/restaurants').then(function (d) {
            return new Restaurant(d.data.data);
        });
    };

    this.getFavorites = function () {
        return $http.get('/restaurants/favorites').then(function (d) {
            var r = [];
            d.data.data.forEach(function (x) {
                return new Restaurant(x);
            });
            return r;
        });
    };
});
