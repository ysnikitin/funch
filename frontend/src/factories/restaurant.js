angular.module('funch').factory('Restaurant', function () {
    var R = function (def) {
        this.def = def;
    };

    R.prototype.getQuickPicks = function () {
        return $http.get('/restaurants/' + this.def.id + '/quickpicks').then(function (d) {
            return d.data.data;
        });
    };

    R.prototype.save = function () {
        return $http.put('/restaurants/' + this.def.id);
    };

    return R;
});
