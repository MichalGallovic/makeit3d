module.exports = function(grunt) {


	grunt.initConfig({
		
		jade: {
			index: {
				options: {
					//ci to nedavat do jednoho riadku
					pretty: true
		      		},
				files: {
		        	"index.html": "index.jade"
		      		}
				}
			},
		watch: {
		  scripts: {
		    files: ['**/*.jade'],
		    tasks: ['jade'],
		    options: {
		      spawn: false,
		      livereload:true,
		    },
		  },
		},
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jade');

	grunt.registerTask('default', [
		 'ble'
	]);

	grunt.registerTask('compile-jade', [
		 'jade'
	]);
	


}