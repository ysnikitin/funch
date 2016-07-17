angular.module('funch').factory('User', function ($resource, $http) {
    var u = $resource('/user/:id');

    u.prototype.recommendations = function (restaurantId) {
        return $http.get('/user/' + this.id + '/restaurants/' + restaurantId + '/recommendations').then(function (data) {
            return data.data;
        });
    };

    return u;
});
