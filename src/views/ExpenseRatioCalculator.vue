<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1>Expense Ratio Calculator</h1>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="12" md="12" sm="12">
          <v-autocomplete label="Symbol Lookup" v-model="selectedSymbols" :items="filteredSymbols" :loading="isLoading"
            :search-input.sync="search" item-value="symbol" :item-title="item => item.symbol" @input="getFilteredSymbols"
            chips closable-chips multiple clearable></v-autocomplete>
        </v-col>
      </v-row>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="12" md="12" sm="12">
          <v-data-table :headers="headers" :items="symbolList" :loading="isLoadingTable"></v-data-table>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  components: {},
  data() {
    return {
      symbolList: [],
      search: '',
      filteredSymbols: [],
      selectedSymbols: null,
      isLoading: false,
      headers: [
        {
          key: 'symbol',
          title: 'Symbol',
        },
        {
          key: 'longName',
          title: 'Name',
        },
        {
          key: 'netExpenseRatio',
          title: 'Expense Ratio (net)',
        },
        {
          key: 'typeDisp',
          title: 'Type'
        }
      ],
      isLoadingTable: false,
    }
  },
  watch: {
    selectedSymbols() {
      this.getSymbolExpenseRatio();
    },
  },
  computed: {
  },
  created() {
    this.$nextTick(() => {
      this.calculate();
    });
  },
  methods: {
    calculate() {

    },
    async getFilteredSymbols(event) {
      if (!event.target.value) {
        return;
      }
      this.isLoading = true;
      try {
        const response = await axios.get('https://yahoo-finance15.p.rapidapi.com/api/v1/markets/search', {
          params: {
            search: event.target.value,
          },
          headers: {
            'X-RapidAPI-Key': '942716142amsh001ada363bce707p1684d6jsn51a76cf464d0',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });
        this.filteredSymbols = response.data.body;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async getSymbolExpenseRatio() {
      console.log(this.selectedSymbols, "----this.selectedSymbols-----")
      this.isLoadingTable = true;
      try {
        const response = await axios.get('https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes', {
          params: {
            ticker: this.selectedSymbols.join(', '),
          },
          headers: {
            'X-RapidAPI-Key': '942716142amsh001ada363bce707p1684d6jsn51a76cf464d0',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        });
        this.symbolList = response.data.body;
        console.log(this.symbolList, "---this.symbolList----")
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        this.isLoadingTable = false;
      }
    }
  },
};
</script>

<style></style>