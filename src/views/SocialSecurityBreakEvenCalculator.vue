<template>
  <v-container class="fill-height ">
    <v-responsive class="fill-height main-container">
      <Header />
      <h2>Social Security Break Even Calculator</h2>
      <hr>
      <v-row class="pa-2 mt-4">
        <v-col cols="12" lg="5" md="5" sm="12">
          <v-form v-model="validForm">
            <div>
              <VueDatePicker v-model="higherEarnerDOB" :enable-time-picker="false" :auto-position="false"
                :text-input="textInputOptions" />
              <v-text-field class="mt-4" v-model="formattedBenefitFRAValue" :rules="[$textGreaterThanNegativeRule]"
                label="Benefit at Full Retirement Age" type="text" prefix="$" @blur="formatBenefitFRAValue"
                @input="stripBenefitFRAValueFormatting" dense></v-text-field>
              <p>Filling Ages&nbsp;
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon icon="mdi-help-circle" class="cursor-pointer" size="md" v-bind="props" start />
                  </template>
                  <span>Enter the two filing ages you want to compare</span>
                </v-tooltip>
              </p>
              <div class="d-flex">
                <p>Early</p>

              </div>
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
  components: {
    VueDatePicker,
    Line,
    Header,
  },
  data() {
    return {
      validForm: true,
      higherEarnerDOB: "01/1/1960",
      benefitFRAValue: 3000,
      formattedBenefitFRAValue: '3,000',
      textInputOptions: {
        format: 'MM/dd/yyyy'
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
  },
};
</script>

<style></style>