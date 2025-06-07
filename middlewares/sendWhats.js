const wbm = require('wbm');
const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
qrcode.generate(qr, { small: true });
console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
console.log('Client is ready!');
});

client.on('message', message => {
console.log(message.body);
if (message.body === 'a') {
message.reply('pong');
}
});

client.initialize();

const sendWhatsappMessage = (phone , message) => {

// Start your client
const wbm = require('wbm');
console.log("This working with mey welcome");
console.log("Yarab ...");
wbm.start({ qrCodeData: true, session: false, showBrowser: false})
.then(async qrCodeData => {
    console.log(qrCodeData); // show data used to generate QR Code
    await wbm.waitQRCode();
    // waitQRCode() is necessary when qrCodeData is true

    const phones = ['201020189717', '201012591423'];
    const message = 'Good Morning.';
    await wbm.send(phones, message);
    await wbm.end();

    await wbm.end();
} ).catch(err => { console.log(err); });

/*
wbm.start().then(async () => {
    const phones = ['201020189717', '201012591423'];
    const message = 'Good Morning.';
    await wbm.send(phones, message);
    await wbm.end();
}).catch(err => console.log(err));

console.log("STRAT WHEATS APP");

wbm.start({showBrowser: true, qrCodeData: true, session: false})
.then(async qrCodeData => {
  console.log("QR CODE = ");
  console.log(qrCodeData); // show data used to generate QR Code
    await wbm.waitQRCode();
    // waitQRCode() is necessary when qrCodeData is true
    await wbm.end();
} ).catch(err => { console.log(err); });



console.log(".......START WHEATS APP");

  wbm.start({}).then(async () => {
      const phones = ['201012591423',"201020189717"];
      const message = 'Good Morning. Today';
      console.log("...............");
      console.log(phones);
      await wbm.send(phones, message);
      await wbm.end();
  }).catch(error => console.log(error));
*/
};
module.exports = sendWhatsappMessage;
