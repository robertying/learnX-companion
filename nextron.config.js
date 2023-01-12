module.exports = {
  webpack: (config, env) => ({
    ...config,
    entry: {
      index: "./main/index.ts",
      cli: "./main/cli.ts",
    },
  }),
};
