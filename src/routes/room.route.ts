import { Router } from "express";
import { prisma } from '../config/db.js'


const router = Router();


router.post('/create-user', async (req, res) => {
    const { username } = req.body;
    await prisma.user.create({
        data: {
            username
        }
    })
})
router.post('/create-room', async (req, res) => {

})





