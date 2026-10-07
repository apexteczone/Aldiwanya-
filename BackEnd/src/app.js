import connectDB from "./DB/connection.js";
import cors from 'cors';
import authRouter from "./Modules/Auth/authController.js";
import gradeRouter from "./Modules/Grade/grade.route.js";
import courseRouter from "./Modules/Course/course.route.js";
import lessonRouter from "./Modules/Lesson/lesson.route.js";
import PDFRouter from "./Modules/PDF/pdf.router.js";
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
app.use("/admin/grades", gradeRouter);
app.use('/admin/courses',courseRouter);
app.use('/admin/lessons',lessonRouter);
app.use('/admin/pdfs',PDFRouter);
app.all("/{*splat}", notFoundHandler);

app.use(globalErrorHandler);


};

export default bootstrap;