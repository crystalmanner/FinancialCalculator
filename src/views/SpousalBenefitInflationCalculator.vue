<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <Header />
      <h2>Social Security Spousal Benefits Calculator</h2>
      <hr>
      <v-form ref="form" v-model="validForm">
        <v-row class="pa-2 mt-2">
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-text-field v-model="higherEarnerDOB" label="Higher Earner DOB" type="date" :rules="[dateBiggerThan1943]"
              min="1943-01-02"></v-text-field>

            <v-text-field v-model="lowerEarnerDOB" label="Lower Earner DOB" type="date" :rules="[dateBiggerThan1943]"
              min="1943-01-02"></v-text-field>

            <v-text-field v-model="higherEarnerFileDate" label="Date Higher Earner Will File" type="date"
              :rules="[higherEarnerFileDateRule]"></v-text-field>

            <v-text-field v-model="lowerEarnerFileDate" label="Date Lower Earner Will File" type="date"
              :rules="[lowerEarnerFileDateRule]"></v-text-field>
            <v-checkbox v-model="meetDivorcedBenefit" class="check-box" label="Do you meet the qualifications for a divorced spouse benefit?"></v-checkbox>
          </v-col>
          <v-col cols="12" lg="6" md="6" sm="12">
            <v-text-field v-model="formattedHigherEarnerBenefit" :rules="[$textGreaterThanNegativeRule]"
              label="Higher Earner Full Retirement Age Benefit" type="text" prefix="$"
              hint="The full retirement age benefit the higher earning spouse earned from their own work"
              @blur="formatHigherEarnerBenefit" @input="stripHigherEarnerBenefitFormatting" dense></v-text-field>
            <v-text-field v-model="formattedLowerEarnerBenefit" :rules="[$textGreaterThanNegativeRule]"
              label="Lower Earner Full Retirement Age Benefit" type="text" prefix="$"
              hint="The full retirement age benefit the lower earning spouse earned from their own work"
              @blur="formatLowerEarnerBenefit" @input="stripLowerEarnerBenefitFormatting" dense></v-text-field>
            <p class="ml-1">Age of Benefit Estimate: Current or Previous Year?</p>
            <v-radio-group
              v-model="benefitEstimateFrom"
            >
              <v-radio
                label="Benefit estimate from this year"
                value="currentYear"
              ></v-radio>
              <v-radio
                label="Benefit estimate from last year"
                value="lastYear"
              ></v-radio>
            </v-radio-group>
            <div class="d-flex align-center">
              <v-text-field class="mr-2" label="Average COLA %" v-model.number="inflationRate" :rules="[$numberGreaterThanNegativeRule, numberSmallerThan10]"
              suffix="%" dense></v-text-field>
              <p class="big-text mb-4">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon icon="mdi-help-circle" class="cursor-pointer" size="md" v-bind="props" start />
                  </template>
                  <span>Enter the estimated annual cost of living increase to Social Security Benefits</span>
                </v-tooltip>
              </p>
            </div>
          </v-col>
        </v-row>
      </v-form>
      <hr>
      <v-row class="pa-2 mt-2">
        <v-col cols="12" lg="12" md="12" sm="12">
          <div v-if="validForm">
            <div class="result-section">
              <div class="title">Benefit from Lower Earner Work at <i>{{ lowerEarnerPaymentTitle }}</i></div>
              <div class="result-value mb-2">
                {{ $formatNumberWithCommas($customRound(lowerEarnerPayment)) }}
              </div>
              <div class="title">Additional Benefit from Spousal Payment at <i>{{ spousalExcessTitle }}</i></div>
              <v-spacer></v-spacer>
              <p class="result-value mb-1">{{ $formatNumberWithCommas($customRound(spousalExcess)) }}
              </p>
            </div>
             <v-data-table :headers="tableHeaders" :items="tableData" :items-per-page="-1" :items-per-page-options="pageOptions" class="spousal-benefit-table mt-4">
            </v-data-table>
          </div>
          <div v-else class="mt-2 text-center">
            <h3 class="text-red-accent-2">Please input valid values.</h3>
            <p>{{ errorNotification }}</p>
          </div>
        </v-col>
        <v-col cols="12" lg="12" md="12" sm="12">
          <p class="text-subtitle-2 text-center mt-6 mb-4">Disclaimer: This calculator assumes that lower earning spouse has
            met the
            all of eligibility criteria for spousal benefits. The calculation provided is intended for illustrative
            purposes only. It is not intended to provide specific financial, investment, tax, legal, or accounting advice.
            For personalized advice, please consult with a qualified professional. The results are based on the
            information provided and certain assumptions about the future, which may not be accurate. We do not guarantee
            the accuracy or applicability of this calculation to your individual circumstances.</p>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
// import axios from 'axios';
// import inflations from '../data/inflations.json';
import Header from '@/components/Header.vue'
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  components: { Header },
  data() {
    return {
      validForm: true,
      higherEarnerDOB: "1960-01-15",
      lowerEarnerDOB: "1960-01-15",
      higherEarnerFileDate: "2027-01-15",
      lowerEarnerFileDate: "2027-01-15",
      higherEarnerBenefit: 3000,
      formattedHigherEarnerBenefit: '3,000',
      lowerEarnerBenefit: 1200,
      formattedLowerEarnerBenefit: '1,200',
      lowerEarnerPayment: 0,
      spousalExcess: 0,
      meetDivorcedBenefit: false,
      errorNotification: "",
      tableHeaders: [
        {
          title: 'Date',
          value: 'date',
          width: '135px',
          sortable: true,
        },
        {
          title: 'Lower Earner Age',
          value: 'lowerEarnerAge',
          width: '160px',
        },
        {
          title: 'Lower Earner FRA Benefit',
          value: 'lowerEarnerFRABenefit',
          align: 'center',
        },
        {
          title: 'Higher Earner FRA Benefit',
          value: 'higherEarnerFRABenefit',
          align: 'center',
        },
        {
          title: 'Lower Earner Benefit From Own Record',
          value: 'lowerEarnerBenefitOwnRecord',
          align: 'center',
        },
        {
          title: 'Lower Earner Benefit From Spousal Payment',
          value: 'lowerEarnerBenefitSpousalPayment',
          align: 'center',
        },
        {
          title: 'Lower Earner Total Benefit Payment',
          value: 'totalBenefitPayment',
          align: 'center',
        }
      ],
      tableData: [],
      pageOptions: [
        { value: 10, title: '10' },
        { value: 25, title: '25' },
        { value: 50, title: '50' },
        { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' }
      ],
      lowerEarnerPaymentTitle: "",
      spousalExcessTitle: "",
      inflationRate: 0,
      fullRetireMonths: 0,
      lowerEarnerDOBSSA: "1960-01-15",
      higherEarnerDOBSSA: "1960-01-15",
      // inflations: inflations,
      inflations: {},
      benefitEstimateFrom: 'currentYear',
    };
  },
  watch: {
    higherEarnerDOB() {
      this.$refs.form.validate();
      this.calculate();
    },
    lowerEarnerDOB() {
      this.$refs.form.validate();
      this.calculate();
    },
    higherEarnerFileDate() {
      this.$refs.form.validate();
      this.calculate();
    },
    lowerEarnerFileDate() {
      this.$refs.form.validate();
      this.calculate();
    },
    higherEarnerBenefit() {
      this.$refs.form.validate();
      this.calculate();
    },
    lowerEarnerBenefit() {
      this.$refs.form.validate();
      this.calculate();
    },
    meetDivorcedBenefit() {
      this.$refs.form.validate();
      this.calculate();
    },
    inflationRate(val) {
      this.$refs.form.validate();
      // for (let i = 2024; i < 9999; i++) {
      //   this.inflations[i] = this.inflations[i - 1] * (100 + val) / 100;
      // }
      this.inflations[1999] = 100;
      for (let i = 2000; i < 9999; i++) {
        this.inflations[i] = this.inflations[i - 1] * (100 + val) / 100;
      }
      this.calculate();
    },
    benefitEstimateFrom() {
      this.$refs.form.validate();
      this.calculate();
    }
  },
  created() {
    this.$nextTick(() => {
      // for (let i = 2024; i < 9999; i++) {
      //   this.inflations[i] = this.inflations[i - 1] * (100 + this.inflationRate) / 100;
      // }
      this.inflations[1999] = 100;
      for (let i = 2000; i < 9999; i++) {
        this.inflations[i] = this.inflations[i - 1] * (100 + this.inflationRate) / 100;
      }
      this.calculate();
    });
  },
  methods: {
    formatHigherEarnerBenefit() {
      // When the user leaves the field, format the number with commas
      this.formattedHigherEarnerBenefit = new Intl.NumberFormat().format(this.higherEarnerBenefit);
    },
    stripHigherEarnerBenefitFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.higherEarnerBenefit = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedHigherEarnerBenefit = digits;
    },
    formatLowerEarnerBenefit() {
      // When the user leaves the field, format the number with commas
      this.formattedLowerEarnerBenefit = new Intl.NumberFormat().format(this.lowerEarnerBenefit);
    },
    stripLowerEarnerBenefitFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.lowerEarnerBenefit = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedLowerEarnerBenefit = digits;
    },
    async calculate() {
      this.lowerEarnerDOBSSA = new Date(this.lowerEarnerDOB);
      
      let higherEarnerBenefit = this.higherEarnerBenefit;
      let lowerEarnerBenefit = this.lowerEarnerBenefit;
      let currentDate = new Date();
      let currentYear = currentDate.getUTCFullYear();
      if (this.benefitEstimateFrom === 'lastYear') {
        higherEarnerBenefit = this.higherEarnerBenefit * this.inflations[currentYear] / this.inflations[currentYear -1];
        lowerEarnerBenefit = this.lowerEarnerBenefit * this.inflations[currentYear] / this.inflations[currentYear -1];
      }
      let dateOfBirth = new Date(this.lowerEarnerDOBSSA)
      let dateOfBirthMonth = dateOfBirth.getUTCMonth()
      if (new Date(this.lowerEarnerDOBSSA) > new Date('01/01/1960')) {
        // 67 years and 0 month
        this.fullRetireMonths = 67 * 12;
      } else if (new Date(this.lowerEarnerDOBSSA) > new Date('01/01/1959')) {
        this.fullRetireMonths = 66 * 12 + 10;
      } else if (new Date(this.lowerEarnerDOBSSA) > new Date('01/01/1958')) {
        this.fullRetireMonths = 66 * 12 + 8;
      } else if (new Date(this.lowerEarnerDOBSSA) > new Date('01/01/1957')) {
        this.fullRetireMonths = 66 * 12 + 6;
      } else if (new Date(this.lowerEarnerDOBSSA) > new Date('01/01/1956')) {
        this.fullRetireMonths = 66 * 12 + 4;
      } else if (new Date(this.lowerEarnerDOBSSA) > new Date('01/01/1955')) {
        this.fullRetireMonths = 66 * 12 + 2;
      } else {
        this.fullRetireMonths = 66 * 12;
      }
      let retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate));
      if (this.getMonthOffset(this.lowerEarnerDOBSSA, new Date(this.lowerEarnerFileDate)) === 62 * 12) {
        if (this.lowerEarnerDOBSSA.getUTCDate() > 2) {
          retiredMonths = retiredMonths + 1
        }
      }
      this.lowerEarnerPaymentTitle = this.getYearsMonth(retiredMonths);
      // inflationRate between 2024 and 2027
      let inflationRate = this.inflations[this.getYearAfterAddingMonths(this.lowerEarnerDOBSSA, retiredMonths)] / this.inflations[currentYear];
      lowerEarnerBenefit = lowerEarnerBenefit * inflationRate
      higherEarnerBenefit = higherEarnerBenefit * inflationRate

      // get inflation lowerEarnerPayment
      let spousalPayment = Math.max(parseFloat(higherEarnerBenefit) / 2 - parseFloat(lowerEarnerBenefit), 0);
      if (!this.meetDivorcedBenefit && !this.higherEarnerFileDate) {
        spousalPayment = 0;
      }
      if (!spousalPayment) {
        spousalPayment = 0;
      }
      this.lowerEarnerPayment = this.getLowerEarnerPayment(lowerEarnerBenefit, this.fullRetireMonths, retiredMonths);

      // get inflation spousal payment
      higherEarnerBenefit = this.higherEarnerBenefit;
      lowerEarnerBenefit = this.lowerEarnerBenefit;
      if (this.benefitEstimateFrom === 'lastYear') {
        higherEarnerBenefit = this.higherEarnerBenefit * this.inflations[currentYear] / this.inflations[currentYear -1];
        lowerEarnerBenefit = this.lowerEarnerBenefit * this.inflations[currentYear] / this.inflations[currentYear -1];
      }
      if (this.meetDivorcedBenefit) {
        retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate));
      } else {
        retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), this.getMaxDate(new Date(this.lowerEarnerFileDate), new Date(this.higherEarnerFileDate)));
      }
      this.spousalExcessTitle = this.getYearsMonth(retiredMonths);

      inflationRate = this.inflations[this.getYearAfterAddingMonths(this.lowerEarnerDOBSSA, retiredMonths)] / this.inflations[currentYear];
      lowerEarnerBenefit = lowerEarnerBenefit * inflationRate
      higherEarnerBenefit = higherEarnerBenefit * inflationRate

      spousalPayment = Math.max(parseFloat(higherEarnerBenefit) / 2 - parseFloat(lowerEarnerBenefit), 0);
      if (!this.meetDivorcedBenefit && !this.higherEarnerFileDate) {
        spousalPayment = 0;
      }
      if (!spousalPayment) {
        spousalPayment = 0;
      }

      if (this.fullRetireMonths > retiredMonths) {
        if ((this.fullRetireMonths - retiredMonths) > 36) {
          this.spousalExcess = spousalPayment * (100 - 36 * 25 / 36 - (this.fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          this.spousalExcess = spousalPayment * (100 - (this.fullRetireMonths - retiredMonths) * 25 / 36) / 100;
        }
      } else {
        retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate));
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        let lowerEarnerPayment = this.getLowerEarnerPayment(lowerEarnerBenefit, this.fullRetireMonths, retiredMonths);
        this.spousalExcess = Math.max(spousalPayment + parseFloat(lowerEarnerBenefit) - lowerEarnerPayment, 0);
      }

      let lowerRetireMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate))
      let higherRetireMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.higherEarnerFileDate))
      if ((lowerRetireMonths < this.fullRetireMonths) && (higherRetireMonths >= this.fullRetireMonths) && !this.meetDivorcedBenefit) {
        this.spousalExcess = Math.max(spousalPayment, 0)
      }
      this.updateTable();
    },
    updateTable() {
      this.tableData = [];
      let lowerEarnerCurrentYearBenefit = this.lowerEarnerBenefit;
      let higherEarnerCurrentYearBenefit = this.higherEarnerBenefit;

      let currentDate = new Date();
      let currentYear = currentDate.getUTCFullYear();
      if (this.benefitEstimateFrom === 'lastYear') {
        higherEarnerCurrentYearBenefit = this.higherEarnerBenefit * this.inflations[currentYear] / this.inflations[currentYear -1];
        lowerEarnerCurrentYearBenefit = this.lowerEarnerBenefit * this.inflations[currentYear] / this.inflations[currentYear -1];
      }
      let dateOfBirth = new Date(this.lowerEarnerDOBSSA)
      let dateOfBirthMonth = dateOfBirth.getUTCMonth()
      let lowerRetireMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate))
      let higherRetireMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.higherEarnerFileDate))
      let retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate));
      if (!this.meetDivorcedBenefit) {
        retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), this.getMaxDate(new Date(this.lowerEarnerFileDate), new Date(this.higherEarnerFileDate)));
      }
      let startMonth = 62 * 12;
      if (this.getMonthOffset(this.lowerEarnerDOBSSA, new Date(this.lowerEarnerFileDate)) === 62 * 12) {
        if (this.lowerEarnerDOBSSA.getUTCDate() > 2) {
          startMonth = 62 * 12 + 1;
          lowerRetireMonths = lowerRetireMonths + 1;
        }
      }

      for (let i = startMonth; i <= 70 * 12; i++) {
        let inflationRate = this.inflations[this.getYearAfterAddingMonths(this.lowerEarnerDOBSSA, i)] / this.inflations[currentYear];
        let lowerEarnerFRABenefit = lowerEarnerCurrentYearBenefit * inflationRate;
        let higherEarnerBenefit = higherEarnerCurrentYearBenefit * inflationRate;
        let spousalPayment = Math.max(parseFloat(higherEarnerBenefit) / 2 - parseFloat(lowerEarnerFRABenefit), 0);
        if (!this.meetDivorcedBenefit && !this.higherEarnerFileDate) {
          spousalPayment = 0;
        }
        if (!spousalPayment) {
          spousalPayment = 0;
        }
        let lowerEarnerBenefitSpousalPayment = spousalPayment;

        let lowerEarnerBenefitOwnRecord = (i < lowerRetireMonths) ? 0 : this.getLowerEarnerPayment(lowerEarnerFRABenefit, this.fullRetireMonths, lowerRetireMonths);


        if (this.fullRetireMonths > retiredMonths) {
          if ((this.fullRetireMonths - retiredMonths) > 36) {
            lowerEarnerBenefitSpousalPayment = spousalPayment * (100 - 36 * 25 / 36 - (this.fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
          } else {
            lowerEarnerBenefitSpousalPayment = spousalPayment * (100 - (this.fullRetireMonths - retiredMonths) * 25 / 36) / 100;
          }
        } else {
          let lowRetiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOBSSA), new Date(this.lowerEarnerFileDate));

          let lowerEarnerPayment = this.getLowerEarnerPayment(lowerEarnerFRABenefit, this.fullRetireMonths, lowRetiredMonths);
          lowerEarnerBenefitSpousalPayment = Math.max(spousalPayment + parseFloat(lowerEarnerFRABenefit) - lowerEarnerPayment, 0);

        }


        if ((lowerRetireMonths < this.fullRetireMonths) && (higherRetireMonths >= this.fullRetireMonths) && !this.meetDivorcedBenefit) {
          lowerEarnerBenefitSpousalPayment = Math.max(spousalPayment, 0)
        }

        this.tableData.push({
          'date': this.addMonthsToDate(this.lowerEarnerDOBSSA, i),
          'lowerEarnerAge': parseInt(i / 12) + ' Years ' + parseInt(i % 12) + ' Months',
          'lowerEarnerFRABenefit': this.$formatNumberWithCommas(this.$customRound(lowerEarnerFRABenefit)),
          'higherEarnerFRABenefit': this.$formatNumberWithCommas(this.$customRound(higherEarnerBenefit)),
          'lowerEarnerBenefitOwnRecord': this.$formatNumberWithCommas(this.$customRound(lowerEarnerBenefitOwnRecord)),
          'lowerEarnerBenefitSpousalPayment': this.$formatNumberWithCommas(this.$customRound((i < retiredMonths) ? 0 : lowerEarnerBenefitSpousalPayment)),
          'totalBenefitPayment': this.$formatNumberWithCommas(this.$customRound(lowerEarnerBenefitOwnRecord + ((i < retiredMonths) ? 0 : lowerEarnerBenefitSpousalPayment))),
        })
        
      }
    },
    addMonthsToDate(dateString, monthsToAdd) {
      let date = new Date(dateString);
      date.setUTCDate(15);
      date.setUTCMonth(date.getUTCMonth() + monthsToAdd);
      return date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }) + ' ' + date.getUTCFullYear();
    },
    getYearAfterAddingMonths(dataString, monthsToAdd) {
      let date = new Date(dataString);
      date.setUTCDate(15);
      date.setUTCMonth(date.getUTCMonth() + monthsToAdd);
      return date.getUTCFullYear();
    },
    getLowerEarnerPayment(lowerEarnerBenefit, fullRetireMonths, retiredMonths) {
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          return lowerEarnerBenefit * (100 - 36 * 5 / 9 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          return lowerEarnerBenefit * (100 - (fullRetireMonths - retiredMonths) * 5 / 9) / 100;
        }
      } else {
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        return lowerEarnerBenefit * (100 + (retiredMonths - fullRetireMonths) * 2 / 3) / 100;
      }
    },
    getYearsMonth(retiredMonths) {
      let ageOfEntitlement = parseInt(retiredMonths / 12) + ' years'
      ageOfEntitlement = ageOfEntitlement + ' and ' + (retiredMonths % 12) + " months";
      return ageOfEntitlement;
    },

    getMonthOffset(startDate, endDate) {
      // Calculate the difference in months
      const months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
        (endDate.getUTCMonth() - startDate.getUTCMonth());
      return months;
    },
    getMaxDate(date1, date2) {
      // Use Math.min to get the maximum value between two dates
      return new Date(Math.max(date1.getTime(), date2.getTime()));
    },
    addYearsToDate(date, yearsToAdd) {
      const newDate = new Date(date);
      newDate.setUTCFullYear(newDate.getUTCFullYear() + yearsToAdd);
      return newDate;
    },
    dateBiggerThan1943(date) {
      if (!date || (new Date(date) < new Date('1943-01-02'))) {
        return `Please choose a date that is after January 1, 1943.`; // Validation fails
      }
      return true; // Validation passes
    },
    convertDateToString(date) {
      return date.toISOString().slice(0, 10);
    },
    add1HourToDate(date) {
      return date.setHours(date.getHours() + 1);
    },
    higherEarnerFileDateRule(date) {
      if (!this.meetDivorcedBenefit && (!date || (this.add1HourToDate(new Date(date)) < this.addYearsToDate(this.higherEarnerDOB, 62)) || (new Date(date) > this.addYearsToDate(this.higherEarnerDOB, 70)))) {
        return `The higher earner should file between the ages of 62 and 70 years old.`;
      }
      return true
    },
    lowerEarnerFileDateRule(date) {
      if (!date || (this.add1HourToDate(new Date(date)) < this.addYearsToDate(this.lowerEarnerDOB, 62)) || (new Date(date) > this.addYearsToDate(this.lowerEarnerDOB, 70))) {
        return `The lower earner should file between the ages of 62 and 70 years old.`;
      }
      return true
    },
    numberSmallerThan10(value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 10) {
        return `Inflation rate should not be greater than 10%.`; // Validation fails
      }
      return true; // Validation passes
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

.title,
.result-value {
  font-weight: 700;
  color: white;
}

.title {
  font-size: 18px;
}

.result-value {
  font-size: 24px;
  line-height: 24px;
}

.result-section {
  background-color: #0C9444;
  padding: 0.4rem 0.8rem;
  border-radius: 0.6rem;
  font-family: sans-serif;
}

.spousal-benefit-table {
  overflow-y: auto;
  height: 500px;
}

.spousal-benefit-table thead tr {
  position: sticky;
  top: 0;
}

.spousal-benefit-table thead tr:nth-child(1) th:nth-child(n+1):nth-child(-n+2) {
  background-color: #fff;
}

.spousal-benefit-table thead tr:nth-child(1) th:nth-child(n+3):nth-child(-n+4) {
  background-color: #B3AEB3;
}

.spousal-benefit-table tbody tr td:nth-child(n+3):nth-child(-n+4) {
  background-color: #B3AEB3;
}

.spousal-benefit-table thead tr:nth-child(1) th:nth-child(5) {
  background-color: #CEE1F2;
}

.spousal-benefit-table tbody tr td:nth-child(5) {
  background-color: #CEE1F2;
}

.spousal-benefit-table thead tr:nth-child(1) th:nth-child(6) {
  background-color: #4897FF;
}

.spousal-benefit-table tbody tr td:nth-child(6) {
  background-color: #4897FF;
}

.spousal-benefit-table thead tr:nth-child(1) th:nth-child(7) {
  background-color: #D6EBD5;
}

.spousal-benefit-table tbody tr td:nth-child(7) {
  background-color: #D6EBD5;
}

.check-box {
  margin-top: -11px;
}
</style>