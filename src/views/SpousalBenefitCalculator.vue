<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <h1>Social Security Spousal Benefits Calculator</h1>
      <hr>
      <v-row class="pa-2">
        <v-col cols="12" lg="6" md="6" sm="12">
          <v-form v-model="validForm">
            <div>
              <v-label>Higher Earner DOB</v-label>
              <VueDatePicker v-model="higherEarnerDOB" :enable-time-picker="false" min-date="01/02/1943"
                :auto-position="false" :text-input="textInputOptions" />
              <v-label class="mt-2">Lower Earner DOB</v-label>
              <VueDatePicker v-model="lowerEarnerDOB" :enable-time-picker="false" min-date="01/02/1943"
                :auto-position="false" :text-input="textInputOptions" />
              <v-label class="mt-2">Date Higher Earner Will File</v-label>
              <VueDatePicker v-model="higherEarnerFileDate" :enable-time-picker="false"
                :min-date="addYearsToDate(higherEarnerDOB, 62)" :max-date="addYearsToDate(higherEarnerDOB, 70)"
                :auto-position="false" :text-input="textInputOptions" />
              <v-label class="mt-2">Date Lower Earner Will File</v-label>
              <VueDatePicker v-model="lowerEarnerFileDate" :enable-time-picker="false"
                :min-date="addYearsToDate(lowerEarnerDOB, 62)" :max-date="addYearsToDate(lowerEarnerDOB, 70)"
                :auto-position="false" :text-input="textInputOptions" />
              <v-text-field class="mt-2" v-model="formattedHigherEarnerBenefit" :rules="[$textGreaterThanNegativeRule]"
                label="Higher Earner Full Retirement Age Benefit" type="text" prefix="$"
                hint="The full retirement age benefit the higher earning spouse earned from their own work"
                @blur="formatHigherEarnerBenefit" @input="stripHigherEarnerBenefitFormatting" dense></v-text-field>
              <v-text-field class="mt-2" v-model="formattedLowerEarnerBenefit" :rules="[$textGreaterThanNegativeRule]"
                label="Lower Earner Full Retirement Age Benefit" type="text" prefix="$"
                hint="The full retirement age benefit the lower earning spouse earned from their own work"
                @blur="formatLowerEarnerBenefit" @input="stripLowerEarnerBenefitFormatting" dense></v-text-field>
              <v-checkbox v-model="meetDivorcedBenefit"
                label="Do you meet the qualifications for a divorced spouse benefit?"></v-checkbox>
            </div>
          </v-form>
        </v-col>
        <v-col cols="12" lg="6" md="6" sm="12">
          <div v-if="validForm">
            <div class="d-flex">
              <h3>Payment from Lower Earner's benefit</h3><v-spacer></v-spacer>
              <p>{{ $formatNumberWithCommas(lowerEarnerPayment) }}</p>
            </div>
            <div class="d-flex">
              <h3>Spousal excessc</h3><v-spacer></v-spacer>
              <p>{{ $formatNumberWithCommas(spousalExcess) }}</p>
            </div>
            <hr>
            <div class="d-flex">
              <h3><strong>Spousal excess</strong></h3><v-spacer></v-spacer>
              <p><strong>{{ $formatNumberWithCommas(lowerEarnerPayment + spousalExcess) }}</strong></p>
            </div>

          </div>
          <div v-else class="mt-2 text-center">
            <h3 class="text-red-accent-2">Please input valid values.</h3>
            <p>{{ errorNotification }}</p>
          </div>
        </v-col>
        <v-col cols="12" lg="12" md="12" sm="12">
          <p class="text-subtitle-2 text-center mt-6 mb-4">Disclaimer: This calculator assumes that lower earning spouse
            has
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
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  components: { VueDatePicker },
  data() {
    return {
      validForm: true,
      higherEarnerDOB: "01/15/1960",
      lowerEarnerDOB: "01/15/1960",
      higherEarnerFileDate: "01/15/2027",
      lowerEarnerFileDate: "01/05/2027",
      higherEarnerBenefit: 3000,
      formattedHigherEarnerBenefit: '3,000',
      lowerEarnerBenefit: 1200,
      formattedLowerEarnerBenefit: '1,200',
      lowerEarnerPayment: 0,
      spousalExcess: 0,
      meetDivorcedBenefit: false,
      textInputOptions: {
        format: 'MM/dd/yyyy'
      },
      errorNotification: ""
    };
  },
  watch: {
    higherEarnerDOB() {
      this.calculate();
    },
    lowerEarnerDOB() {
      this.calculate();
    },
    higherEarnerFileDate() {
      this.calculate();
    },
    lowerEarnerFileDate() {
      this.calculate();
    },
    higherEarnerBenefit() {
      this.calculate();
    },
    lowerEarnerBenefit() {
      this.calculate();
    },
    meetDivorcedBenefit() {
      this.calculate();
    },
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
    calculate() {
      if (this.lowerEarnerDOB && this.lowerEarnerFileDate) {
        if ((new Date(this.addYearsToDate(this.lowerEarnerDOB, 62)) > new Date(this.lowerEarnerFileDate)) || (new Date(this.addYearsToDate(this.lowerEarnerDOB, 70)) < new Date(this.lowerEarnerFileDate))) {
          this.validForm = false;
          this.errorNotification = "Filling ages should be 62~70.";
          return;
        }
        this.errorNotification = "";
        this.validForm = true;
      } else {
        this.errorNotification = "Please input valid dates";
        this.validForm = false;
        return;
      }
      let spousalPayment = Math.max(this.higherEarnerBenefit / 2 - this.lowerEarnerBenefit, 0);
      if (!this.meetDivorcedBenefit && !this.higherEarnerFileDate) {
        spousalPayment = 0;
      }
      let fullRetireMonths = 0;
      if (new Date(this.lowerEarnerDOB) > new Date('01/01/1960')) {
        // 67 years and 0 month
        fullRetireMonths = 67 * 12;
      } else if (new Date(this.lowerEarnerDOB) > new Date('01/01/1959')) {
        fullRetireMonths = 66 * 12 + 10;
      } else if (new Date(this.lowerEarnerDOB) > new Date('01/01/1958')) {
        fullRetireMonths = 66 * 12 + 8;
      } else if (new Date(this.lowerEarnerDOB) > new Date('01/01/1957')) {
        fullRetireMonths = 66 * 12 + 6;
      } else if (new Date(this.lowerEarnerDOB) > new Date('01/01/1956')) {
        fullRetireMonths = 66 * 12 + 4;
      } else if (new Date(this.lowerEarnerDOB) > new Date('01/01/1955')) {
        fullRetireMonths = 66 * 12 + 2;
      } else {
        fullRetireMonths = 66 * 12;
      }
      let retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), new Date(this.lowerEarnerFileDate));
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          this.lowerEarnerPayment = this.lowerEarnerBenefit * (100 - 36 * 5 / 9 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          this.lowerEarnerPayment = this.lowerEarnerBenefit * (100 - (fullRetireMonths - retiredMonths) * 5 / 9) / 100;
        }
      } else {
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        this.lowerEarnerPayment = this.lowerEarnerBenefit * (100 + (retiredMonths - fullRetireMonths) * 2 / 3) / 100;
      }
      retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), this.getMaxDate(new Date(this.lowerEarnerFileDate), new Date(this.higherEarnerFileDate)));
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          this.spousalExcess = spousalPayment * (100 - 36 * 25 / 36 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          this.spousalExcess = spousalPayment * (100 - (fullRetireMonths - retiredMonths) * 25 / 36) / 100;
        }
      } else {
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        this.spousalExcess = spousalPayment;
      }
    },
    getMonthOffset(startDate, endDate) {
      // Calculate the difference in months
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      return months;
    },
    getMaxDate(date1, date2) {
      // Use Math.min to get the maximum value between two dates
      return new Date(Math.max(date1.getTime(), date2.getTime()));
    },
    addYearsToDate(date, yearsToAdd) {
      const newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + yearsToAdd);
      return newDate;
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
</style>