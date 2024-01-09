const myPlugin = {
    install(app) {
        app.config.globalProperties.$formatNumberWithCommas = (number) => {
            if (number === null) return "";
            if (number.toLocaleString('en-US', { maximumFractionDigits: 2 })) {
                return "$" + number.toLocaleString('en-US', { maximumFractionDigits: 2 });
            }
            return "";
        };
        app.config.globalProperties.$numberGreaterThanZeroRule = (value) => {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue > 0) {
                return true; // Validation passes
            }
            return 'Enter a valid number greater than 0'; // Validation fails
        };
        app.config.globalProperties.$numberGreaterThanNegativeRule = (value) => {
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue) && numericValue >= 0) {
                return true; // Validation passes
            }
            return 'Please provide positive value'; // Validation fails
        };
        app.config.globalProperties.$textGreaterThanNegativeRule = (value) => {
            const numericValue = parseFloat(value.replace(/[^\d]/g, ''));
            if (!isNaN(numericValue) && numericValue >= 0) {
                return true; // Validation passes
            }
            return 'Please provide positive value'; // Validation fails
        };
        app.config.globalProperties.$integerRule = (value) => {
            if (Number.isInteger(Number(value))) {
                return true; // Value is an integer
            } else {
                return "Please enter a valid integer"; // Validation failed
            }
        };
    },
};

export default myPlugin;