var fs = require('fs');
var uuid = require('uuid');
var config = require('./../../config');



exports.alert_upload_image = function(req, res) {
    var baseUrl = 'http://' + config.server.host + ':' + config.server.port;
    fs.readFile(req.files.upload.path, function (err, data) {
        var id = uuid.v4();
        var newPath = __dirname + '/../uploads/' + id;
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
                html = "";
                html += "<script type='text/javascript'>";
                html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
                html += "    var url     = \"" + baseUrl + "/uploads/" + id + "\";";
                html += "    var message = \"Uploaded file successfully\";";
                html += "";
                html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
                html += "</script>";

                res.send(html);
            }
        });
    });
}