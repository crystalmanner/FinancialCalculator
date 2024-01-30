<template>
  <v-container class="fill-height">
    <v-responsive class="fill-height">
      <Header />
      <h2>Social Security Spousal Benefits Calculator</h2>
      <hr>
      <v-row class="pa-2 mt-2">
        <v-col cols="12" lg="4" md="4" sm="12">

          <v-form ref="form" v-model="validForm">

            <v-text-field v-model="higherEarnerDOB" label="Higher Earner DOB" type="date" :rules="[dateBiggerThan1943]"
              min="1943-01-02"></v-text-field>

            <v-text-field v-model="lowerEarnerDOB" label="Lower Earner DOB" type="date" :rules="[dateBiggerThan1943]"
              min="1943-01-02"></v-text-field>

            <v-text-field v-model="higherEarnerFileDate" label="Date Higher Earner Will File" type="date"
              :rules="[higherEarnerFileDateRule]"></v-text-field>

            <v-text-field v-model="lowerEarnerFileDate" label="Date Lower Earner Will File" type="date"
              :rules="[lowerEarnerFileDateRule]"></v-text-field>

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
          </v-form>
        </v-col>
        <v-col cols="12" lg="8" md="8" sm="12">
          <div v-if="validForm">
            <div class="result-section">
              <div class="title">Benefit from Lower Earner Work at <i>{{ lowerEarnerPaymentTitle }}</i></div>
              <div class="result-value mb-2">
                {{ $formatNumberWithCommas(customRound(lowerEarnerPayment)) }}
              </div>
              <div class="title">Additional Benefit from Spousal Payment at <i>{{ spousalExcessTitle }}</i></div>
              <v-spacer></v-spacer>
              <p class="result-value mb-1">{{ $formatNumberWithCommas(customRound(spousalExcess)) }}
              </p>
            </div>
            <!-- <hr>
            <div class="d-flex">
              <h3><strong>Total Benefit</strong></h3><v-spacer></v-spacer>
              <p><strong>{{ $formatNumberWithCommas(customRound(lowerEarnerPayment + spousalExcess)) }}</strong></p>
            </div> -->
            <!-- <v-data-table :headers="tableHeaders" :items="tableData" :items-per-page="10"
              :items-per-page-options="pageOptions" class="portfolio-table mt-4">
            </v-data-table> -->
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
          title: 'Age of Entitlement',
          value: 'ageOfEntitlement',
          sortable: true,
        },
        {
          title: 'Benefit from Lower Earner Work',
          value: 'lowerEarnerPayment',
        },
        {
          title: 'Additional Benefit from Spousal Payment',
          value: 'spousalExcess',
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
      // if (this.lowerEarnerDOB && this.lowerEarnerFileDate) {
      //   if ((new Date(this.addYearsToDate(this.lowerEarnerDOB, 62)) > new Date(this.lowerEarnerFileDate)) || (new Date(this.addYearsToDate(this.lowerEarnerDOB, 70)) < new Date(this.lowerEarnerFileDate))) {
      //     this.validForm = false;
      //     this.errorNotification = "Filling ages should be 62~70.";
      //     return;
      //   }
      //   this.errorNotification = "";
      //   this.validForm = true;
      // } else {
      //   this.errorNotification = "Please input valid dates";
      //   this.validForm = false;
      //   return;
      // }
      let spousalPayment = Math.max(parseFloat(this.higherEarnerBenefit) / 2 - parseFloat(this.lowerEarnerBenefit), 0);
      if (!this.meetDivorcedBenefit && !this.higherEarnerFileDate) {
        spousalPayment = 0;
      }
      if (!spousalPayment) {
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
      this.lowerEarnerPaymentTitle = this.getYearsMonth(retiredMonths);
      this.lowerEarnerPayment = this.getLowerEarnerPayment(fullRetireMonths, retiredMonths);
      if (this.meetDivorcedBenefit) {
        retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), new Date(this.lowerEarnerFileDate));
      } else {
        // retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), new Date(this.lowerEarnerFileDate));
        retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), this.getMaxDate(new Date(this.lowerEarnerFileDate), new Date(this.higherEarnerFileDate)));
      }
      this.spousalExcessTitle = this.getYearsMonth(retiredMonths);

      retiredMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), new Date(this.lowerEarnerFileDate));
      let lowerEarnerPayment = this.getLowerEarnerPayment(fullRetireMonths, retiredMonths);
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          this.spousalExcess = spousalPayment * (100 - 36 * 25 / 36 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          this.spousalExcess = spousalPayment * (100 - (fullRetireMonths - retiredMonths) * 25 / 36) / 100;
        }
      } else {
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        this.spousalExcess = Math.max(spousalPayment + parseFloat(this.lowerEarnerBenefit) - lowerEarnerPayment, 0);
      }

      let lowerRetireMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), new Date(this.lowerEarnerFileDate))
      let higherRetireMonths = this.getMonthOffset(new Date(this.lowerEarnerDOB), new Date(this.higherEarnerFileDate))
      if ((lowerRetireMonths < fullRetireMonths) && (higherRetireMonths >= fullRetireMonths) && !this.meetDivorcedBenefit) {
        this.spousalExcess = Math.max(spousalPayment, 0)
      }
    },
    getLowerEarnerPayment(fullRetireMonths, retiredMonths) {
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          return this.lowerEarnerBenefit * (100 - 36 * 5 / 9 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          return this.lowerEarnerBenefit * (100 - (fullRetireMonths - retiredMonths) * 5 / 9) / 100;
        }
      } else {
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        return this.lowerEarnerBenefit * (100 + (retiredMonths - fullRetireMonths) * 2 / 3) / 100;
      }
    },
    getYearsMonth(retiredMonths) {
      let ageOfEntitlement = parseInt(retiredMonths / 12) + ' years'
      // if (retiredMonths % 12 !== 0) {
      //   if (retiredMonths % 12 === 1) {
      //     ageOfEntitlement = ageOfEntitlement + ' and 1 Month';
      //   } else {
      //     ageOfEntitlement = ageOfEntitlement + ' and ' + (retiredMonths % 12) + " Months";
      //   }
      // }
      ageOfEntitlement = ageOfEntitlement + ' and ' + (retiredMonths % 12) + " months";
      return ageOfEntitlement;
    },
    addTableRowData(fullRetireMonth, retiredMonths, spousalPayment) {
      let fullRetireMonths = fullRetireMonth;
      let lowerEarnerPayment;
      let spousalExcess;
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          lowerEarnerPayment = this.lowerEarnerBenefit * (100 - 36 * 5 / 9 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          lowerEarnerPayment = this.lowerEarnerBenefit * (100 - (fullRetireMonths - retiredMonths) * 5 / 9) / 100;
        }
      } else {
        lowerEarnerPayment = this.lowerEarnerBenefit * (100 + (retiredMonths - fullRetireMonths) * 2 / 3) / 100;
      }
      if (fullRetireMonths > retiredMonths) {
        if ((fullRetireMonths - retiredMonths) > 36) {
          spousalExcess = spousalPayment * (100 - 36 * 25 / 36 - (fullRetireMonths - retiredMonths - 36) * 5 / 12) / 100;
        } else {
          spousalExcess = spousalPayment * (100 - (fullRetireMonths - retiredMonths) * 25 / 36) / 100;
        }
      } else {
        retiredMonths = Math.min(retiredMonths, 70 * 12);
        spousalExcess = spousalPayment + this.lowerEarnerBenefit - lowerEarnerPayment;
      }
      let ageOfEntitlement = parseInt(retiredMonths / 12) + ' Years'
      if (retiredMonths % 12 !== 0) {
        if (retiredMonths % 12 === 1) {
          ageOfEntitlement = ageOfEntitlement + ' and 1 month';
        } else {
          ageOfEntitlement = ageOfEntitlement + ' and ' + (retiredMonths % 12) + " months";
        }
      }
      this.tableData.push({
        'ageOfEntitlement': ageOfEntitlement,
        'lowerEarnerPayment': this.$formatNumberWithCommas(lowerEarnerPayment),
        'spousalExcess': this.$formatNumberWithCommas(spousalExcess),
      });
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
</style>