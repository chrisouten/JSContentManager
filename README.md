JSContentManager
================

A javascript content manager
Hopefully this will be a content manager akin to XNA 


Example usage

var cm = require("./contentmanager");
cm.init("./server/content/");

var blah = new testObj(0,0).loadContent("orc", function() { console.log(blah); });