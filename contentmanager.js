var fs = require('fs');


ContentManager = {

    _counter : 0,
    _currentlyProcessing : {},
    _cpCallBackCounter : {},

    init : function(assetDirectory) {
        this.assetDirectory = assetDirectory;
    },

    getFile : function(path, objIndex, callback, extraProperty) {
        fs.readFile(path, 'utf8', function(err, json_string) {
            if(err) {
                console.error("Could not open content file:", err.path);
                callback(null);
            } else {
                callback(objIndex, JSON.parse(json_string), extraProperty);
            }
        });
    },

    loadContent : function(fileName, callback) {
        ContentManager._currentlyProcessing[ContentManager._counter] = {};
        ContentManager._cpCallBackCounter[ContentManager._counter] = {'started': 1, 'completed': 0, 'callback': callback};
        ContentManager._load(fileName, ContentManager._counter, callback);
        ContentManager._counter++;
    },

    _load : function(fileName, objIndex, callback, extraProperty) {
        var file = this.assetDirectory + fileName + ".json";
	    ContentManager.getFile(file, objIndex, ContentManager._loadData, extraProperty);
    },

    _loadData : function(objIndex, content, extraProperty) {
        var obj = {};
	    for (p in content) {
		    var property = content[p];
		    if (property.AssetType !== undefined) {
		        ContentManager._load(property.AssetType, objIndex, ContentManager._processedContent, p)
                ContentManager._cpCallBackCounter[objIndex].started++;
		    } else {
		    	obj[p] = property;
		    }
	    }
        ContentManager._processedContent(obj, objIndex, extraProperty);
    },

    _processedContent : function(obj, objIndex, extraProperty) {
        ContentManager._cpCallBackCounter[objIndex].completed++;
        ContentManager._currentlyProcessing[objIndex] = ContentManager._extendObject(ContentManager._currentlyProcessing[objIndex], obj, extraProperty);
        if (ContentManager._cpCallBackCounter[objIndex].started == ContentManager._cpCallBackCounter[objIndex].completed) {
            ContentManager._cpCallBackCounter[objIndex].callback(ContentManager._currentlyProcessing[objIndex]);
            delete(ContentManager._currentlyProcessing[objIndex]);
            
        }
        
    },

    _extendObject: function(current, extra, extraProperty) {
        if (extraProperty === null || extraProperty === undefined) {       
            for (p in extra) {
                current[p] = extra[p];
            }
        } else {
            current[extraProperty] = extra;
        }
        return current;
    }


};

Object.prototype.loadContent = function(filename, callback) {
            var self = this;
            ContentManager.loadContent(filename, 
                function(loadedContent) {
                    for (p in loadedContent) {
                        if (self[p] === undefined) {
                            self[p] = loadedContent[p];
                        }
                    }
                    if (callback) {
                        callback();
                    }
             });
             return self;
        }

module.exports = ContentManager;



