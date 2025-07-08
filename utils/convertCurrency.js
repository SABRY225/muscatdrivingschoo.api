const https = require("https");

const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error("فشل في تحليل البيانات"));
                }
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
};

const convertCurrency = async (amount, currencyFrom, currencyTo) => {
    try {
        if (isNaN(amount) || amount <= 0) {
            throw new Error("الرجاء إدخال قيمة صحيحة أكبر من 0");
        }

        currencyFrom = currencyFrom.toUpperCase();
        currencyTo = currencyTo.toUpperCase();

        const apiUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currencyFrom.toLowerCase()}.json`;

        const data = await fetchData(apiUrl);
        const rates = data[currencyFrom.toLowerCase()];

        if (!rates[currencyTo.toLowerCase()]) {
            throw new Error(`لم يتم العثور على سعر صرف من ${currencyFrom} إلى ${currencyTo}.`);
        }

        return (amount * rates[currencyTo.toLowerCase()]).toFixed(2);
    } catch (error) {
        return `خطأ: ${error.message}`;
    }
};

module.exports = convertCurrency;
