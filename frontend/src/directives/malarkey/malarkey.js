angular.module('funch').directive('acmeMalarkey', function () {
    return {
        restrict: 'E',
        scope: {
          extraValues: '='
        },
        template: '&nbsp;',
        link: function (scope, el, attr, vm) {
          var watcher;
          var typist = malarkey(el[0], {
            typeSpeed: 40,
            deleteSpeed: 40,
            pauseDelay: 800,
            loop: true,
            postfix: ' '
          });

          el.addClass('acme-malarkey');

          angular.forEach(scope.extraValues, function(value) {
            typist.type(value).pause().delete();
          });

          watcher = scope.$watch('vm.contributors', function() {
            angular.forEach(vm.contributors, function(contributor) {
              typist.type(contributor.login).pause().delete();
            });
          });

          scope.$on('$destroy', function () {
            watcher();
          });
        }
    }
});
