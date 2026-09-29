/**
 * Dynamic config: keeps the map keys out of source control by reading them from
 * .env, which Expo loads before evaluating this file. Both keys are compiled
 * into the native project, so changing one needs a dev-client rebuild.
 *
 * The static app.json arrives as `config`. It must be spread from that argument
 * rather than `require("./app.json")`: a require is cached for the life of the
 * process, so a CLI that writes to app.json (eas init writing extra.eas.projectId)
 * would not see its own change on the verification read, and would roll it back.
 */
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.ANDROID_MAPS_KEY ?? "" },
    },
  },
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      googleMapsApiKey: process.env.IOS_MAPS_KEY ?? "",
    },
  },
  extra: {
    ...config.extra,
  },
});
