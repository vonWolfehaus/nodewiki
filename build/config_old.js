var dest = '../dist';
var src = '../client';

module.exports = {
	sass: {
		src: src + '/sass/*.{sass,scss}',
		dest: dest,
		settings: {
			indentedSyntax: true, // Enable .sass syntax!
			imagePath: 'images' // Used by the image-url helper
		}
	},
	iconFonts: {
		name: 'Gulp Starter Icons',
		src: src + '/icons/*.svg',
		dest: dest + '/fonts',
		sassDest: src + '/sass',
		template: './gulp/tasks/iconFont/template.sass.swig',
		sassOutputName: '_icons.sass',
		fontPath: 'fonts',
		className: 'icon',
		options: {
			fontName: 'Post-Creator-Icons',
			appendCodepoints: true,
			normalize: false
		}
	},
	riot: {
		
	},
	browserify: {
		// A separate bundle will be generated for each
		// bundle config in the list below
		bundleConfigs: [{
			entries: src + '/main.js',
			dest: dest,
			outputName: 'page.js',
			extensions: ['.tag'],
			noparse: ['riot']
			// list of externally available modules to exclude from the bundle
			// external: 'riot'
		}]
	},
	production: {
		cssSrc: dest + '/*.css',
		jsSrc: dest + '/*.js',
		dest: dest
	}
};
