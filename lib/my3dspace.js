const axios = require("axios").default;

module.exports = class My3DSpace {
  constructor(passport) {
    this.passport = passport;
    this.eno_csrf_token = "";
  }

  /// Get ENO_CSRF_TOKEN for engineering processes...
  async get_eno_csrf_token() {
    let url =
      this.passport.userInfo.urlService +
      "/resources/v1/application/CSRF?tenant=" +
      this.passport.userInfo.tenant;

    let config = {
      method: "get",
      url: url,
      jar: this.passport.cookieJar,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "En",
        SecurityContext: this.passport.userInfo.securityContext,
      },
    };

    return await axios(config);
  }

  /// Search any document in 3DExperience platform...
  async search_document(searchString) {
    let forDocSearch =
      "/resources/v1/modeler/documents/search?tenant=" +
      this.passport.userInfo.tenant +
      "&searchStr=" +
      searchString +
      "&$include=*&$fields=*";

    let urlSearch = this.passport.urlService + forDocSearch;

    let cfgDocSearch = {
      method: "get",
      url: urlSearch,
      jar: this.passport.cookieJar,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "En",
        SecurityContext: this.passport.userInfo.securityContext,
      },
    };

    let searchDoc = null;

    try {
      searchDoc = await axios(cfgDocSearch);
    } catch (error) {
      return {
        statusCode: 500,
        statusMessage: "Search failed.",
      };
    }

    return {
      statusCode: 200,
      body: searchDoc.data,
    };
  }

  /// Search any engineering item in 3DExperience platform...
  async search_engitem(
    searchString,
    top = 200,
    skip = 0,
    mask = "dsmveng:EngItemMask.Details"
  ) {
    //dskern:Mask.Default, dsmveng:EngItemMask.Common, dsmveng:EngItemMask.Details
    let url =
      this.passport.userInfo.urlService +
      "/resources/v1/modeler/dseng/dseng:EngItem/search?tenant=" +
      this.passport.userInfo.tenant +
      "&$mask=" +
      mask +
      "&$top=" +
      top +
      "&$skip=" +
      skip +
      "&$searchStr=" +
      searchString;

    let config = {
      method: "get",
      url: url,
      jar: this.passport.cookieJar,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "En",
        SecurityContext: this.passport.userInfo.securityContext,
      },
    };

    return await axios(config);
  }

  /// Get any engineering item instances...
  async get_eng_item_instances(pid, mask = "dsmveng:EngInstanceMask.Details", fields = "dsmveno:CustomerAttributes", mva = true) {
    // MASKS: dskern:Mask.Default, dsmveng:EngInstanceMask.Details, dsmveng:EngInstanceMask.Filterable, dsmveng:EngInstanceMask.Position
    // FIELDS: dsmveno:SupportedTypes, dsmveno:CustomerAttributes, dsmvcfg:attribute.hasConfiguredInstance
    
    let url =
      this.passport.userInfo.urlService +
      "/resources/v1/modeler/dseng/dseng:EngItem/" +
      pid +
      "/dseng:EngInstance" + "?$mask=" + mask + "&$fields=" + fields;

    let config = {
      method: "get",
      url: url,
      jar: this.passport.cookieJar,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "En",
        SecurityContext: this.passport.userInfo.securityContext,
      },
    };

    return await axios(config);
  }
};
