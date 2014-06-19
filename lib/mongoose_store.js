var MongoDBStore = function(opts) {
    var
        DataStore = require("machinist-js").DataStore,
        Q = require('q'),
        mongoose = require("mongoose"),
        _opts = opts,
        client,
        connection;

    if(!_opts.connectionUrl && !_opts.host && !_opts.port) {
        _opts.connectionUrl = 'mongodb://localhost:27017/';
    } else if(!_opts.connectionUrl && _opts.host && !_opts.port) {
        _opts.connectionUrl = 'mongodb://'+ _opts.host + ':27017/';
    } else if(!_opts.connectionUrl && _opts.host && _opts.port) {
        _opts.connectionUrl = 'mongodb://'+ _opts.host + ':'+ _opts.port + '/';
    }

    if(_opts.database) {
        _opts.connectionUrl += _opts.database;
    }

    var self = DataStore(_opts);

    self.find = function(Model, query) {
        var deferred = Q.defer();
        mongoose.connect(_opts.connectionUrl, function (err) {
            if (err) deferred.reject(err);
            Model
                .find(query)
                .exec(function(err, docs){
                    mongoose.disconnect();
                    if(err) deferred.reject(err);
                    deferred.resolve(docs);
                })
        });
        return deferred.promise;
    };

    self.findOne = function(Model, query) {
        var deferred = Q.defer();
        mongoose.connect(_opts.connectionUrl, function (err) {
            if (err) deferred.reject(err);
            Model
                .findOne(query)
                .exec(function(err, doc){
                    mongoose.disconnect();
                    if(err) deferred.reject(err);
                    deferred.resolve(doc);
                })
        });
        return deferred.promise;
    };

    self.findOrMake = function(Model, obj) {
        var deferred = Q.defer();
        var promise = self.find(Model, obj);
        promise.then(
            function(docs) {
                if(docs && docs.length > 0) {
                    deferred.resolve(docs[0]);
                } else {
                    deferred.resolve(self.make(Model, obj));
                }
            },
            function(err){
                if(err) deferred.reject(err);
            }
        );
        return deferred.promise;
    };

    self.make = function(Model, obj) {
        var deferred = Q.defer();
        var model = new Model(obj);
        mongoose.connect(_opts.connectionUrl, function (err) {
            if (err) deferred.reject(err);
            model.save(function(err, saved){
                mongoose.disconnect();
                if(err) deferred.reject(err);
                if(saved) {
                    return deferred.resolve(saved);
                } else {
                    deferred.resolve(null);
                }
            });
        });

        return deferred.promise;
    };

    self.clear = function(Model, args) {
        var deferred = Q.defer();
        mongoose.connect(_opts.connectionUrl, function (err) {
            var collection = Model.db.collection(Model.collection.name);
            collection.drop(function(err){
                mongoose.disconnect();
                if(err) deferred.reject(err);
                deferred.resolve();
            });
        });
        return deferred.promise;
    };

    self.clearAll = function(args) {
        var deferred = Q.defer();
        mongoose.connect(_opts.connectionUrl, function (err) {
            var db = mongoose.connection;
            mongoose.connection.db.dropDatabase(function(err){
                mongoose.disconnect();
                if(err) deferred.reject(err);
                deferred.resolve();
            });
        });
        return deferred.promise;
    };

    return self;

};

module.exports = MongoDBStore;
