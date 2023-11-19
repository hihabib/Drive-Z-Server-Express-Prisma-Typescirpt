import "source-map-support/register";
import express, {
    type Express,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import router from "./routes";
import cors from "cors";
import { type HandleError } from "./model/model";

const app: Express = express();
const PORT = 8080;
// json middleware
app.use(express.json());
app.use(cors());

// set routes
app.use(router);

app.listen(PORT, () => {
    console.log(`App is listening to ${PORT} port`);
});

app.use(
    (error: HandleError, req: Request, res: Response, next: NextFunction) => {
        res.status(error.status ?? 500).json({
            message: error.message,
        });
    },
);
