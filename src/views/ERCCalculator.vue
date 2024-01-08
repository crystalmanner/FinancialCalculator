<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1 class="text-center">ERC Calculator</h1>
      <v-row class="pa-4">
        <v-col cols="12" lg="4" md="4" sm="12">
          <div class="text-h4">
            Employee Retention Tax Credit Calculator
          </div>
          <br>
          <div class="text-h6">
            Quickly calculate your potential credit through the ERC Program. A government credit designed to reward
            business owners that retained their employees during the pandemic. For business owners who supported their
            employees from 2019-2021, a credit of up to <strong>$26,000 per W2 employee is available.</strong>

            Enter some basic information to calculate what your credit could be.
          </div>
        </v-col>
        <v-col cols="12" lg="8" md="8" sm="12">
          <v-stepper v-model="step" :items="items"
            :disabled="(step === 1 && (!isBusinessOwner || !rangeEmployees || !roundOfPPP || !averageCompensation || isBusinessOwner === 'noBusiness')) || (step === 2 && !isSecondStepFormValid) || (step === 3 && !isThirdStepFormValid)">
            <template v-slot:item.1>
              <v-radio-group v-model="isBusinessOwner">
                <template v-slot:label>
                  <div>Are you the business owner? <strong class="text-error font-italic">(Required)</strong></div>
                </template>
                <v-radio label="Yes, I own the business" value="ownBusiness"></v-radio>
                <v-radio label="No, but I can make decisions" value="willBusiness"></v-radio>
                <v-radio label="No, I am an employee" value="noBusiness"></v-radio>
              </v-radio-group>
              <p class="text-warning">You must be the owner or decision maker to continue.</p>
              <br>

              <v-radio-group v-model="rangeEmployees">
                <template v-slot:label>
                  <div>Range of Employees in 2019? <strong class="text-error font-italic">(Required)</strong></div>
                </template>
                <v-radio label="Under 100" value="under100"></v-radio>
                <v-radio label="100-499" value="under499"></v-radio>
                <v-radio label="500+" value="bigger500"></v-radio>
              </v-radio-group>

              <v-radio-group v-model="roundOfPPP">
                <template v-slot:label>
                  <div>Round of PPP <strong class="text-error font-italic">(Required)</strong></div>
                </template>
                <v-radio label="None" value="None"></v-radio>
                <v-radio label="1" value="1"></v-radio>
                <v-radio label="2" value="2"></v-radio>
              </v-radio-group>

              <v-radio-group v-model="averageCompensation">
                <template v-slot:label>
                  <div>Average Compensation <strong class="text-error font-italic">(Required)</strong></div>
                </template>
                <v-radio label="Under $40,000 Annually" value="under40000"></v-radio>
                <v-radio label="Over $40,000 Annually" value="over40000"></v-radio>
              </v-radio-group>
            </template>

            <template v-slot:item.2>
              <v-form v-model="isSecondStepFormValid">
                <v-text-field v-model="companyName" label="Company Name" :rules="[isFieldRequired]" dense></v-text-field>
                <v-text-field v-model.number="numberOfEmployees" type="number" label="Number of Employees in 2021"
                  :rules="[$numberGreaterThanZeroRule, numberMax1000Rule]"
                  hint="Please enter a number less than or equal to 1000." dense></v-text-field>
                <p>Add part-time employees as .5 (1/2) employees (2 part time = 1 employee)</p>
              </v-form>
            </template>

            <template v-slot:item.3>
              <v-form v-model="isThirdStepFormValid">
                <v-text-field v-model="firstName" label="First Name" :rules="[isFieldRequired]" dense></v-text-field>
                <v-text-field v-model="lastName" label="Last Name" :rules="[isFieldRequired]" dense></v-text-field>
              </v-form>
            </template>

            <template v-slot:item.4>
              <div class="text-center">
                <div class="text-h6">{{ firstName }}, {{ companyName }} May Qualify for</div>
                <div class="text-h3 text-warning">
                  {{ $formatNumberWithCommas(this.totalERC) }}
                </div>
                <div class="text-h5">
                  By Claiming the Employee Retention Tax Credit
                </div>
                <div v-if="this.totalERC > 0" class="text-left">
                  <div class="text-h5">File Your ERC Claim</div>
                  <div class="text-h8">
                    Based on numerous factors, such as supporting between employees in 2019 and maintaining a total of
                    employees through 2021. {{ companyName }} meets the minimum criteria to qualify the ERC credit.

                    Your PPP claim status does a play a large part in the amount you receive per employee and with an
                    average salary of , we have some options of how we can claim your ERC to receive the maximum amount.

                    Being in the industry, you are able to claim various hardships due to the pandemic, including supply
                    chain issues as of the most recent ERC law amendment.

                    {{ companyName }} is in a good position to claim the Employee Retention Tax Credit and with the help
                    of
                    a
                    qualified tax attorney, we're confident that you'll be satisfied with the results.
                  </div>
                </div>
              </div>
            </template>
          </v-stepper>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import CountryFlag from 'vue-country-flag-next'

export default {
  components: {
    CountryFlag
  },
  data() {
    return {
      isBusinessOwner: null,
      rangeEmployees: null,
      roundOfPPP: null,
      averageCompensation: null,
      step: 1,
      items: [
        'Basic Information',
        'Company Information',
        'Your Information',
        'Result',
      ],
      companyName: null,
      numberOfEmployees: null,
      isSecondStepFormValid: null,
      isFieldRequired: (v) => !!v || "Field is required",
      firstName: null,
      lastName: null,
      isThirdStepFormValid: null,
    };
  },
  computed: {
    totalERC() {
      if (this.rangeEmployees === 'under100') {
        let result = 24000;
        if (this.roundOfPPP === '1') {
          result = result - 2000;
        }
        if (this.roundOfPPP === '2') {
          result = result - 5000;
        }
        if (this.averageCompensation === 'over40000') {
          result = result + 2000;
        }
        return result * this.numberOfEmployees;
      }
      if (this.rangeEmployees === 'under499') {
        if (this.roundOfPPP === 'None' && this.averageCompensation === 'under40000') {
          return 24000 * this.numberOfEmployees;
        }
        if (this.roundOfPPP === 'None' && this.averageCompensation === 'over40000') {
          return 21000 * this.numberOfEmployees;
        }
        if (this.roundOfPPP === '1' && this.averageCompensation === 'under40000') {
          return 19000 * this.numberOfEmployees;
        }
        if (this.roundOfPPP === '1' && this.averageCompensation === 'over40000') {
          return 21000 * this.numberOfEmployees;
        }
        if (this.roundOfPPP === '2' && this.averageCompensation === 'under40000') {
          return 16000 * this.numberOfEmployees;
        }
        if (this.roundOfPPP === '2' && this.averageCompensation === 'over40000') {
          return 26000 * this.numberOfEmployees;
        }
      }
      if (this.rangeEmployees === 'bigger500') {
        return 0;
      }
      return 0;
    }
  },
  mounted() {

  },
  methods: {
    numberMax1000Rule(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 1000) {
        return `Maximum value is 1,000`; // Validation fails
      }
      return true; // Validation passes
    }
  },
};
</script>

<style></style>