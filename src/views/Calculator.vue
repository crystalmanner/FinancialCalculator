<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1>Fee Calculator</h1>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="4" md="4" sm="12">
          <v-form v-model="validForm">
            <v-text-field v-model.number="accountValue" :rules="[$numberGreaterThanNegativeRule]" label="Account(s) Value"
              type="number" prefix="$" hint="The total value of all your accounts which will be charged a fee"
              dense></v-text-field>
            <v-text-field v-model.number="averageExpectedGrowthRate"
              :rules="[$numberGreaterThanNegativeRule, numberSmallerThan12]" label="Average Expected Growth Rate"
              suffix="%" hint="How much do you expect to earn on an average annual basis?" dense></v-text-field>
            <v-text-field v-model.number="annualDistribution" :rules="[$numberGreaterThanNegativeRule]"
              label="Annual Distribution" prefix="$"
              hint="How much would you like to take out of your accounts for living expenses?" dense></v-text-field>
            <v-text-field v-model.number="annualIncreaseDistributionRate"
              :rules="[$numberGreaterThanNegativeRule, numberSmallerThan10]" label="Average Expected Growth Rate"
              suffix="%"
              hint="How much would you like to increase your annual living expense distributions to offset inflation?"
              dense></v-text-field>
            <v-text-field v-model.number="advisoryFeeRate" :rules="[$numberGreaterThanNegativeRule]"
              label="% Advisory Fee" suffix="%" hint="How much are you being charged as a percentage for an advisory fee?"
              dense></v-text-field>
            <v-text-field v-model.number="annualIncreaseAdvisoryFeeRate" :rules="[$numberGreaterThanNegativeRule]"
              label="Annual Increase to % Advisory Fee" suffix="%" hint="Will your advisor increase this fee?"
              dense></v-text-field>
            <v-text-field v-model.number="flatFee" :rules="[$numberGreaterThanNegativeRule]" label="Flat Fee" prefix="$"
              hint="What is the proposed dollar amount of the flat fee?" dense></v-text-field>
            <v-text-field v-model.number="annualIncreaseFlatFeeRate" :rules="[$numberGreaterThanNegativeRule]"
              label="Annual Increase to Flat Fee" suffix="%" hint="Will the flat fee increase annually?"
              dense></v-text-field>
            <v-text-field v-model.number="periodLength" :rules="periodLengthRules" label="Period Length" suffix="year(s)"
              hint="How many years would you like to use for this calculation?" dense></v-text-field>
          </v-form>
        </v-col>
        <v-col cols="12" lg="8" md="8" sm="12">
          <div v-if="validForm">
            <div class="d-flex">
              <h3>% Advisory Fee</h3><v-spacer></v-spacer>
              <p>{{ $formatNumberWithCommas(totalPercentFee) }}</p>
            </div>
            <div class="d-flex">
              <h3>Flat Fee</h3><v-spacer></v-spacer>
              <p>{{ $formatNumberWithCommas(totalFlatFee) }}</p>
            </div>
            <hr>
            <div class="d-flex">
              <h3>Difference</h3><v-spacer></v-spacer>
              <p>{{ $formatNumberWithCommas(totalPercentFee - totalFlatFee) }}</p>
            </div>
            <v-tabs v-model="tab" color="primary" align-tabs="left">
              <v-tab :value="1">Table</v-tab>
              <v-tab :value="2">Chart</v-tab>
            </v-tabs>
            <v-window v-model="tab">
              <v-window-item :value="1">
                <v-data-table :headers="headers" :items="tableData"></v-data-table>
              </v-window-item>
              <v-window-item :value="2">
                <div style="max-width: 760px;">
                  <Line id="line-chart" width="600px" height="300px" :options="chartOptions" :data="chartData" />
                </div>
              </v-window-item>
            </v-window>
          </div>
          <div v-else class="mt-2 text-center">
            <h3 class="text-red-accent-2">Please input valid values.</h3>
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

export default {
  components: { VueDatePicker, Line },
  data() {
    return {
      validForm: true,
      accountValue: 2000000,
      averageExpectedGrowthRate: 7,
      annualDistribution: 80000,
      annualIncreaseDistributionRate: 2,
      advisoryFeeRate: 1,
      annualIncreaseAdvisoryFeeRate: 0,
      flatFee: 10000,
      annualIncreaseFlatFeeRate: 3,
      periodLength: 25,
      tab: null,
      tableData: [],
      totalPercentFee: 0,
      totalFlatFee: 0,
      chartOptions: {
        responsive: true,
        lineTension: 1,
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: ((context) => {
                let label = context.dataset.label || '';

                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              })
            }
          }
        }
      },
      chartData: {
        labels: [],
        datasets: [
          {
            label: "% Fee Account Value",
            data: [],
            backgroundColor: "rgba(0,112,192,.9)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Flat Fee Account Value",
            data: [],
            backgroundColor: "rgba(0,176,80,.9)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      periodLengthRules: [
        v => !isNaN(parseFloat(v)) && v > 0 && Number.isInteger(v) || 'The period length should be an integer greater than 0'
      ]
    };
  },
  watch: {
    accountValue() {
      this.calculate();
    },
    averageExpectedGrowthRate() {
      this.calculate();
    },
    annualDistribution() {
      this.calculate();
    },
    annualIncreaseDistributionRate() {
      this.calculate();
    },
    advisoryFeeRate() {
      this.calculate();
    },
    annualIncreaseAdvisoryFeeRate() {
      this.calculate();
    },
    flatFee() {
      this.calculate();
    },
    annualIncreaseFlatFeeRate() {
      this.calculate();
    },
    periodLength() {
      this.calculate();
    }
  },
  computed: {
    headers() {
      return [
        {
          align: 'start',
          key: 'year',
          title: '',
          width: '25%',
        },
        { key: 'flatFeeAccountValue', title: 'Flat Fee Account Value', width: '25%' },
        { key: 'percentAccountValue', title: 'Values of ' + this.advisoryFeeRate + '% Account Value', width: '25%' },
        { key: 'difference', title: 'Difference', width: '25%' },
      ]
    },
  },
  created() {
    this.$nextTick(() => {
      this.calculate();
    });
  },
  methods: {
    calculate() {
      this.tableData = [];
      let i = 0;

      let chartData = {
        labels: [],
        datasets: [
          {
            label: "% Fee Account Value",
            data: [],
            backgroundColor: "rgba(0,112,192,.9)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Flat Fee Account Value",
            data: [],
            backgroundColor: "rgba(0,176,80,.9)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: true,
          },
        ],
      };
      let distribution = this.annualDistribution;
      let percentFee = this.accountValue * this.advisoryFeeRate / 100;
      let flatFee = this.flatFee;
      let percentAccountValue = this.accountValue;
      let flatFeeAccountValue = this.accountValue;
      let advisoryFeeRate = this.advisoryFeeRate;
      this.totalPercentFee = 0;
      this.totalFlatFee = 0;
      while (i < this.periodLength) {
        i++;
        flatFeeAccountValue = flatFeeAccountValue * (100 + this.averageExpectedGrowthRate) / 100 - (distribution + flatFee);
        percentAccountValue = percentAccountValue * (100 + this.averageExpectedGrowthRate) / 100 - (distribution + percentFee);
        distribution = distribution * (100 + this.annualIncreaseDistributionRate) / 100;
        percentFee = percentAccountValue * advisoryFeeRate / 100;
        flatFee = flatFee * (100 + this.annualIncreaseFlatFeeRate) / 100;
        advisoryFeeRate = advisoryFeeRate * (100 + this.annualIncreaseAdvisoryFeeRate) / 100;
        this.tableData.push({
          'year': 'Year ' + i,
          'flatFeeAccountValue': this.$formatNumberWithCommas(flatFeeAccountValue),
          'percentAccountValue': this.$formatNumberWithCommas(percentAccountValue),
          'difference': this.$formatNumberWithCommas(flatFeeAccountValue - percentAccountValue),
        });
        chartData.labels.push('Year ' + i);
        chartData.datasets[0].data.push(percentAccountValue.toFixed(2));
        chartData.datasets[1].data.push(flatFeeAccountValue.toFixed(2));
        this.totalPercentFee += percentFee;
        this.totalFlatFee += flatFee;
      }

      this.chartData = chartData;
      // this.renderChart();
    },
    smallerThanAccountValue(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > this.accountValue) {
        return `Payment should be lower than account(s) value.`; // Validation fails
      }
      return true; // Validation passes
    },
    numberSmallerThan12(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 12) {
        return `Average expected growth rate should not be greater than 12%.`; // Validation fails
      }
      return true; // Validation passes
    },
    numberSmallerThan10(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 10) {
        return `Annual increase to distribution should not be greater than 10%.`; // Validation fails
      }
      return true; // Validation passes
    }
  },
};
</script>

<style>
.d-flex {
  display: flex;
}

.space-around {
  justify-content: space-around;
  align-items: center;
}

.space-between {
  justify-content: space-between;
}

.text-align-right {
  text-align: right;
}

.dp__pointer {
  height: 57px;
}

.arrow-right {
  align-items: center;
  display: flex;
}
</style>