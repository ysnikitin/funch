angular.module('funch').factory('User', function () {
    var U = function (def) {
        this.def = def;
    };

    U.prototype.getHistory = function (restaurantId) {
        return $http.get('/users/' + this.def.id + '/restaurants/' + restaurantId + '/recommendations').then(function (d) {
            return d.data.data;
        });
    };

    return U;
});
