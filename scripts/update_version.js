
var packageJson = require('../package.json');
updatePackageJsonVersion('../ionic/package.json', packageJson.version)
updatePackageJsonVersion('../ionic/v4/package.json', packageJson.version)
updatePackageJsonVersion('../ionic/ngx/package.json', packageJson.version)
updatePluginXLMVersion(packageJson.version)

function updatePackageJsonVersion(packageJsonFilePath, version) {
    const fs = require('fs');
    const JSON_INDENT = 4;
    var path = require("path");
    var Q = require('q');
    var deferral = new Q.defer();
    let packageJsonFile = path.resolve(__dirname, packageJsonFilePath)
    fs.readFile(packageJsonFile, (err, data) => {
        if (err) {
            return console.error('updatePackageJsonVersion', 'readFile', 'error', `packageJsonFilePath=${packageJsonFilePath}`, `version = ${version}`, `error = ${err}`);
        }
        console.log('updatePackageJsonVersion', 'readFile', 'success', `packageJsonFilePath=${packageJsonFilePath}`, `version = ${version}`);
        var packageJson = JSON.parse(data);
        packageJson.version = version;
        fs.writeFile(packageJsonFile, JSON.stringify(packageJson, undefined, JSON_INDENT), function (err) {
            if (err) {
                return console.error('updatePackageJsonVersion', 'writeFile', 'success', `packageJsonFilePath = ${packageJsonFilePath}`, `version = ${version}`, `error = ${err}`);
            }
            console.log('updatePackageJsonVersion', 'writeFile', 'success', `packageJsonFilePath = ${packageJsonFilePath}`, `version = ${version}`);
            deferral.resolve();
        });

    });

    return deferral.promise;
}

function updatePluginXLMVersion(version) {
    var Q = require('q');
    var deferral = new Q.defer();
    var fs = require('fs');
    var path = require("path");
    var xml2js = require('xml2js');

    let pluginFilePath = path.resolve(__dirname, "../plugin.xml")
    fs.readFile(pluginFilePath, (err, data) => {
        if (err) {
            return console.error('updatePluginXLMVersion', 'readFile', 'error', `version = ${version}`, `error = ${err}`);
        }
        console.log('updatePluginXLMVersion', 'readFile', 'success', `version = ${version}`);
        var xml = data;
        xml2js.parseString(xml, function (err, result) {

            if (err) {
                return console.error('updatePluginXLMVersion', 'parseString', 'error', `version = ${version}`, `error = ${err}`);
            }
            console.log('updatePluginXLMVersion', 'parseString', 'success', `version = ${version}`);

            // Get JS Obj
            var obj = result;

            obj['plugin']['$']['version'] = version;

            // Build XML from JS Obj
            var builder = new xml2js.Builder({ renderOpts: { 'pretty': true, 'indent': ' ', 'newline': '\n' } });
            var xml = builder.buildObject(obj);

            // Write config.xml
            fs.writeFile(pluginFilePath, xml, function (err) {
                if (err) {
                    return console.error('updatePluginXLMVersion', 'writeFile', 'error', `version = ${version}`, `error = ${err}`);
                }
                console.log('updatePluginXLMVersion', 'writeFile', 'success', `version = ${version}`);
                deferral.resolve();
            });
        });
    });
    return deferral.promise;
}