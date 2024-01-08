<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="startDate" type="date" label="Start Date" placeholder="mm/dd/yyyy"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="endDate" type="date" label="End Date" placeholder="mm/dd/yyyy"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="startPrice" label="Start Price" prefix="$"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-btn @click="calculate" color="primary">Calculate</v-btn>
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="endPrice" label="End Price" :readonly="true"></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      startDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      startPrice: 100,
      endPrice: ''
    };
  },
  methods: {
    async calculate() {
      try {
        let response = await axios.get('https://www.statbureau.org/calculate-inflation-price-json', {
          params: {
            country: 'united-states',
            start: this.startDate,
            end: this.endDate,
            amount: this.startPrice,
            format: true
          }
        });
        this.endPrice = response.data;
        response = await axios.get('https://www.statbureau.org/calculate-inflation-rate-json', {
          params: {
            country: 'united-states',
            start: this.startDate,
            end: this.endDate,
          }
        });
        console.log(response.data)

      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style scoped></style>
