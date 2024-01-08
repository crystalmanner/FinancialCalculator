<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1 class="text-center">Savings Calculator</h1>
      <p class="text-center">Use our simple savings calculator to see how quickly your savings will grow.

      </p>
      <v-row class="pa-2">
        <v-col cols="12" lg="4" md="4" sm="12">
          <h4>Enter in Your Details</h4>
          <v-form v-model="validForm">
            <v-label>
              Starting Savings Balance
            </v-label>
            <v-text-field v-model.number="savingBalance" :rules="[$numberGreaterThanNegativeRule]" prefix="$" dense
              @input="calculate"></v-text-field>

            <v-label class="mt-4">
              Annual Percentage Yield (APY)
            </v-label>
            <div class="d-flex" style="gap: 10px;">
              <v-text-field v-model.number="apyRate" :rules="[$numberGreaterThanNegativeRule]" suffix="%"
                @input="calculate" dense></v-text-field>
              <v-select v-model="apyType" :items="apyTypeList" style="min-width: 176px;"></v-select>
            </div>
            <p class="text-subtitle-2">Online Average is 1.10%</p>

            <v-label class="mt-4">
              Additional Contribution
            </v-label>
            <div class="d-flex" style="gap: 10px;">
              <v-text-field v-model.number="monthlyContribution" :rules="[$numberGreaterThanNegativeRule]" prefix="$"
                @input="calculate" dense></v-text-field>
              <v-select v-model="addiontalContributionType" :items="addiontalContributionTypeList"
                style="min-width: 176px;"></v-select>
            </div>
            <p class="text-subtitle-2">Annual Contribution of {{ $formatNumberWithCommas(annualContribution) }}</p>

            <v-label class="mt-4">
              Years to Save
            </v-label>
            <div>
              <v-text-field v-model.number="yearsToSave" :rules="[$numberGreaterThanZeroRule, $integerRule]"
                @input="calculate" dense></v-text-field>
              <v-slider v-model="yearsToSave" :min="1" :max="20" :step="1" @end="calculate" color="primary"></v-slider>
            </div>
          </v-form>
        </v-col>
        <v-col cols="12" lg="8" md="8" sm="12">
          <div v-if="validForm" class="text-center ma-4">
            <h3>Your savings balance at the end of {{ new Date().getFullYear() + this.yearsToSave - 1 }} will be</h3>
            <div class="text-h4 text-light-blue-darken-3
">{{ $formatNumberWithCommas(endYearBalance) }}</div>
            <div class="chart-container">
              <Bar id="bar-chart" width="600px" height="300px" :options="chartOptions" :data="chartData" />
            </div>
            <div>
              <div v-if="yearsToSave > 1">
                <v-slider v-model="selectedYear" :min="0" :max="yearsToSave - 1" :step="1" color="primary"></v-slider>
              </div>
              <h4 class="text-left">Break down for {{ new Date().getFullYear() + this.selectedYear }}</h4>
              <v-row class="text-left">
                <v-col cols="12" lg="3" md="3" sm="6">
                  Starting Balance
                  <div style="color: #00496e; font-weight: 600;">
                    {{ $formatNumberWithCommas(this.savingBalance) }}
                  </div>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="6">
                  Total Contributions
                  <div style="color: #1f84ad; font-weight: 600;">
                    {{ $formatNumberWithCommas(this.annualContribution * (this.selectedYear + 1)) }}
                  </div>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="6">
                  Total Interest Earned
                  <div style="color: #f9b719; font-weight: 600;">
                    {{ $formatNumberWithCommas(getSelectedYearTotalInterestedEarned(this.selectedYear)) }}
                  </div>
                </v-col>
                <v-col cols="12" lg="3" md="3" sm="6">
                  End Balance
                  <div style="color: black; font-weight: 600;">
                    {{ $formatNumberWithCommas(this.savingBalance + this.annualContribution * (this.selectedYear + 1) + getSelectedYearTotalInterestedEarned(this.selectedYear)) }}
                  </div>
                </v-col>
              </v-row>
            </div>
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
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


export default {
  components: { Bar },
  data() {
    return {
      savingBalance: 25000,
      apyRate: 1.1,
      apyType: "Daily",
      apyTypeList: ["Daily", "Monthly", "Annually"],
      monthlyContribution: 100,
      addiontalContributionType: "Monthly",
      addiontalContributionTypeList: ["Monthly", "Annually"],
      yearsToSave: 10,
      validForm: true,
      selectedYear: 4,
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Starting Balance',
            backgroundColor: '#00496E',
            data: []
          },
          {
            label: 'Total Contributions',
            backgroundColor: '#1F84AD',
            data: []
          },
          {
            label: 'Total Interest Earned',
            backgroundColor: '#F9B719',
            data: []
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            categoryPercentage: 0.5,
            barPercentage: 1
          },
          y: {
            stacked: true,
            ticks: {
              beginAtZero: true
            }
          }
        },
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
    apyType() {
      this.calculate();
    },
    addiontalContributionType() {
      this.calculate();
    },
  },
  computed: {
    annualContribution() {
      if (this.addiontalContributionType === "Semi-Monthly") {
        return this.monthlyContribution * 24;
      }
      if (this.addiontalContributionType === "Monthly") {
        return this.monthlyContribution * 12;
      }
      if (this.addiontalContributionType === "Annually") {
        return this.monthlyContribution;
      }
    },
    endYearBalance() {
      return this.getYearEndBalance(this.yearsToSave);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.calculate();
    });
  },
  methods: {
    getYearEndBalance(yearsToSave) {
      try {
        return this.chartData.datasets[0].data[yearsToSave - 1] + this.chartData.datasets[1].data[yearsToSave - 1] + this.chartData.datasets[2].data[yearsToSave - 1]
      } catch {
        return 0
      }
    },
    calculate() {
      this.selectedYear = this.yearsToSave - 1;
      let chartData = {
        labels: [],
        datasets: [
          {
            label: 'Starting Balance',
            backgroundColor: '#00496E',
            data: []
          },
          {
            label: 'Total Contributions',
            backgroundColor: '#1F84AD',
            data: []
          },
          {
            label: 'Total Interest Earned',
            backgroundColor: '#F9B719',
            data: []
          }
        ]
      };
      for (let i = 0; i < this.yearsToSave; i++) {
        chartData.labels.push(new Date().getFullYear() + i);
        chartData.datasets[0].data.push(this.savingBalance);
        chartData.datasets[1].data.push(this.annualContribution * (i + 1));
        chartData.datasets[2].data.push(this.getSelectedYearTotalInterestedEarned(i));
      }
      this.chartData = chartData;
    },
    getSelectedYearTotalInterestedEarned(selectedYear) {
      // Contribution frequently: Annually, Compound frequently: Annually
      if (this.addiontalContributionType === 'Annually' && this.apyType === 'Annually')
        return this.calculateTotalInterestAnnually(this.savingBalance, this.apyRate, this.annualContribution, selectedYear + 1)
      // Contribution frequently: Monthly, Compound frequently: Monthly
      if (this.addiontalContributionType === 'Monthly' && this.apyType === 'Monthly')
        return this.calculateTotalInterestMonthly(this.savingBalance, this.apyRate, 12, selectedYear + 1, this.monthlyContribution)

      if (this.addiontalContributionType === 'Annually' && this.apyType === 'Monthly')
        return this.calculateTotalInterestWithAnnualContributionMonthlyCompounding(this.savingBalance, this.annualContribution, this.apyRate, selectedYear + 1)

      if (this.addiontalContributionType === 'Annually' && this.apyType === 'Daily')
        return this.calculateTotalInterestWithAnnualContributionDailyCompounding(this.savingBalance, this.annualContribution, this.apyRate, selectedYear + 1)

      if (this.addiontalContributionType === 'Monthly' && this.apyType === 'Annually')
        return this.calculateTotalInterestWithMonthlyContributionAnnualCompounding(this.savingBalance, this.monthlyContribution, this.apyRate, selectedYear + 1)

      if (this.addiontalContributionType === 'Monthly' && this.apyType === 'Daily')
        return this.calculateTotalInterestWithMonthlyContributionDailyCompounding(this.savingBalance, this.monthlyContribution, this.apyRate, selectedYear + 1)
    },
    calculateTotalInterestAnnually(principal, annualInterestRate, contributions, years) {
      // Convert annual interest rate to decimal form
      const r = annualInterestRate / 100;

      // Assuming interest is compounded annually (n = 1)
      const n = 1;

      // Calculate future value without contributions
      const futureValueWithoutContributions = principal * Math.pow(1 + r / n, n * years);

      // Calculate future value of contributions using compound interest formula
      const futureValueOfContributions = contributions * ((Math.pow(1 + r / n, n * years) - 1) / (r / n));

      // Total future value (including principal and contributions)
      const totalFutureValue = futureValueWithoutContributions + futureValueOfContributions;

      // Total interest earned is the total future value minus the initial principal and contributions
      const totalInterestEarned = totalFutureValue - principal - (contributions * years);

      return totalInterestEarned;
    },
    calculateTotalInterestMonthly(principal, annualInterestRate, compoundingFrequency, years, regularContribution) {
      annualInterestRate = annualInterestRate / 100; // Convert annual interest rate to decimal
      let total = principal; // Initialize total with the principal amount

      // Loop through each compounding period and calculate the future value
      for (let i = 0; i < compoundingFrequency * years; i++) {
        total = total * (1 + annualInterestRate / compoundingFrequency) + regularContribution;
      }
      let totalInterest = total - (principal + regularContribution * compoundingFrequency * years);
      return totalInterest; // Round the result to two decimal places
    },
    calculateTotalInterestWithAnnualContributionMonthlyCompounding(P, annualContribution, r, t) {
      r = r / 100 / 12; // Convert annual interest rate to monthly decimal rate
      let total = P; // Initialize total with the principal amount

      // Loop through each month and calculate the future value with monthly contributions
      for (let i = 0; i < t * 12; i++) {
        total = (total + annualContribution / 12) * (1 + r);
      }

      const totalContributions = annualContribution * t;
      const totalAmount = total - totalContributions;
      const totalInterest = totalAmount - P;

      return totalInterest; // Round the result to two decimal places
    },
    calculateTotalInterestWithAnnualContributionDailyCompounding(P, annualContribution, r, t) {
      r = r / 100 / 365; // Convert annual interest rate to daily decimal rate
      let total = P; // Initialize total with the principal amount

      // Loop through each day and calculate the future value with daily contributions
      for (let i = 0; i < t * 365; i++) {
        total = (total + annualContribution / 365) * (1 + r);
      }

      const totalContributions = annualContribution * t;
      const totalAmount = total - totalContributions;
      const totalInterest = totalAmount - P;

      return totalInterest; // Round the result to two decimal places
    },
    calculateTotalInterestWithMonthlyContributionAnnualCompounding(P, monthlyContribution, r, t) {
      r = r / 100; // Convert annual interest rate to decimal
      let total = P; // Initialize total with the principal amount

      // Loop through each year and calculate the future value with monthly contributions
      for (let i = 0; i < t; i++) {
        total = (total + monthlyContribution * 12) * (1 + r);
      }

      const totalContributions = monthlyContribution * 12 * t;
      const totalAmount = total - totalContributions;
      const totalInterest = totalAmount - P;

      return totalInterest; // Round the result to two decimal places
    },
    calculateTotalInterestWithMonthlyContributionDailyCompounding(P, monthlyContribution, r, t) {
      r = r / 100 / 365; // Convert annual interest rate to daily decimal rate
      let total = P; // Initialize total with the principal amount

      // Loop through each day and calculate the future value with daily contributions
      for (let i = 0; i < t * 365; i++) {
        total = (total + monthlyContribution / 30.44) * (1 + r);
      }

      const totalContributions = monthlyContribution * t * 12;
      const totalAmount = total - totalContributions;
      const totalInterest = totalAmount - P;

      return totalInterest; // Round the result to two decimal places
    }
  },
};
</script>

<style>
.chart-container {
  flex-grow: 1;
  min-height: 0;

  >div {
    position: relative;
    height: 100%;
  }
}
</style>