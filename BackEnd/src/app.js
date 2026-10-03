import connectDB from "./DB/connection.js";
import cors from 'cors';
import authRouter from "./Modules/Auth/authController.js";
import notFoundHandler from "./utils/errorHandling/NotFoundHandler.js";
import globalErrorHandler from "./utils/errorHandling/globalErrorHandler.js";

const bootstrap = async (app,express) => {
await connectDB();

app.use(cors());
app.use(express.json());
  app.use(
      express.urlencoded({
        extended: true,
      })
    );


app.get("/",(req,res)=>res.send("Hello world"))

app.use('/auth',authRouter);
app.all("/{*splat}", notFoundHandler);

app.use(globalErrorHandler);


};


        export default bootstrap;