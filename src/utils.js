
/**
 * helper function to get current plugin version
 * @return {string}
 */
var getVersion = function () {
  return "{{Version}}";
};


/**
 * Method takes an object (config.src) and copies references
 * of all specified attributes and functions, these are then
 * returned in a new object. This new object can then be used
 * to extend another object.
 * @param {Object} config.src
 * @param {array}  config.getters
 * @param {array}  config.setters
 * @param {array}  config.methods
 * @return {array}
 */
var ApiGenerator = (function() {

  var src, i, length;

  /**
   * helper function to capitalize first letter of string
   * @return {string}
   */
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // create closure for correct scope
  function createGetter(g, scope) {
    if(src[g]) {
      scope['get' + capitalize(g)] = function () {
        return src[g];
      };
    }
  }


  // create closure for correct scope
  function createSetter(s, scope) {
    if(src[s]) {
      scope['set' + capitalize(s)] = function (val) {
        src[s] = val;
      };
    }
  }


  function initApi(scope, config) {
    // special accessor to get full source object
    scope._getSource = function () {
      return src;
    };
    if (config.getters) {
      length = config.getters.length;
      for (i = 0; i < length; i++) {
        createGetter(config.getters[i], scope);
      }
    }
    if (config.setters) {
      length = config.setters.length;
      for (i = 0; i < length; i++) {
        createSetter(config.setters[i], scope);
      }
    }
    if (config.methods) {
      length = config.methods.length;
      for (i = 0; i < length; i++) {
        method = config.methods[i];
        if(src[method]) {
          scope[method] = $.proxy(src[method], src);
        }
      }
    }
    if (config.version) {
      scope._version = config.version;
    }
  }

  return {
    init: function(SrcConstructor, config) {
      return function api() {
        if(typeof SrcConstructor === 'function') {
          // workaround to pass 'arguments' to Constructor
          // see: http://stackoverflow.com/a/3362623
          var args = Array.prototype.slice.call(arguments);
          var inst, ret;
          var Temp = function(){};
          Temp.prototype = SrcConstructor.prototype;
          inst = new Temp();
          ret = SrcConstructor.apply(inst, args);
          src = typeof ret === 'object' ? ret : inst;

          initApi(this, config);
          return this;
        }
      };
    }
  };

})();
