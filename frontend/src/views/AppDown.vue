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
        <a :href="'/api/apps/android'">
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
        <div v-on:click="downloadIOS">
          <v-img
            :src="require('../assets/images/ios-logo.png')"
            class="my-3"
            contain
            height="100"
          />
          <p class="font-weight-black text-center">iOS</p>
        </div>
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
