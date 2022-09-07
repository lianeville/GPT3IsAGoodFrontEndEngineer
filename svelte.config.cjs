const preprocess = require("svelte-preprocess");

const config = {
  preprocess: [
    preprocess({
      scss: {
        prependData: '@use "src/variables.scss" as *;',
      },
    }),
  ],
};

module.exports = config;
