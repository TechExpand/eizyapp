
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs"
import config from '../config/configSetup';;
import { sign } from "jsonwebtoken";
import { compareTwoStrings } from 'string-similarity';

// yarn add stream-chat
import { StreamChat } from 'stream-chat';
import { Sequelize } from "sequelize-typescript";
import { Verify } from "../models/Verify";
import { sendEmail } from "../services/sms";
import { templateEmail } from "../config/template";
import { Numbers } from "../models/Number";
const fs = require("fs");
const axios = require('axios')




export const fetchCountry = async (req: Request, res: Response) => {
  const response = await axios({
    method: 'get',
    url: `https://api.sms-man.com/stubs/handler_api.php?action=getCountries&api_key=${config.NUMBER_API_KEY}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  const countriesArray = Object.values(response.data);
  return successResponse(res, "Successful", countriesArray);
}



export const fetchPlaforms = async (req: Request, res: Response) => {
  const response = await axios({
    method: 'get',
    url: `https://api.sms-man.com/stubs/handler_api.php?action=getServices&api_key=${config.NUMBER_API_KEY}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  return successResponse(res, "Successful", response.data);
}



export const fetchPrice = async (req: Request, res: Response) => {
  const { country, service } = req.query;
  const response = await axios({
    method: 'get',
    url: `https://api.sms-man.com/stubs/handler_api.php?action=getPrices&api_key=${config.NUMBER_API_KEY}&country=${country}&service=${service}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  let finalPrice = 0;
  let price = (Number(response.data[`${service}`]["cost"]) / 90.84)
  if (price > 1.5 && price < 2.5) {
    finalPrice = 10000
  } else if (price > 2.5 && price < 3.5) {
    finalPrice = 15000
  } else if (price > 0 && price < 1.5) {
    finalPrice = 6000;
  } else if (price > 3.5 && price < 4.5) {
    finalPrice = 20000;
  } else {
    finalPrice = 70000;
  }

  return successResponse(res, "Successful",
    {
      count: response.data[`${service}`]["count"],
      cost: finalPrice,
      final: price.toFixed(2),
      original: response.data[`${service}`]["cost"]
    });
}




export const fetchNewNumber = async (req: Request, res: Response) => {
  const { country, service, countryName, serviceName } = req.query;
  const { id } = req.user;
  const response = await axios({
    method: 'get',
    url: `https://api.sms-man.com/stubs/handler_api.php?action=getNumber&api_key=${config.NUMBER_API_KEY}&service=${service}&country=${country}&ref=-_8s_ZMXSfNq`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  if (response.data.toString().includes("ACCESS_NUMBER")) {
    console.log(response.data);
    let values = response.data.toString().split(":")
    const number = await Numbers.create({
      userId: id,
      activationCode: values[1], phoneNumber: values[2], status: "", serviceName, countryName
    })
    return successResponse(res, "Successful", number);
  } else if (response.data.toString().includes("NO_CHANNELS")) {
    const response = await axios({
      method: 'get',
      url: `https://api.sms-man.com/stubs/handler_api.php?action=getNumber&api_key=${config.NUMBER_API_KEY}&service=${service}&country=${country}&ref=-_8s_ZMXSfNq`,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    })
    if (response.data.toString().includes("ACCESS_NUMBER")) {
      console.log(response.data);
      let values = response.data.toString().split(":")
      const number = await Numbers.create({
        userId: id,
        activationCode: values[1], phoneNumber: values[2], status: "", serviceName, countryName
      })
      return successResponse(res, "Successful", number);
    } else {
      return errorResponse(res, "Successful", response.data);
    }
  } else {
    return errorResponse(res, "Successful", response.data);
  }
}




export const fetchNumberStatus = async (req: Request, res: Response) => {
  const { activationKey } = req.query;
  const { id } = req.user;
  const response = await axios({
    method: 'get',
    url: `https://api.sms-man.com/stubs/handler_api.php?action=getStatus&api_key=${config.NUMBER_API_KEY}&id=${activationKey}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  const number = await Numbers.findOne({ where: { activationCode: activationKey } })
  if (number) {
    console.log(response.data.toString())
    if (response.data.toString().includes("STATUS_OK") || response.data.toString().includes("STATUS_WAIT_RETRY")) {
      let value = response.data.toString().split(":")
      await number?.update({ status: value[0], code: value[1] })
      const numberNew = await Numbers.findOne({ where: { activationCode: activationKey } })
      return successResponse(res, "Successful", numberNew);
    } else {
      await number?.update({ status: response.data })
      const numberNew = await Numbers.findOne({ where: { activationCode: activationKey } })
      return successResponse(res, "Successful", numberNew);
    }
  } else {
    console.log(response.data.toString())
    if (response.data.toString().includes("STATUS_OK") || response.data.toString().includes("STATUS_WAIT_RETRY")) {
      let value = response.data.toString().split(":")
      console.log(value[1])
      const number = await Numbers.create({
        userId: id,
        activationCode: activationKey, phoneNumber: "", status: value[0], code: value[1]
      })
      return successResponse(res, "Successful", number);
    } else {
      const number = await Numbers.create({
        userId: id,
        activationCode: activationKey, phoneNumber: "", status: response.data,
      })
      return successResponse(res, "Successful", number);
    }

  }
}






export const fetchUserNumber = async (req: Request, res: Response) => {
  const { id } = req.user;
  const number = await Numbers.findAll({
    where: { userId: id },
    order: [
      ['id', 'DESC']
    ],
  })
  return successResponse(res, "Successful", number);

}



// export const sendEmailTest = async (req: Request, res: Response) => {
//   let value = await sendEmail("", "")
//   return successResponse(res, "Successful", value);

// }

