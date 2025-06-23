import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
const PORT = process.env.PORT || 8000;
dotenv.config({ path: "./.env" });
 
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

    app.on("error", (error) => {
      console.log("ERROR : " + error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.log("MONGODB Connection FAIL !!" + error);
  });

