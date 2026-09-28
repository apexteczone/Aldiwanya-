import connectDB from "./DB/connection.js";
import cors from 'cors';

const bootstrap = async (app,express) => {
await connectDB();

app.use(cors());
app.use(express.json());



app.get("/",(req,res)=>res.send("Hello world"))
};

        export default bootstrap;