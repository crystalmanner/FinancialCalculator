<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1>Flat Fee vs % Advisory Fee Calculator</h1>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="4" md="4" sm="12">
          <v-form v-model="validForm">
            <v-text-field v-model.number="loanAmount" :rules="[$numberGreaterThanNegativeRule]" label="Loan term"
              prefix="$" dense></v-text-field>
            <v-select v-model="loanTerm" :items="loanTerms" item-title="title" item-value="value"
              label="Loan term"></v-select>
            <v-text-field v-model.number="interestRate" :rules="[$numberGreaterThanZeroRule]" label="Interest rate"
              suffix="%" dense></v-text-field>
            <v-label>Loan start date</v-label>
            <VueDatePicker v-model="loanStartDate" month-picker />
            <v-text-field class="mt-4" v-model.number="additionalMonthlyPayment"
              :rules="[$numberGreaterThanNegativeRule, smallerThanLoanAmount]"
              label="Additional amount to monthly payment" prefix="$" dense></v-text-field>

            <v-label>Addtional yearly payment every</v-label>
            <div class="d-flex" style="gap: 10px;">
              <v-text-field v-model.number="additionalYearlyPayment" :rules="[$numberGreaterThanNegativeRule]" prefix="$"
                dense></v-text-field>
              <v-select v-model="additionalYearlyPaymentMonth" :items="months" item-title="title"
                item-value="value"></v-select>
            </div>

            <v-label>One-time additional payment on</v-label>
            <div class="d-flex" style="gap: 10px;">
              <v-text-field v-model.number="additionalOneTimePayment" :rules="[$numberGreaterThanNegativeRule]" prefix="$"
                style="width: 300px" dense></v-text-field>
              <VueDatePicker v-model="additionalOneTimePaymentDate" month-picker />
            </div>
          </v-form>
        </v-col>
        <v-col cols="12" lg="8" md="8" sm="12">
          <div class="d-flex">
            <h3>Summary</h3><v-spacer></v-spacer>
            <p v-if="validForm">Number of payments: {{ numberOfPayment }}</p>
          </div>
          <hr>
          <div v-if="validForm">
            <v-row class="mt-4 mb-4">
              <v-col cols="12" lg="3" md="3" sm="6">
                Monthly payment <br>
                <h2>{{ $formatNumberWithCommas(this.monthlyPayment) }}</h2>
              </v-col>
              <v-col cols="12" lg="3" md="3" sm="6">
                Total interest paid<br>
                <h2>{{ $formatNumberWithCommas(this.totalInterestPaid) }}</h2>
              </v-col>
              <v-col cols="12" lg="3" md="3" sm="6">
                Total cost of loan<br>
                <h2>{{ $formatNumberWithCommas(this.loanAmount + this.totalInterestPaid) }}</h2>
              </v-col>
              <v-col cols="12" lg="3" md="3" sm="6">
                Payoff date <br>
                <h2>{{ payoffDate }}</h2>
              </v-col>
            </v-row>
            <v-tabs v-model="tab" color="primary" align-tabs="left">
              <v-tab :value="1">Table</v-tab>
              <v-tab :value="2">Chart</v-tab>
            </v-tabs>
            <v-window v-model="tab">
              <v-window-item :value="1">
                <h1>Amortization schedule breakdown</h1>
                <p>This table lists how much principal and interest are paid in each scheduled mortgage payment.</p>
                <div class="d-flex mt-2">
                  <div>
                    <v-label>First payment</v-label>
                    <VueDatePicker v-model="loanStartDate" :teleport="true" month-picker />
                  </div>
                  <div class="arrow-right ml-3 mr-3">
                    <v-icon class="mt-2" icon="mdi-arrow-right" />
                  </div>
                  <div>
                    <v-label>Last payment</v-label>
                    <h1>{{ payoffDate }}</h1>
                  </div>
                </div>
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
      loanAmount: 330000,
      loanTerms: [
        {
          title: '30 years',
          value: 30,
        },
        {
          title: '20 years',
          value: 20,
        },
        {
          title: '15 years',
          value: 15,
        },
        {
          title: '10 years',
          value: 10,
        }
      ],
      loanTerm: 30,
      interestRate: 5.27,
      loanStartDate: "",
      monthlyPayment: 0,
      totalInterestPaid: 0,
      additionalMonthlyPayment: 0,
      payoffDate: null,
      additionalYearlyPayment: 0,
      additionalYearlyPaymentMonth: null,
      additionalOneTimePayment: 0,
      additionalOneTimePaymentDate: "",
      numberOfPayment: null,
      tab: null,
      months: [
        {
          title: 'January',
          value: '01'
        },
        {
          title: 'February',
          value: '02'
        },
        {
          title: 'March',
          value: '03'
        },
        {
          title: 'April',
          value: '04'
        },
        {
          title: 'May',
          value: '05'
        },
        {
          title: 'June',
          value: '06'
        },
        {
          title: 'July',
          value: '07'
        },
        {
          title: 'August',
          value: '08'
        },
        {
          title: 'September',
          value: '09'
        },
        {
          title: 'October',
          value: '10'
        },
        {
          title: 'November',
          value: '11'
        },
        {
          title: 'December',
          value: '12'
        },
      ],
      headers: [
        {
          align: 'start',
          key: 'date',
          sortable: true,
          title: 'Date',
          width: '25%',
        },
        { key: 'principal', title: 'Principal', width: '25%' },
        { key: 'interest', title: 'Interest', width: '25%' },
        { key: 'remainingBalance', title: 'Remaining balance', width: '25%' },
      ],
      tableData: [],
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Principal paid",
            data: [],
            backgroundColor: "rgba(71,151,255,.5)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Interest paid",
            data: [],
            backgroundColor: "rgba(136,221,155,.5)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Loan balance",
            data: [],
            backgroundColor: "rgba(3,66,167,.5)",
            borderColor: "#0342A7",
            borderWidth: 1,
            fill: true,
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
    loanAmount() {
      this.calculate();
    },
    loanTerm() {
      this.calculate();
    },
    interestRate() {
      this.calculate();
    },
    loanStartDate() {
      this.calculate();
    },
    additionalMonthlyPayment() {
      this.calculate();
    },
    additionalYearlyPayment() {
      this.calculate();
    },
    additionalYearlyPaymentMonth() {
      this.calculate();
    },
    additionalOneTimePayment() {
      this.calculate();
    },
    additionalOneTimePaymentDate() {
      this.calculate();
    }
  },
  computed: {
  },
  created() {
    this.$nextTick(() => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      this.loanStartDate = {
        month: currentMonth,
        year: currentYear
      };
      this.additionalYearlyPaymentMonth = (currentMonth + 1).toString().padStart(2, '0');  // Adding 1 to make it 1-12
      this.additionalOneTimePaymentDate = this.loanStartDate;
      this.calculate();
    });
  },
  methods: {
    calculate() {
      this.tableData = [];
      this.monthlyPayment = this.calculatePMT(this.loanAmount, this.interestRate, this.loanTerm * 12) + this.additionalMonthlyPayment;
      let totalInterest = 0;
      let beginnigBalance = this.loanAmount;
      let i = 0;
      let totalMonthlyPrincipal = 0;

      let chartData = {
        labels: [],
        datasets: [
          {
            label: "Principal paid",
            data: [],
            backgroundColor: "rgba(71,151,255,.5)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Interest paid",
            data: [],
            backgroundColor: "rgba(136,221,155,.5)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Loan balance",
            data: [],
            backgroundColor: "rgba(3,66,167,.5)",
            borderColor: "#0342A7",
            borderWidth: 1,
            fill: true,
          },
        ],
      };
      while (i < this.loanTerm * 12) {
        i++;
        let monthlyInterest = beginnigBalance * this.interestRate / 100 / 12;
        let monthlyPrincipal = this.monthlyPayment - monthlyInterest;
        let loanStartDate = (this.loanStartDate.month + 1).toString().padStart(2, '0') + '/' + this.loanStartDate.year;
        let currentMonth = this.addMonthsToDate(loanStartDate, i);
        if (currentMonth.substring(0, 2) === this.additionalYearlyPaymentMonth) {
          monthlyPrincipal += this.additionalYearlyPayment;
        }

        let additionalOneTimePaymentDate = (this.additionalOneTimePaymentDate.month + 1).toString().padStart(2, '0') + '/' + this.additionalOneTimePaymentDate.year
        if (currentMonth === additionalOneTimePaymentDate) {
          monthlyPrincipal += this.additionalOneTimePayment;
        }
        totalMonthlyPrincipal += monthlyPrincipal;
        totalInterest += monthlyInterest;
        beginnigBalance = beginnigBalance - monthlyPrincipal;
        if (beginnigBalance < 0) {
          beginnigBalance = 0;
        }
        this.tableData.push({
          'date': currentMonth,
          'principal': this.$formatNumberWithCommas(monthlyPrincipal),
          'interest': this.$formatNumberWithCommas(totalInterest),
          'remainingBalance': this.$formatNumberWithCommas(beginnigBalance),
        });

        chartData.labels.push(currentMonth);
        chartData.datasets[0].data.push(totalMonthlyPrincipal.toFixed(2));
        chartData.datasets[1].data.push(totalInterest.toFixed(2));
        chartData.datasets[2].data.push(beginnigBalance.toFixed(2));

        if (beginnigBalance === 0) {
          break;
        }
      }
      this.totalInterestPaid = totalInterest;
      let loanStartDate = (this.loanStartDate.month + 1).toString().padStart(2, '0') + '/' + this.loanStartDate.year;
      this.payoffDate = this.addMonthsToDate(loanStartDate, i);
      this.numberOfPayment = i;
      this.chartData = chartData;
      // this.renderChart();
    },
    addMonthsToDate(dateString, monthsToAdd) {
      // Parse the input date string into loanStartDate and year components
      const [loanStartDate, year] = dateString.split('/').map(Number);

      // Create a JavaScript Date object for the input date
      const inputDate = new Date(year, loanStartDate - 1); // Month is 0-based

      // Add the specified number of months
      inputDate.setMonth(inputDate.getMonth() + monthsToAdd);

      // Get the new loanStartDate and year
      const newMonth = inputDate.getMonth() + 1; // Month is 0-based, so add 1
      const newYear = inputDate.getFullYear();

      // Format the result as "MM/YYYY"
      const result = `${newMonth.toString().padStart(2, '0')}/${newYear}`;

      return result;
    },
    calculatePMT(principal, annualInterestRate, loanTerm) {
      // Convert annual interest rate to monthly rate
      const monthlyInterestRate = (annualInterestRate / 100) / 12;
      // Calculate the monthly payment
      const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
      return monthlyPayment;
    },
    smallerThanLoanAmount(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > this.loanAmount) {
        return `Payment should be lower than loan amount.`; // Validation fails
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