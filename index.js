'use strict';

/**
 * Serverless Optimizer Plugin
 */

module.exports = function(ServerlessPlugin) {
  const _          = require('lodash'),
    Promise        = require('bluebird'),
    browserify     = require('browserify'),
    fs             = require('fs'),
    os             = require('os'),
    path           = require('path'),
    wrench         = require('wrench');

  const DEFAULT_CONFIG = {
    includePaths: [],
    requires: [],
    plugins: [],
    transforms: [],
    exclude: [],
    ignore: [],
  };


  /**
   * ServerlessOptimizer
   */

  class ServerlessOptimizer extends ServerlessPlugin {

    constructor(S, config) {
      super(S, config);
    }

    static getName() {
      return 'com.serverless.' + ServerlessOptimizer.name;
    }

    registerHooks() {
      this.S.addHook(this._optimize.bind(this), {
        action: 'codePackageLambdaNodejs',
        event:  'post'
      });

      return Promise.resolve();
    }

    _optimize(evt) {
      let self = this;
      let conf = _.merge({}, DEFAULT_CONFIG, this.S._projectJson.custom.optimize, evt.function.custom.optimize);

      return self._browserifyBundle(evt, conf).then(buffer => {
        let bundledFilePath = path.join(evt.function.pathDist, 'bundled.js');   // Save for auditing
        fs.writeFileSync(bundledFilePath, buffer);

        let envData = fs.readFileSync(path.join(evt.function.pathDist, '.env'));
        let handlerFileName = evt.function.handler.split('.')[0];

        // Create pathsPackaged for each file ready to compress
        evt.function.pathsPackaged   = [
          // handlerFileName is the full path lambda file including dir rel to back
        { fileName: handlerFileName + '.js', data: buffer },
        { fileName: '.env', data: envData },
        ];

        evt.function.pathsPackaged = evt.function.pathsPackaged.concat(self._generateIncludePaths(evt, conf));

        return evt;
      }).catch(e => console.log('\n\n' + (e.toString ? e.toString() : e) + '\n'));
    }

    /**
     * Browserify Bundle
     * - Browserify the code and return buffer of bundled code
     */

    _browserifyBundle(evt, conf) {
      let b = browserify({
        basedir:          fs.realpathSync(evt.function.pathDist),
        entries:          [evt.function.handler.split('.')[0] + '.' + (conf.handlerExt || 'js')],
        standalone:       'lambda',
        browserField:     false,  // Setup for node app (copy logic of --node in bin/args.js)
        builtins:         false,
        commondir:        false,
        ignoreMissing:    true,  // Do not fail on missing optional dependencies
        detectGlobals:    true,  // Default for bare in cli is true, but we don't care if its slower
        insertGlobalVars: {      // Handle process https://github.com/substack/node-browserify/issues/1277
          //__filename: insertGlobals.lets.__filename,
          //__dirname: insertGlobals.lets.__dirname,
          process: function() {}
        }
      });

      // browserify.require
      conf.requires.map(req => {
        if (typeof(req) === typeof(''))
          req = {name: req};
        b.require(req.name, req.opts);
      });

      // browserify.plugin
      conf.plugins.map(plug => {
        if (typeof(plug) === typeof(''))
          plug = {name: plug};
        b.plugin(require(plug.name), plug.opts);
      });

      // browserify.transform
      conf.transforms.map(transform => {
        if (typeof(transform) === typeof(''))
          transform = {name: transform};
        b.transform(require(transform.name), transform.opts);
      });

      // browserify.exclude
      conf.exclude.forEach(file => b.exclude(file));

      // browserify.ignore
      conf.ignore.forEach(file => b.ignore(file));

      // Perform Bundle
      let bundledFilePath = path.join(evt.function.pathDist, 'bundled.js');   // Save for auditing

      return Promise.fromNode(cb => {
        b.bundle(cb);
      });
    }

    /**
     * Generate Include Paths
     */

    _generateIncludePaths(evt, conf) {
      let compressPaths = [],
      ignore        = ['.DS_Store'],
      stats,
        fullPath;


      // Collect includePaths
      conf.includePaths.forEach(p => {
        try {
          fullPath = path.resolve(path.join(evt.function.pathDist, p));
          stats    = fs.lstatSync(fullPath);
        } catch (e) {
          console.error('Cant find includePath ', p, e);
          throw e;
        }

        if (stats.isFile()) {
          compressPaths.push({fileName: p, data: fs.readFileSync(fullPath)});
        } else if (stats.isDirectory()) {

          let dirname = path.basename(p);

          wrench
            .readdirSyncRecursive(fullPath)
            .forEach(file => {

              // Ignore certain files
              for (let i = 0; i < ignore.length; i++) {
                if (file.toLowerCase().indexOf(ignore[i]) > -1) return;
              }

              let filePath = [fullPath, file].join('/');
              if (fs.lstatSync(filePath).isFile()) {
                let pathInZip = path.join(dirname, file);
                compressPaths.push({fileName: pathInZip, data: fs.readFileSync(filePath)});
              }
            });
        }
      });

      return compressPaths;
    }
  }

  // Export Plugin Class
  return ServerlessOptimizer;

};
