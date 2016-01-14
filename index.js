'use strict';

/**
 * Serverless Optimizer Plugin
 */

module.exports = function(ServerlessPlugin) {

  const path       = require('path'),
      fs           = require('fs'),
      os           = require('os'),
      babelify     = require('babelify'),
      browserify   = require('browserify'),
      UglifyJS     = require('uglify-js'),
      wrench       = require('wrench'),
      BbPromise    = require('bluebird');

  /**
   * ServerlessOptimizer
   */

  class ServerlessOptimizer extends ServerlessPlugin {

    /**
     * Constructor
     */

    constructor(S, config) {
      super(S, config);
    }

    /**
     * Define your plugins name
     */

    static getName() {
      return 'com.serverless.' + ServerlessOptimizer.name;
    }

    /**
     * Register Hooks
     */

    registerHooks() {

      this.S.addHook(this._optimize.bind(this), {
        action: 'codePackageLambdaNodejs',
        event:  'post'
      });

      return Promise.resolve();
    }

    /**
     * Optimize
     */

    _optimize(evt) {

      let _this = this;

      // Skip plugin if this function is not optimized
      if (!evt.function.custom.optimize) return BbPromise.resolve(evt);

      if (evt.function.custom.optimize.browserify) {

        return _this._browserifyBundle(evt)
            .then(optimizedCodeBuffer => {

              let envData         = fs.readFileSync(path.join(evt.function.pathDist, '.env')),
                  handlerFileName = evt.function.handler.split('.')[0];

              // Create pathsPackaged for each file ready to compress
              evt.function.pathsPackaged   = [
                // handlerFileName is the full path lambda file including dir rel to back
                { fileName: handlerFileName + '.js', data: optimizedCodeBuffer },
                { fileName: '.env', data: envData },
              ];

              evt.function.pathsPackaged = evt.function.pathsPackaged.concat(_this._generateIncludePaths(evt));

              return evt;
            })
            .catch(function(e) {console.log(e)});
      }

      // Otherwise, skip plugin
      return BbPromise.resolve(evt)
    }

    /**
     * Browserify Bundle
     * - Browserify the code and return buffer of bundled code
     */

    _browserifyBundle(evt) {

      let _this       = this;
      let uglyOptions = {
        mangle:   true, // @see http://lisperator.net/uglifyjs/compress
        compress: {},
      };

      let b = browserify({
        basedir:          evt.function.pathDist,
        entries:          [evt.function.handler.split('.')[0] + '.js'],
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

      // If Babelify is set, do it here
      if (evt.function.custom.optimize.babelify) b.transform(babelify);

      // Add custom transforms
      if (evt.function.custom.optimize.transform) {
        //SUtils.sDebug(`"${evt.stage} - ${evt.region.region} - ${evt.function.name}": Adding transform - ${evt.function.package.optimize.transform}`);
        b.transform(evt.function.custom.optimize.transform);
      }

      // browserify.exclude
      if (evt.function.custom.optimize.browserify.exclude) {
        evt.function.custom.optimize.browserify.exclude.forEach(file => {
          b.exclude(file);
        });
      }

      // browserify.ignore
      if (evt.function.custom.optimize.browserify.ignore) {
        evt.function.custom.optimize.browserify.ignore.forEach(file => {
          b.ignore(file);
        });
      }

      // Perform Bundle
      let bundledFilePath = path.join(evt.function.pathDist, 'bundled.js');   // Save for auditing
      let minifiedFilePath = path.join(evt.function.pathDist, 'minified.js'); // Save for auditing

      return new BbPromise(function(resolve, reject) {

        b.bundle(function(err, bundledBuf) {

          if (err) {
            console.error('Error running browserify bundle');
            reject(err);
          } else {

            fs.writeFileSync(bundledFilePath, bundledBuf);
            //SUtils.sDebug(`"${evt.stage} - ${evt.region.region} - ${evt.function.name}": Bundled file created - ${bundledFilePath}`);

            if (evt.function.custom.optimize.minify) {

              //SUtils.sDebug(`"${evt.stage} - ${evt.region.region} - ${evt.function.name}": Minifying...`);

              let result = UglifyJS.minify(bundledFilePath, uglyOptions);

              if (!result || !result.code) {
                reject(new SError('Problem uglifying code'));
              }

              fs.writeFileSync(minifiedFilePath, result.code);

              //SUtils.sDebug(`"${evt.stage} - ${evt.region.region} - ${evt.function.name}": Minified file created - ${minifiedFilePath}`);

              resolve(result.code);
            } else {
              resolve(bundledBuf);
            }
          }
        });
      });
    }

    /**
     * Generate Include Paths
     */

    _generateIncludePaths(evt) {

      let compressPaths = [],
          ignore        = ['.DS_Store'],
          stats,
          fullPath,
          srcPath,
          destPath,
          destDirPath;

      // Skip if undefined
      if (!evt.function.custom.optimize.includePaths) return compressPaths;

      // Collect includePaths
      evt.function.custom.optimize.includePaths.forEach(p => {
        if( p.src && p.dest ){
          srcPath = p.src;
          destPath = p.dest;
          destDirPath = p.dest;
        } else {
          srcPath = p;
          destPath = p;
          destDirPath = path.basename(p);
        }

        try {
          fullPath = path.resolve(path.join(evt.function.pathDist, srcPath));
          stats    = fs.lstatSync(fullPath);
        } catch (e) {
          console.error('Cant find includePath ', srcPath, e);
          throw e;
        }

        if (stats.isFile()) {
          compressPaths.push({fileName: destPath, data: fs.readFileSync(fullPath)});
        } else if (stats.isDirectory()) {

          wrench
              .readdirSyncRecursive(fullPath)
              .forEach(file => {

                // Ignore certain files
                for (let i = 0; i < ignore.length; i++) {
                  if (file.toLowerCase().indexOf(ignore[i]) > -1) return;
                }

                let filePath = [fullPath, file].join('/');
                if (fs.lstatSync(filePath).isFile()) {
                  let pathInZip = path.join(destDirPath, file);
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