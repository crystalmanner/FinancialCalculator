<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1 class="text-center">Simple Loan Calculator</h1>
      <v-row class="pa-2">
        <v-col cols="12" lg="6" md="6" sm="12">
          <v-form v-model="formValid">
            <v-text-field v-model.number="loanAmount" :rules="[$numberGreaterThanZeroRule, numberMin1000Rule]"
              type="number" label="Auto Price" prefix="$"></v-text-field>
            <v-text-field v-model.number="loanTermsInYears" :rules="[$numberGreaterThanZeroRule, numberMax40Rule]"
              type="number" label="Loan term in years" @input="inputYears"></v-text-field>
            <div>Or</div>
            <v-text-field v-model.number="loanTermsInMonths" :rules="[$numberGreaterThanZeroRule, $integerRule]"
              type="number" label="Loan term in months"></v-text-field>
            <v-text-field v-model.number="interestRate" :rules="[$numberGreaterThanZeroRule]" type="number"
              label="Interest rate per year" suffix="%"></v-text-field>
          </v-form>
        </v-col>
        <v-col cols="12" lg="6" md="6" sm="12">
          <div v-if="formValid" class="text-center">
            <div>Monthly payment</div>
            <div>
              <h2>{{ $formatNumberWithCommas(monthlyPayment) }}</h2>
            </div>
            <div class="mt-4">
              <div class="d-flex space-between mb-4">
                <span>Total principal paid</span><span>{{ $formatNumberWithCommas(loanAmount) }}</span>
              </div>
              <v-divider></v-divider>
              <div class="d-flex space-between mt-4">
                <span>Total interest paid</span><span>{{ $formatNumberWithCommas(totalInterestPaid) }}</span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>


export default {
  data() {
    return {
      loanAmount: 5000,
      loanTermsInYears: 5,
      loanTermsInMonths: 60,
      interestRate: 4.5,
      formValid: true,
      // monthlyPayment: 0,
      // totalInterestPaid: 0,
    };
  },

  watch: {
    loanTermsInMonths(val) {
      this.loanTermsInYears = val / 12;
    },
    loanTermsInYears(val) {
      this.loanTermsInMonths = val * 12;
    },

  },

  computed: {
    monthlyPayment() {
      return this.calculatePMT(this.loanAmount, this.interestRate, this.loanTermsInMonths);
    },
    totalInterestPaid() {
      let totalInterest = 0;
      let beginnigBalance = this.loanAmount;
      for (let i = 0; i < this.loanTermsInMonths; i++) {
        let monthlyInterest = beginnigBalance * this.interestRate / 100 / 12;
        let monthlyPrincipal = this.monthlyPayment - monthlyInterest;
        totalInterest += monthlyInterest;
        beginnigBalance = beginnigBalance - monthlyPrincipal;
      }
      return totalInterest;
    }
  },
  mounted() {
    // this.calculate();
  },
  methods: {
    inputYears(e) {
      if (this.loanTermsInYears.toString().length > 2) {
        this.loanTermsInYears = parseInt(this.loanTermsInYears);
      }
    },
    numberMax40Rule(value) {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue > 40) {
        return `Invalid loan term. Loan term in years can't be greater than 40.`; // Validation fails
      }
      return true; // Validation passes
    },
    numberMin1000Rule(value) {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue < 1000) {
        return `Invalid loan amount. Loan amount can't be smaller than $1000`; // Validation fails
      }
      return true; // Validation passes
    },
    // calculate() {
    //   this.monthlyPayment = this.calculatePMT(this.loanAmount, this.interestRate, this.loanTermsInMonths);
    //   let totalInterest = 0;
    //   let beginnigBalance = this.loanAmount;
    //   for (let i = 0; i < this.loanTermsInMonths; i++) {
    //     let monthlyInterest = beginnigBalance * this.interestRate / 100 / 12;
    //     let monthlyPrincipal = this.monthlyPayment - monthlyInterest;
    //     totalInterest += monthlyInterest;
    //     beginnigBalance = beginnigBalance - monthlyPrincipal;
    //   }
    //   this.totalInterestPaid = totalInterest;
    // },

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

<style>
.space-between {
  justify-content: space-between;
}
</style>