// Import packages
import { Router } from 'express';
import {  changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { fetchCountry, fetchNewNumber, fetchNumberStatus, fetchPlaforms, fetchPrice, fetchUserNumber } from '../controllers';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/country', fetchCountry);
routes.get('/user/platform', fetchPlaforms);
routes.get('/user/price', fetchPrice);
routes.get('/user/number', fetchNewNumber);
routes.get('/user/status', fetchNumberStatus);
routes.get('/user/numbers', fetchUserNumber);
routes.get('/test', testApi);






export default routes;
