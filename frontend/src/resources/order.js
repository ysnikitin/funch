angular.module('funch').factory('Order', function ($resource) {
    return $resource('/lunch/:lunchId/orders/:id');
});
