// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { fetchCountry, fetchNewNumber, fetchNumberStatus, fetchPlaforms, fetchPrice, fetchUserNumber } from '../controllers';
import { fetchCountryG, fetchNewNumberG, fetchNumberStatusG, fetchPlaformsG, fetchPriceG } from '../controllers/grizzlyIndex';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/g/country', fetchCountryG);
routes.get('/user/g/platform', fetchPlaformsG);
routes.get('/user/g/price', fetchPriceG);
routes.get('/user/g/number', fetchNewNumberG);
routes.get('/user/g/status', fetchNumberStatusG);
routes.get('/test', testApi);






export default routes;
