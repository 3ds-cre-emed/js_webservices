/* Selimhan Bek */
const axios = require("axios").default;
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
var qs = require("querystring");

module.exports = class Authentication3DSpace {
  constructor() {
    this.passport;
  }

  // --> 1. Create session and get ticket ...
  async getTicket(urlPassport) {
    axiosCookieJarSupport(axios);

    const cookieJar = new tough.CookieJar();
    const cfgJar = {
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
    };

    var casTicket = await axios.get(
      urlPassport + "/login?action=get_auth_params",
      cfgJar
    );

    this.passport = {
      isSessionStart: true,
      cfgJar: cfgJar,
      cookieJar: cookieJar,
      ticket_cas: casTicket,
      urlPassport: urlPassport,
    };

    return {
      isSessionStart: true,
      cookieJar: cookieJar,
      cfgJar: cfgJar,
      ticket_cas: casTicket,
      urlPassport: urlPassport,
    };
  }

  // --> 2. Now has to be redirected to 3DSpace platform ...
  async loginTo3DSpace(loginInfo) {
    if (this.passport.isSessionStart != true) {
      return {
        status: 401,
        data: "Please get login ticket first.",
      } 
    }

    var userInfo = qs.stringify({
      lt: this.passport.ticket_cas.data.lt,
      username: loginInfo.username,
      password: loginInfo.password,
      rememberMe: "no",
    });

    // Rebuilding service url ...
    var toService = "/login?service=";
    var for3DSpace =
      "/resources/modeler/pno/person?current=true%26select=collabspaces%26select=preferredcredentials%26tenant=" +
      loginInfo.tenant;

    var loginUrl =
      this.passport.urlPassport + toService + loginInfo.urlService + for3DSpace; // --------> has to be rebuild loginUrl

    // Configure request ...
    var cfgAuth = {
      method: "post",
      url: loginUrl,
      jar: this.passport.cookieJar,
      withCredentials: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      data: userInfo,
    };

    var redirectTo3DSpace = await axios(cfgAuth);

    this.passport = {
      isSessionStart: true,
      cfgJar: this.passport.cfgJar,
      cookieJar: this.passport.cookieJar,
      ticket_cas: this.passport.casTicket,
      urlPassport: this.passport.urlPassport,
      urlService: loginInfo.urlService,
      userInfo: loginInfo,
    };

    var status = 200;
    var response = redirectTo3DSpace.data;

    var username = redirectTo3DSpace.data.name;
    if (username == undefined) {
      status = 401;
      response = "Username, password or tenant is wrong."
    }

    return {
      status: status,
      data: response,
    } 
  }

  // --> 3. Login out ...
  async logout() {
    var cfg = {
      method: "get",
      url: this.passport.urlPassport + "/logout",
      jar: this.passport.cookieJar,
      withCredentials: true,
    };

    var logout = await axios(cfg);

    return logout;
  }
};