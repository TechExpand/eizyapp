
import { TOKEN_SECRET, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, validateEmail } from "../helpers/utility";
import { Request, Response } from 'express';
import { Op, where } from "sequelize";
import { UserState, UserStatus, Users } from "../models/Users";
import { compare, hash } from "bcryptjs"
import config from '../config/configSetup';
import countries from '../config/countries.json';
import platform from '../config/platform.json';
import { Numbers } from "../models/Number";
const fs = require("fs");
const axios = require('axios')




export const fetchCountryG = async (req: Request, res: Response) => {
  const response = countries;
  return successResponse(res, "Successful", response);
}



export const fetchPlaformsG = async (req: Request, res: Response) => {
  const response = platform;
  return successResponse(res, "Successful", response);
}



export const fetchPriceG = async (req: Request, res: Response) => {

  const { country, service } = req.query;
  const response = await axios({
    method: 'get',
    url: `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${config.GRIZZLY_NUMBER_API_KEY}&action=getPrices&service=${service}&country=${country}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  console.log(response.data)
  let finalPrice = 0;
  let price = (Number(response.data[`${country}`][`${service}`]["cost"]) / 90.84)
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
      count: response.data[`${country}`][`${service}`]["count"],
      cost: finalPrice,
      final: price.toFixed(2),
      original: response.data[`${country}`][`${service}`]["cost"]
    });
}




export const fetchNewNumberG = async (req: Request, res: Response) => {
  const { country, service, countryName, serviceName } = req.query;
  const { id } = req.user;
  const response = await axios({
    method: 'get',
    url: `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${config.GRIZZLY_NUMBER_API_KEY}&action=getNumber&service=${service}&country=${country}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
  if (response.data.toString().includes("ACCESS_NUMBER")) {

    let values = response.data.toString().split(":")
    const number = await Numbers.create({
      userId: id,
      activationCode: values[1], phoneNumber: values[2], status: "", serviceName, countryName
    })
    return successResponse(res, "Successful", number);
  }
  else if (response.data.toString().includes("NO_CHANNELS") ||
    response.data.toString().includes("NO_NUMBERS")) {
    const response = await axios({
      method: 'get',
      url: `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${config.GRIZZLY_NUMBER_API_KEY}&action=getNumber&service=${service}&country=${country}`,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    })
    if (response.data.toString().includes("ACCESS_NUMBER")) {
      let values = response.data.toString().split(":")
      const number = await Numbers.create({
        userId: id,
        activationCode: values[1], phoneNumber: values[2], status: "", serviceName, countryName
      })
      return successResponse(res, "Successful", number);
    } else {
      return errorResponse(res, "Successful", response.data);
    }
  }
  else {
    return errorResponse(res, "Successful", response.data);
  }
}




export const fetchNumberStatusG = async (req: Request, res: Response) => {
  const { activationKey } = req.query;
  const { id } = req.user;
  const response = await axios({
    method: 'get',
    url: `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${config.GRIZZLY_NUMBER_API_KEY}&action=getStatus&id=${activationKey}`,
    // url: `https://api.sms-man.com/stubs/handler_api.php?action=getStatus&api_key=${config.NUMBER_API_KEY}&id=${activationKey}`,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  })
   console.log(response.data)
  const number = await Numbers.findOne({ where: { activationCode: activationKey } })
  if (number) {
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
    if (response.data.toString().includes("STATUS_OK") || response.data.toString().includes("STATUS_WAIT_RETRY")) {
      let value = response.data.toString().split(":")
      console.log(value[1])
      const number = await Numbers.create({
        userId: id,
        activationCode: activationKey, phoneNumber: "", status: value[0], code: value[1]
      })
      return successResponse(res, "Successful", number);
    }

    else {
      const number = await Numbers.create({
        userId: id,
        activationCode: activationKey, phoneNumber: "", status: response.data,
      })
      return successResponse(res, "Successful", number);
    }
  }
}





