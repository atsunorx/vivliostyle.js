var fs = require("fs");
var path = require("path");
var glob = require("glob");

glob("node_modules/hyphenation.*", {}, function (er, modules) {
    modules.forEach(function(modulePath){
        var dictionary = require(path.basename(modulePath));
        var ids = typeof dictionary.id == "string" ? [dictionary.id] : dictionary.id;
        var body = JSON.stringify(dictionary);
        ids.forEach(function(id) {
            var dst = "plugins/hyphenation/resources/" + id.toLowerCase() + ".json";
            fs.writeFileSync(dst, body);
        });
    });
});
