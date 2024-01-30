<template>
  <v-container class="fill-height ">
    <v-responsive class="fill-height main-container">
      <Header />
      <h2>Social Security Break Even Calculator</h2>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="5" md="5" sm="12">
          <v-form v-model="validForm">
            <v-text-field v-model="higherEarnerDOB" type="date" label="Date Of Birth" :rules="[validateInputDate]" />
            <v-text-field class="mt-2" v-model="formattedBenefitFRAValue" :rules="[$textGreaterThanNegativeRule]"
              label="Benefit at Full Retirement Age" type="text" prefix="$" @blur="formatBenefitFRAValue"
              @input="stripBenefitFRAValueFormatting" dense></v-text-field>
            <p class="medium-text">Filling Ages&nbsp;
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon icon="mdi-help-circle" class="cursor-pointer" size="md" v-bind="props" start />
                </template>
                <span>Enter the two filing ages you want to compare</span>
              </v-tooltip>
            </p>
            <p v-if="!validFillingAges" class="small-text text-red-accent-4 mt-4">
              Early Filing Age should be before Later Filing Age
            </p>
            <div class="d-flex align-center mt-4">
              <p class="big-text mr-2 mb-4">Early</p>
              <v-btn density="compact" icon="mdi-minus" @click="minusEarly" class="mx-2 mb-4"></v-btn>
              <v-text-field label="Year" v-model.number="earlyYear" @blur="formatEarlyYear" class="mx-2"></v-text-field>
              <v-text-field label="Month" v-model.number="earlyMonth" @blur="formatEarlyMonth" @input="inputEarlyMonth"
                class="mx-2"></v-text-field>
              <v-btn density="compact" icon="mdi-plus" @click="plusEarly" class="mx-2 mb-4"></v-btn>
            </div>

            <div class="d-flex align-center mt-4">
              <p class="big-text mr-2 mb-4">Later</p>
              <v-btn density="compact" icon="mdi-minus" @click="minusLater" class="mx-2 mb-4"></v-btn>
              <v-text-field label="Year" v-model.number="laterYear" @blur="formatLaterYear" class="mx-2"></v-text-field>
              <v-text-field label="Month" v-model.number="laterMonth" @blur="formatLaterMonth" @input="inputLaterMonth"
                class="mx-4"></v-text-field>
              <v-btn density="compact" icon="mdi-plus" @click="plusLater" class="mx-2 mb-4"></v-btn>
            </div>
            <div class="d-flex align-center">
              <p class="big-text mr-2 mb-4">Average Annual Cola&nbsp;
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon icon="mdi-help-circle" class="cursor-pointer" size="md" v-bind="props" start />
                  </template>
                  <span>Enter the estimated annual cost of living increase to Social Security Benefits</span>
                </v-tooltip>
              </p>
              <v-text-field v-model.number="averageAnnualCola" @blur="formatAverageAnnualCola" suffix="%"
                dense></v-text-field>
            </div>

            <v-slider v-model="averageAnnualCola" :min="0" :max="10" :step="0.5" color="primary"></v-slider>
            <div class="d-flex">
              <v-spacer></v-spacer>
              <v-btn color="primary" :disabled="!validForm || !validFillingAges">Calculate</v-btn>
            </div>
          </v-form>
        </v-col>
        <v-col cols="12" lg="7" md="7" sm="12">
          <div v-if="validForm">

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
import Header from '@/components/Header.vue'
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
  components: {
    Line,
    Header,
  },
  data() {
    return {
      validForm: true,
      higherEarnerDOB: "1960-01-01",
      benefitFRAValue: 3000,
      formattedBenefitFRAValue: '3,000',
      earlyYear: 64,
      earlyMonth: 0,
      laterYear: 68,
      laterMonth: 0,
      averageAnnualCola: 2,
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
            label: "Early",
            data: [],
            backgroundColor: "rgba(0,112,192,.6)",
            borderColor: "#B00000",
            borderWidth: 1,
            fill: false,
          },
          {
            label: "Late",
            data: [],
            backgroundColor: "rgba(0,176,80,.6)",
            borderColor: "#1C4B5A",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
    }
  },
  watch: {
  },
  computed: {
    validFillingAges() {
      return !!((this.laterYear * 12 + this.laterMonth) >= (this.earlyYear * 12 + this.earlyMonth))
    },
  },
  created() {
    this.$nextTick(() => {
      this.calculate();
    });
  },
  methods: {
    calculate() {

    },
    formatBenefitFRAValue() {
      // When the user leaves the field, format the number with commas
      this.formattedBenefitFRAValue = new Intl.NumberFormat().format(this.benefitFRAValue);
    },
    stripBenefitFRAValueFormatting(event) {
      // When the user inputs text, strip non-numeric characters and save the raw number
      const digits = event.target.value.replace(/[^\d]/g, '');
      this.benefitFRAValue = digits;
      // Update the displayed value to keep the cursor in the correct position
      this.formattedBenefitFRAValue = digits;
    },
    minusEarly() {
      if ((this.earlyYear * 12 + this.earlyMonth) < 62 * 12) {
        return
      }
      if (this.earlyMonth <= 0) {
        if (this.earlyYear <= 62) {
          this.earlyYear = 62
          this.earlyMonth = 0
          return
        }
        this.earlyYear -= 1
        this.earlyMonth = 11
      } else {
        this.earlyMonth -= 1
      }
    },
    minusLater() {
      if ((this.laterYear * 12 + this.laterMonth) < 62 * 12) {
        return
      }
      if (this.laterMonth <= 0) {
        if (this.laterYear <= 62) {
          this.laterYear = 62
          this.laterMonth = 0
          return
        }
        this.laterYear -= 1
        this.laterMonth = 11
      } else {
        this.laterMonth -= 1
      }
    },
    plusEarly() {
      if ((this.earlyYear * 12 + this.earlyMonth) > 70 * 12) {
        return
      }
      if (this.earlyMonth >= 11) {
        if (this.earlyYear >= 70) {
          this.earlyYear = 70
          this.earlyMonth = 0
          return
        }
        this.earlyYear += 1
        this.earlyMonth = 0
      } else {
        if (this.earlyYear < 70) {
          this.earlyMonth += 1
        } else {
          this.earlyMonth = 0
        }
      }
    },
    plusLater() {
      if ((this.laterYear * 12 + this.laterMonth) > 70 * 12) {
        return
      }
      if (this.laterMonth >= 11) {
        if (this.laterYear >= 70) {
          this.laterYear = 70
          this.laterMonth = 0
          return
        }
        this.laterYear += 1
        this.laterMonth = 0
      } else {
        if (this.laterYear < 70) {
          this.laterMonth += 1
        } else {
          this.laterMonth = 0
        }
      }
    },
    formatEarlyYear() {
      if (!this.earlyYear || isNaN(parseInt(this.earlyYear))) {
        this.earlyYear = 62
        return
      }
      this.earlyYear = parseInt(this.earlyYear)
      if (this.earlyYear < 62) {
        this.earlyYear = 62
        this.earlyMonth = 0
      }
      if (this.earlyYear > 70) {
        this.earlyYear = 70
        this.earlyMonth = 0
      }
      if (this.earlyYear === 70) {
        this.earlyMonth = 0
      }
    },
    formatEarlyMonth() {
      if (!this.earlyMonth || isNaN(parseInt(this.earlyMonth))) {
        this.earlyMonth = 0
        return
      }
      if (this.earlyYear >= 70) {
        this.earlyMonth = 0
        return
      }
      this.earlyMonth = parseInt(this.earlyMonth)
      if (this.earlyMonth < 0) {
        this.earlyMonth = 0
      }
      if (this.earlyMonth > 11) {
        this.earlyMonth = 11
      }
    },

    formatLaterYear() {
      if (!this.laterYear || isNaN(parseInt(this.laterYear))) {
        this.laterYear = 62
        return
      }
      this.laterYear = parseInt(this.laterYear)
      if (this.laterYear < 62) {
        this.laterYear = 62
        this.laterMonth = 0
      }
      if (this.laterYear > 70) {
        this.laterYear = 70
        this.laterMonth = 0
      }
      if (this.laterYear === 70) {
        this.laterMonth = 0
      }
    },
    formatLaterMonth() {
      if (!this.laterMonth || isNaN(parseInt(this.laterMonth))) {
        this.laterMonth = 0
        return
      }
      if (this.laterYear >= 70) {
        this.laterMonth = 0
        return
      }
      this.laterMonth = parseInt(this.laterMonth)
      if (this.laterMonth < 0) {
        this.laterMonth = 0
      }
      if (this.laterMonth > 11) {
        this.laterMonth = 11
      }
    },
    formatAverageAnnualCola() {
      if (!this.averageAnnualCola || isNaN(parseFloat(this.averageAnnualCola))) {
        this.averageAnnualCola = 0
      }
      this.averageAnnualCola = parseFloat(this.averageAnnualCola).toFixed(2)
      if (this.averageAnnualCola < 0) {
        this.averageAnnualCola = 0
      }
      if (this.averageAnnualCola > 10) {
        this.averageAnnualCola = 10
      }
    },
    validateInputDate(date) {
      if (!date) {
        return `Please enter the correct birth date.`;
      }
      return true;
    },
    inputEarlyMonth(event) {
      if (parseInt(event.target.value) > 11) {
        this.earlyMonth = 11
      }
    },
    inputLaterMonth(event) {
      if (parseInt(event.target.value) > 11) {
        this.laterMonth = 11
      }
    }
  },
};
</script>

<style>
.big-text {
  font-size: 22px;
}

.medium-text {
  font-size: 20px;
}

.small-text {
  font-size: 13px;
  font-weight: 700;
}
</style>