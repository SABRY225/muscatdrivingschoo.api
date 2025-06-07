const app = require("./app");

const sequelize = require("./db/config/connection");

const port = app.get("port");


sequelize
  // .sync({alter:true})
  .sync({})
  // .sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`The Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));
