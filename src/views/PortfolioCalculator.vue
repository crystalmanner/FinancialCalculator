<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1>Total Fee Comparison Calculator</h1>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="6" md="6" sm="12">
          <v-form v-model="validForm">
            <v-text-field v-model="formattedAccountValue" :rules="[$textGreaterThanNegativeRule, textSmallerThan12000000]"
              label="Account(s) Value" type="text" prefix="$"
              hint="The total value of all your accounts which will be charged a fee" @blur="formatAccountValue"
              @input="stripAccountValueFormatting" dense></v-text-field>
            <v-text-field v-model.number="averageAnnualReturn"
              :rules="[$numberGreaterThanNegativeRule, numberSmallerThan12]" label="Average Annual Return" suffix="%"
              hint="How much do you expect to earn on an average annual basis?" dense></v-text-field>
            <v-text-field v-model.number="periodLength" :rules="[...periodLengthRules, numberSmallerThan50]"
              label="Period Length" suffix="year(s)" hint="How many years would you like to use for this calculation?"
              dense></v-text-field>
            <v-text-field v-model="formattedAnnualDistribution" :rules="[$textGreaterThanNegativeRule]"
              label="Annual Distribution" prefix="$" type="text"
              hint="How much would you like to take out of your accounts for living expenses?"
              @blur="formatAnnualDistribution" @input="stripAnnualDistributionFormatting" dense></v-text-field>
            <v-text-field v-model.number="annualIncreaseDistributionRate"
              :rules="[$numberGreaterThanNegativeRule, numberSmallerThan10]" label="Average % Increase to Distribution"
              suffix="%"
              hint="How much would you like to increase your annual living expense distributions to offset inflation?"
              dense></v-text-field>

            <v-row>
              <v-col cols="12" lg="6" md="6" sm="12">
                <h4>Current Portfolio</h4>
                <v-text-field v-model.number="currentAveragePortfolioExpenseRate"
                  :rules="[$numberGreaterThanNegativeRule]" label="Average Portfolio Expense" suffix="%"
                  hint="Will your advisor increase this fee?" dense></v-text-field>


                <v-radio-group v-model="currentFeeOption">
                  <v-radio label="Advisory Fee" value="advisoryFee"></v-radio>
                  <v-radio label="Flat Fee" value="flatFee"></v-radio>
                </v-radio-group>
                <v-text-field v-if="currentFeeOption === 'advisoryFee'" v-model.number="currentAdvisoryFeeRate"
                  :rules="[$numberGreaterThanNegativeRule]" label="% Advisory Fee" suffix="%"
                  hint="How much are you being charged as a percentage for an advisory fee?" dense></v-text-field>
                <v-text-field v-if="currentFeeOption === 'flatFee'" v-model="formattedCurrentFlatFee"
                  :rules="[$textGreaterThanNegativeRule]" label="Flat Fee" prefix="$"
                  hint="What is the proposed dollar amount of the flat fee?" type="text" @blur="formatCurrentFlatFee"
                  @input="stripCurrentFlatFeeFormatting" dense></v-text-field>
                <v-text-field v-model.number="currentAnnualIncreaseFeeRate" :rules="[$numberGreaterThanNegativeRule]"
                  label="Annual Increase to Fee" suffix="%" hint="Will the flat fee increase annually?"
                  dense></v-text-field>
              </v-col>
              <v-col cols="12" lg="6" md="6" sm="12">
                <h4>Proposed Portfolio</h4>
                <v-text-field v-model.number="proposedAveragePortfolioExpenseRate"
                  :rules="[$numberGreaterThanNegativeRule]" label="Average Portfolio Expense" suffix="%"
                  hint="Will your advisor increase this fee?" dense></v-text-field>
                <v-radio-group v-model="proposedFeeOption">
                  <v-radio label="Advisory Fee" value="advisoryFee"></v-radio>
                  <v-radio label="Flat Fee" value="flatFee"></v-radio>
                </v-radio-group>
                <v-text-field v-if="proposedFeeOption === 'advisoryFee'" v-model.number="proposedAdvisoryFeeRate"
                  :rules="[$numberGreaterThanNegativeRule]" label="% Advisory Fee" suffix="%"
                  hint="How much are you being charged as a percentage for an advisory fee?" dense></v-text-field>
                <v-text-field v-if="proposedFeeOption === 'flatFee'" v-model="formattedProposedFlatFee"
                  :rules="[$textGreaterThanNegativeRule]" label="Flat Fee" prefix="$"
                  hint="What is the proposed dollar amount of the flat fee?" type="text" @blur="formatProposedFlatFee"
                  @input="stripProposedFlatFeeFormatting" dense></v-text-field>
                <v-text-field v-model.number="proposedAnnualIncreaseFeeRate" :rules="[$numberGreaterThanNegativeRule]"
                  label="Annual Increase to Fee" suffix="%" hint="Will the flat fee increase annually?"
                  dense></v-text-field>
              </v-col>
            </v-row>

          </v-form>
        </v-col>
        <v-col cols="12" lg="6" md="6" sm="12">
          <div v-if="validForm">
            <h2>FACE VALUE&nbsp;
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-icon icon="mdi-help-circle" class="mb-1 cursor-pointer" size="md" v-bind="props" start />
                </template>
                <span>Face Value is the difference of the two cumulative fee amounts over the period selected.</span>
              </v-tooltip>
            </h2>
            <div class="d-flex">
              <div class="width-50">
                <h4>Current Portfolio</h4>
                <ul class="ml-5">
                  <li>Advisory Expense</li>
                  <li>Investment Expense ({{ this.currentAveragePortfolioExpenseRate }}%)</li>
                </ul>
              </div>
              <div class="width-50">
                <h4>
                  {{ $formatNumberWithCommas(customRound(currentTotalAdvisoryExpense + currentTotalInvestmentExpense)) }}
                </h4>
                <ul class="ml-5">
                  <li>{{ $formatNumberWithCommas(customRound(currentTotalAdvisoryExpense)) }}</li>
                  <li>{{ $formatNumberWithCommas(customRound(currentTotalInvestmentExpense)) }}</li>
                </ul>
              </div>
            </div>
            <div class="d-flex">
              <div class="width-50">
                <h4>Proposed Portfolio</h4>
                <ul class="ml-5">
                  <li>Advisory Expense</li>
                  <li>Investment Expense ({{ this.proposedAveragePortfolioExpenseRate }}%)</li>
                </ul>
              </div>
              <div class="width-50">
                <h4>
                  {{ $formatNumberWithCommas(customRound(proposedTotalAdvisoryExpense + proposedTotalInvestmentExpense)) }}
                </h4>
                <ul class="ml-5">
                  <li>{{ $formatNumberWithCommas(customRound(proposedTotalAdvisoryExpense)) }}</li>
                  <li>{{ $formatNumberWithCommas(customRound(proposedTotalInvestmentExpense)) }}</li>
                </ul>
              </div>
            </div>
            <hr>
            <div class="d-flex">
              <div class="width-50">
                <h4>Difference</h4>
              </div>
              <div class="width-50">
                <h4>
                  {{ $formatNumberWithCommas(customRound(Math.abs(currentTotalAdvisoryExpense + currentTotalInvestmentExpense - proposedTotalAdvisoryExpense - proposedTotalInvestmentExpense))) }}
                </h4>
              </div>
            </div>
            <h2 class="mt-2">REAL VALUE&nbsp;
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <v-icon icon="mdi-help-circle" class="mb-1 cursor-pointer" size="md" v-bind="props" start />
                </template>
                <span>Real Value is the difference in ending account value assuming the decreased fees remained invested
                  over the period selected.</span>
              </v-tooltip>
            </h2>
            <div class="d-flex">
              <div class="width-50">
                <h4>Current Portfolio</h4>
              </div>
              <div class="width-50">
                <h4> {{ $formatNumberWithCommas(customRound(currentRealValue)) }}</h4>
              </div>
            </div>
            <div class="d-flex">
              <div class="width-50">
                <h4>Proposed Portfolio</h4>
              </div>
              <div class="width-50">
                <h4> {{ $formatNumberWithCommas(customRound(proposedRealValue)) }}</h4>
              </div>
            </div>
            <hr>
            <div class="d-flex">
              <div class="width-50">
                <h4>Difference</h4>
              </div>
              <div class="width-50">
                <h4>
                  {{ $formatNumberWithCommas(customRound(Math.abs(currentRealValue - proposedRealValue))) }}
                </h4>
              </div>
            </div>
            <div class="mt-4" style="max-width: 760px;">
              <Line id="line-chart" width="600px" height="300px" :options="chartOptions" :data="chartData" />
            </div>
          </div>
          <div v-else class="mt-2 text-center">
            <h3 class="text-red-accent-2">Please input valid values.</h3>
          </div>
        </v-col>
        <v-col cols="12" lg="12" md="12" sm="12">
          <div v-if="validForm">
            <v-data-table :headers="headers" :items="tableData" :items-per-page="-1" :items-per-page-options="pageOptions"
              class="portfolio-table mt-4">
            </v-data-table>
          </div>
        </v-col>
        <v-col cols="12" lg="12" md="12" sm="12">
          <p class="text-subtitle-2 text-center">Disclaimer: The calculation provided by this fee calculator is intended
            for illustrative purposes only. It is not intended to provide specific financial, investment, tax, legal, or
            accounting advice. For personalized advice, please consult with a qualified professional. The results are
            based on the information provided and certain assumptions about the future, which may not be accurate. We do
            not guarantee the accuracy or applicability of this calculation to your individual circumstances.</p>
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
      formattedAccountValue: '2,000,000',
      averageAnnualReturn: 7,
      periodLength: 25,
      annualDistribution: 80000,
      formattedAnnualDistribution: '80,000',
      annualIncreaseDistributionRate: 2,

      currentAveragePortfolioExpenseRate: 0.7,
      currentAdvisoryFeeRate: 1,
      currentFlatFee: 10000,
      formattedCurrentFlatFee: '10,000',
      currentAnnualIncreaseFeeRate: 0,
      currentFeeOption: 'advisoryFee',

      currentTotalAdvisoryExpense: 0,
      currentTotalInvestmentExpense: 0,
      proposedTotalAdvisoryExpense: 0,
      proposedTotalInvestmentExpense: 0,
      currentRealValue: 0,
      proposedRealValue: 0,

      proposedAveragePortfolioExpenseRate: 0.1,
      proposedAdvisoryFeeRate: 1,
      proposedFlatFee: 10000,
      formattedProposedFlatFee: '10,000',
      proposedAnnualIncreaseFeeRate: 3,
      proposedFeeOption: 'flatFee',

      proposedTotalPercentFee: 0,
      proposedTotalFlatFee: 0,
      proposedFlatFeeAccountValue: 0,
      proposedPercentAccountValue: 0,
      tableData: [],
      pageOptions: [
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 25, title: '25' },
        { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' }
      ],

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
            label: "Current Portfolio",
            data: [],
            backgroundColor: "rgba(0,112,192,.6)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Proposed Portfolio",
            data: [],
            backgroundColor: "rgba(0,176,80,.6)",
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
    averageAnnualReturn() {
      this.calculate();
    },
    annualDistribution() {
      this.calculate();
    },
    annualIncreaseDistributionRate() {
      this.calculate();
    },
    periodLength() {
      this.calculate();
    },
    currentFeeOption() {
      this.calculate();
    },
    proposedFeeOption() {
      this.calculate();
    },
    currentAdvisoryFeeRate() {
      this.calculate();
    },
    currentAveragePortfolioExpenseRate() {
      this.calculate();
    },
    currentFlatFee() {
      this.calculate();
    },
    currentAnnualIncreaseFeeRate() {
      this.calculate();
    },

    proposedAdvisoryFeeRate() {
      this.calculate();
    },
    proposedAveragePortfolioExpenseRate() {
      this.calculate();
    },
    proposedFlatFee() {
      this.calculate();
    },
    proposedAnnualIncreaseFeeRate() {
      this.calculate();
    },
  },
  computed: {
    headers() {
      return [
        {
          title: '',
          children: [
            {
              title: 'Year',
              align: 'start',
              value: 'year',
            }
          ]
        },
        {
          title: 'Current Portfolio',
          align: 'center',
          children: [
            { title: 'Account Value', value: 'currentAccountValue' },
            { title: 'Distribution', value: 'currentDistribution' },
            { title: 'Advisory Expense', value: 'currentAdvisoryExpense' },
            { title: 'Investment Expense (' + this.currentAveragePortfolioExpenseRate + '%)', value: 'currentInvestmentExpense' },
            { title: 'Total Expense', value: 'currentTotalExpense' },
          ]
        },
        {
          title: 'Proposed Portfolio',
          align: 'center',
          children: [
            { title: 'Account Value', value: 'proposedAccountValue' },
            { title: 'Distribution', value: 'proposedDistribution' },
            { title: 'Advisory Expense', value: 'proposedAdvisoryExpense' },
            { title: 'Investment Expense (' + this.proposedAveragePortfolioExpenseRate + '%)', value: 'proposedInvestmentExpense' },
            { title: 'Total Expense', value: 'proposedTotalExpense' },
          ]
        }
      ]
    },
  },
  created() {
    this.$nextTick(() => {
      this.calculate();
    });
  },
  methods: {
    formatAccountValue() {
      // When the user leaves the field, format the number with commas
      this.formattedAccountValue = new Intl.NumberFormat().format(this.accountValue);
    },
    stripAccountValueFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.accountValue = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedAccountValue = digits;
    },
    formatAnnualDistribution() {
      // When the user leaves the field, format the number with commas
      this.formattedAnnualDistribution = new Intl.NumberFormat().format(this.annualDistribution);
    },
    stripAnnualDistributionFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.annualDistribution = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedAnnualDistribution = digits;
    },
    formatCurrentFlatFee() {
      // When the user leaves the field, format the number with commas
      this.formattedCurrentFlatFee = new Intl.NumberFormat().format(this.currentFlatFee);
    },
    stripCurrentFlatFeeFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.currentFlatFee = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedCurrentFlatFee = digits;
    },
    formatProposedFlatFee() {
      // When the user leaves the field, format the number with commas
      this.formattedProposedFlatFee = new Intl.NumberFormat().format(this.proposedFlatFee);
    },
    stripProposedFlatFeeFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.proposedFlatFee = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedProposedFlatFee = digits;
    },
    calculate() {
      this.tableData = [];
      let i = 0;

      let chartData = {
        labels: [],
        datasets: [
          {
            label: "Current Portfolio",
            data: [],
            backgroundColor: "rgba(0,112,192,.6)",
            borderColor: "#4897FF",
            borderWidth: 1,
            fill: true,
          },
          {
            label: "Proposed Portfolio",
            data: [],
            backgroundColor: "rgba(0,176,80,.6)",
            borderColor: "#88DD9B",
            borderWidth: 1,
            fill: true,
          },
        ],
      };
      let currentAccountValue = parseFloat(this.accountValue);
      let currentDistribution = parseFloat(this.annualDistribution);
      let currentAdvisoryExpense;
      if (this.currentFeeOption === 'advisoryFee') {
        currentAdvisoryExpense = currentAccountValue * this.currentAdvisoryFeeRate / 100;
      } else {
        currentAdvisoryExpense = parseFloat(this.currentFlatFee);
      }
      let currentInvestmentExpense = currentAccountValue * this.currentAveragePortfolioExpenseRate / 100;
      let currentTotalExpense = currentAdvisoryExpense + currentInvestmentExpense;

      let proposedAccountValue = parseFloat(this.accountValue);
      let proposedDistribution = parseFloat(this.annualDistribution);
      let proposedAdvisoryExpense;
      if (this.proposedFeeOption === 'advisoryFee') {
        proposedAdvisoryExpense = proposedAccountValue * this.proposedAdvisoryFeeRate / 100;
      } else {
        proposedAdvisoryExpense = parseFloat(this.proposedFlatFee);
      }
      let proposedInvestmentExpense = proposedAccountValue * this.proposedAveragePortfolioExpenseRate / 100;
      let proposedTotalExpense = proposedAdvisoryExpense + proposedInvestmentExpense;

      this.currentTotalAdvisoryExpense = 0;
      this.currentTotalInvestmentExpense = 0;
      this.proposedTotalAdvisoryExpense = 0;
      this.proposedTotalInvestmentExpense = 0;
      while (i < this.periodLength) {
        i++;
        currentAccountValue = currentAccountValue * (100 + this.averageAnnualReturn) / 100 - currentDistribution - currentAdvisoryExpense - currentInvestmentExpense;
        currentDistribution = currentDistribution * (100 + this.annualIncreaseDistributionRate) / 100;
        if (this.currentFeeOption === 'advisoryFee') {
          currentAdvisoryExpense = currentAccountValue * this.currentAdvisoryFeeRate / 100;
          currentAdvisoryExpense = currentAdvisoryExpense * (100 + this.currentAnnualIncreaseFeeRate) / 100;
        } else {
          currentAdvisoryExpense = currentAdvisoryExpense * (100 + this.currentAnnualIncreaseFeeRate) / 100;

        }
        currentInvestmentExpense = currentAccountValue * this.currentAveragePortfolioExpenseRate / 100;
        currentTotalExpense = currentAdvisoryExpense + currentInvestmentExpense;

        proposedAccountValue = proposedAccountValue * (100 + this.averageAnnualReturn) / 100 - proposedDistribution - proposedAdvisoryExpense - proposedInvestmentExpense;
        proposedDistribution = proposedDistribution * (100 + this.annualIncreaseDistributionRate) / 100;
        if (this.proposedFeeOption === 'advisoryFee') {
          proposedAdvisoryExpense = proposedAccountValue * this.proposedAdvisoryFeeRate /
            100;
          proposedAdvisoryExpense = proposedAdvisoryExpense * (100 + this.proposedAnnualIncreaseFeeRate) / 100;
        } else {
          proposedAdvisoryExpense = proposedAdvisoryExpense * (100 + this.proposedAnnualIncreaseFeeRate) / 100;
        }
        proposedInvestmentExpense = proposedAccountValue * this.proposedAveragePortfolioExpenseRate / 100;
        proposedTotalExpense = proposedAdvisoryExpense + proposedInvestmentExpense;

        this.currentTotalAdvisoryExpense += currentAdvisoryExpense;
        this.currentTotalInvestmentExpense += currentInvestmentExpense;
        this.proposedTotalAdvisoryExpense += proposedAdvisoryExpense;
        this.proposedTotalInvestmentExpense += proposedInvestmentExpense;
        this.currentRealValue = currentAccountValue;
        this.proposedRealValue = proposedAccountValue;
        this.tableData.push({
          'year': i,
          'currentAccountValue': this.$formatNumberWithCommas(this.customRound(currentAccountValue)),
          'currentDistribution': this.$formatNumberWithCommas(this.customRound(currentDistribution)),
          'currentAdvisoryExpense': this.$formatNumberWithCommas(this.customRound(currentAdvisoryExpense)),
          'currentInvestmentExpense': this.$formatNumberWithCommas(this.customRound(currentInvestmentExpense)),
          'currentTotalExpense': this.$formatNumberWithCommas(this.customRound(currentTotalExpense)),
          'proposedAccountValue': this.$formatNumberWithCommas(this.customRound(proposedAccountValue)),
          'proposedDistribution': this.$formatNumberWithCommas(this.customRound(proposedDistribution)),
          'proposedAdvisoryExpense': this.$formatNumberWithCommas(this.customRound(proposedAdvisoryExpense)),
          'proposedInvestmentExpense': this.$formatNumberWithCommas(this.customRound(proposedInvestmentExpense)),
          'proposedTotalExpense': this.$formatNumberWithCommas(this.customRound(proposedTotalExpense)),
        });
        chartData.labels.push('Year ' + i);
        chartData.datasets[0].data.push(currentAccountValue.toFixed(2));
        chartData.datasets[1].data.push(proposedAccountValue.toFixed(2));
      }

      this.chartData = chartData;
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
    },
    numberSmallerThan50(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 50) {
        return `Period length should not be greater than 50 years.`; // Validation fails
      }
      return true; // Validation passes
    },
    textSmallerThan12000000(value) {
      const numericValue = parseFloat(value.replace(/[^\d]/g, ''));
      if (!isNaN(numericValue) && numericValue > 12000000) {
        return `Account(s) value can not be greater than 12,000,000.`; // Validation fails
      }
      return true; // Validation passes
    },
    customRound(value) {
      const decimalPart = value - Math.floor(value);
      if (decimalPart >= 0.5) {
        // If decimal part is greater than or equal to 0.5, use Math.ceil()
        return Math.ceil(value);
      } else {
        // If decimal part is less than 0.5, use Math.floor()
        return Math.floor(value);
      }
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

.cursor-pointer {
  cursor: pointer;
}

.width-50 {
  width: 50%;
}

.current-header-style {
  background-color: #4897FF;
}

.portfolio-table table thead tr:nth-child(1) th:nth-child(2) {
  background-color: #4897FF;
}

.portfolio-table table thead tr:nth-child(1) th:nth-child(3) {
  background-color: #88DD9B;
}

.portfolio-table table thead tr:nth-child(2) th:nth-child(n+2):nth-child(-n+6) {
  background-color: #CEE1F2;
}

.portfolio-table table thead tr:nth-child(2) th:nth-child(n+7):nth-child(-n+11) {
  background-color: #D6EBD5;
}

.portfolio-table table tbody tr td:nth-child(n+2):nth-child(-n+6) {
  background-color: #CEE1F2;
}

.portfolio-table table tbody tr td:nth-child(n+7):nth-child(-n+11) {
  background-color: #D6EBD5;
}
</style>