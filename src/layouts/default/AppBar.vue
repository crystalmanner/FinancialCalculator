<template>
  <v-app-bar app>
    <v-icon icon="mdi-circle-slice-4" />
    Merchant Services
    <v-spacer></v-spacer>
    <v-menu open-on-hover>
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props">
          Menu
        </v-btn>
      </template>

      <v-list>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/')">Mortgage Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/bincodes')">Bin codes</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/autoloancalculator')">Auto Loan Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/mcccodes')">Merchants Category Codes</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/erccalculator')">ERC Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/federalincometax')">Federal Income Tax Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/creditcardprocessingfee')">Credit Card Processing Fee
            Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/cdcalculator')">CD Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/simpleloancalculator')">Simple Loan Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/amortizationschedulecalculator')">Amortization Schedule
            Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/currencyconverter')">Currecny Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/inflationcalculator')">Inflation Calculator</v-list-item-title>
        </v-list-item>
        <v-list-item class="menu-item">
          <v-list-item-title @click="redirectTo('/savingscalculator')">Savings Calculator</v-list-item-title>
        </v-list-item>
      </v-list>
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
