//axios instance를 정의하는 파일
import axios from "axios";

const instance = axios.create({
  baseURL: "https://inha-inform.today/",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export default instance;
