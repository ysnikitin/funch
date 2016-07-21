angular.module('funch').service('Suggestions', function ($uibModal) {
    this.open = function (restaurant, user) {
        var m = $uibModal.open({
            animation: true,
            templateUrl: 'components/suggestions/suggestions.html',
            controller: 'SuggestionsCtrl',
            size: 'md',
            controllerAs: 'vm',
            backdrop: 'static',
            keyboard: false
        });

        m.restaurant = restaurant;
        m.user = user;

        return m;
    };
});
