angular.module('funch').factory('User', function () {
    var U = function (def) {
        for (var k in def) {
            this[k] = def[k];
        }
    };

    U.prototype.getHistory = function (restaurantId) {
        return $http.get('/users/' + this.id + '/restaurants/' + restaurantId + '/recommendations').then(function (d) {
            return d.data.data;
        });
    };

    return U;
});
