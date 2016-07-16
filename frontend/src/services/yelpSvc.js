angular.module('funch').service('YelpSvc', function ($http) {
    function rndstr (length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    }

    this.search = function (term) {
        var method = 'GET';
        var url = 'http://api.yelp.com/v2/search';

        var params = {
            callback: 'angular.callbacks._0',
            location: 'Boston+MA',
            oauth_consumer_key: 'LjPEaXQFtErjHCNlVBOmQw',
            oauth_token: 'xFZNMupFpAba5e3yJMBW3Ktix6ROios5',
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: new Date().getTime(),
            oauth_nonce: rndstr(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            term: term
        };

        var consumerSecret = 'bltz9AZvILgqSCBo7tqMK3gP54w';
        var tokenSecret = '1QSFZqJKM34YmKm9_5DUyZAo0fs';

        var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, {
            encodeSignature: false
        });

        params['oauth_signature'] = signature;

        return $http.jsonp(url, {
            params: params
        }).then(function (d) {
            return d.data.businesses;
        });
    };
});
