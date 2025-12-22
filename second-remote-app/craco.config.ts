const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  webpack: {
    configure: (config: any) => {
      config.output.publicPath = "auto";

      config.plugins.push(
        new ModuleFederationPlugin({
          name: "secondRemoteApp",
          filename: "remoteEntry.js",
          exposes: {
            "./SecondMount": "./src/bootstrap",
            "./SecondRemotePageExport": "./src/exports/SecondRemotePageExport",
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
    port: 3002,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    hot: false,
    liveReload: false,
  },
};
