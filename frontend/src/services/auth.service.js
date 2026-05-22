import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8002/auth";

// 🚀 SECURE LOGIN ENGINE
export const login = async (credentials) => {
  const emailValue = credentials.email || credentials.username;
  
  // 🛡️ FIXED: Changed .lower() to JavaScript's standard .toLowerCase()
  const optimizedPayload = {
    email: emailValue?.trim().toLowerCase(),
    username: emailValue?.trim().toLowerCase(), 
    password: credentials.password
  };

  console.log("📡 DISPATCHING SECURED LOGIN PAYLOAD:", optimizedPayload);
  return await axios.post(`${BASE_URL}/login`, optimizedPayload);
};

// 🌟 RESTORED SIGNUP ENGINE
export const signup = async (userData) => {
  const emailValue = userData.email || userData.username;

  // 🛡️ FIXED: Changed .lower() to JavaScript's standard .toLowerCase()
  const optimizedPayload = {
    email: emailValue?.trim().toLowerCase(),
    username: emailValue?.trim().toLowerCase(),
    password: userData.password
  };

  console.log("📡 DISPATCHING SIGNUP PAYLOAD:", optimizedPayload);
  return await axios.post(`${BASE_URL}/signup`, optimizedPayload);
};