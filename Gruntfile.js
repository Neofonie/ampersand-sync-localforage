'use strict';

module.exports = function(grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test']
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      dev: {
        autoWatch: true,
        browsers: ['Firefox', 'Chrome', 'PhantomJS']
      },
      build: {
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    concurrent: {
      dev: {
        tasks: ['watch', 'karma:dev'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    bump: {
      options: {
        commitFiles: ['package.json', 'CHANGELOG.md'],
        pushTo: 'origin'
      }
    },
    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: 'angular'
        }
      },
      release: {
        src: 'CHANGELOG.md'
      }
    }
  });

  grunt.registerTask('dev', ['concurrent:dev']);

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:build']);

  grunt.registerTask('release', 'Alias for "bump-only", "conventionalChangelog", and "bump-commit" tasks.', function (versionType) {
    grunt.task.run('bump-only' + (versionType ? ':' + versionType : ''));
    grunt.task.run('default');
    grunt.task.run('conventionalChangelog');
    grunt.task.run('bump-commit');
  });

};
