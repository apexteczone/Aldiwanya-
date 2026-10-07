import connectDB from "./DB/connection.js";
import cors from 'cors';
import authRouter from "./Modules/Auth/authController.js";
import courseRouter from "./Modules/Course/courseController.js";
import moduleRouter from "./Modules/Module/module.controller.js";
import lessonRouter from "./Modules/Lesson/lessonController.js";
import planRouter from "./Modules/Plan/Plan.controller.js";
import userRouter from "./Modules/User/user.route.js"
import contentRouter from "./Modules/Content/content.controller.js";
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
app.use('/admin',courseRouter);
app.use('/admin',moduleRouter);
app.use('/admin',lessonRouter);
app.use('/',contentRouter);
app.use('/plan',planRouter);
app.use('/user',userRouter);

app.all("/{*splat}", notFoundHandler);

app.use(globalErrorHandler);


};


        export default bootstrap;