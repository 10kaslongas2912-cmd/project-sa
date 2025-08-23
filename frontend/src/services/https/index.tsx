import type { UsersInterface } from "../../interfaces/IUser";
import type { SignInInterface } from "../../interfaces/SignIn";
import axios from "axios";
const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};


async function SignIn(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/signin`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function GetGender() {
  return await axios
    .get(`${apiUrl}/genders`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function GetUsers() {
  return await axios
    .get(`${apiUrl}/users`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function GetUsersById(id: string) {
  return await axios
    .get(`${apiUrl}/user/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);

}


async function UpdateUsersById(id: string, data: UsersInterface) {
  return await axios
    .put(`${apiUrl}/user/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeleteUsersById(id: string) {
  return await axios
    .delete(`${apiUrl}/user/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreateUser(data: UsersInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPaymentMethods() {
  return await axios
    .get(`${apiUrl}/payment-methods`, requestOptions) // Changed /paymentmethods to /payment-methods
    .then((res) => res)
    .catch((e) => e.response);
}

import type { DonorsInterface } from '../../interfaces/Donors';
import type { MoneyDonationsInterface } from '../../interfaces/MoneyDonations';
import type { ItemDonationsInterface } from '../../interfaces/ItemDonations';

async function CreateDonation(
  donorInfo: DonorsInterface,
  donationType: string,
  moneyDetails?: MoneyDonationsInterface,
  itemDetails?: ItemDonationsInterface[]
) {
  const payload: any = { // Construct payload dynamically
    donor_info: donorInfo,
    donation_type: donationType,
  };

  if (moneyDetails) {
    payload.money_donation_details = moneyDetails;
  }
  if (itemDetails) {
    payload.item_donation_details = itemDetails;
  }

  return await axios
    .post(`${apiUrl}/donations`, payload, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  SignIn,
  GetGender,
  GetUsers,
  GetUsersById,
  UpdateUsersById,
  DeleteUsersById,
  CreateUser,
  GetPaymentMethods,
  CreateDonation, // Added CreateDonation
};