angular.module('funch').factory('User', function ($http) {
    var U = function (def) {
        for (var k in def) {
            this[k] = def[k];
        }
    };

    U.prototype.getRecommendations = function (restaurantId) {
        return $http.get('/user/' + this.id + '/restaurants/' + restaurantId + '/recommendations').then(function (d) {
            return d.data;
        });
    };

    return U;
});
