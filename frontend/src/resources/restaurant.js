angular.module('funch').factory('Restaurant', function ($resource) {
    return $resource('/restaurants/:id', {}, {
        favorites: {
            method: 'GET'
        },
        quickpicks: {
            method: 'GET'
        }
    });
});
