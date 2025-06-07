// added by Abdelwahab
const dotenv = require("dotenv");
// dotenv.config();
const accountSid  = process.env.TWILIO_ACCOUNT_SID;
const authToken   = process.env.TWILIO_AUTH_TOKEN;
const sender      = process.env.TWILIO_SENDER_NUMBER;

const clientSMS   = require("twilio")(accountSid, authToken);
const sendSMS     = (options) => {
/*
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', 'https://sms.ooredoo.com.om/User/bulkpush.asmx?op=SendSMS', true);
  xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "http://sms.ooredoo.com.om");
  xhr.send(JSON.stringify({
    UserName : 'John',
    Password : 30  
  }));
  
  // build SOAP request
  var sr = '<?xml version="1.0" encoding="utf-8"?>' +
  '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
    '<soap12:Body>' +
      '<ObterLojasActivas xmlns="http://microsoft.com/webservices/" />' +
    '</soap12:Body>' +
  '</soap12:Envelope>;';

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        alert(xmlhttp.responseText);

      }
    }
  }
  // Send the POST request
  xmlhttp.setRequestHeader('Content-Type', 'text/xml');
  xmlhttp.send(sr);
*/
try {
    clientSMS.messages
    .create({ from: sender, body: options.body, to: options.to })
    .then((message) =>
      console.log("message sent successfully: ", message.sid)
    ).catch((error) => console.error("message was not sent: ", error));
  } catch (error) {
    console.error(error);
  }
};


module.exports = sendSMS;
