<template>
  <v-container>
    <v-row
      no-gutters
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="4"
      >
        <a :href="'/api/mobile/v1/apps/dotori-android.apk'">
          <v-img
            :src="require('../assets/images/android-logo.png')"
            class="my-3"
            contain
            height="100"
          />
          <p class="font-weight-black text-center">Android</p>
        </a>
      </v-col>
      <v-col
        cols="12"
        sm="6"
      >
        <a :href="'itms-services://?action=download-manifest&url=https://appstore.dotorimarket.com/download/v1/apps/dotori-ios.plist'">
          <v-img
            :src="require('../assets/images/ios-logo.png')"
            class="my-3"
            contain
            height="100"
          />
          <p class="font-weight-black text-center">iOS</p>
        </a>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'AppDown',

    data: () => ({

    }),

    methods: {
      downloadAndroid: () => {
        alert('downloadAndroid');
      },
      downloadIOS: () => {
        alert('downloadIOS');
      },
    }
  }
</script>
