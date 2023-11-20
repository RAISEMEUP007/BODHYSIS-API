
import express from 'express';

import { signup, login, isAuth, resetpass, changepass } from '../controllers/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/resetpass', resetpass);
router.get('/changepass/:id', changepass);
router.get('/private', isAuth);

router.get('/public', (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});

// will match any other path
router.use('/', (req, res, next) => {
    console.log(req.body);
    res.status(404).json({error : "page not found"});
});

export default router;