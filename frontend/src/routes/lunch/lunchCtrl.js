angular.module('funch').controller('LunchCtrl', function (LunchSvc) {
    var vm = this;

    var ID = 1;

    vm.lunch = undefined;

    //LunchSvc.get(ID).then(function (l) {
        //vm.lunch = l;

        //var stoptime = moment(vm.lunch.stoptime);
        var stoptime = moment('07-15-2016 10:45:00');
        var curtime = moment();
        var duration = moment.duration((stoptime - curtime) * 1000, 'milliseconds');



        vm.countdown = {
            hours: duration.hours(),
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };

        console.log(vm.countdown );
    //});

    vm.orders = [{
        name: 'MD',
        order: 'Cheeseburger and fries'
    },{
        name: 'JN',
        order: 'Nothing if it\'s Bonapita'
    },{
        name: 'AK',
        order: 'Caesar salad'
    },{
        name: 'McD',
        order: 'Anything but tomatoes'
    }, {
        name: 'AF',
        order: undefined
    }, {
        name: 'SR',
        order: undefined
    }, {
        name: 'TS',
        order: 'Pepperoni pizza'
    }, {
        name: 'JM',
        order: 'Boars Head sandwhich'
    }];
});
