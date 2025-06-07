const characters = '0123456789';
  function generateRandomCode(){
      let result = ""
      for ( var i = 0; i < 4 ; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 10));
      }
      return result
  }

  module.exports = generateRandomCode