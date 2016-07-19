angular.module('funch').factory('Order', function ($resource) {
    var o = $resource('/lunch/:lunchId/orders/:id', {
        lunchId: '@lunchId',
        id: '@id'
    }, {
        update: {
            method: 'PUT'
        }
    });

    o.prototype.$saveOrUpdate = function() {
        if (this.id) {
            return this.$update();
        } else {
            return this.$save();
        }
    };

    return o;
});
