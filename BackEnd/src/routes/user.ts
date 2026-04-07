import  express  from "express";
import { Request, Response } from "express";
import { list, remove } from "../controllers/user";
const router = express.Router();

router.get('/users',list);
router.delete('/users/:UserId',remove);

module.exports = router