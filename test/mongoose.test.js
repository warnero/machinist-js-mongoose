var
    should = require("should"),
    machinist = require("machinist-js"),
    opts = {database: 'machinist-mongoose-test'},
    store = require("../lib/mongoose_store")(opts),
    mongoose = require("mongoose"),
    User = require("./models/user").Model,
    UserSchema = require("./models/user").Schema,
    MongoClient = require('mongodb').MongoClient;

describe("Machinist API", function(){
    var
        userBlueprint,
        createdDocId,
        myObj = {
            name: "Test User",
            username: "test",
            emails: ["test@test.com"],
            active: true
        },
        testDoc;

    before(function(done){
        this.timeout(20000);
        machinist.addStore(store);
        userBlueprint = machinist.blueprint("user", User, {
            active: true
        });
        var user = new User(myObj);
        var TempModel = mongoose.model("Temp", UserSchema);
        var temp = new TempModel(myObj);
        mongoose.connect(opts.connectionUrl, function (err) {
            user.save(function(err, saved){
                if(saved) {
                    testDoc = saved;
                    temp.save(function(err, saved){
                        mongoose.disconnect();
                        if(saved) {
                            done();
                        } else {
                            done("second insert failed");
                        }
                    });
                } else {
                    mongoose.disconnect();
                    done("insert failed");
                }
            });
        });
    });

    // beforeEach(function(done){
    //     mongoose.connect(opts.connectionUrl, function (err) {
    //         done(err);
    //     });
    // });

    it("should create a new Mongoose store", function(done){
        var mongoose = require("../lib/mongoose_store")({database: 'machinist-mongoose-test'});
        should.exist(mongoose);
        done();
    });


    it("make: it should create a new user using blueprint", function(done){
        // this.timeout(20000);
        var promise = machinist.blueprint("user").make({
            name: "Warner Onstine",
            username: "warner",
            emails: ["warner@test.com"]
        });

        promise.then(
            function(doc) {
                should.exist(doc);
                doc.name.should.equal("Warner Onstine");

                //check default value of blueprint
                doc.active.should.equal(true);
                createdDocId = doc._id;
                done();
            },
            function(err){
                should.not.exist(err);
                done();
            }
        );
    });

    it("findOne: it should find one existing user", function(done){
        // this.timeout(20000);
        var promise = machinist.blueprint("user").findOne({
            _id: createdDocId
        });

        promise.then(
            function(doc) {
                should.exist(doc);
                doc.name.should.equal("Warner Onstine");

                //check default value of blueprint
                doc.active.should.equal(true);
                done();
            },
            function(err){
                should.not.exist(err);
                done();
            }
        );
    });

    it("find: it should find one existing user", function(done){
        // this.timeout(20000);
        var promise = machinist.blueprint("user").find({
            name: "Warner Onstine"
        });

        promise.then(
            function(docs) {
                should.exist(docs);
                docs.length.should.be.above(0);
                return done();
            },
            function(err){
                should.not.exist(err);
                return done();
            }
        );
    });

    it("findOrMake: it should create a new user using blueprint.findOrMake", function(done){
        // this.timeout(20000);
        var promise = machinist.blueprint("user").findOrMake({
            name: "Adam Englander",
            username: "adam",
            emails: ["adam@test.com"]
        });

        promise.then(
            function(doc) {
                should.exist(doc);
                doc.name.should.equal("Adam Englander");
                //check default value of blueprint
                doc.active.should.equal(true);
                return done();
            },
            function(err){
                should.not.exist(err);
                return done();
            }
        );
    });

    it("findOrMake: it should find an existing user using blueprint.findOrMake", function(done){
        // this.timeout(40000);
        var promise = machinist.blueprint("user").findOrMake(myObj);

        promise.then(
            function(doc) {
                should.exist(doc);
                doc.name.should.equal(testDoc.name);
                doc.username.should.equal(testDoc.username);
                doc.emails.length.should.equal(testDoc.emails.length);
                return done();
            },
            function(err){
                should.not.exist(err);
                return done();
            }
        );
    });

    it("clear: it should clear the users collection", function(done){
        // this.timeout(20000);
        var promise = machinist.stores.default.clear(User);
        promise.then(
            function() {
                MongoClient.connect(opts.connectionUrl, function(err, db) {
                    if(err) done(err);
                    db.collection("users").find().toArray(function(err, docs) {
                        should.not.exist(err);
                        docs.length.should.equal(0);
                        db.collection("temps").find().toArray(function(err,docs){
                            docs.length.should.equal(1);
                            done();
                        });
                    });
                });
            },
            function(err) {
                should.not.exist(err);
                done();
            }
        );
    });

    it("clearAll: it should clear all the collections", function(done){
        this.timeout(4000);
        var promise = machinist.stores.default.clearAll();
        promise.then(
            function() {
                setTimeout(MongoClient.connect(opts.connectionUrl, function(err, db) {
                    if(err) done(err);
                    db.collection("users").find().toArray(function(err, docs) {
                        should.not.exist(err);
                        docs.length.should.equal(0);
                        db.collection("temps").find().toArray(function(err,docs){
                            docs.length.should.equal(0);
                            done();
                        });
                    });
                }), 2000);
            },
            function(err) {
                should.not.exist(err);
                done();
            }
        );
    });

});
