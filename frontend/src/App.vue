<template>
  <v-app>
    <v-main>
      <AppDown/>
    </v-main>
  </v-app>
</template>

<script>
import AppDown from './views/AppDown';

export default {
  name: 'App',

  components: {
    AppDown,
  },

  data: () => ({
    //
  }),
};
</script>
