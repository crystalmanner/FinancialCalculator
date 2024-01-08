<template>
  <v-container class="fill-height">
    <v-responsive class="text-center fill-height">
      <h1>Auto Loan Calculator</h1>
      <v-row class="pa-2">
        <v-col cols="12" lg="5" md="5" sm="12">
          <v-form v-model="isFormValid">
            <v-text-field v-model.number="autoPrice" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Auto Price" prefix="$"></v-text-field>
            <v-text-field v-model.number="loanTerm" :rules="[$numberGreaterThanZeroRule]" type="number" label="Loan Term"
              min="0" suffix="months"></v-text-field>
            <v-text-field v-model.number="interestRate" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Interest Rate" suffix="%"></v-text-field>

            <v-text-field v-model.number="cashIncentives" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Cash Incentives" prefix="$"></v-text-field>
            <v-text-field v-model.number="downPayment" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Down Payment" suffix="%"></v-text-field>
            <v-text-field v-model.number="tradeInValue" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Trade-in Value" prefix="$"></v-text-field>
            <v-text-field v-model.number="amountOwnedOnTradeIn" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Amount Owed on Trade-in" prefix="$"></v-text-field>

            <v-select v-model="selectedState" :items="usStates" item-title="stateName" label="Your State"></v-select>

            <v-text-field v-model.number="salesTaxRate" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Sales Tax" suffix="%"></v-text-field>
            <v-text-field v-model.number="titleAndFees" :rules="[$numberGreaterThanNegativeRule]" type="number"
              label="Title, Registration and Other Fees" prefix="$"></v-text-field>
            <v-checkbox v-model="includeAllFees" label="Include All Fees in Loan" required></v-checkbox>
            <v-btn elevated @click="calculate" :disabled="!isFormValid">Calculate</v-btn>
          </v-form>
        </v-col>
        <v-col cols="12" lg="7" md="7" sm="12">
          <v-row justify="space-between" class="bg-green text-white">
            <v-col class="float-left">Monthly Pay</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.monthlyPayment) }}</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col class="float-left">Total Loan Amount</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.totalLoanAmount) }}</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col class="float-left">Sale Tax</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.salesTax) }}</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col class="float-left">Upfront Payment</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.upfrontPayment) }}</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col class="float-left">Total Loan Payments</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.totalLoanPayments) }}</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col class="float-left">Total Loan Interest</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.totalLoanInterest) }}</v-col>
          </v-row>
          <v-row justify="space-between">
            <v-col class="float-left">Total Cost (price, interest, tax, fees)</v-col>
            <v-col class="float-right">{{ $formatNumberWithCommas(this.totalCost) }}</v-col>
          </v-row>
          <v-tabs v-model="tab" color="primary" align-tabs="left">
            <v-tab :value="1">Chart</v-tab>
            <v-tab :value="2">Annual Schedule</v-tab>
            <v-tab :value="3">Monthly Schedule</v-tab>
          </v-tabs>
          <v-window v-model="tab">
            <v-window-item :value="1">
              <div style="max-width: 760px;">
                <Line id="line-chart" width="600px" height="300px" :options="chartOptions" :data="chartData" />
              </div>
            </v-window-item>
            <v-window-item :value="2">
              <v-data-table :headers="annualTableHeaders" :items="annualTableData"></v-data-table>
            </v-window-item>
            <v-window-item :value="3">
              <v-data-table :headers="monthlyTableHeaders" :items="monthlyTableData"></v-data-table>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
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
      autoPrice: 50000,
      loanTerm: 60,
      interestRate: 5,
      cashIncentives: 0,
      downPayment: 10000,
      tradeInValue: 0,
      amountOwnedOnTradeIn: 0,
      salesTaxRate: 6.6,
      titleAndFees: 2600,
      includeAllFees: false,
      result: { error: '' },
      isFormValid: false,
      selectedState: "---Select---",
      usStates: [
        {
          stateName: "---Select---",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Alabama",

          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Alaska",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }


        },
        {
          stateName: "Arizona",

          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Arkansas",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "California",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Colorado",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Delaware",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "District of Columbia",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Florida",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Georgia",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Hawaii",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Idaho",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Illinois",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Indiana",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Iowa",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Kansas",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Kentucky",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Louisiana",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Maine",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Maryland",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Massachusetts",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Michigan",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Minnesota",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Mississippi",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Missouri",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Montana",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Nebraska",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Nevada",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "New Hampshire",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "New Jersey",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "New Mexico",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "New York",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "North Carolina",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "North Dakota",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Ohio",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Oklahoma",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Oregon",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Pennsylvania",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Rhode Island",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "South Carolina",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "South Dakota",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Tennessee",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Texas",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Utah",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Vermont",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
        {
          stateName: "Virginia",
          taxInfo: {
            isTradeInSalesTaxCredit: false,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Washington",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "West Virginia",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Wisconsin",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: true,
          }
        },
        {
          stateName: "Wyoming",
          taxInfo: {
            isTradeInSalesTaxCredit: true,
            isIncentivesTaxed: false,
          }
        },
      ],
      salesTax: "",
      totalLoanAmount: "",
      upfrontPayment: "",
      monthlyPayment: "",
      totalLoanInterest: "",
      totalLoanPayments: "",
      totalCost: "",
      tab: null,
      monthlyTableHeaders: [
        {
          align: 'center',
          key: 'month',
          sortable: true,
          title: 'Month',
          width: '25%',
        },
        { align: 'center', key: 'interest', title: 'Interest', width: '25%' },
        { align: 'center', key: 'principal', title: 'Principal', width: '25%' },
        { align: 'center', key: 'remainingBalance', title: 'Remaining balance', width: '25%' },
      ],
      annualTableHeaders: [
        {
          align: 'center',
          key: 'year',
          sortable: true,
          title: 'Year',
          width: '25%',
        },
        { align: 'center', key: 'interest', title: 'Interest', width: '25%' },
        { align: 'center', key: 'principal', title: 'Principal', width: '25%' },
        { align: 'center', key: 'remainingBalance', title: 'Remaining balance', width: '25%' },
      ],
      monthlyTableData: [],
      annualTableData: [],
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Balance",
            data: [],
            backgroundColor: "rgba(3,66,167,.5)",
            borderColor: "#0342A7",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Interest",
            data: [],
            backgroundColor: "rgba(136,221,155,.5)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Payment",
            data: [],
            backgroundColor: "rgba(145,10,10,.5)",
            borderColor: "#910000",
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
  mounted() {
  },
  methods: {
    calculate() {
      this.monthlyTableData = [];
      this.annualTableData = [];
      let chartData = {
        labels: [],
        datasets: [
          {
            label: "Balance",
            data: [],
            backgroundColor: "rgba(3,66,167,.5)",
            borderColor: "#0342A7",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Interest",
            data: [],
            backgroundColor: "rgba(136,221,155,.5)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Payment",
            data: [],
            backgroundColor: "rgba(145,10,10,.5)",
            borderColor: "#910000",
            borderWidth: 1,
            fill: false,
          },
        ],
      };
      let selectedStateObj = this.usStates.find(state => state.stateName === this.selectedState);
      if (selectedStateObj.taxInfo.isTradeInSalesTaxCredit && selectedStateObj.taxInfo.isIncentivesTaxed) {
        this.salesTax = (this.autoPrice - this.tradeInValue) * (this.salesTaxRate / 100);
      } else if (selectedStateObj.taxInfo.isTradeInSalesTaxCredit === false && selectedStateObj.taxInfo.isIncentivesTaxed) {
        this.salesTax = this.autoPrice * (this.salesTaxRate / 100);
      } else if (selectedStateObj.taxInfo.isTradeInSalesTaxCredit === false && selectedStateObj.taxInfo.isIncentivesTaxed === false) {
        this.salesTax = (this.autoPrice - this.cashIncentives) * (this.salesTaxRate / 100);
      } else if (selectedStateObj.taxInfo.isTradeInSalesTaxCredit && selectedStateObj.taxInfo.isIncentivesTaxed === false) {
        this.salesTax = (this.autoPrice - this.cashIncentives - this.tradeInValue) * (this.salesTaxRate / 100);
      }

      if (this.includeAllFees) {
        this.totalLoanAmount = this.autoPrice - this.downPayment + this.salesTax + this.amountOwnedOnTradeIn + this.titleAndFees - this.tradeInValue - this.cashIncentives;
        this.upfrontPayment = this.downPayment;
      } else {
        this.totalLoanAmount = this.autoPrice - this.downPayment - this.cashIncentives - this.tradeInValue + this.amountOwnedOnTradeIn;
        this.upfrontPayment = this.downPayment + this.titleAndFees + this.salesTax;
      }

      this.monthlyPayment = this.calculatePMT(this.totalLoanAmount, this.interestRate, this.loanTerm)


      let totalInterest = 0;
      let beginnigBalance = this.totalLoanAmount;
      let totalMonthlyPrincipal = 0;
      let month = 0;
      let annualInterest = 0;
      let annualPrinciple = 0;
      for (let i = 0; i < this.loanTerm; i++) {
        let monthlyInterest = beginnigBalance * this.interestRate / 100 / 12;
        let monthlyPrincipal = this.monthlyPayment - monthlyInterest;
        totalMonthlyPrincipal += monthlyPrincipal;
        totalInterest += monthlyInterest;
        beginnigBalance = beginnigBalance - monthlyPrincipal;
        if (beginnigBalance < 0) {
          beginnigBalance = 0;
        }
        annualInterest += monthlyInterest;
        annualPrinciple += monthlyPrincipal;
        month++;
        if (month === 12 || beginnigBalance === 0) {
          this.annualTableData.push({
            'year': parseInt(i / 12) + 1,
            'interest': this.$formatNumberWithCommas(annualInterest),
            'principal': this.$formatNumberWithCommas(annualPrinciple),
            'remainingBalance': this.$formatNumberWithCommas(beginnigBalance),
          });
          month = 0;
          annualInterest = 0;
          annualPrinciple = 0;
        }
        this.monthlyTableData.push({
          'month': i + 1,
          'interest': this.$formatNumberWithCommas(monthlyInterest),
          'principal': this.$formatNumberWithCommas(monthlyPrincipal),
          'remainingBalance': this.$formatNumberWithCommas(beginnigBalance),
        });

        chartData.labels.push('Month' + (i + 1).toString());
        chartData.datasets[0].data.push(totalMonthlyPrincipal.toFixed(2));
        chartData.datasets[1].data.push(totalInterest.toFixed(2));
        chartData.datasets[2].data.push(beginnigBalance.toFixed(2));

        if (beginnigBalance === 0) {
          break;
        }
      }
      this.totalLoanInterest = totalInterest;
      this.totalLoanPayments = this.totalLoanAmount + this.totalLoanInterest;
      this.totalCost = this.autoPrice + this.totalLoanInterest + this.salesTax + this.titleAndFees - this.cashIncentives;
      this.chartData = chartData;
    },

    calculatePMT(principal, annualInterestRate, loanTerm) {
      // Convert annual interest rate to monthly rate
      const monthlyInterestRate = (annualInterestRate / 100) / 12;

      // Calculate the monthly payment
      const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));

      return monthlyPayment;
    },
  },
};
</script>

<style></style>