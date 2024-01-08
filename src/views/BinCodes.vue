<template>
  <v-container class="fill-height">
    <v-responsive class="text-center fill-height">
      <h1>Bin Codes</h1>
      <v-row class="pa-2">
        <v-col cols="12" lg="5" md="5" sm="12">
          <h3>Validate, Verify & Check BIN</h3>
          <p class="mb-4">
            To validate, type the BIN in the specified field below.

            Make sure that the BIN follows the proper BIN format. The length is 6 characters and contains only numbers and
            no space in between.
          </p>
          <div>Example : 346596 / 491653 / 520402
          </div>
          <v-text-field ref="binInput" v-model.number="binNumber" placeholder="Bank Identification Number ('Bin')..."
            :rules="inputRules" dense maxlength="8"></v-text-field>
          <v-btn elevated @click="checkBin" :disabled="!isBinValid">Check</v-btn>
        </v-col>
        <v-col cols="12" lg="7" md="7" sm="12">
          <div v-if="result.error" class="pa-4 d-block">
            <h3 class="pt-3">{{ result.error }}</h3>
          </div>
          <div v-if="result.success">
            <div v-if="result.BIN.valid">
              <div class="text-cyan">BIN/IIN is valid</div>
              <v-table class="text-left">
                <thead>
                  <tr>
                    <th>Details for the BIN/IIN:</th>
                    <th>{{ result.BIN.number }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Brand</td>
                    <td>{{ result.BIN.brand }}</td>
                  </tr>
                  <tr>
                    <td>Type</td>
                    <td>{{ result.BIN.type }}</td>
                  </tr>
                  <tr>
                    <td>Country</td>
                    <td>{{ result.BIN.country.name }}</td>
                  </tr>
                  <tr>
                    <td>Capital</td>
                    <td>{{ result.BIN.country.capital }}</td>
                  </tr>
                  <tr>
                    <td>Currency</td>
                    <td>{{ result.BIN.country.currency }} ({{ result.BIN.country.currency_symbol }})</td>
                  </tr>
                  <tr>
                    <td>Language</td>
                    <td>{{ result.BIN.country.alpha3 }}</td>
                  </tr>
                  <tr>
                    <td>Region</td>
                    <td>{{ result.BIN.country.region }}</td>
                  </tr>
                  <tr>
                    <td>Subregion</td>
                    <td>{{ result.BIN.country.subregion }}</td>
                  </tr>
                  <tr>
                    <td>Flag</td>
                    <td>
                      <country-flag :country='result.BIN.country.alpha3' />
                    </td>
                  </tr>
                  <tr>
                    <td>Native</td>
                    <td>{{ result.BIN.country.native }}</td>
                  </tr>
                  <tr>
                    <td>Latitude & Longitude</td>
                    <td>{{ result.BIN.country.latitude }}, {{ result.BIN.country.longitude }}</td>
                  </tr>
                  <tr>
                    <td>Bank name</td>
                    <td>{{ result.BIN.issuer.name }}</td>
                  </tr>
                  <tr>
                    <td>Bank phone</td>
                    <td>{{ result.BIN.issuer.phone }}</td>
                  </tr>
                  <tr>
                    <td>Bank Website</td>
                    <td>{{ result.BIN.issuer.website }}</td>
                  </tr>
                  <tr>
                    <td>Level</td>
                    <td>{{ result.BIN.level }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div v-else>
              <div class="text-red-accent-2">BIN/IIN is invalid</div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import axios from 'axios';
import CountryFlag from 'vue-country-flag-next'

export default {
  components: {
    CountryFlag
  },
  data() {
    return {
      binNumber: "",
      result: { error: '' },
      inputRules: [
        (v) => !!v || "Field is required",
        (v) => /^\d{6,8}$/.test(v) || "Must be 6 to 8 digits",
      ],
      valid: false,
    };
  },
  computed: {
    isBinValid() {
      if (this.binNumber && /^\d{6,8}$/.test(this.binNumber)) {
        return true
      }
      return false
    },
  },
  mounted() {

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