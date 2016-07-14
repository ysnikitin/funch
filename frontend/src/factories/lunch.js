angular.module('funch').factory('Lunch', function () {
    var L = function (def) {
        for (var k in def) {
            this[k] = def[k];
        }
    };

    L.prototype.getOrders = function () {
        return $http.get('/lunch/' + this.id + '/orders').then(function (d) {
            return d.data.data;
        });
    };

    L.prototype.makeOrder = function (orders) {
        return $http.post('/lunch/' + this.id + '/orders', orders);
    };

    L.prototype.updateOrder = function (order) {
        return $http.put('/lunch/' + this.id + '/orders/' + order.id, order);
    };

    L.prototype.destroyOrder = function (order) {
        return $http.delete('/lunch/' + this.id + '/orders/' + order.id);
    };

    L.prototype.save = function () {
        return $http.put('/lunch/' + this.id);
    };

    L.prototype.destroy = function () {
        return $http.delete('/lunch/' + this.id);
    };

    return L;
});
