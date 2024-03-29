const axios = require("axios");
import { Resend } from 'resend';
import config from '../config/configSetup';






export const sendEmail = async (email: String, subject: String, template: String)=>{
  const response = await axios.post(
      `https://api.brevo.com/v3/smtp/email`,
      {
        "sender":{  
          "name": "Eizy App",
          "email":"support@eizyapp.com"
       },
       "to":[  
          {  
             "email": email,
             "name": "User"
          }
       ],
       subject: `${subject}`,
       "htmlContent":  `${template}`
      },
      {
        headers: {
          "api-key": config.BREVO,
          "accept": "application/json",
          'Content-Type': ['application/json', 'application/json']
        }
      }
    );

    if (response.status <= 300) {
      return {
          status: true,
        message: response.data,
      }
    } else {
      return  {
        status: false,
        message: response.data,
      };
    }
}