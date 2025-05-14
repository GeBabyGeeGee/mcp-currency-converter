const axios = require('axios');

const API_KEY = process.env.EXCHANGERATE_API_KEY || '58697ea4ff573d9ae9296b35'; // Replace with your actual API key or use environment variable
const BASE_API_URL = 'https://v6.exchangerate-api.com/v6/';

/**
 * MCP Tool to convert an amount from one currency to another
 * using the exchangerate-api.com service.
 */
class ConvertCurrencyTool {
    /**
     * Executes the currency conversion.
     *
     * @param {number} amount - The amount to convert.
     * @param {string} from_currency - The currency code to convert from (e.g., "USD").
     * @param {string} to_currency - The currency code to convert to (e.g., "EUR").
     * @returns {Promise<object>} A promise resolving to an object containing the conversion result or an error message.
     *                   Expected format on success:
     *                   {
     *                     "original_amount": 100,
     *                     "from_currency": "USD",
     *                     "to_currency": "EUR",
     *                     "converted_amount": 92.00,
     *                     "exchange_rate": 0.92,
     *                     "last_updated_utc": "YYYY-MM-DDTHH:MM:SSZ"
     *                   }
     *                   Expected format on error:
     *                   {
     *                     "error": "Error message description"
     *                   }
     */
    async execute(amount, from_currency, to_currency) {
        if (API_KEY === 'YOUR-API-KEY' || API_KEY === '58697ea4ff573d9ae9296b35') {
             return {"error": "API key not configured. Please set your exchangerate-api.com API key via EXCHANGERATE_API_KEY environment variable."};
        }

        const fromCurrencyUpper = from_currency.toUpperCase();
        const toCurrencyUpper = to_currency.toUpperCase();

        const api_url = `${BASE_API_URL}${API_KEY}/latest/${fromCurrencyUpper}`;

        try {
            const response = await axios.get(api_url, { timeout: 10000 }); // Added timeout

            if (response.data.result === "error") {
                const error_type = response.data["error-type"] || "Unknown API error";
                 // More specific error handling based on exchangerate-api.com documentation
                if (error_type === "unknown-code") {
                    return {"error": `Unsupported or invalid base currency code for API: ${from_currency}`};
                } else if (error_type === "malformed-request") {
                    return {"error": "Malformed request to the exchange rate API."};
                } else if (error_type === "invalid-key") {
                    return {"error": "Invalid API key provided for exchangerate-api.com."};
                } else if (error_type === "inactive-account") {
                    return {"error": "API account is inactive."};
                } else if (error_type === "quota-reached") {
                    return {"error": "API request quota reached."};
                }
                return {"error": `API error: ${error_type}`};
            }

            const conversion_rates = response.data.conversion_rates;
            if (!conversion_rates) {
                return {"error": "Could not retrieve conversion rates from API response."};
            }

            if (!(fromCurrencyUpper in conversion_rates)) {
                 return {"error": `Currency code '${fromCurrencyUpper}' not found in API response for base '${response.data.base_code}'. It might be an unsupported currency.`};
            }
            if (!(toCurrencyUpper in conversion_rates)) {
                 return {"error": `Target currency code '${toCurrencyUpper}' not found in API response for base '${fromCurrencyUpper}'. It might be an unsupported currency.`};
            }

            const effective_exchange_rate = conversion_rates[toCurrencyUpper];

            if (effective_exchange_rate === undefined) { // Should be caught by the check above, but as a safeguard
                 return {"error": `Could not determine exchange rate from '${fromCurrencyUpper}' to '${toCurrencyUpper}'.`};
            }

            const converted_amount = parseFloat(amount) * effective_exchange_rate;

            // Get the update timestamp
            const last_updated_utc_str = response.data.time_last_update_utc; // "Fri, 27 Mar 2020 00:00:00 +0000"
            let last_updated_iso = "Timestamp parse error";

            if (last_updated_utc_str) {
                 try {
                    // Attempt to parse the string format provided by the API
                    // Example: "Fri, 27 Mar 2020 00:00:00 +0000"
                    // JavaScript Date.parse can handle this format
                    const date_obj = new Date(last_updated_utc_str);
                    if (!isNaN(date_obj.getTime())) {
                         last_updated_iso = date_obj.toISOString();
                    }
                 } catch (e) {
                    console.error("Error parsing date string:", e);
                 }
            } else {
                 last_updated_iso = new Date().toISOString();
            }


            return {
                "original_amount": parseFloat(amount),
                "from_currency": fromCurrencyUpper,
                "to_currency": toCurrencyUpper,
                "converted_amount": parseFloat(converted_amount.toFixed(4)), // Round to sensible decimal places
                "exchange_rate": parseFloat(effective_exchange_rate.toFixed(6)),
                "last_updated_utc": last_updated_iso
            };

        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {"error": `Network request failed: ${error.message}`};
            } else {
                return {"error": `An unexpected error occurred: ${error.message}`};
            }
        }
    }
}

module.exports = ConvertCurrencyTool;

// --- Example Usage (for testing purposes) ---
if (require.main === module) {
    console.log("MCP Currency Conversion Tool Test");
    console.log("=================================");

    const converter = new ConvertCurrencyTool();

    if (API_KEY === 'YOUR-API-KEY' || API_KEY === '58697ea4ff573d9ae9296b35') {
        console.log("\nWARNING: API_KEY is not configured. Please set the EXCHANGERATE_API_KEY environment variable.");
        console.log("Skipping live API test.\n");
    } else {
        console.log(`Using API Key: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`); // Show partial key for confirmation

        async function runTests() {
            console.log("\nTest 1: Convert 100 USD to EUR");
            let result1 = await converter.execute(100, "USD", "EUR");
            console.log(result1);

            console.log("\nTest 2: Convert 50 EUR to JPY");
            let result2 = await converter.execute(50, "EUR", "JPY");
            console.log(result2);

            console.log("\nTest 3: Convert 1000 JPY to GBP");
            let result3 = await converter.execute(1000, "JPY", "GBP");
            console.log(result3);

            console.log("\nTest 4: Invalid 'from' currency");
            let result4 = await converter.execute(100, "XYZ", "USD");
            console.log(result4);

            console.log("\nTest 5: Invalid 'to' currency (assuming USD is a valid base)");
            let result5 = await converter.execute(100, "USD", "ABC");
            console.log(result5);

            console.log("\nTest 6: Amount as string (should be number)");
            // The tool itself expects a number. Proper input validation should occur before calling execute.
            try {
                let amount_str_test = "150.75";
                console.log(`Attempting to convert string amount: '${amount_str_test}' from USD to CAD`);
                let result6 = await converter.execute(parseFloat(amount_str_test), "USD", "CAD");
                console.log(result6);
            } catch (e) {
                console.error(`Error converting string amount to float: ${e}`);
                console.log({"error": "Amount must be a valid number."});
            }

            console.log("\nTest 7: Zero amount");
            let result7 = await converter.execute(0, "USD", "EUR");
            console.log(result7);
        }

        runTests();
    }
}