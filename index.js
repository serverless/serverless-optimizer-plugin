'use strict';

/**
 * Serverless Optimizer Plugin
 */

module.exports = function(serverlessPath) {

  const SPlugin    = require(path.join(serverlessPath, 'ServerlessPlugin')),
      fs           = require('fs'),
      os           = require('os'),
      path         = require('path'),
      babelify     = require('babelify'),
      browserify   = require('browserify'),
      UglifyJS     = require('uglify-js'),
      wrench       = require('wrench'),
      BbPromise    = require('bluebird');

  /**
   * ServerlessOptimizer
   */

  class ServerlessOptimizer extends SPlugin {

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
        action: 'codePackageLambdaNodeJs',
        event:  'post'
      });

      return Promise.resolve();
    }

    /**
     * Optimize
     */

    _optimize(evt) {

      let _this = this;

      return new BbPromise(function (resolve, reject) {


        return resolve(evt);

      });
    }
  }

  // Export Plugin Class
  return ServerlessOptimizer;

};