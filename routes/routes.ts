import express from "express";
import multer from "multer";

import {
  signup,
  login,
  logout,
  isAuth,
  resetPass,
  verifyChangePass,
  newPass,
  refreshToken,
  getTestToken,
} from "../controllers/auth";
import {
  getDrivers,
} from "../controllers/user";
import {
  createPriceGroup,
  addPricePoint,
  getTableData,
  getPriceGroupsData,
  getPriceGroupValue,
  getPriceDataByGroup,
  getHeaderData,
  setFree,
  priceValidation,
  setPriceData,
  setExtraDay,
  deleteGroup,
  deletePricePoint,
  updatePriceGroup,
  getSeasonsData,
  saveSeasonCell,
  deleteSeason,
  getBrandsData,
  saveBrandCell,
  deleteBrand,
  getPriceTablesData,
  savePriceTableCell,
  deletePriceTable,
  clonePriceTableCell,
  getPriceLogicData,
  createPriceLogic,
  deletePriceLogic,
  getPriceGroupActiveDataByTableId,
  setActiveGroup,
} from "../controllers/price";
import {
  getProductCategoriesData,
  createProductCategory,
  updateProductCategory,
  saveProductCategory,
  deleteProductCategory,
  getProductFamiliesData,
  getProductFamiliesDataByDisplayName,
  createProductFamily,
  updateProductFamily,
  deleteProductFamily,
  getProductLinesData,
  getProductLinesDataByCategory,
  createProductLine,
  updateProductLine,
  deleteProductLine,
  getProductsData,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductQuantitiesByLine,
  getProductQuantitiesByFamily,
  getProductQuantitiesByCategory,
  quickAddProduct,
} from "../controllers/product";
import {
  getManufacturesData,
  createManufacture,
  updateManufacture,
  deleteManufacture,
  getTagsData,
  createTag,
  updateTag,
  deleteTag,
  getLocationsData,
  createLocation,
  updateLocation,
  deleteLocation,
  getCountriesData,
  createCountry,
  updateCountry,
  deleteCountry,
  getLanguagesData,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getDocumentsData,
  createDocument,
  updateDocument,
  deleteDocument,
  getReservationTypesData,
  createReservationType,
  updateReservationType,
  deleteReservationType,
  getExtrasData,
  createExtra,
  updateExtra,
  deleteExtra,
  getTrucksData,
  createTruck,
  updateTruck,
  deleteTruck,
  getTimezonesData,
  createTimezone,
  updateTimezone,
  deleteTimezone,
  getCurrenciesData,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  getDateformatsData,
  createDateformat,
  updateDateformat,
  deleteDateformat,
  getTimeformatsData,
  createTimeformat,
  updateTimeformat,
  deleteTimeformat,
  getStoreDetail,
  getStoreDetailByStoreURL,
  updateStoreDetail,
  getDiscountCodesData,
  createDiscountCode,
  quickAddDiscountCodesData,
  updateDiscountCode,
  deleteDiscountCode,
  getExclusionsData,
  createExclusion,
  updateExclusion,
  deleteExclusion,
  deleteExclusionByDCId,
  getTaxcodesData,
  createTaxcode,
  updateTaxcode,
  deleteTaxcode,
  getColorcombinationsData,
  createColorcombination,
  updateColorcombination,
  deleteColorcombination,
} from "../controllers/settings";
import {
  getCustomersData,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getDeliveryAddressData,
  createDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  deleteDeliveryAddressByCustomerId,
} from "../controllers/customer";
import {
  getReservationsData,
  createReservation,
  getReservationDetails,
  getReservationsList,
  updateReservation,
  createTransaction,
  getTransactionsData,
  removeReservationItem,
  verifyQuantity,
} from "../controllers/reservations";

import {
  createCustomerStripe,
  retriveCustomerStripe,
  createCardToCustomer,
  addAndSaveCard,
  addCardTokenToCustomer,
  detachCardTokenToCustomer,
  addPaymentMethodToCustomer,
  makePayment,
  listPaymentMethods,
} from "../controllers/stripe.js";
import { getOrders, getOrdersById, getOrdersData } from "../controllers/orders.js";


const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "uploads/");
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);
router.post("/resetpass", resetPass);
router.get("/changepass/:id", verifyChangePass);
router.post("/newpassword", newPass);
router.get("/private", isAuth);
router.post("/refresh-token", refreshToken);
router.get("/auth/ttt", getTestToken);

// user
router.get("/user/getdrivers", getDrivers);

/* ----- price ----- */
// price table detail
router.get("/price/getheaderdata/:tableId", getHeaderData);
router.get("/price/getpricegroupactivedatabytableid/:tableId", getPriceGroupActiveDataByTableId);
router.get("/price/gettabledata/:tableId", getTableData);
router.get("/price/getpricegroupsdata", getPriceGroupsData);
router.post("/price/getpricegroupvalue", getPriceGroupValue);
router.post("/price/getpricedatabygroup", getPriceDataByGroup);
router.post("/price/creategroup", createPriceGroup);
router.post("/price/updategroup", updatePriceGroup);
router.post("/price/addpricepoint", addPricePoint);
router.post("/price/setfree", setFree);
router.post("/price/validation", priceValidation);
router.post("/price/setpricedata", setPriceData);
router.post("/price/setextraday", setExtraDay);
router.post("/price/deletegroup", deleteGroup);
router.post("/price/deletepricepoint", deletePricePoint);
router.post("/price/setactivegroup", setActiveGroup);

// Seasons management
router.get("/price/getseasonsdata", getSeasonsData);
router.post("/price/saveseasoncell", saveSeasonCell);
router.post("/price/deleteseason", deleteSeason);

// Brands management
router.get("/price/getbrandsdata", getBrandsData);
router.post("/price/savebrandcell", saveBrandCell);
router.post("/price/deletebrand", deleteBrand);

// PriceTables management
router.get("/price/getpricetablesdata", getPriceTablesData);
router.post("/price/savepricetablecell", savePriceTableCell);
router.post("/price/deletepricetable", deletePriceTable);
router.post("/price/clonepricetablecell", clonePriceTableCell);

// PriceLogic management
router.get("/price/getpricelogicdata", getPriceLogicData);
router.post("/price/createpricelogic", createPriceLogic);
router.post("/price/deletepricelogic", deletePriceLogic);

/* ----- product ----- */
// Product category
router.get("/product/getproductcategoriesdata", getProductCategoriesData);
router.post(
  "/product/createproductcategory",
  upload.array("img", 3),
  createProductCategory
);
router.post(
  "/product/updateproductcategory",
  upload.array("img", 3),
  updateProductCategory
);
router.post("/product/saveproductcategory", saveProductCategory);
router.post("/product/deleteproductcategory", deleteProductCategory);
router.post("/product/quickaddproduct", quickAddProduct);

// Product family
router.get(
  "/product/getproductfamiliesdata/:categoryId",
  getProductFamiliesData
);
router.get(
  "/product/getproductfamiliesdatabydiplayname/:categoryId",
  getProductFamiliesDataByDisplayName
);
router.post(
  "/product/createproductfamily",
  upload.array("img", 3),
  createProductFamily
);
router.post(
  "/product/updateproductfamily",
  upload.array("img", 3),
  updateProductFamily
);
router.post("/product/deleteproductfamily", deleteProductFamily);

// Product Line
router.get("/product/getproductlinesdata/:familyId", getProductLinesData);
router.get("/product/getproductlinesdata2/:categoryId", getProductLinesDataByCategory);
router.post("/product/createproductline", createProductLine);
router.post("/product/updateproductline", updateProductLine);
router.post("/product/deleteproductline", deleteProductLine);

// Products
router.post("/product/getproductsdata/", getProductsData);
router.post("/product/createproduct", createProduct);
router.post("/product/updateproduct", updateProduct);
router.post("/product/deleteproduct", deleteProduct);
router.get("/product/getquantitiesbyline", getProductQuantitiesByLine);
router.get("/product/getquantitiesbyfamily", getProductQuantitiesByFamily);
router.get("/product/getquantitiesbycategory", getProductQuantitiesByCategory);

/* ----- settings ----- */
// Settings/Manufactures
router.get("/settings/getmanufacturesdata/", getManufacturesData);
router.post("/settings/createmanufacture", createManufacture);
router.post("/settings/updatemanufacture", updateManufacture);
router.post("/settings/deletemanufacture", deleteManufacture);

// Settings/Tags
router.get("/settings/gettagsdata/", getTagsData);
router.post("/settings/createtag", createTag);
router.post("/settings/updatetag", updateTag);
router.post("/settings/deletetag", deleteTag);

// Settings/Locations
router.get("/settings/getlocationsdata/", getLocationsData);
router.post("/settings/createlocation", createLocation);
router.post("/settings/updatelocation", updateLocation);
router.post("/settings/deletelocation", deleteLocation);

// Settings/Countries
router.get("/settings/getcountriesdata/", getCountriesData);
router.post("/settings/createcountry", createCountry);
router.post("/settings/updatecountry", updateCountry);
router.post("/settings/deletecountry", deleteCountry);

// Settings/Languages
router.get("/settings/getlanguagesdata/", getLanguagesData);
router.post("/settings/createlanguage", createLanguage);
router.post("/settings/updatelanguage", updateLanguage);
router.post("/settings/deletelanguage", deleteLanguage);

// Settings/Document
router.get("/settings/getdocumentsdata", getDocumentsData);
router.post("/settings/createdocument", upload.array("img", 3), createDocument);
router.post("/settings/updatedocument", upload.array("img", 3), updateDocument);
router.post("/settings/deletedocument", deleteDocument);

// Settings/ReservationType
router.get("/settings/getreservationtypesdata", getReservationTypesData);
router.post(
  "/settings/createreservationtype",
  upload.array("img", 3),
  createReservationType
);
router.post(
  "/settings/updatereservationtype",
  upload.array("img", 3),
  updateReservationType
);
router.post("/settings/deletereservationtype", deleteReservationType);

// Settings/Trucks
router.get("/settings/gettrucksdata/", getTrucksData);
router.post("/settings/createtruck", createTruck);
router.post("/settings/updatetruck", updateTruck);
router.post("/settings/deletetruck", deleteTruck);

// Settings/Timezones
router.get("/settings/gettimezonesdata/", getTimezonesData);
router.post("/settings/createtimezone", createTimezone);
router.post("/settings/updatetimezone", updateTimezone);
router.post("/settings/deletetimezone", deleteTimezone);

// Settings/Currencies
router.get("/settings/getcurrenciesdata/", getCurrenciesData);
router.post("/settings/createcurrency", createCurrency);
router.post("/settings/updatecurrency", updateCurrency);
router.post("/settings/deletecurrency", deleteCurrency);

// Settings/Dateformats
router.get("/settings/getdateformatsdata/", getDateformatsData);
router.post("/settings/createdateformat", createDateformat);
router.post("/settings/updatedateformat", updateDateformat);
router.post("/settings/deletedateformat", deleteDateformat);

// Settings/Timeformats
router.get("/settings/gettimeformatsdata/", getTimeformatsData);
router.post("/settings/createtimeformat", createTimeformat);
router.post("/settings/updatetimeformat", updateTimeformat);
router.post("/settings/deletetimeformat", deleteTimeformat);

// Settings store detail
router.get("/settings/getstoredetail/:brandId", getStoreDetail);
router.post("/settings/getstoredetailbyurl/", getStoreDetailByStoreURL);
router.post(
  "/settings/updatestoredetail",
  upload.array("img", 3),
  updateStoreDetail
);

// Settings/DiscountCodes
router.get("/settings/getdiscountcodesdata", getDiscountCodesData);
router.post("/settings/creatediscountcode", createDiscountCode);
router.post("/settings/quickadddiscountcode", quickAddDiscountCodesData);
router.post("/settings/updatediscountcode", updateDiscountCode);
router.post("/settings/deletediscountcode", deleteDiscountCode);

// Settings/Exclusion
router.post("/settings/getexclusionsdata", getExclusionsData);
router.post("/settings/createexclusion", createExclusion);
router.post("/settings/updateexclusion", updateExclusion);
router.post("/settings/deleteexclusion", deleteExclusion);
router.post("/settings/deleteexclusionbydcid", deleteExclusionByDCId);

// Settings/Taxcodes
router.get("/settings/gettaxcodesdata/", getTaxcodesData);
router.post("/settings/createtaxcode", createTaxcode);
router.post("/settings/updatetaxcode", updateTaxcode);
router.post("/settings/deletetaxcode", deleteTaxcode);

// Settings/Colorcombinations
router.get("/settings/getcolorcombinationsdata/", getColorcombinationsData);
router.post("/settings/createcolorcombination", createColorcombination);
router.post("/settings/updatecolorcombination", updateColorcombination);
router.post("/settings/deletecolorcombination", deleteColorcombination);

/* ----- customer ----- */
// Customer/Customers
router.get("/customer/getcustomersdata", getCustomersData);
router.post("/customer/createcustomer", createCustomer);
router.post("/customer/updatecustomer", updateCustomer);
router.post("/customer/deletecustomer", deleteCustomer);

// Customer/Customers
router.post("/customer/getdeliveryaddressesdata", getDeliveryAddressData);
router.post("/customer/createdeliverydddress", createDeliveryAddress);
router.post("/customer/updatedeliverydddress", updateDeliveryAddress);
router.post("/customer/deletedeliverydddress", deleteDeliveryAddress);
router.post(
  "/customer/deletedeliveryaddressbycid",
  deleteDeliveryAddressByCustomerId
);

// Settings/Extras
router.get("/settings/getextrasdata", getExtrasData);
router.post(
  "/settings/createextra",
  upload.array("img", 3),
  createExtra
);
router.post(
  "/settings/updateextra",
  upload.array("img", 3),
  updateExtra
);
router.post("/settings/deleteextra", deleteExtra);

/* ----- Reservations ----- */
// Reservations
router.get("/reservations/getreservationsdata/", getReservationsData);
router.post("/reservations/createreservation/", createReservation);
router.get("/reservations/getreservationslist/", getReservationsList);
router.get("/reservations/getreservationdetails/:id", getReservationDetails);
router.post("/reservations/updatereservation", updateReservation);

router.post("/reservation/createtransaction/", createTransaction);
router.post("/reservation/gettransactionsdata/", getTransactionsData);
router.post("/reservation/removereservationitem/", removeReservationItem);
router.post("/reservation/verifyQuantity/", verifyQuantity);

/* ----- Stripe ----- */
router.post("/createcustomerstripe/", createCustomerStripe);
router.post("/retrivecustomerstripe/", retriveCustomerStripe);
router.post("/createcardtocustomer/", createCardToCustomer);
router.post("/addandsavecard/", addAndSaveCard);
router.post("/addpaymentmethodtocustomer/", addPaymentMethodToCustomer);
router.post("/stripe/addcardtokentocustomer/", addCardTokenToCustomer);
router.post("/stripe/detachcardtokentocustomer/", detachCardTokenToCustomer);
router.post("/stripe/makepayment/", makePayment);
router.post("/stripe/listpaymentmethods/", listPaymentMethods);

// Orders
router.get("/orders", getOrders)
router.get("/orders/:id", getOrdersById)
router.get("/order/getordersdata/", getOrdersData);

router.get("/public", (req, res, next) => {
  res.status(200).json({ message: "here is your public resource" });
});

router.use("/", (req, res, next) => {
  console.log("..");
  console.log(req.body);
  res.status(404).json({ error: "page not found" });
});

export default router;
