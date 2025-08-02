import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // update if deployed
});

export default API;
