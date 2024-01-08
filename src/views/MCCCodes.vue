<template>
    <v-container class="fill-height">
        <v-responsive class="fill-height">
            <h1 class="text-center">Merchants Category Codes</h1>
            <v-row class="pa-2">
                <v-col cols="12" lg="12" md="12" sm="12">
                    <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                        hide-details></v-text-field>
                    <v-data-table :headers="headers" :items="mccCodes" :search="search"></v-data-table>
                </v-col>
            </v-row>
        </v-responsive>
    </v-container>
</template>

<script>
import mccCodes from '../data/mcc_codes.json';

export default {
    data() {
        return {
            search: '',
            headers: [
                {
                    align: 'start',
                    key: 'mcc',
                    sortable: true,
                    title: 'Code',
                    width: '100px',
                },
                { key: 'edited_description', title: 'Description' },

            ],
            mccCodes: mccCodes,
        };
    },

    mounted() {
    },
    methods: {

    },
};
</script>

<style></style>