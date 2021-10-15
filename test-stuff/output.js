
  const modules = {"test-stuff/to-bundle/index.js": function(exports, require) { const {
  add: add
} = require("test-stuff/to-bundle/add.js");

const {
  substract: substract
} = require("test-stuff/to-bundle/substract.js");

console.log(substract(add(1, 2), -5)); },"test-stuff/to-bundle/add.js": function(exports, require) { exports.add = (a, b) => a + b; },"test-stuff/to-bundle/substract.js": function(exports, require) { exports.substract = (a, b) => a - b; },};
  const entry = "test-stuff/to-bundle/index.js";
  function webpackStart({ modules, entry }) {
    const moduleCache = {};
    const require = moduleName => {
      // if in cache, return the cached version
      if (moduleCache[moduleName]) {
        return moduleCache[moduleName];
      }
      const exports = {};
      // this will prevent infinite "require" loop
      // from circular dependencies
      moduleCache[moduleName] = exports;
  
      // "require"-ing the module,
      // exported stuff will assigned to "exports"
      modules[moduleName](exports, require);
      return moduleCache[moduleName];
    };
  
    // start the program
    require(entry);
  }
  
  webpackStart({ modules, entry });  
