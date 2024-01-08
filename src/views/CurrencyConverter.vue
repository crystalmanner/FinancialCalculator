<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1 class="text-center">Currency Converter</h1>
      <p>Use our currency converter to convert over 171.
        <br>
        To get started enter the values below and calculate today’s exchange rates for any two currencies.
      </p>
      <div class="mt-4">
        <v-row>
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-text-field v-model.number="fromAmount" type="number" label="From" prefix="$" @input="calculate"
              dense></v-text-field>
          </v-col>
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-autocomplete v-model="baseCurrency" :items="currencies" item-title="text" item-value="value"
              label="From"></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="6" md="6" sm="12">
          </v-col>
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-icon icon="mdi-swap-vertical-bold" @click="currencyExchange" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-text-field v-model.number="toAmount" type="number" label="To" prefix="$" @input="reverseCalculate"
              dense></v-text-field>
          </v-col>
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-autocomplete v-model="targetCurrency" :items="currencies" item-title="text" item-value="value"
              label="To"></v-autocomplete>
          </v-col>
        </v-row>
      </div>
    </v-responsive>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currencies: [],
      baseCurrency: null,
      targetCurrency: null,
      fromAmount: 0,
      toAmount: 0,
      rate: 0,
    };
  },

  mounted() {
    this.getCurrencyList();
  },
  watch: {
    baseCurrency() {
      this.calculate();
    },
    targetCurrency() {
      this.calculate();
    },
  },
  methods: {
    async getCurrencyList() {
      try {
        const response = await axios.get('https://data.fixer.io/api/symbols', {
          params: {
            access_key: 'c0e4e9b23f651e131d14bc74e41d2fdf',
          }
        });
        this.currencies = Object.entries(response.data.symbols).map(([key, value]) => ({ value: key, text: key + " - " + value }));
        // Handle the API response data here
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle errors here
      }
    },
    async calculate() {
      if (this.baseCurrency && this.targetCurrency) {
        try {
          const response = await axios.get('https://data.fixer.io/api/convert', {
            params: {
              access_key: 'c0e4e9b23f651e131d14bc74e41d2fdf',
              from: this.baseCurrency,
              to: this.targetCurrency,
              amount: this.fromAmount,
            }
          });
          this.toAmount = response.data.result;
          this.rate = this.fromAmount / this.toAmount;
        } catch (error) {
          console.error('Error fetching data:', error);
          // Handle errors here
        }
      }
    },
    reverseCalculate() {
      this.fromAmount = (this.rate * this.toAmount).toFixed(5);
    },
    currencyExchange() {
      let temp = this.baseCurrency;
      this.baseCurrency = this.targetCurrency;
      this.targetCurrency = temp;
    }
  }
};
</script>

<style></style>