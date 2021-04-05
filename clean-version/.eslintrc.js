module.exports = {
  extends: ["react-app", "shared-config"],
  rules: {
    semi: 0
  },
  overrides: [
    {
      files: ["**/*.(js|ts)?(x)"],
      rules: {
        semi: [2, "never"]
      }
    }
  ]
};
