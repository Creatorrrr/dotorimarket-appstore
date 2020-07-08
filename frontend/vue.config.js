module.exports = {
  "outputDir": "../backend/public",
  "devServer": {
    "proxy": {
      "/api": {
        "target": "http://localhost:3000",
        "changeOrigin": true,
      }
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}