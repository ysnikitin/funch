angular.module('funch').config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'src/routes/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'vm'
        })
        .state('main', {
            abstract: true,
            templateUrl: 'src/routes/main/main.html'
        })
        .state('main.create', {
            url: '/create',
            templateUrl: 'src/routes/create/create.html',
            controller: 'CreateCtrl',
            controllerAs: 'vm'
        })
        .state('main.history', {
            url: '/history',
            templateUrl: 'src/routes/history/history.html',
            controller: 'HistoryCtrl',
            controllerAs: 'vm'
        })
        .state('main.lunch', {
            url: '/lunch/:code',
            templateUrl: 'src/routes/lunch/lunch.html',
            controller: 'LunchCtrl',
            controllerAs: 'vm'
        });
});
