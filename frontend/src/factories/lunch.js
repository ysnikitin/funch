angular.module('funch').factory('Lunch', function ($http) {
    var L = function (def) {
        for (var k in def) {
            this[k] = def[k];
        }

        if (this.onduty && this.onduty instanceof Array) {
            this.onduty = this.onduty.map(function (u) {
                return +u;
            });
        }
    };

    L.prototype.getOrders = function () {
        return $http.get('/lunch/' + this.id + '/orders').then(function (d) {
            return d.data;
        });
    };

    L.prototype.getOrder = function (orderId) {
        return $http.get('/lunch/' + this.id + '/orders/' + orderId).then(function (d) {
            return d.data;
        });
    };

    L.prototype.makeOrder = function (order) {
        return $http.post('/lunch/' + this.id + '/orders', order).then(function (d) {
            return d.data;
        });
    };

    L.prototype.updateOrder = function (order) {
        var id = order.id;

        delete order.ordertime;
        delete order.lunchId;
        delete order.id;

        return $http.put('/lunch/' + this.id + '/orders/' + id, order).then(function (d) {
            return d.data;
        });
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

    L.prototype.inviteGuest = function (guest) {
        return $http.post('/lunch/' + this.id + '/email', guest);
    };

    return L;
});
