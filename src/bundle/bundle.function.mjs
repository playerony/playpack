function collect(module, modules) {
  modules.push(module);
  module.dependencies.forEach((dependency) => collect(dependency, modules));
}

const traverseModules = (dependencyGraph) => {
  const modules = [];
  collect(dependencyGraph, modules);

  return modules;
};

const toWebpackModuleMap = (modules) => {
  let result = '{';
  for (const module of modules) {
    result += `"${module.filePath}": function(exports, require) { ${module.content} },`;
  }

  result += '}';
  return result;
};

const addRuntime = (moduleMap, entryPoint) =>
`
  const modules = ${moduleMap};
  const entry = "${entryPoint}";
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
`;

export const bundle = (dependencyGraph) => {
  const modules = traverseModules(dependencyGraph);
  const moduleMap = toWebpackModuleMap(modules);

  return addRuntime(moduleMap, modules[0].filePath);
};
