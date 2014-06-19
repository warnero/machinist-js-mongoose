var UserModel = function(){

    var
        mongoose = require("mongoose"),
        uuid = require("node-uuid");

    var _jsonSchema = {
        _id: {type: String, "default": uuid.v4},
        name: String,
        username: String,
        emails: [String],
        active: {type: Boolean, "default":false}
    };

    var _schema = mongoose.Schema(_jsonSchema);

    var _model = mongoose.model("User", _schema);

    return {
        Schema: _schema,
        Model: _model,
        jsonSchema: _jsonSchema
    };

}();

module.exports = UserModel;
