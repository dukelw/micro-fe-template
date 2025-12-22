const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  webpack: {
    configure: (config) => {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: "shellApp",
          remotes: {
            remoteApp: "remoteApp@http://localhost:3001/remoteEntry.js",
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: false,
            },
            "react-dom": {
              singleton: true,
              requiredVersion: false,
            },
            "react-router-dom": { singleton: true, requiredVersion: false },
          },
        })
      );

      return config;
    },
  },
};
