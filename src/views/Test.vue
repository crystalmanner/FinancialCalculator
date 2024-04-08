<template>
  <v-container class="fill-height ">
    <v-responsive class="fill-height main-container">
      <h2>Test</h2>
      <hr>
      <v-text-field v-model="ipAddress"></v-text-field><v-btn @click="initialize">Search</v-btn>
      <v-row class="pa-4 mt-4">
        <h3>Net Range {{ startAddress }} - {{ endAddress }}</h3>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import axios from 'axios';
import Header from '@/components/Header.vue'

export default {
  components: {
    Header,
  },
  data() {
    return {
      startAddress: '',
      endAddress: '',
      ipAddress: '104.28.39.108'
    }
  },
  watch: {
  },
  computed: {
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      console.log('---d---');
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://rdap.arin.net/registry/ip/' + this.ipAddress;
      try {
        const response = await axios.get(proxyUrl + targetUrl);
        console.log(response.data); // Logs the JSON response from the ARIN RDAP query
        this.startAddress = response.data.startAddress;
        this.endAddress = response.data.endAddress;
      } catch (error) {
        console.error('Error fetching page content:', error);
      }
    },
  },
};
</script>

<style></style>