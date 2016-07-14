angular.module('funch').service('RestaurantsSvc', function ($http, Restaurant) {
    this.get = function (id) {
        return $http.get('/restaurants/' + id).then(function (d) {
            return new Restaurant(d.data);
        });
    };

    this.getAll = function () {
        return $http.get('/restaurants').then(function (d) {
            var r = [];
            d.data.forEach(function (x) {
                r.push(new Restaurant(x));
            });
            return r;
        });
    };

    this.getFavorites = function () {
        return $http.get('/restaurants/favorites').then(function (d) {
            var r = [];
            d.data.forEach(function (x) {
                r.push(new Restaurant(x));
            });
            return r;
        });
    };

    this.create = function (r) {
        return $http.post('/restaurants', r).then(function (d) {
            return d.data;
        });
    };
});
