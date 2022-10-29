const { DateTime } = require('luxon');
const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const htmlmin = require('html-minifier');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const Image = require('@11ty/eleventy-img');

require('dotenv').config();

/**
 * Fix public asset path relative to "src" folder
 */
function fixSrcPath(url) {
  if (url.startsWith('/')) {
    return '.' + url;
  } else {
    return url;
  }
}

module.exports = function (eleventyConfig) {
  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Configuration API: use eleventyConfig.addLayoutAlias(from, to) to add
  // layout aliases! Say you have a bunch of existing content using
  // layout: post. If you don’t want to rewrite all of those values, just map
  // post to a new file like this:
  // eleventyConfig.addLayoutAlias("post", "layouts/my_new_post_layout.njk");

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  // Add support for maintenance-free post authors
  // Adds an authors collection using the author key in our post frontmatter
  // Thanks to @pdehaan: https://github.com/pdehaan
  // eleventyConfig.addCollection("authors", collection => {
  //   const blogs = collection.getFilteredByGlob("posts/*.md");
  //   return blogs.reduce((coll, post) => {
  //     const author = post.data.author;
  //     if (!author) {
  //       return coll;
  //     }
  //     if (!coll.hasOwnProperty(author)) {
  //       coll[author] = [];
  //     }
  //     coll[author].push(post.data);
  //     return coll;
  //   }, {});
  // });

  // Returns 1200px wide JPEG social-media (open-graph) image path.
  eleventyConfig.addAsyncShortcode('SocialImagePath', async (src) => {
    if (!src) return '';
    src = fixSrcPath(src);

    let meta = await Image(src, {
      widths: [1200],
      formats: ['jpeg'],
      urlPath: '/img/',
      outputDir: './_site/img/',
    });
    return meta.jpeg && meta.jpeg.length > 0 ? meta.jpeg[0].url : '';
  });

  // Date formatting (human readable)
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy');
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter('machineDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd');
  });

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (outputPath.indexOf('.html') > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy('static/img');
  eleventyConfig.addPassthroughCopy('static/fonts');
  eleventyConfig.addPassthroughCopy('admin/');
  eleventyConfig.addPassthroughCopy('_includes/assets/css/inline.css');

  /* Markdown Plugins */
  const markdownIt = require('markdown-it');
  const markdownItAnchor = require('markdown-it-anchor');
  const markdownItEmoji = require('markdown-it-emoji');

  const mdOptions = {
    html: true,
    breaks: false,
    linkify: true,
  };
  const mdAnchorsOptions = {
    permalink: false,
  };

  eleventyConfig.setLibrary('md', markdownIt(mdOptions).use(markdownItAnchor, mdAnchorsOptions).use(markdownItEmoji));

  return {
    templateFormats: ['md', 'njk', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
