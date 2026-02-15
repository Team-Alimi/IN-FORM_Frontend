//axios instance를 정의하는 파일
import axios from "axios";

const instance = axios.create({
  baseURL: "http://34.64.39.13:8080/",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export default instance;
