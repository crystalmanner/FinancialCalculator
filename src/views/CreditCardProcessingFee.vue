<template>
  <v-container class="fill-height">
    <v-responsive class="text-center fill-height">
      <h1>Credit Card Processing Fee Calculator</h1>
      <v-row class="pa-2">
        <v-col cols="12" lg="12" md="12" sm="12">
          <h3>CALCULATE YOUR TRUE PROCESSING RATE</h3>
          <v-divider></v-divider>
          <p class="mb-4">
            Are your credit card processing fees too high? What is a fair rate? Use our calculator tool to see if you are
            overpaying.
          </p>
          <v-form v-model="formValid" class="pa-2">
            <v-text-field v-model.number="amountPaid" type="number" label="Total Amount Paid for Credit Card Processing"
              prefix="$" @input="calculate" :rules=[$numberGreaterThanZeroRule] dense></v-text-field>
            <v-slider v-model="amountPaid" :min="25" :max="5000" :step="25" @end="calculate"></v-slider>
            <v-text-field v-model.number="monthlySales" type="number" label="Total Monthly Sales" prefix="$"
              @input="monthlySales" :rules=[$numberGreaterThanZeroRule] dense></v-text-field>
            <v-slider v-model="monthlySales" :min="100" :max="500000" :step="25" @end="monthlySales"></v-slider>
          </v-form>
          <v-divider></v-divider>
          <div v-if="formValid" class="text-h6 mt-2">
            Your Effective Credit Card Processing Rate: <strong>{{ rate }}%</strong>
          </div>
          <div v-else class="text-h6 mt-2">
            Please input correct number.
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
export default {
  components: {
  },
  data() {
    return {
      amountPaid: 125,
      monthlySales: 5000,
      formValid: true,
    };
  },
  mounted() {

  },
  computed: {
    rate() {
      return (this.amountPaid / this.monthlySales * 100).toFixed(2);
    }
  },
  methods: {
    checkBin() {
      this.fetchData();
    },
    async fetchData() {
      this.result = { error: 'Loading...' }
      try {

        const options = {
          method: 'POST',
          url: 'https://bin-ip-checker.p.rapidapi.com/',
          params: { bin: this.binNumber },
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '942716142amsh001ada363bce707p1684d6jsn51a76cf464d0',
            'X-RapidAPI-Host': 'bin-ip-checker.p.rapidapi.com'
          },
          data: { bin: this.binNumber }
        };

        const response = await axios(options);
        this.result = response.data;
      } catch (error) {
        console.error('Error:', error);
        this.result = { "error": error.response.data.message };
      }
    },
  },
};
</script>

<style></style>