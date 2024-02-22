<template>
  <v-app-bar app>
    <v-icon icon="mdi-circle-slice-4" />
    Fee Calculator
    <v-spacer></v-spacer>
    <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props">
          Menu
        </v-btn>
      </template>
    </v-menu>
  </v-app-bar>
</template>

<script>
//
export default {
  methods: {
    redirectTo(url) {
      this.$router.push(url);
    }
  },
};

</script>

<style>
.menu-item {
  cursor: pointer;
}
</style>
