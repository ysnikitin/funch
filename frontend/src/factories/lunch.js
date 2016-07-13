angular.module('funch').factory('Lunch', function () {
    var L = function (def) {
        this.def = def;
    };

    L.prototype.getOrders = function () {
        return $http.get('/lunch/' + this.def.id + '/orders').then(function (d) {
            return d.data.data;
        });
    };

    L.prototype.makeOrder = function (orders) {
        return $http.post('/lunch/' + this.def.id + '/orders', orders);
    };

    L.prototype.updateOrder = function (order) {
        return $http.put('/lunch/' + this.def.id + '/orders/' + order.id, order);
    };

    L.prototype.destroyOrder = function (order) {
        return $http.delete('/lunch/' + this.def.id + '/orders/' + order.id);
    };

    L.prototype.save = function () {
        return $http.put('/lunch/' + this.def.id);
    };

    L.prototype.destroy = function () {
        return $http.delete('/lunch/' + this.def.id);
    };

    return L;
});
