const currentMatchingSystem = 'prod';
const currentPaymentSystem = 'prod';
import axios from 'axios';

const baseMatchingUrls = {
  dev: 'http://192.168.1.6:8000',
  prod: 'https://king-prawn-app-xjfwg.ondigitalocean.app',
};

const basePaymentUrls = {
  dev: 'http://192.168.1.6:3000',
  prod: 'https://seashell-app-sqjrj.ondigitalocean.app',
};

export const matchingUrls = {
  ONLINE: '/online',
  DAILY_USER_REPORTS: '/dailyUserReports',
  CHAT_REQUEST: '/user',
  COMMON_LIKES: '/commonLikes',
  CHAT_ROOMS: '/chatrooms',
  COUNTRIES: '/countries',
  REPORT_USER: '/reportUser',
  REMOVE_USERS: '/removeUsers',
  SKIP_CHAT: '/removeChat',
  REMOVE_REQUEST: '/removeRequest',
};

export const paymentUrls = {
  VERIFY_PAYMENT: '/payment',
  SUBSCRIPTION_STATUS: '/subscriptionStatus'
};

export const getOnlineUsers = async () => {
  const response = await axios.get(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.ONLINE}`,
  );
  return response.data.numOnlineUsers;
};

export const getUserDailyReports = async ip => {
  const response = await axios.get(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.DAILY_USER_REPORTS}?ip=${ip}`,
  );
  const reports = response.data.reports;
  const isBlocked = response.data.blocked;
  return {reports, isBlocked};
};

export const getCommonLikes = async () => {
  const response = await axios.get(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.COMMON_LIKES}`,
  );
  return response.data.commonlikes;
};

export const getChatRooms = async () => {
  const response = await axios.get(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.CHAT_ROOMS}`,
  );
  return response.data.chatrooms;
};

export const getCountryChatInfo = async country => {
  const response = await axios.get(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.COUNTRIES}?country=${country}`,
  );
  return response.data.countries;
};

export const reportUser = async data => {
  return axios.post(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.REPORT_USER}`,
    data,
  );
};

export const removeUsers = async data => {
  return axios.post(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.REMOVE_USERS}`,
    data,
  );
};

export const sendChatRequest = async data => {
  return axios.post(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.CHAT_REQUEST}`,
    data,
  );
};

export const skipChat = async data => {
  return axios.post(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.SKIP_CHAT}`,
    data,
  );
};

export const removeRequest = async data => {
  console.log("re aceddddddddd")
  return axios.post(
    `${baseMatchingUrls[currentMatchingSystem]}${matchingUrls.REMOVE_REQUEST}`,
    data,
  );
};

export const verifyPayment = async data => {
  return axios.post(
    `${basePaymentUrls[currentPaymentSystem]}${paymentUrls.VERIFY_PAYMENT}`,
    data,
  );
};

export const getSubscriptionStatus = async data => {
  return axios.post(
    `${basePaymentUrls[currentPaymentSystem]}${paymentUrls.SUBSCRIPTION_STATUS}`,
    data
  );
}
