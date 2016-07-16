angular.module('funch').service('RestaurantsSvc', function ($http, Restaurant) {
    this.get = function (id) {
        return $http.get('/restaurants/' + id).then(function (d) {
            return new Restaurant(d.data);
        });
    };

    this.getAll = function () {
        return $http.get('/restaurants').then(function (d) {
            return d.data.map(function (x) {
                return new Restaurant(x);
            });
        });
    };

    this.getFavorites = function () {
        return $http.get('/restaurants/favorites').then(function (d) {
            return d.data.map(function (x) {
                return new Restaurant(x);
            });
        });
    };

    this.create = function (r) {
        return $http.post('/restaurants', r).then(function (d) {
            return d.data;
        });
    };
});
