import express from 'express';

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Test from controllers Say hi");
    
});

export default router;