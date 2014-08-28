module.exports = function (config) {

  config.set({
    basePath: '',
    frameworks: ['browserify', 'mocha', 'chai'],
    files: ['test/*.js'],
    reporters: ['progress'],
    colors: true,
    preprocessors: {'test/*.js': ['browserify']},
    client: {
      mocha: {
        ui: 'bdd'
      }
    }
  });

};
