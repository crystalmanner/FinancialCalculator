<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <h1>Mortgage Calculator</h1>
      <v-row class="pa-2">
        <v-col cols="12" lg="3" md="4" sm="12">
          <h3>Edit Your Mortgage Detials</h3>
          <v-text-field v-model.number="homePrice" type="number" label="Home Price" prefix="$" @input="fetchData"
            dense></v-text-field>
          <v-slider v-model="homePrice" :min="homePriceMin" :max="homePriceMax" :step="homePriceStep"
            @end="fetchData"></v-slider>
          <v-text-field v-model.number="downPayment" type="number" label="Down Payment" prefix="$" @input="fetchData"
            dense></v-text-field>
          <v-slider v-model="downPayment" :min="downPaymentMin" :max="downPaymentMax" :step="downPaymentStep"
            @end="fetchData"></v-slider>
          <div v-if="notification">
            <p class="yellow-italic">{{ notification }}</p>
          </div>
          <v-text-field v-model.number="formattedRate" type="number" label="Mortgage Interest Rate" suffix="%"
            @input="fetchData" dense></v-text-field>
          <v-slider v-model="interestRate" :min="interestRateMin" :max="interestRateMax" :step="interestReatestep"
            @end="fetchData"></v-slider>
          <v-select v-model="selectedLoanType" :items="loanTypes" item-title="text" item-value="value"
            label="Loan Type"></v-select>
          <!-- <v-text-field v-model="location" label="Location" outlined></v-text-field> -->

          <v-text-field v-model.number="formattedTax" type="number" label="Annual Property Tax" suffix="%"
            @input="fetchData" dense></v-text-field>
          <v-slider v-model="annualPropertyTax" :min="annualPropertyTaxMin" :max="annualPropertyTaxMax"
            :step="annualPropertyTaxStep" @end="fetchData"></v-slider>

          <v-text-field v-model.number="annualInsurance" type="number" label="Annual Homeowners Insurance" prefix="$"
            @input="fetchData" dense></v-text-field>
          <v-slider v-model="annualInsurance" :min="annualInsuranceMin" :max="annualInsuranceMax"
            :step="annualInsuranceStep" @end="fetchData"></v-slider>
          <v-text-field v-model.number="monthlyHOA" type="number" label="Monthly HOA/Condo Fees" prefix="$"
            @input="fetchData" dense></v-text-field>
          <v-slider v-model="monthlyHOA" :min="monthlyHOAMin" :max="monthlyHOAMax" :step="monthlyHOAStep"
            @end="fetchData"></v-slider>
          <v-select v-model="selectedEstimatedPMIRate" :items="estimatedPMIRates" item-title="text" item-value="value"
            label="Your credit score" @input="fetchData"></v-select>
        </v-col>
        <v-col cols="12" lg="9" md="8" sm="12">
          <h2>Total Monthly Payment Breakdown</h2>
          <div v-if="result.error" class="pa-4 d-block">
            <h3 class="pt-3">{{ result.error }}</h3>
          </div>
          <div v-else>
            Based on a {{ $formatNumberWithCommas(homePrice - downPayment) }} mortgage
            <v-row justify="space-between">
              <v-col class="float-left">Mortgage Payment (P&I)</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(result.monthly_payment.mortgage) }}</v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col class="float-left">Home Insurance</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(result.monthly_payment.annual_home_ins +
                mortgageInsurance) }}</v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col class="float-left">Homeowners Insurance</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(result.monthly_payment.annual_home_ins) }}</v-col>
            </v-row>
            <!-- <v-row justify="space-between">
              <v-col class="float-left"><a>Edit this</a></v-col>
            </v-row> -->
            <v-row justify="space-between">
              <v-col class="float-left">Mortgage Insurance (PMI)</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(mortgageInsurance) }}</v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col class="float-left">Taxes & Other Fees</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(result.monthly_payment.hoa + propertyTaxes) }}</v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col class="float-left">Property Taxes</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(propertyTaxes) }}</v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col class="float-left">HOA/Condo Fees</v-col>
              <v-col class="float-right">{{ $formatNumberWithCommas(result.monthly_payment.hoa) }}</v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col class="float-left">Total Monthly Payment</v-col>
              <v-col class="float-right">
                {{ $formatNumberWithCommas(result.monthly_payment.hoa + propertyTaxes + result.monthly_payment.mortgage
                  + result.monthly_payment.annual_home_ins + mortgageInsurance) }}
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      homePrice: 500000, // Initial Homeprice value
      homePriceMin: 10000,    // Minimum Homeprice value
      homePriceMax: 10000000,  // Maximum Homeprice value
      homePriceStep: 5000,    // Step Homeprice size

      downPayment: 100000,
      downPaymentMin: 1,
      downPaymentMax: 10000000,
      downPaymentStep: 5000,


      interestRate: 6,
      interestRateMin: 1,
      interestRateMax: 12,
      interestReatestep: 0.01,

      selectedLoanType: 30,
      loanTypes: [
        { text: '30-Year Fixed', value: 30 },
        { text: '15-Year Fixed', value: 15 },
        { text: '5/1 ARM', value: 30 },
      ],
      location: "",

      annualPropertyTax: 1.95,
      annualPropertyTaxMin: 0,
      annualPropertyTaxMax: 5,
      annualPropertyTaxStep: 0.05,

      annualInsurance: 1250,
      annualInsuranceMin: 0,
      annualInsuranceMax: 50000,
      annualInsuranceStep: 50,

      monthlyHOA: 0,
      monthlyHOAMin: 0,
      monthlyHOAMax: 13000,
      monthlyHOAStep: 50,

      result: { error: 'calculating!' },
      selectedEstimatedPMIRate: 1.5,
      estimatedPMIRates: [
        { text: '620-639', value: 1.5 },
        { text: '640-659', value: 1.31 },
        { text: '660-679', value: 1.23 },
        { text: '680-699', value: 0.98 },
        { text: '700-719', value: 0.79 },
        { text: '720-739', value: 0.7 },
        { text: '740-759', value: 0.58 },
        { text: '760 and above', value: 0.46 },
        { text: 'Unknown', value: 0.98 },
      ],
      notification: null,
    };
  },
  watch: {
    selectedLoanType: function (newValue) {
      this.fetchData();
    }
  },
  computed: {
    formattedRate: {
      get() {
        return this.interestRate.toFixed(2); // Format value to 2 decimal places
      },
      set(newValue) {
        this.interestRate = parseFloat(newValue);
      }
    },
    formattedTax: {
      get() {
        return this.annualPropertyTax.toFixed(2); // Format value to 2 decimal places
      },
      set(newValue) {
        this.annualPropertyTax = parseFloat(newValue);
      }
    },
    propertyTaxes: {
      get() {
        if (this.annualPropertyTax > 0) {
          // return parseInt(this.homePrice * this.annualPropertyTax / 1200);
          return Math.round(this.homePrice * this.annualPropertyTax / 1200);
        }
        else
          return 0;
      },
    },
    mortgageInsurance: {
      get() {
        if (this.homePrice >= this.downPayment * 5) {
          return Math.round((this.homePrice - this.downPayment) * this.selectedEstimatedPMIRate / 1200);
        }
        else
          return 0;
      },
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchData();
    });
  },
  methods: {
    async fetchData() {
      this.notification = null;
      this.result = { error: 'calculating!' }
      try {

        if (this.homePrice < this.downPayment * 5) {
          if (this.homePrice <= this.downPayment) {
            this.downPayment = parseInt(this.homePrice / 5);
            this.notification = 'Down payment cannot be greater than home price. It has been reset to 20% of home price.';
          }

        }
        const response = await axios.get('https://api.api-ninjas.com/v1/mortgagecalculator', {
          params: {
            home_value: this.homePrice,
            downpayment: this.downPayment,
            interest_rate: this.interestRate,
            duration_years: this.selectedLoanType,
            monthly_hoa: this.monthlyHOA,
            annual_property_tax: this.annualPropertyTax,
            annual_home_insurance: this.annualInsurance,
          },
          headers: {
            'X-Api-Key': 'qTp5iDdDFTWa/wLbxIGOQw==unzoJhUeo45hmgkv',
            'Content-Type': 'application/json'
          }
        });
        this.result = response.data;

      } catch (error) {
        this.result = { "error": error.response.data };
        console.error('Error:', error.response.data);
      }
    },
    // formattedValue(number) {
    //   return number.toLocaleString(); // Format the number with commas
    // },
  },
};
</script>

<style>
.yellow-italic {
  color: chocolate;
  font-style: italic;
  font-size: 12px;
}
</style>