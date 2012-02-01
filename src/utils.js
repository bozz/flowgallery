
/**
 * helper function to get current plugin version
 * @return {string}
 */
var getVersion = function () {
  return '1.0.0pre';
}


/**
 * helper function to capitalize first letter of string
 * @return {string}
 */
var capitaliseFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


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
var filterPrototype = function (config) {
  var proto = {};
  var i;

  if (config.src) {
    var src = config.src;
    // special accessor to get full source object
    proto._getSource = function () {
      return config.src;
    };

    if (config.getters) {
      var createGetter = function (g) {
        proto['get' + capitaliseFirstLetter(g)] = function () {
          return src[g];
        };
      };
      for (i = 0; i < config.getters.length; i++) {
        createGetter(config.getters[i]);
      }
    }
    if (config.setters) {
      var createSetter = function (s) {
        proto['set' + capitaliseFirstLetter(s)] = function (val) {
          src[s] = val;
        };
      }
      for (i = 0; i < config.setters.length; i++) {
        createSetter(config.setters[i]);
      }
    }
    if (config.methods) {
      for (i = 0; i < config.methods.length; i++) {
        method = config.methods[i];
        proto[method] = $.proxy(config.src[method], config.src);
      }
    }
    if (config.version) {
      proto._version = config.version;
    }
  }
  return proto;
};
