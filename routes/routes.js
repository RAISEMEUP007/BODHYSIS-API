import express from 'express';
import multer from 'multer';
import path from 'path';

import { signup, login, isAuth, resetPass, verifyChangePass, newPass } from '../controllers/auth.js';
import { createPriceGroup, addPricePoint, getTableData, getPriceGroupsData, getHeaderData, setFree, priceValidation, setPriceData, 
		 setExtraDay, deleteGroup, deletePricePoint, updatePriceGroup, getSeasonsData, saveSeasonCell, deleteSeason, 
		 getBrandsData, saveBrandCell, deleteBrand, getPriceTablesData, savePriceTableCell, deletePriceTable,
		 getPriceLogicData, createPriceLogic, deletePriceLogic} from '../controllers/price.js';
import { getProductCategoriesData, createProductCategory, updateProductCategory, saveProductCategory, deleteProductCategory, 
		 getProductFamiliesData, createProductFamily, updateProductFamily, deleteProductFamily,
		 getProductLinesData, createProductLine, updateProductLine, deleteProductLine,
		 getProductsData, createProduct, updateProduct, deleteProduct,
		 getProductQuantitiesByLine, getProductQuantitiesByFamily, getProductQuantitiesByCategory, quickAddProduct} from '../controllers/product.js';
import { getManufacturesData, createManufacture, updateManufacture, deleteManufacture, 
		 getTagsData, createTag, updateTag, deleteTag,
		 getLocationsData, createLocation, updateLocation, deleteLocation, } from '../controllers/settings.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'uploads/');
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/login', login);
router.post('/signup', signup);
router.post('/resetpass', resetPass);
router.get('/changepass/:id', verifyChangePass);
router.post('/newpassword', newPass);
router.get('/private', isAuth);

/* ----- price ----- */
// price group
router.get('/price/getheaderdata/:tableId', getHeaderData);
router.get('/price/gettabledata/:tableId', getTableData);
router.get('/price/getpricegroupsdata', getPriceGroupsData);
router.post('/price/creategroup', createPriceGroup);
router.post('/price/updategroup', updatePriceGroup);
router.post('/price/addpricepoint', addPricePoint);
router.post('/price/setfree', setFree);
router.post('/price/validation', priceValidation);
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
/* ----- price ----- */

/* ----- product ----- */
// Product category
router.get('/product/getproductcategoriesdata', getProductCategoriesData);
router.post('/product/createproductcategory', upload.array('img', 3),  createProductCategory);
router.post('/product/updateproductcategory', upload.array('img', 3),  updateProductCategory);
router.post('/product/saveproductcategory', saveProductCategory);
router.post('/product/deleteproductcategory', deleteProductCategory);
router.post('/product/quickaddproduct', quickAddProduct);


// Product family
router.get('/product/getproductfamiliesdata/:categoryId', getProductFamiliesData);
router.post('/product/createproductfamily', upload.array('img', 3),  createProductFamily);
router.post('/product/updateproductfamily', upload.array('img', 3),  updateProductFamily);
router.post('/product/deleteproductfamily', deleteProductFamily);

// Product Line
router.get('/product/getproductlinesdata/:familyId', getProductLinesData);
router.post('/product/createproductline',  createProductLine);
router.post('/product/updateproductline', updateProductLine);
router.post('/product/deleteproductline', deleteProductLine);

// Products
router.get('/product/getproductsdata/', getProductsData);
router.post('/product/createproduct', createProduct);
router.post('/product/updateproduct', updateProduct);
router.post('/product/deleteproduct', deleteProduct);
router.get('/product/getquantitiesbyline', getProductQuantitiesByLine);
router.get('/product/getquantitiesbyfamily', getProductQuantitiesByFamily);
router.get('/product/getquantitiesbycategory', getProductQuantitiesByCategory);

/* ----- product ----- */

// Settings/Manufactures
router.get('/settings/getmanufacturesdata/', getManufacturesData);
router.post('/settings/createmanufacture', createManufacture);
router.post('/settings/updatemanufacture', updateManufacture);
router.post('/settings/deletemanufacture', deleteManufacture);

// Settings/Tags
router.get('/settings/gettagsdata/', getTagsData);
router.post('/settings/createtag', createTag);
router.post('/settings/updatetag', updateTag);
router.post('/settings/deletetag', deleteTag);

// Settings/Locations
router.get('/settings/getlocationsdata/', getLocationsData);
router.post('/settings/createlocation', createLocation);
router.post('/settings/updatelocation', updateLocation);
router.post('/settings/deletelocation', deleteLocation);

router.get('/public', (req, res, next) => {
	res.status(200).json({ message: "here is your public resource" });
});

router.use('/', (req, res, next) => {
	console.log("..");
	console.log(req.body);
	res.status(404).json({error : "page not found"});
});

export default router;