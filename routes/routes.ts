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
  testToken,
} from "../controllers/auth";
import {
  customerSignUp,
  customerLogin,
  adminTry,
  customerNewPass,
} from "../controllers/customerauth";
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
  getBrandDetail,
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
  getProductDetailByBarcode,
  getProductDetailById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductQuantitiesByLine,
  getProductQuantitiesByFamily,
  getProductQuantitiesByCategory,
  quickAddProduct,
  updateBulkLocation,
  updateBulkStatus,
  getDisplayGroupOrder,
  updateOrderIndex,
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
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getReservationTypesData,
  createReservationType,
  updateReservationType,
  deleteReservationType,
  getExtrasData,
  getExtrasDataByDisplayName,
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
  getProductCompatibilitiesData,
  updateCompatibility,
} from "../controllers/settings";
import {
  getCustomersData,
  getUsedDeliveryAddress,
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
  getReservationsCounts,
  createReservation,
  getReservationDetails,
  getReservationsList,
  updateReservation,
  updateReservationItem,
  createTransaction,
  getTransactionsData,
  removeReservationItem,
  removeReservation,
  verifyQuantity,
  exportReservation,
  scanBarcode,
  checkedInBarcode,
  verifyQuantityByDisplayName,
  getAvailableSheet,
  getAvailableSheetEcommerce,
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
  getSecret,
  chargeStripeCard,
  refundStripe,
  sendReservationConfirmationEmail,
  getCustomerIdById,
  addLastPaymentMethosToCustomer,
} from "../controllers/stripe";
import { getOrders, getOrdersById, getOrdersData } from "../controllers/orders.js";
import { getSettingsTemplate, getSettingsTemplateByType, postSettingsTemplate, putSettingsTemplate } from "../controllers/settings_templates";
import { searchAddress, getAddressesData, createAddress, updateAddress, deleteAddress, getForecastingData, getOrderPotential,
  createForecasting, updateForecasting, deleteForecasting, exportForecastingData, getStreetsInAddresses, getPlantationsInAddresses, getPropertyNamesInAddresses, 
  getPlantationsData, updatePlantation, createPlantation, deletePlantation,
  getStreetsData, updateStreet, createStreet, deleteStreet,
  getPropertyNamesData, updatePropertyName, createPropertyName, deletePropertyName,
} from "../controllers/alladdresses";

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
// router.get("/auth/gettesttoken", getTestToken);
router.get("/testtokenvalid", (req, res, next)=>{
  res.status(200).json("valid");
});

// user
router.get("/user/getdrivers", getDrivers);

// customer
router.post("/customer/signup", customerSignUp);
router.post("/customer/login", customerLogin);
router.post("/customer/admintry", adminTry);
router.post("/customer/newpassword", customerNewPass);

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
router.post("/price/getbranddetail", getBrandDetail);
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
router.post("/product/getproductcategoriesdata", getProductCategoriesData);
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
router.get("/product/getdisplaygrouporder", getDisplayGroupOrder);
router.post("/product/updateorderindex", updateOrderIndex);

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
router.post("/products/list", getProductsData);
router.post("/product/getproductdetailbybarcode/", getProductDetailByBarcode);
router.get("/products/:id", getProductDetailById);
router.post("/product/createproduct", createProduct);
router.post("/product/updateproduct", updateProduct);
router.post("/product/deleteproduct", deleteProduct);
router.get("/product/getquantitiesbyline", getProductQuantitiesByLine);
router.get("/product/getquantitiesbyfamily", getProductQuantitiesByFamily);
router.get("/product/getquantitiesbycategory", getProductQuantitiesByCategory);
router.post("/product/updatebulklocation", updateBulkLocation);
router.post("/product/updatebulkstatus", updateBulkStatus);

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
router.get("/settings/getdocumentbyid/:id", getDocumentById);
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
router.post("/customer/getuseddeliveryaddress", getUsedDeliveryAddress);

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
router.post("/settings/getextrasdatabydisplayname", getExtrasDataByDisplayName);
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

// Settings/ProductCompatibilities
router.get("/settings/getproductcompatibilitiesdata", getProductCompatibilitiesData);
router.post("/settings/updatecompatibility", updateCompatibility);

/* ----- Reservations ----- */
// Reservations
router.get("/reservations/getreservationsdata/", getReservationsData);
router.post("/reservations/getreservationsdata/", getReservationsData);
router.post("/reservations/getreservationscounts/", getReservationsCounts);
router.post("/reservations/createreservation/", createReservation);
router.get("/reservations/getreservationslist/", getReservationsList);
router.get("/reservations/list/", getReservationsList);
router.post("/reservations/removereservation/", removeReservation);
router.get("/reservations/getreservationdetails/:id", getReservationDetails);
router.get("/reservation/:id", getReservationDetails);
router.post("/reservations/updatereservation", updateReservation);
router.post("/reservations/updateposition", updateReservation);
router.post("/reservations/updatereservationitem", updateReservationItem);

router.post("/reservation/createtransaction/", createTransaction);
router.post("/reservation/gettransactionsdata/", getTransactionsData);
router.post("/reservation/removereservationitem/", removeReservationItem);
router.post("/reservation/verifyQuantity/", verifyQuantity);
router.post("/reservation/verifyquantitybydisplayname/", verifyQuantityByDisplayName);
router.get("/reservations/exportpdf/:id/:tc", exportReservation);
router.post("/reservation/scanbarcode/", scanBarcode);
router.post("/reservation/checkedinbarcode/", checkedInBarcode);
router.post("/reservations/getavailablesheet", getAvailableSheet);
router.post("/reservations/getavailablesheetecommerce", getAvailableSheetEcommerce);

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
router.post("/stripe/getsecret/", getSecret);
router.post("/stripe/chargeStripeCard/", chargeStripeCard);
router.post("/stripe/sendreservationconfirmationemail/", sendReservationConfirmationEmail);
router.post("/stripe/refund/", refundStripe);
router.post("/stripe/getcustomeridbyid/", getCustomerIdById);
router.post("/stripe/addlastpaymentmethostocustomer/", addLastPaymentMethosToCustomer);

// Orders
router.get("/orders", getOrders)
router.get("/orders/:id", getOrdersById)
router.get("/order/getordersdata/", getOrdersData);

// Templates
router.post("/settings/templates", postSettingsTemplate)
router.get("/settings/templates", getSettingsTemplate)
router.put("/settings/templates", putSettingsTemplate)
router.get("/settings/templates/:typeTemplate", getSettingsTemplateByType)

//add addresses
router.get("/address/search/:str/:store_id", searchAddress);
router.post("/alladdresses/getaddressesdata/", getAddressesData);
router.post("/alladdresses/createaddress", createAddress);
router.post("/alladdresses/updateaddress", updateAddress);
router.post("/alladdresses/deleteaddress", deleteAddress);
router.get("/alladdresses/getstreets", getStreetsInAddresses);
router.get("/alladdresses/getplantations", getPlantationsInAddresses);
router.get("/alladdresses/getpropertynames", getPropertyNamesInAddresses);

router.get("/alladdresses/getplantationsdata/", getPlantationsData);
router.post("/alladdresses/createplantation", createPlantation);
router.post("/alladdresses/updateplantation", updatePlantation);
router.post("/alladdresses/deleteplantation", deletePlantation);

router.get("/alladdresses/getstreetsdata/", getStreetsData);
router.post("/alladdresses/createstreet", createStreet);
router.post("/alladdresses/updatestreet", updateStreet);
router.post("/alladdresses/deletestreet", deleteStreet);

router.get("/alladdresses/getpropertynamesdata/", getPropertyNamesData);
router.post("/alladdresses/createpropertyname", createPropertyName);
router.post("/alladdresses/updatepropertyname", updatePropertyName);
router.post("/alladdresses/deletepropertyname", deletePropertyName);

router.post("/forecasting/create", createForecasting);
router.post("/forecasting/update", updateForecasting);
router.post("/forecasting/delete", deleteForecasting);
router.post("/forecasting/getsummary", getForecastingData);
router.get("/forecasting/exportforecasting", exportForecastingData);

router.post("/marketing/orderpotential", getOrderPotential);

router.get("/public", (req, res, next) => {
  res.status(200).json({ message: "here is your public resource" });
});

router.get("/testtoken", (req, res, next) => {
  res.status(200).json({ message: 'Token is valid' });
});

router.use("/", (req, res, next) => {
  res.status(404).json({ error: "page not found" });
});

export default router;
