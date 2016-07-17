angular.module('funch').factory('User', function ($resource) {
    return $resource('/user/:id', {}, {
        recommendations: {
            method: 'GET',
            path: '/user/:id/restaurants/:restaurantId/recommendations'
        }
    });
});
