
import express from 'express';

import { signup, login, isAuth, resetpass, changepass, password } from '../controllers/auth.js';
import { createpricegroup } from '../controllers/price.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/resetpass', resetpass);
router.get('/changepass/:id', changepass);
router.post('/password', password);
router.get('/private', isAuth);

router.post('/price/creategroup', createpricegroup);

router.get('/public', (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});

// will match any other path
router.use('/', (req, res, next) => {
    console.log("..");
    console.log(req.body);
    res.status(404).json({error : "page not found"});
});

export default router;