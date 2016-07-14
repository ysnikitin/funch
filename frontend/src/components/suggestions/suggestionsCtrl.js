angular.module('funch').controller('SuggestionsCtrl', function ($uibModalInstance) {
    var vm = this;

    vm.restaurant = $uibModalInstance.restaurant;
    vm.user = $uibModalInstance.user;

    vm.user.getRecommendations(vm.restaurant.id).then(function (sg) {
        vm.suggestions = sg;
    });

    vm.order = function (name) {
        $uibModalInstance.close(name);
    };

    vm.close = function () {
        $uibModalInstance.close();
    };
});
