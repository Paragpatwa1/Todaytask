const express = require("express");
const mongoose  = require("mongoose");
const authRoutes = require("./routes/auth");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/authjwt", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");    
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});
app.use('/api, authRoutes');
app.listen(3000, () => {
    console.log("Server is running on port 3000");

}   );
