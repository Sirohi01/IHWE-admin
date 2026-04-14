import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/auth/userSlice";
import categoryReducer from "../features/add_by_admin/category/categorySlice";
import natureReducer from "../features/add_by_admin/nature/natureSlice";
import countryReducer from "../features/add_by_admin/country/countrySlice";
import stateReducer from "../features/state/stateSlice";
import cityReducer from "../features/city/citySlice";
import dataSourceReducer from "../features/add_by_admin/dataSource/dataSourceSlice";
import crmEventReducer from "../features/crmEvent/crmEventSlice";
import companyReducer from "../features/company/companySlice";
import statusOptionReducer from "../features/add_by_admin/statusOption/statusOptionSlice";
import bankReducer from "../features/add_by_admin/banks/bankSlice";
import crmMessageReducer from "../features/add_by_admin/crm_wat_mess/CrmWatMessage";
import authReducer from "../features/auth/authSlice";
import crmExhibatorReviewReducer from "../features/crm-exhibator-reviews/crmExhibatorReviewSlice";
import estimateReducer from "../features/estimates/estimateSlice";
import performaInvoiceReducer from "../features/performaInvoice/performaInvoiceSlice";
import invoiceReducer from "../features/invoice/invoiceSlice";
import creditNoteReducer from "../features/creditNote/creditNoteSlice";
import paymentReducer from "../features/payment/paymentSlice";
import activityLogReducer from "../features/activityLog/activityLogSlice";
import corporateVisitorReducer from "../features/visitor/corporateVisitorSlice";
import generalVisitorReducer from "../features/visitor/generalVisitorSlice";
import healthCampVisitorReducer from "../features/visitor/freeHealthCampSlice";
import visitorReviewReducer from "../features/visitor/visitorReviewSlice";
import businessTypeReducer from "../features/add_by_admin/business/BusinessTypeSlice";
import annualTurnoverReducer from "../features/add_by_admin/annual_turnover/AnnualTurnoverSlice";

export const store = configureStore({
  reducer: {
    users: userReducer,
    categories: categoryReducer,
    natures: natureReducer,
    countries: countryReducer,
    activityLog: activityLogReducer,
    states: stateReducer,
    cities: cityReducer,
    dataSources: dataSourceReducer,
    crmEvents: crmEventReducer,
    companies: companyReducer,
    statusOptions: statusOptionReducer,
    banks: bankReducer,
    crmMessages: crmMessageReducer,
    auth: authReducer,
    reviews: crmExhibatorReviewReducer,
    estimates: estimateReducer,
    perinvoice: performaInvoiceReducer,
    invoice: invoiceReducer,
    creditnotes: creditNoteReducer,
    payment: paymentReducer,
    corporateVisitors: corporateVisitorReducer,
    generalVisitors: generalVisitorReducer,
    healthCampVisitors: healthCampVisitorReducer,
    visitorReview: visitorReviewReducer,
    businessTypes: businessTypeReducer,
    annualTurnover: annualTurnoverReducer,
  },
});

export default store;
