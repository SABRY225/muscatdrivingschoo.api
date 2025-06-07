


/*


*/

const CC = require("currency-converter-lt");
const { Convert } = require("easy-currencies");
const currencyConverter = new CC();

const convert = async (req, res) => {
  const { from, to, amount } = req.params;
  if (
    !from ||
    !to ||
    !amount ||
    `${from}`.trim() === "" ||
    `${to}`.trim() === "" ||
    `${amount}`.trim() === ""
  ) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }
  const convertedAmount = await currencyConverter
    .from("from")
    .to(to)
    .amount(+amount)
    .convert();
  return res.status(200).json({
    status: 200,
    data: convertedAmount,
    msg: {
      arabic: "تم تحويل العملة بنجاح",
      english: "currency converted successfully",
    },
  });
};

const getConversionRate = async (req, res) => {
  /*
  const CCV = require('currency-converter-vl');
  let currencyConverter = new CCV({from:"USD", to:"INR", amount:100, isDecimalComma:true})
  currencyConverter.convert().then((response) => {
    console.log("Chaange Cunn");
    console.log(response); //or do something else
})
*/

  const { to } = req.params;

  if (!to || `${to}`.trim() === "") {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }
  try {
    const value = await Convert(1).from("OMR").to(to);
  /*
    const conversionRate = await currencyConverter
    .from("OMR")
    .to(to)
    .amount(1)
    .convert();
    */
    return res.status(200).json({
      status: 200,
      data: value,
      msg: {
        arabic: "تم تحويل العملة بنجاح",
        english: "currency converted successfully",
      },
    });

  } catch (error) {
    console.log('Error converting currency', error);
    return amount; // Fallback to original amount in case of error
}

};
const getConversionRateFrom = async (req, res) => {
  const { from, to } = req.params;
  if (!from || `${from}`.trim() === "" || !to || `${to}`.trim() === "") {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }
  const conversionRate = await Convert(1).from(from).to(to);
  /*
  const conversionRate = await currencyConverter
    .from(from)
    .to(to)
    .amount(1)
    .convert();
    */
  return res.status(200).json({
    status: 200,
    data: conversionRate,
    msg: {
      arabic: "تم تحويل العملة بنجاح",
      english: "currency converted successfully",
    },
  });
};
module.exports = {
  convert,
  getConversionRate,
  getConversionRateFrom,
};
