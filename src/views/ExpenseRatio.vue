<template>
  <v-container class="fill-height ">
    <v-responsive class="fill-height main-container">
      <h1>Expense Ratio Calculator</h1>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="12" md="12" sm="12">
          <v-data-table :headers="headers" :items="tableList" :items-per-page="-1">
            <template v-slot:top>
              <v-dialog v-model="dialog" max-width="500px">
                <v-card>
                  <v-card-title>
                    <span class="text-h5">{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field v-model="editedItem.symbol" label="Investment Description or Symbol"
                            @keydown.enter="getExpenseRatio" @blur="getExpenseRatio"></v-text-field>
                          <!-- <v-autocomplete label="Investment Description or Symbol" v-model="editedItem.symbol"
                              :items="filteredSymbols" :loading="isLoading" :search-input.sync="search"
                              @input="inputSymbol" @keydown.enter="addNewSymbol" @blur="getExpenseRatio"></v-autocomplete> -->
                        </v-col>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field v-model="formattedCurrentValue" label="Current Value" @blur="formatCurrentValue"
                            @input="stripCurrentValueFormatting" prefix="$"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field v-model.number="editedItem.netExpenseRatio" label="Expense Ratio"
                            suffix="%"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="close" :disabled="isLoading">
                      Cancel
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="save" :disabled="isLoading">
                      Save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
            <template v-slot:item.addIcon="{ item }">
              <div v-if="!item.isAdded">
                <v-btn color="primary" density="compact" icon="mdi-plus" @click="editItem(item)" size="small"></v-btn>
              </div>
            </template>
            <template v-slot:item.symbol="{ item }">
              <div v-if="item.isAdded">
                {{ item.symbol }}
              </div>
              <div v-else>
                Please Add Your Investment Description or Symbol
              </div>
            </template>
            <template v-slot:item.currentValue="{ item }">
              <div v-if="item.isAdded">
                {{ $formatNumberWithCommas(parseFloat(item.currentValue)) }}
              </div>
              <div v-else>
                Please Add the Current Value of this Investment
              </div>
            </template>
            <template v-slot:item.netExpenseRatio="{ item }">
              <div v-if="item.isAdded">
                {{ item.netExpenseRatio.toFixed(2) }}%
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <div v-if="item.isAdded">
                <v-icon size="small" class="me-2" @click="editItem(item)">
                  mdi-pencil
                </v-icon>
                <v-icon size="small" @click="deleteItem(item)">
                  mdi-delete
                </v-icon>
              </div>
              <div v-else>
                <v-icon size="small" @click="deleteItem(item)">
                  mdi-delete
                </v-icon>
              </div>
            </template>
            <template v-slot:no-data>
              Please Add Your Investment Description or Symbol
            </template>
          </v-data-table>
          <v-btn variant="text" color="primary" prepend-icon="mdi-plus-circle" @click="addAdditionalRows()">
            Add additional investments
          </v-btn>
        </v-col>
        <v-col cols="12" lg="12" md="12" sm="12">
          <div class="w-100">
            <h3 class="text-right">Value: {{ $formatNumberWithCommas(this.totalValue) }}</h3>
          </div>
          <div class="w-100">
            <h3 class="text-right">Total Expense Ratio: {{ this.totalExpenseRatio.toFixed(2) }}%</h3>
          </div>
        </v-col>

        <v-col v-if="!isPrinting" cols="12" lg="12" md="12" sm="12">

          <v-btn class="float-right ml-4" prepend-icon="mdi-printer" append-icon="mdi-file-pdf-box" outlined
            @click="printPage">
            <template v-slot:prepend>
              <v-icon color="primary" />
            </template>
            <template v-slot:append>
              <v-icon color="error"></v-icon>
            </template>
            Print/Save
          </v-btn>

        </v-col>
        <v-col class="mt-8 mb-8" style="min-height: 50px;">&nbsp;</v-col>
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
      dialog: false,
      dialogDelete: false,
      headers: [
        {
          title: '',
          key: 'addIcon',
        },
        {
          title: 'Investment Description or Symbol',
          align: 'start',
          sortable: true,
          key: 'symbol',
        },
        { title: 'Current Value', key: 'currentValue' },
        { title: 'Expense Ratio', key: 'netExpenseRatio' },
        { title: '', key: 'actions', sortable: false },
      ],
      tableList: [],
      editedIndex: -1,
      editedItem: {
        symbol: '',
        currentValue: 0,
        netExpenseRatio: 0,
        isAdded: true,
      },
      defaultItem: {
        symbol: '',
        currentValue: 0,
        netExpenseRatio: 0,
        isAdded: true,
      },
      isPrinting: false,
      search: '',
      filteredSymbols: [],
      isLoading: false,
      formattedCurrentValue: '0',
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },
  computed: {
    formTitle() {
      return this.editedItem.symbol ? 'Edit Item' : 'New Item'
    },
    totalValue() {
      let totalValue = 0
      this.tableList.forEach(item => {
        totalValue += parseInt(item.currentValue) || 0;
      })
      return totalValue
    },
    totalExpenseRatio() {
      let totalValue = 0
      let totalExpense = 0
      this.tableList.forEach(item => {
        totalValue += parseInt(item.currentValue) || 0;
        totalExpense += (parseInt(item.currentValue) || 0) * (item.netExpenseRatio || 0) / 100;
      })
      return (totalValue > 0) ? (totalExpense / totalValue * 100) : 0
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    calculate() {
      let totalValue = 0
      let totalExpense = 0
      this.tableList.forEach(item => {
        totalValue += parseInt(item.currentValue) || 0;
        totalExpense += (parseInt(item.currentValue) || 0) * (item.netExpenseRatio || 0) / 100;
      })
      this.totalExpenseRatio = (totalValue > 0) ? (totalExpense / totalValue * 100) : 0
      this.totalValue = totalValue
    },
    addNewItem() {
      this.formattedCurrentValue = '0';
    },
    formatCurrentValue() {
      // When the user leaves the field, format the number with commas
      this.formattedCurrentValue = new Intl.NumberFormat().format(this.editedItem.currentValue);
    },
    stripCurrentValueFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.editedItem.currentValue = parseInt(digits);
      // Update the displayed value to keep the cursor in the correct position
      this.formattedCurrentValue = String(parseInt(digits));
    },
    initialize() {
      this.addAdditionalRows();
    },
    addAdditionalRows() {
      for (let i = 0; i < 10; i++) {
        this.tableList.push({
          symbol: '',
          currentValue: 0,
          netExpenseRatio: 0,
          isAdded: false,
        })
      }
    },
    async inputSymbol(event) {
      if (!event.target.value) {
        return;
      }
      await this.getFilteredSymbols(event.target.value)
    },
    async getFilteredSymbols(query) {
      this.isLoading = true;
      try {
        const response = await axios.get('https://financialmodelingprep.com/api/v3/search', {
          params: {
            query: query,
            apikey: 'BvlY2k8x8IJr4RhhISejING0wttVc9s4',
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        this.filteredSymbols = response.data.map(item => {
          return item.symbol;
        });
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        this.isLoading = false;
      }
    },
    addNewSymbol(event) {
      const value = event.target.value;
      if (value && !this.filteredSymbols.includes(value)) {
        this.filteredSymbols.push(value);
        this.editedItem.symbol = value;
        this.getExpenseRatio();
      }
    },
    editItem(item) {
      this.editedIndex = this.tableList.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.search = ''
      this.filteredSymbols = [this.editedItem.symbol]
      this.dialog = true
      this.formatCurrentValue();
    },

    deleteItem(item) {
      this.editedIndex = this.tableList.indexOf(item)
      this.editedItem = Object.assign({}, item)
      if (this.editedItem.isAdded) {
        this.dialogDelete = true;
      } else {
        this.deleteItemConfirm();
      }
    },

    deleteItemConfirm() {
      this.tableList.splice(this.editedIndex, 1)
      this.closeDelete()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      if (this.editedIndex > -1) {
        this.editedItem.symbol = (this.editedItem.netExpenseRatio > 0) ? this.editedItem.symbol.toUpperCase() : this.editedItem.symbol;
        this.editedItem.isAdded = true;
        Object.assign(this.tableList[this.editedIndex], this.editedItem)
      } else {
        this.editedItem.symbol = (this.editedItem.netExpenseRatio > 0) ? this.editedItem.symbol.toUpperCase() : this.editedItem.symbol;
        this.tableList.push(this.editedItem)
      }
      this.close()
    },
    async getExpenseRatio() {
      if (this.editedItem.symbol) {
        this.isLoading = true;
        try {
          const response = await axios.get('https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes', {
            params: {
              ticker: this.editedItem.symbol,
            },
            headers: {
              'X-RapidAPI-Key': '942716142amsh001ada363bce707p1684d6jsn51a76cf464d0',
              'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com',
              'Content-Type': 'application/json'
            }
          });
          if (response.data.body && response.data.body.length > 0) {
            this.editedItem.netExpenseRatio = response.data.body[0].netExpenseRatio || 0
          } else {
            this.editedItem.netExpenseRatio = 0;
          }
        } catch (error) {
          // console.error('Error fetching suggestions:', error);
          this.editedItem.netExpenseRatio = 0;
        } finally {
          this.isLoading = false;
        }
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
    printPage() {
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