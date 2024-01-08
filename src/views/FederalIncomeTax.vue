<template>
    <v-container class="fill-height">
        <v-responsive class="fill-height">
            <h1 class="text-center">Tax Calculator: 2022-2023 Refund and Tax Estimator</h1>
            <v-row class="pa-2">
                <v-col cols="12" lg="6" md="12" sm="12">
                    <v-form ref="myForm" v-model="isFormValid">
                        <v-text-field v-model.number="houseHoldIncome" type="number" label="Income" prefix="$"
                            @input="changeHouseHoldIncome" :rules="[$numberGreaterThanNegativeRule]" dense></v-text-field>
                        <v-slider v-model="houseHoldIncome" :min="houseHoldIncomeMin" :max="houseHoldIncomeMax"
                            :step="houseHoldIncomeStep" @end="changeHouseHoldIncome"></v-slider>
                        <!-- <v-autocomplete label="Location" v-model="selectedLocation" v-model:search="locationSearch"
                            :items="locations" :loading="loading"></v-autocomplete> -->
                        <v-select label="Filing Status" v-model="filingStatus"
                            :items="['Single', 'Married, filing jointly', 'Married, filing separately', 'Head of household']"></v-select>
                        <v-text-field v-model.number="age" type="number" :rules="[$numberGreaterThanZeroRule]"
                            @input="calculate" label="Age"></v-text-field>
                        <v-text-field v-model.number="k401Contribution" type="number" label="401(k) Contribution" prefix="$"
                            :rules="[$numberGreaterThanNegativeRule, numberMax27000Rule]"
                            :hint="`0 ~ ${houseHoldIncome < maxContribution ? houseHoldIncome : maxContribution}`"
                            @input="calculate" dense></v-text-field>
                        <v-text-field v-model.number="iraContribution" type="number" label="IRA Contribution" prefix="$"
                            :rules="[$numberGreaterThanNegativeRule, numberMax6000Rule]"
                            :hint="`0 ~ ${houseHoldIncome < 6000 ? houseHoldIncome : 6000}`" @input="calculate"
                            dense></v-text-field>
                        <v-text-field v-model.number="personalExemptions" type="number"
                            label="Number of State Personal Exemptions" @input="calculate"
                            :rules="[$numberGreaterThanZeroRule, personalExemptionsRule]" hint="1~12" dense></v-text-field>
                        <v-text-field v-model.number="withHeld" type="number" :rules="[$numberGreaterThanNegativeRule]"
                            @input="calculate" label="Withheld" prefix="$"></v-text-field>

                        <p>Your Standard deduction: $ {{ standardDeductions[filingStatus] }}</p>
                        <v-radio-group v-model="deductionType">
                            <v-radio label="Standard Deduction" value="standard"></v-radio>
                            <v-radio label="Itemize Deduction" value="itemized"></v-radio>
                        </v-radio-group>
                        <v-text-field v-model.number="itemizedDeductions" type="number" label="Itemized Deductions"
                            :rules="[$numberGreaterThanNegativeRule, numberMaxHouseHoldIncome]" @input="calculate"
                            :hint="`0 ~ ${houseHoldIncome}`" :disabled="deductionType === 'standard'" prefix="$"
                            dense></v-text-field>
                        <v-text-field v-model.number="taxCredits" type="number" :rules="[$numberGreaterThanNegativeRule]"
                            @input="calculate" label="Tax Credits" prefix="$"></v-text-field>
                        <!-- <div class="text-center">
                            <v-btn elevated @click="calculate" :disabled="!isFormValid">Calculate</v-btn>
                        </div> -->
                    </v-form>
                </v-col>
                <v-col cols="12" lg="6" md="12" sm="12" class="text-h6">
                    <div v-if="isFormValid" class="ma-4">
                        <v-row justify="space-between">
                            <v-col class="float-left ">Taxable income</v-col>
                            <v-col class="float-right">{{ $formatNumberWithCommas(this.taxableIncome) }}</v-col>
                        </v-row>
                        <v-row justify="space-between">
                            <v-col class="float-left ">Effective tax rate
                            </v-col>
                            <v-col class="float-right">{{ this.effictiveTaxRate }}</v-col>
                        </v-row>
                        <v-row justify="space-between">
                            <v-col class="float-left ">Estimated federal taxes
                            </v-col>
                            <v-col class="float-right">{{ $formatNumberWithCommas(this.estimatedFederalTaxes) }}</v-col>
                        </v-row>
                        <v-row justify="space-between">
                            <v-col class="float-left ">Federal taxes withheld
                            </v-col>
                            <v-col class="float-right">{{ $formatNumberWithCommas(this.withHeld) }}</v-col>
                        </v-row>

                        <br>
                        <v-divider></v-divider>
                        <br>
                        <v-row v-if="this.estimatedFederalTaxes > this.withHeld" justify="space-between" class="text-h5">
                            <v-col class="float-left ">We estimate you will owe
                            </v-col>
                            <v-col
                                :class="['float-right', this.estimatedFederalTaxes - this.taxCredits - this.withHeld > 0 ? 'text-error' : 'text-green-darken-4']">{{
                                    $formatNumberWithCommas(Math.max(this.estimatedFederalTaxes -
                                        this.taxCredits - this.withHeld, 0)) }}</v-col>
                        </v-row>
                        <v-row v-else justify="space-between" class="text-h5">
                            <v-col class="float-left ">We estimate you will get back
                            </v-col>
                            <v-col :class="['float-right', 'text-green-darken-4']">{{
                                $formatNumberWithCommas(
                                    this.withHeld - this.estimatedFederalTaxes) }}</v-col>
                        </v-row>
                    </div>
                </v-col>
            </v-row>
        </v-responsive>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            houseHoldIncome: 100000, // Initial houseHoldIncome value
            houseHoldIncomeMin: 0,    // Minimum houseHoldIncome value
            houseHoldIncomeMax: 10000000,  // Maximum houseHoldIncome value
            houseHoldIncomeStep: 1000,    // Step houseHoldIncome size
            selectedLocation: null,
            locations: [],
            filingStatus: "Single",
            locationSearch: null,
            loading: false,
            k401Contribution: 0,
            iraContribution: 0,
            itemizedDeductions: 0,
            personalExemptions: 1,
            isFormValid: false,
            age: 35,
            estimatedFederalTaxes: 0,
            federalTaxesWithheld: 0,
            taxCredits: 0,
            withHeld: 0,
            deductionType: 'standard',
            standardDeductions: {
                'Single': 12950,
                'Married, filing jointly': 25900,
                'Married, filing separately': 12950,
                'Head of household': 19400,
            },
        };
    },
    watch: {
        locationSearch(val) {
            val && this.querySelections(val)
        },
        age() {
            this.$refs.myForm.validate();
        },
        k401Contribution() {
            this.$refs.myForm.validate();
        },
        filingStatus() {
            this.calculate();
        },
        deductionType() {
            this.calculate();
        },
        houseHoldIncome() {
            this.$refs.myForm.validate();
        }
    },
    computed: {
        taxableIncome() {
            var deductions = 0;
            if (this.deductionType === 'standard') {
                deductions = this.standardDeductions[this.filingStatus];
            } else {
                deductions = this.itemizedDeductions
            }
            return this.houseHoldIncome -
                this.k401Contribution -
                this.iraContribution - deductions
        },
        maxContribution() {
            if (!this.age || this.age < 50) {
                return 20500;
            }
            return 27000;
        },
        effictiveTaxRate() {
            try {
                var deductions = 0;
                if (this.deductionType === 'standard') {
                    deductions = this.standardDeductions[this.filingStatus];
                } else {
                    deductions = this.itemizedDeductions
                }
                return (this.estimatedFederalTaxes / ((this.houseHoldIncome - this.k401Contribution -
                    this.iraContribution - deductions)) * 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%'
            } catch {
                return ""
            }

        }
    },
    async mounted() {
        // try {
        //     const response = await axios.get('https://ipinfo.io?token=6cee6093627b02'); // Replace with your API token
        //     this.selectedLocation = response.data.city + ", " + response.data.region
        //     console.log(response.data)
        //     this.calculate();
        // } catch (error) {
        //     console.error('Error fetching location data:', error);
        // }
        this.calculate();
    },
    methods: {
        calculate() {
            var deductions = 0;
            if (this.deductionType === 'standard') {
                deductions = this.standardDeductions[this.filingStatus];
            } else {
                deductions = this.itemizedDeductions
            }
            this.estimatedFederalTaxes = this.calculateFederalTax(this.houseHoldIncome, this.filingStatus, this.k401Contribution, this.iraContribution, deductions, null)
            // const ficaTaxes = this.calculateFICATaxes(householdIncome, k401Contribution, iraContribution);
            // console.log(ficaTaxes, "----ficaTaxes----")
        },
        calculateFederalTax(income, filingStatus, k401Contribution, iraContribution, itemizedDeductions, stateExemptions) {
            // Define tax brackets for 2022 for Married Filing Jointly
            const brackets = {
                "Single": [
                    { min: 0, max: 10275, rate: 0.1 },
                    { min: 10276, max: 41775, rate: 0.12 },
                    { min: 41776, max: 89075, rate: 0.22 },
                    { min: 89076, max: 170050, rate: 0.24 },
                    { min: 170051, max: 215950, rate: 0.32 },
                    { min: 215951, max: 539900, rate: 0.35 },
                    { min: 539901, max: Infinity, rate: 0.37 },
                ],
                "Married, filing jointly": [
                    { min: 0, max: 20550, rate: 0.1 },
                    { min: 20551, max: 83550, rate: 0.12 },
                    { min: 83551, max: 178150, rate: 0.22 },
                    { min: 178151, max: 340100, rate: 0.24 },
                    { min: 340101, max: 431900, rate: 0.32 },
                    { min: 431901, max: 647850, rate: 0.35 },
                    { min: 657851, max: Infinity, rate: 0.37 },
                ],
                "Married, filing separately": [
                    { min: 0, max: 10275, rate: 0.1 },
                    { min: 10276, max: 41775, rate: 0.12 },
                    { min: 41776, max: 89075, rate: 0.22 },
                    { min: 89076, max: 170050, rate: 0.24 },
                    { min: 170051, max: 215950, rate: 0.32 },
                    { min: 215951, max: 323925, rate: 0.35 },
                    { min: 539901, max: Infinity, rate: 0.37 },
                ],
                "Head of household": [
                    { min: 0, max: 14650, rate: 0.1 },
                    { min: 14651, max: 55900, rate: 0.12 },
                    { min: 55901, max: 89075, rate: 0.22 },
                    { min: 89051, max: 170050, rate: 0.24 },
                    { min: 170051, max: 215950, rate: 0.32 },
                    { min: 215951, max: 539900, rate: 0.35 },
                    { min: 539901, max: Infinity, rate: 0.37 },
                ],
            };

            // Calculate AGI (Adjusted Gross Income)
            const agi = income - k401Contribution - iraContribution;

            // Calculate taxable income after deductions
            const taxableIncome = agi - itemizedDeductions;

            // Calculate federal tax
            let federalTax = 0;
            for (const bracket of brackets[filingStatus]) {
                if (taxableIncome > bracket.min) {
                    const taxableAmountInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
                    federalTax += taxableAmountInBracket * bracket.rate;
                }
            }

            // Calculate tax credits (simplified)
            // You may need to add more accurate calculations for tax credits
            const childTaxCredit = 0; // Placeholder for Child Tax Credit
            const eitc = 0; // Placeholder for Earned Income Tax Credit
            federalTax -= childTaxCredit + eitc;

            // // Calculate state tax (simplified)
            // const stateTax = taxableIncome * 0.03; // Placeholder for state tax calculation

            // // Calculate total tax (federal + state)
            // const totalTax = federalTax + stateTax;

            return federalTax;
        },
        changeHouseHoldIncome() {
            // this.contribution = 0
            // this.iraContribution = 0
            // this.itemizedDeductions = 0
            this.calculate();
        },
        async querySelections(val) {
            this.loading = true;
            try {
                const response = await axios.get('https://api.geoapify.com/v1/geocode/autocomplete', {
                    params: {
                        text: val,
                        type: 'city',
                        apiKey: "e46fbd4d5b4545ba81aad0cc33d9b98d",
                        filter: "countrycode:us",
                        format: 'json',
                        limit: '100',
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                this.locations = [];
                this.locations = response.data.results.map((location) => (
                    location.city + ", " + location.state
                ))
            } catch (error) {
                console.error('Error fetching location list:', error);
            }
            this.loading = false;
        },
        numberMax27000Rule(value) {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue > this.maxContribution) {
                if (!this.age || this.age < 50) {
                    return `In 2022, for people under age 50 the maximum contribution is $20,500.`;
                }
                return `In 2022, for people age 50 and over the maximum contribution is $27,000.`; // Validation fails
            }
            if (!isNaN(numericValue) && numericValue > this.houseHoldIncome) {
                this.contribution = this.houseHoldIncome;
            }
            return true; // Validation passes
        },
        numberMax6000Rule(value) {

            const numericValue = parseFloat(value);
            if (this.k401Contribution > 0 && numericValue > 0) {
                return 'If you already contribute to a 401(k), this calculator assumes your IRA contributions are not tax-deductible.'
            }
            if (!isNaN(numericValue) && numericValue > 6000) {
                return `Maximum value is $6,000`; // Validation fails
            }
            return true; // Validation passes
        },
        numberMaxHouseHoldIncome(value) {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue > this.houseHoldIncome) {
                return `Maximum value is ${this.$formatNumberWithCommas(this.houseHoldIncome)}`; // Validation fails
            }
            return true; // Validation passes
        },
        personalExemptionsRule(value) {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue > 12) {
                return `Maximum value is 12`; // Validation fails
            }
            return true; // Validation passes
        },
        calculateFICATaxes(income, k401Contribution, iraContribution) {
            // FICA tax rates for 2022-2023
            const socialSecurityRate = 0.062; // 6.2% (up to Social Security cap)
            const medicareRate = 0.0145; // 1.45% (no income cap)

            // Social Security tax cap for 2022-2023
            const socialSecurityCap = 147000; // Cap for 2022-2023

            // Calculate Social Security tax (up to the cap)
            let socialSecurityTax = Math.min(income, socialSecurityCap) * socialSecurityRate;

            // Calculate Medicare tax (applies to all income)
            let medicareTax = income * medicareRate;

            // Adjust for 401(k) and IRA contributions (pre-tax deductions)
            socialSecurityTax -= k401Contribution * socialSecurityRate;
            medicareTax -= k401Contribution * medicareRate;

            socialSecurityTax -= iraContribution * socialSecurityRate;
            medicareTax -= iraContribution * medicareRate;

            // Ensure taxes are non-negative
            socialSecurityTax = Math.max(socialSecurityTax, 0);
            medicareTax = Math.max(medicareTax, 0);

            return {
                socialSecurity: socialSecurityTax,
                medicare: medicareTax,
            };
        }
    },
};
</script>

<style></style>