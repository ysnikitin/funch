angular.module('funch').factory('Restaurant', function () {
    var R = function (def) {
        for (var k in def) {
            this[k] = def[k];
        }
    };

    R.prototype.getQuickPicks = function () {
        return $http.get('/restaurants/' + this.id + '/quickpicks').then(function (d) {
            return d.data.data;
        });
    };

    R.prototype.save = function () {
        return $http.put('/restaurants/' + this.id);
    };

    return R;
});
