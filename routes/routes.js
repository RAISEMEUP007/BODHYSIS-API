
import express from 'express';

import { signup, login, isAuth, resetPass, verifyChangePass, newPass } from '../controllers/auth.js';
import { createPriceGroup, addPricePoint, getTableData, getHeaderData, setFree, setPriceData, 
		 setExtraDay, deleteGroup, deletePricePoint, updatePriceGroup, getSeasonsData, saveSeasonCell, deleteSeason, 
		 getBrandsData, saveBrandCell, deleteBrand, getPriceTablesData, savePriceTableCell, deletePriceTable,
		 getPriceLogicData, createPriceLogic, deletePriceLogic } from '../controllers/price.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/resetpass', resetPass);
router.get('/changepass/:id', verifyChangePass);
router.post('/newpassword', newPass);
router.get('/private', isAuth);

// price group
router.get('/price/getheaderdata', getHeaderData);
router.get('/price/gettabledata/:tableId', getTableData);
router.post('/price/creategroup', createPriceGroup);
router.post('/price/updategroup', updatePriceGroup);
router.post('/price/addpricepoint', addPricePoint);
router.post('/price/setfree', setFree);
router.post('/price/setpricedata', setPriceData);
router.post('/price/setextraday', setExtraDay);
router.post('/price/deletegroup', deleteGroup);
router.post('/price/deletepricepoint', deletePricePoint);

// Seasons management
router.get('/price/getseasonsdata', getSeasonsData);
router.post('/price/saveseasoncell', saveSeasonCell);
router.post('/price/deleteseason', deleteSeason);

// Brands management
router.get('/price/getbrandsdata', getBrandsData);
router.post('/price/savebrandcell', saveBrandCell);
router.post('/price/deletebrand', deleteBrand);

// PriceTables management
router.get('/price/getpricetablesdata', getPriceTablesData);
router.post('/price/savepricetablecell', savePriceTableCell);
router.post('/price/deletepricetable', deletePriceTable);

// PriceLogic management
router.get('/price/getpricelogicdata', getPriceLogicData);
router.post('/price/createpricelogic', createPriceLogic);
router.post('/price/deletepricelogic', deletePriceLogic);

router.get('/public', (req, res, next) => {
	res.status(200).json({ message: "here is your public resource" });
});

router.use('/', (req, res, next) => {
	console.log("..");
	console.log(req.body);
	res.status(404).json({error : "page not found"});
});

export default router;