import axios from "axios";

class Service {
  constructor() {
    const authByte = btoa(
      "halobro" + ":" + "123j9snv89s921njksakdf901n2nkasfNJAJNDnkj9njk"
    );
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Basic " + authByte,
    };

    // if (isAuth()) {
    //   headers.Authorization = getToken();
    // }

    const service = axios.create({
      headers,
    });

    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
  }

  handleSuccess = (response) => {
    return response;
  };

  handleError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          break;

        default:
          break;
      }
    } else {
    }

    return Promise.reject(error);
  };

  redirectTo = (document, path) => {
    document.location = path;
  };

  get(path, params) {
    return this.service
      .request({
        method: "GET",
        url: path,
        responseType: "json",
        params,
      })
      .then(
        (response) => response,
        (error) => {
          throw error;
        }
      );
  }

  post(path, payload, callback) {
    return this.service
      .request({
        method: "POST",
        url: path,
        responseType: "json",
        data: payload,
      })
      .then(
        (response) => response,
        (error) => {
          throw error;
        }
      );
  }

  put(path, payload, callback) {
    return this.service
      .request({
        method: "PUT",
        url: path,
        responseType: "json",
        data: payload,
      })
      .then(
        (response) => response,
        (error) => {
          throw error;
        }
      );
  }

  delete(path, payload, callback) {
    return this.service
      .request({
        method: "DELETE",
        url: path,
        responseType: "json",
        data: payload,
      })
      .then(
        (response) => response,
        (error) => {
          throw error;
        }
      );
  }
}

export default new Service();
