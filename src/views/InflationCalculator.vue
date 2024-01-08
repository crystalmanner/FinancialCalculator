<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Inflation Calculator</h1>
        <p>This calculator helps determine the buying power of a dollar over time in the United States.</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <v-text-field v-model.number="fromAmount" type="number" prefix="$" @input="calculate"
          dense></v-text-field>&nbsp;&nbsp;in&nbsp;&nbsp;
        <v-select v-model="fromYear" :items="years"></v-select>&nbsp;&nbsp;will be
        worth&nbsp;&nbsp;<span class="text-h6 text-blue-accent-3">${{ this.toAmount.toLocaleString('en-US', {
          maximumFractionDigits: 2
        })
        }}</span>&nbsp;&nbsp;in&nbsp;&nbsp;
        <v-select v-model="toYear" :items="years"></v-select>
      </v-col>
    </v-row>
    <v-row v-if="fromYear > 2023 || toYear > 2023">
      <v-col cols="12" class="d-flex align-center">
        Using an inflation rate of&nbsp;&nbsp;
        <v-text-field class="shrink" v-model.number="defaultRate" type="number" suffix="%" @input="calculate"
          dense></v-text-field>
        &nbsp;&nbsp;from&nbsp;&nbsp;<span
          v-if="fromYear > 2023 && toYear > 2023">{{ Math.min(fromYear, toYear) }}</span>&nbsp;&nbsp;
        <span v-else>2023</span>&nbsp;&nbsp;to {{ Math.max(fromYear, toYear) }}.
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex align-left">
        <div>
          This is an average inflation rate of
          <strong>{{ this.averageInflationRate.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}</strong>% and
          cumulative inflation
          of <strong>{{ this.cumulativeInflationRate.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}</strong>%.
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div style="max-width: 760px;">
          <Line id="line-chart" width="600px" height="300px" :options="chartOptions" :data="chartData" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import inflations from '../data/inflations.json';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
  components: { Line },
  data() {
    return {
      inflations: inflations,
      fromAmount: 100,
      fromYear: 2003,
      toAmount: 0,
      toYear: 2023,
      years: [],
      defaultRate: 3,
      cumulativeInflationRate: 0,
      averageInflationRate: 0,
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Historical Rate",
            data: [],
            backgroundColor: "rgba(71,151,255,.5)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
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
    };
  },
  watch: {
    fromYear() {
      this.calculate();
    },
    toYear() {
      this.calculate();
    },
    defaultRate(val) {
      for (let i = 2024; i < 2074; i++) {
        this.inflations[i] = this.inflations[i - 1] * (100 + val) / 100;
      }
    }
  },
  mounted() {
    for (let i = 1914; i < 2074; i++) {
      this.years.push(i);
    }
    for (let i = 2024; i < 2074; i++) {
      this.inflations[i] = this.inflations[i - 1] * (100 + this.defaultRate) / 100;
    }
    this.calculate();
  },
  methods: {
    calculate() {
      this.cumulativeInflationRate = this.getCumulativeInflationRate(this.fromYear, this.toYear);
      this.toAmount = (this.cumulativeInflationRate + 100) * this.fromAmount / 100;
      let chartData = null;
      if (Math.max(this.fromYear, this.toYear) > 2023) {
        chartData = {
          labels: [],
          datasets: [
            {
              label: "Historical Rate",
              data: [],
              backgroundColor: "rgba(71,151,255,.5)",
              borderColor: "#4897FF",
              borderWidth: 1,
              fill: false,
            },
            {
              label: "Projected Rate",
              data: [],
              backgroundColor: "rgba(136,221,155,.5)",
              borderColor: "#88DD9B",
              borderWidth: 1,
              fill: false,
            },
          ],
        };
      } else {
        chartData = {
          labels: [],
          datasets: [
            {
              label: "Historical Rate",
              data: [],
              backgroundColor: "rgba(71,151,255,.5)",
              borderColor: "#4897FF",
              borderWidth: 1,
              fill: false,
            },
          ],
        }
      }
      if (this.fromYear == this.toYear) {
        this.averageInflationRate = 0;
      } else {
        let sumInflationRate = 0;
        let yearCount = 0;
        for (let i = Math.min(this.toYear, this.fromYear); i < Math.max(this.toYear, this.fromYear); i++) {
          yearCount++;
          sumInflationRate += this.getCumulativeInflationRate(i, i + 1);
        }
        if (this.fromYear < this.toYear) {
          this.averageInflationRate = sumInflationRate / yearCount
        } else {
          this.averageInflationRate = -sumInflationRate / yearCount
        }
      }
      for (let i = Math.min(this.toYear, this.fromYear); i <= Math.max(this.toYear, this.fromYear); i++) {
        chartData.labels.push(i);
        let cumulativeInflationRate = this.getCumulativeInflationRate(Math.min(this.toYear, this.fromYear), i);
        let fromAmount = this.fromAmount > this.toAmount ? this.toAmount : this.fromAmount;
        if (i <= 2023) {
          chartData.datasets[0].data.push((cumulativeInflationRate + 100) * fromAmount / 100);
        }
        if (i < 2023) {
          chartData.datasets[1]?.data.push(null);
        }
        if (i > 2023 || (i === 2023 && Math.max(this.fromYear, this.toYear) > 2023)) {
          chartData.datasets[1].data.push((cumulativeInflationRate + 100) * fromAmount / 100);
        }
      }
      this.chartData = chartData;
    },
    getCumulativeInflationRate(fromYear, toYear) {
      return (this.inflations[toYear] - this.inflations[fromYear]) * 100 / this.inflations[fromYear];
    }
  }
};
</script>

<style scoped>
.shrink {
  max-width: 100px;
}
</style>
