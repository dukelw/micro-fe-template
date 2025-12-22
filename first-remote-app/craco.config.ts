const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  webpack: {
    configure: (config: any) => {
      config.output.publicPath = "auto";

      config.plugins.push(
        new ModuleFederationPlugin({
          name: "firstRemoteApp",
          filename: "remoteEntry.js",
          exposes: {
            "./FirstMount": "./src/bootstrap",
            "./FirstRemotePageExport": "./src/exports/FirstRemotePageExport",
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
  devServer: {
    port: 3001,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    hot: false,
    liveReload: false,
  },
};
