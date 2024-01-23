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

        <v-col cols="12" lg="12" md="12" sm="12">
          <div class="w-100">
            <h3 class="text-right">Aggregate Expense Ratio: {{ this.aggregateExpenseRatio.toFixed(2) }}%</h3>
          </div>
          <div class="w-100">
            <h3 class="text-right">Total Expense: {{ $formatNumberWithCommas(this.totalExpense) }}</h3>
          </div>
        </v-col>
        <v-col v-if="!isPrinting" cols="12" lg="12" md="12" sm="12">
          <v-btn class="float-right ml-4" prepend-icon="mdi-file-pdf-box" outlined :disabled="symbolList.length === 0"
            @click="exportPdf">
            <template v-slot:prepend>
              <v-icon color="error" icon="mdi-file-pdf-box" />
            </template>
            Save
          </v-btn>
          <v-btn class="float-right" prepend-icon="mdi-printer" outlined :disabled="symbolList.length === 0"
            @click="print">
            <template v-slot:prepend>
              <v-icon color="primary"></v-icon>
            </template>
            Print
          </v-btn>
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
          title: 'Expense Ratio % (net)',
        },
        {
          key: 'typeDisp',
          title: 'Type'
        },
        {
          key: 'netAssets',
          title: 'Net Assets'
        },
      ],
      isLoadingTable: false,
      aggregateExpenseRatio: 0,
      totalExpense: 0,
      isPrinting: false,
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
        // const response = await axios.get('https://yahoo-finance15.p.rapidapi.com/api/v1/markets/search', {
        //   params: {
        //     search: event.target.value,
        //   },
        //   headers: {
        //     'X-RapidAPI-Key': '942716142amsh001ada363bce707p1684d6jsn51a76cf464d0',
        //     'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
        //     'Content-Type': 'application/json'
        //   }
        // });
        // this.filteredSymbols = response.data.body;
        const response = await axios.get('https://financialmodelingprep.com/api/v3/search', {
          params: {
            query: event.target.value,
            apikey: 'BvlY2k8x8IJr4RhhISejING0wttVc9s4',
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        this.filteredSymbols = response.data;
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async getSymbolExpenseRatio() {
      if (this.selectedSymbols.length > 0) {
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
          this.aggregateExpenseRatio = 0;
          this.totalExpense = 0;
          let accountValue = 0;
          this.symbolList = response.data.body.map((item) => {
            if (item.netExpenseRatio && item.netAssets) {
              this.totalExpense += item.netExpenseRatio * item.netAssets / 100;
              accountValue += item.netAssets;
              item.netExpenseRatio += '%';
              item.netAssets = this.formatLargeNumber(item.netAssets);
            }
            return item;
          });
          this.aggregateExpenseRatio = this.totalExpense / accountValue * 100;
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          this.isLoadingTable = false;
        }
      } else {
        this.symbolList = [];
      }
    },
    formatLargeNumber(number) {
      const billion = 1e9;
      const million = 1e6;
      const thousand = 1e3;

      if (number >= billion) {
        return (number / billion).toFixed(2) + 'B';
      } else if (number >= million) {
        return (number / million).toFixed(2) + 'M';
      } else if (number >= thousand) {
        return (number / thousand).toFixed(2) + 'K';
      } else {
        return number.toString();
      }
    },
    exportPdf() {
      console.log("---exportPdf--------")
    },
    print() {
      console.log("---print--------")
      this.isPrinting = true;
      setTimeout(() => {
        window.print();
        this.isPrinting = false;
      }, 100);
    }
  },
};
</script>

<style></style>