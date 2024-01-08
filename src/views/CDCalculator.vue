<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1>CD Calculator</h1>
      <h3>Calculate your earnings and more</h3>
      <p class="mb-4">
        Use the Bankrate CD calculator to find out how much interest is earned on a certificate of deposit (CD). Just
        enter a few pieces of information and this CD calculator will calculate the annual percentage yield (APY) and
        ending balance.
      </p>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="5" md="5" sm="12">
          <v-form v-model="validForm">
            <v-text-field v-model.number="initialDeposit" :rules="[$numberGreaterThanNegativeRule]"
              label="Initial Deposit:" prefix="$" dense></v-text-field>
            <div class="d-flex space-between">
              <span>Over a period of:</span>
              <v-tooltip v-model="show" location="bottom">
                <template v-slot:activator="{ props }">

                  <v-icon color="blue-lighten-1" v-bind="props">
                    mdi-alert-circle-outline
                  </v-icon>

                </template>
                <span>The amount of time until the CD matures and funds can be withdrawn without penalty.</span>
              </v-tooltip>
            </div>
            <div class="d-flex">
              <v-text-field v-model.number="periodOf" :rules="[$numberGreaterThanZeroRule, $integerRule]"
                dense></v-text-field>
              <v-radio-group v-model="periodType" inline>
                <v-radio label="Months" value="Months"></v-radio>
                <v-radio label="Years" value="Years"></v-radio>
              </v-radio-group>
            </div>
            <div class="d-flex space-between">
              <span>APY:</span>
              <v-tooltip v-model="showSecond" location="bottom">
                <template v-slot:activator="{ props }">

                  <v-icon color="blue-lighten-1" v-bind="props">
                    mdi-alert-circle-outline
                  </v-icon>

                </template>
                <span>
                  APY stands for "annual percentage yield." It's the rate of return on your money, or how much money your
                  money earns over time
                </span>
              </v-tooltip>
            </div>
            <v-text-field v-model.number="apy" :rules="[$numberGreaterThanZeroRule]" suffix="%" dense></v-text-field>
          </v-form>
        </v-col>
        <v-col cols="12" lg="7" md="7" sm="12">
          <h2>Results</h2>
          <div v-if="validForm" class="d-flex space-around">
            <div>
              <h3>Total interest earned</h3>
              <h1 class="text-teal-darken-3">
                {{ $formatNumberWithCommas(totalBalance - this.initialDeposit) }}
              </h1>
            </div>
            <div>
              <h3>Total balance</h3>
              <h1 class="text-teal-darken-3">{{ $formatNumberWithCommas(totalBalance) }}</h1>
            </div>
          </div>
          <hr>
          <div style="max-width: 760px;">
            <Line id="line-chart" width="600px" height="300px" :options="chartOptions" :data="chartData" />
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
// import Chart from 'chart.js'
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
  components: { Line },
  data() {
    return {
      initialDeposit: 10000,
      periodOf: 5,
      periodType: "Years",
      apy: 3.15,
      validForm: true,
      show: false,
      showSecond: false,

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
        labels: [], datasets: [{
          label: "Your Earnings",
          data: [],
          backgroundColor: "rgba(71, 183,132,.5)",
          borderColor: "#47b784",
          borderWidth: 3,
          fill: true,
        },
        ]
      },
    };
  },
  computed: {
    totalBalance() {
      this.renderChart();
      return this.calculateEarnings(this.periodOf) + this.initialDeposit;
    },
  },
  created() {
    this.$nextTick(() => {
      this.renderChart();
    });
  },
  methods: {
    calculateEarnings(period) {
      if (this.periodType == "Years") {
        let result = this.initialDeposit;
        for (let i = 0; i < period; i++) {
          result = result * (100 + this.apy) / 100;
        }
        return result - this.initialDeposit;
      } else {
        return this.initialDeposit * ((1 + this.apy / 100) ** (period / 12)) - this.initialDeposit;
      }
    },
    async renderChart() {
      let chartData = {
        labels: [], datasets: [{
          label: "Your Earnings",
          data: [],
          backgroundColor: "rgba(71, 183,132,.5)",
          borderColor: "#47b784",
          borderWidth: 3,
          fill: true,
        },
        ]
      };
      for (let i = 1; i <= this.periodOf; i++) {
        if (this.periodType === 'Years') {
          chartData.labels.push('Year' + i);
        } else {
          chartData.labels.push('Month' + i);
        }
        chartData.datasets[0].data.push(this.calculateEarnings(i).toFixed(2));
      }
      this.chartData = chartData;
    },

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
</style>