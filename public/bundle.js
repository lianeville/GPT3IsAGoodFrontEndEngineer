var app = (function (internal, svelte, Carousel) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Carousel__default = /*#__PURE__*/_interopDefaultLegacy(Carousel);

  const matchName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const iconDefaults = Object.freeze({
    left: 0,
    top: 0,
    width: 16,
    height: 16,
    rotate: 0,
    vFlip: false,
    hFlip: false
  });
  function fullIcon(data) {
    return { ...iconDefaults, ...data };
  }

  const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
    const colonSeparated = value.split(":");
    if (value.slice(0, 1) === "@") {
      if (colonSeparated.length < 2 || colonSeparated.length > 3) {
        return null;
      }
      provider = colonSeparated.shift().slice(1);
    }
    if (colonSeparated.length > 3 || !colonSeparated.length) {
      return null;
    }
    if (colonSeparated.length > 1) {
      const name2 = colonSeparated.pop();
      const prefix = colonSeparated.pop();
      const result = {
        provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
        prefix,
        name: name2
      };
      return validate && !validateIcon(result) ? null : result;
    }
    const name = colonSeparated[0];
    const dashSeparated = name.split("-");
    if (dashSeparated.length > 1) {
      const result = {
        provider,
        prefix: dashSeparated.shift(),
        name: dashSeparated.join("-")
      };
      return validate && !validateIcon(result) ? null : result;
    }
    if (allowSimpleName && provider === "") {
      const result = {
        provider,
        prefix: "",
        name
      };
      return validate && !validateIcon(result, allowSimpleName) ? null : result;
    }
    return null;
  };
  const validateIcon = (icon, allowSimpleName) => {
    if (!icon) {
      return false;
    }
    return !!((icon.provider === "" || icon.provider.match(matchName)) && (allowSimpleName && icon.prefix === "" || icon.prefix.match(matchName)) && icon.name.match(matchName));
  };

  function mergeIconData(icon, alias) {
    const result = { ...icon };
    for (const key in iconDefaults) {
      const prop = key;
      if (alias[prop] !== void 0) {
        const value = alias[prop];
        if (result[prop] === void 0) {
          result[prop] = value;
          continue;
        }
        switch (prop) {
          case "rotate":
            result[prop] = (result[prop] + value) % 4;
            break;
          case "hFlip":
          case "vFlip":
            result[prop] = value !== result[prop];
            break;
          default:
            result[prop] = value;
        }
      }
    }
    return result;
  }

  function getIconData$1(data, name, full = false) {
    function getIcon(name2, iteration) {
      if (data.icons[name2] !== void 0) {
        return Object.assign({}, data.icons[name2]);
      }
      if (iteration > 5) {
        return null;
      }
      const aliases = data.aliases;
      if (aliases && aliases[name2] !== void 0) {
        const item = aliases[name2];
        const result2 = getIcon(item.parent, iteration + 1);
        if (result2) {
          return mergeIconData(result2, item);
        }
        return result2;
      }
      const chars = data.chars;
      if (!iteration && chars && chars[name2] !== void 0) {
        return getIcon(chars[name2], iteration + 1);
      }
      return null;
    }
    const result = getIcon(name, 0);
    if (result) {
      for (const key in iconDefaults) {
        if (result[key] === void 0 && data[key] !== void 0) {
          result[key] = data[key];
        }
      }
    }
    return result && full ? fullIcon(result) : result;
  }

  function isVariation(item) {
    for (const key in iconDefaults) {
      if (item[key] !== void 0) {
        return true;
      }
    }
    return false;
  }
  function parseIconSet(data, callback, options) {
    options = options || {};
    const names = [];
    if (typeof data !== "object" || typeof data.icons !== "object") {
      return names;
    }
    if (data.not_found instanceof Array) {
      data.not_found.forEach((name) => {
        callback(name, null);
        names.push(name);
      });
    }
    const icons = data.icons;
    Object.keys(icons).forEach((name) => {
      const iconData = getIconData$1(data, name, true);
      if (iconData) {
        callback(name, iconData);
        names.push(name);
      }
    });
    const parseAliases = options.aliases || "all";
    if (parseAliases !== "none" && typeof data.aliases === "object") {
      const aliases = data.aliases;
      Object.keys(aliases).forEach((name) => {
        if (parseAliases === "variations" && isVariation(aliases[name])) {
          return;
        }
        const iconData = getIconData$1(data, name, true);
        if (iconData) {
          callback(name, iconData);
          names.push(name);
        }
      });
    }
    return names;
  }

  const optionalProperties = {
    provider: "string",
    aliases: "object",
    not_found: "object"
  };
  for (const prop in iconDefaults) {
    optionalProperties[prop] = typeof iconDefaults[prop];
  }
  function quicklyValidateIconSet(obj) {
    if (typeof obj !== "object" || obj === null) {
      return null;
    }
    const data = obj;
    if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
      return null;
    }
    for (const prop in optionalProperties) {
      if (obj[prop] !== void 0 && typeof obj[prop] !== optionalProperties[prop]) {
        return null;
      }
    }
    const icons = data.icons;
    for (const name in icons) {
      const icon = icons[name];
      if (!name.match(matchName) || typeof icon.body !== "string") {
        return null;
      }
      for (const prop in iconDefaults) {
        if (icon[prop] !== void 0 && typeof icon[prop] !== typeof iconDefaults[prop]) {
          return null;
        }
      }
    }
    const aliases = data.aliases;
    if (aliases) {
      for (const name in aliases) {
        const icon = aliases[name];
        const parent = icon.parent;
        if (!name.match(matchName) || typeof parent !== "string" || !icons[parent] && !aliases[parent]) {
          return null;
        }
        for (const prop in iconDefaults) {
          if (icon[prop] !== void 0 && typeof icon[prop] !== typeof iconDefaults[prop]) {
            return null;
          }
        }
      }
    }
    return data;
  }

  const storageVersion = 1;
  let storage$1 = /* @__PURE__ */ Object.create(null);
  try {
    const w = window || self;
    if (w && w._iconifyStorage.version === storageVersion) {
      storage$1 = w._iconifyStorage.storage;
    }
  } catch (err) {
  }
  function newStorage(provider, prefix) {
    return {
      provider,
      prefix,
      icons: /* @__PURE__ */ Object.create(null),
      missing: /* @__PURE__ */ Object.create(null)
    };
  }
  function getStorage(provider, prefix) {
    if (storage$1[provider] === void 0) {
      storage$1[provider] = /* @__PURE__ */ Object.create(null);
    }
    const providerStorage = storage$1[provider];
    if (providerStorage[prefix] === void 0) {
      providerStorage[prefix] = newStorage(provider, prefix);
    }
    return providerStorage[prefix];
  }
  function addIconSet(storage2, data) {
    if (!quicklyValidateIconSet(data)) {
      return [];
    }
    const t = Date.now();
    return parseIconSet(data, (name, icon) => {
      if (icon) {
        storage2.icons[name] = icon;
      } else {
        storage2.missing[name] = t;
      }
    });
  }
  function addIconToStorage(storage2, name, icon) {
    try {
      if (typeof icon.body === "string") {
        storage2.icons[name] = Object.freeze(fullIcon(icon));
        return true;
      }
    } catch (err) {
    }
    return false;
  }
  function getIconFromStorage(storage2, name) {
    const value = storage2.icons[name];
    return value === void 0 ? null : value;
  }

  let simpleNames = false;
  function allowSimpleNames(allow) {
    if (typeof allow === "boolean") {
      simpleNames = allow;
    }
    return simpleNames;
  }
  function getIconData(name) {
    const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
    return icon ? getIconFromStorage(getStorage(icon.provider, icon.prefix), icon.name) : null;
  }
  function addIcon(name, data) {
    const icon = stringToIcon(name, true, simpleNames);
    if (!icon) {
      return false;
    }
    const storage = getStorage(icon.provider, icon.prefix);
    return addIconToStorage(storage, icon.name, data);
  }
  function addCollection(data, provider) {
    if (typeof data !== "object") {
      return false;
    }
    if (typeof provider !== "string") {
      provider = typeof data.provider === "string" ? data.provider : "";
    }
    if (simpleNames && provider === "" && (typeof data.prefix !== "string" || data.prefix === "")) {
      let added = false;
      if (quicklyValidateIconSet(data)) {
        data.prefix = "";
        parseIconSet(data, (name, icon) => {
          if (icon && addIcon(name, icon)) {
            added = true;
          }
        });
      }
      return added;
    }
    if (typeof data.prefix !== "string" || !validateIcon({
      provider,
      prefix: data.prefix,
      name: "a"
    })) {
      return false;
    }
    const storage = getStorage(provider, data.prefix);
    return !!addIconSet(storage, data);
  }

  const defaults = Object.freeze({
    inline: false,
    width: null,
    height: null,
    hAlign: "center",
    vAlign: "middle",
    slice: false,
    hFlip: false,
    vFlip: false,
    rotate: 0
  });
  function mergeCustomisations(defaults2, item) {
    const result = {};
    for (const key in defaults2) {
      const attr = key;
      result[attr] = defaults2[attr];
      if (item[attr] === void 0) {
        continue;
      }
      const value = item[attr];
      switch (attr) {
        case "inline":
        case "slice":
          if (typeof value === "boolean") {
            result[attr] = value;
          }
          break;
        case "hFlip":
        case "vFlip":
          if (value === true) {
            result[attr] = !result[attr];
          }
          break;
        case "hAlign":
        case "vAlign":
          if (typeof value === "string" && value !== "") {
            result[attr] = value;
          }
          break;
        case "width":
        case "height":
          if (typeof value === "string" && value !== "" || typeof value === "number" && value || value === null) {
            result[attr] = value;
          }
          break;
        case "rotate":
          if (typeof value === "number") {
            result[attr] += value;
          }
          break;
      }
    }
    return result;
  }

  const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
  const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
  function calculateSize(size, ratio, precision) {
    if (ratio === 1) {
      return size;
    }
    precision = precision === void 0 ? 100 : precision;
    if (typeof size === "number") {
      return Math.ceil(size * ratio * precision) / precision;
    }
    if (typeof size !== "string") {
      return size;
    }
    const oldParts = size.split(unitsSplit);
    if (oldParts === null || !oldParts.length) {
      return size;
    }
    const newParts = [];
    let code = oldParts.shift();
    let isNumber = unitsTest.test(code);
    while (true) {
      if (isNumber) {
        const num = parseFloat(code);
        if (isNaN(num)) {
          newParts.push(code);
        } else {
          newParts.push(Math.ceil(num * ratio * precision) / precision);
        }
      } else {
        newParts.push(code);
      }
      code = oldParts.shift();
      if (code === void 0) {
        return newParts.join("");
      }
      isNumber = !isNumber;
    }
  }

  function preserveAspectRatio(props) {
    let result = "";
    switch (props.hAlign) {
      case "left":
        result += "xMin";
        break;
      case "right":
        result += "xMax";
        break;
      default:
        result += "xMid";
    }
    switch (props.vAlign) {
      case "top":
        result += "YMin";
        break;
      case "bottom":
        result += "YMax";
        break;
      default:
        result += "YMid";
    }
    result += props.slice ? " slice" : " meet";
    return result;
  }
  function iconToSVG(icon, customisations) {
    const box = {
      left: icon.left,
      top: icon.top,
      width: icon.width,
      height: icon.height
    };
    let body = icon.body;
    [icon, customisations].forEach((props) => {
      const transformations = [];
      const hFlip = props.hFlip;
      const vFlip = props.vFlip;
      let rotation = props.rotate;
      if (hFlip) {
        if (vFlip) {
          rotation += 2;
        } else {
          transformations.push("translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")");
          transformations.push("scale(-1 1)");
          box.top = box.left = 0;
        }
      } else if (vFlip) {
        transformations.push("translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")");
        transformations.push("scale(1 -1)");
        box.top = box.left = 0;
      }
      let tempValue;
      if (rotation < 0) {
        rotation -= Math.floor(rotation / 4) * 4;
      }
      rotation = rotation % 4;
      switch (rotation) {
        case 1:
          tempValue = box.height / 2 + box.top;
          transformations.unshift("rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")");
          break;
        case 2:
          transformations.unshift("rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")");
          break;
        case 3:
          tempValue = box.width / 2 + box.left;
          transformations.unshift("rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")");
          break;
      }
      if (rotation % 2 === 1) {
        if (box.left !== 0 || box.top !== 0) {
          tempValue = box.left;
          box.left = box.top;
          box.top = tempValue;
        }
        if (box.width !== box.height) {
          tempValue = box.width;
          box.width = box.height;
          box.height = tempValue;
        }
      }
      if (transformations.length) {
        body = '<g transform="' + transformations.join(" ") + '">' + body + "</g>";
      }
    });
    let width, height;
    if (customisations.width === null && customisations.height === null) {
      height = "1em";
      width = calculateSize(height, box.width / box.height);
    } else if (customisations.width !== null && customisations.height !== null) {
      width = customisations.width;
      height = customisations.height;
    } else if (customisations.height !== null) {
      height = customisations.height;
      width = calculateSize(height, box.width / box.height);
    } else {
      width = customisations.width;
      height = calculateSize(width, box.height / box.width);
    }
    if (width === "auto") {
      width = box.width;
    }
    if (height === "auto") {
      height = box.height;
    }
    width = typeof width === "string" ? width : width.toString() + "";
    height = typeof height === "string" ? height : height.toString() + "";
    const result = {
      attributes: {
        width,
        height,
        preserveAspectRatio: preserveAspectRatio(customisations),
        viewBox: box.left.toString() + " " + box.top.toString() + " " + box.width.toString() + " " + box.height.toString()
      },
      body
    };
    if (customisations.inline) {
      result.inline = true;
    }
    return result;
  }

  const regex = /\sid="(\S+)"/g;
  const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
  let counter = 0;
  function replaceIDs(body, prefix = randomPrefix) {
    const ids = [];
    let match;
    while (match = regex.exec(body)) {
      ids.push(match[1]);
    }
    if (!ids.length) {
      return body;
    }
    ids.forEach((id) => {
      const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
      const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      body = body.replace(new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"), "$1" + newID + "$3");
    });
    return body;
  }

  const storage = /* @__PURE__ */ Object.create(null);
  function setAPIModule(provider, item) {
    storage[provider] = item;
  }
  function getAPIModule(provider) {
    return storage[provider] || storage[""];
  }

  function createAPIConfig(source) {
    let resources;
    if (typeof source.resources === "string") {
      resources = [source.resources];
    } else {
      resources = source.resources;
      if (!(resources instanceof Array) || !resources.length) {
        return null;
      }
    }
    const result = {
      resources,
      path: source.path === void 0 ? "/" : source.path,
      maxURL: source.maxURL ? source.maxURL : 500,
      rotate: source.rotate ? source.rotate : 750,
      timeout: source.timeout ? source.timeout : 5e3,
      random: source.random === true,
      index: source.index ? source.index : 0,
      dataAfterTimeout: source.dataAfterTimeout !== false
    };
    return result;
  }
  const configStorage = /* @__PURE__ */ Object.create(null);
  const fallBackAPISources = [
    "https://api.simplesvg.com",
    "https://api.unisvg.com"
  ];
  const fallBackAPI = [];
  while (fallBackAPISources.length > 0) {
    if (fallBackAPISources.length === 1) {
      fallBackAPI.push(fallBackAPISources.shift());
    } else {
      if (Math.random() > 0.5) {
        fallBackAPI.push(fallBackAPISources.shift());
      } else {
        fallBackAPI.push(fallBackAPISources.pop());
      }
    }
  }
  configStorage[""] = createAPIConfig({
    resources: ["https://api.iconify.design"].concat(fallBackAPI)
  });
  function addAPIProvider(provider, customConfig) {
    const config = createAPIConfig(customConfig);
    if (config === null) {
      return false;
    }
    configStorage[provider] = config;
    return true;
  }
  function getAPIConfig(provider) {
    return configStorage[provider];
  }

  const mergeParams = (base, params) => {
    let result = base, hasParams = result.indexOf("?") !== -1;
    function paramToString(value) {
      switch (typeof value) {
        case "boolean":
          return value ? "true" : "false";
        case "number":
          return encodeURIComponent(value);
        case "string":
          return encodeURIComponent(value);
        default:
          throw new Error("Invalid parameter");
      }
    }
    Object.keys(params).forEach((key) => {
      let value;
      try {
        value = paramToString(params[key]);
      } catch (err) {
        return;
      }
      result += (hasParams ? "&" : "?") + encodeURIComponent(key) + "=" + value;
      hasParams = true;
    });
    return result;
  };

  const maxLengthCache = {};
  const pathCache = {};
  const detectFetch = () => {
    let callback;
    try {
      callback = fetch;
      if (typeof callback === "function") {
        return callback;
      }
    } catch (err) {
    }
    return null;
  };
  let fetchModule = detectFetch();
  function calculateMaxLength(provider, prefix) {
    const config = getAPIConfig(provider);
    if (!config) {
      return 0;
    }
    let result;
    if (!config.maxURL) {
      result = 0;
    } else {
      let maxHostLength = 0;
      config.resources.forEach((item) => {
        const host = item;
        maxHostLength = Math.max(maxHostLength, host.length);
      });
      const url = mergeParams(prefix + ".json", {
        icons: ""
      });
      result = config.maxURL - maxHostLength - config.path.length - url.length;
    }
    const cacheKey = provider + ":" + prefix;
    pathCache[provider] = config.path;
    maxLengthCache[cacheKey] = result;
    return result;
  }
  function shouldAbort(status) {
    return status === 404;
  }
  const prepare = (provider, prefix, icons) => {
    const results = [];
    let maxLength = maxLengthCache[prefix];
    if (maxLength === void 0) {
      maxLength = calculateMaxLength(provider, prefix);
    }
    const type = "icons";
    let item = {
      type,
      provider,
      prefix,
      icons: []
    };
    let length = 0;
    icons.forEach((name, index) => {
      length += name.length + 1;
      if (length >= maxLength && index > 0) {
        results.push(item);
        item = {
          type,
          provider,
          prefix,
          icons: []
        };
        length = name.length;
      }
      item.icons.push(name);
    });
    results.push(item);
    return results;
  };
  function getPath(provider) {
    if (typeof provider === "string") {
      if (pathCache[provider] === void 0) {
        const config = getAPIConfig(provider);
        if (!config) {
          return "/";
        }
        pathCache[provider] = config.path;
      }
      return pathCache[provider];
    }
    return "/";
  }
  const send = (host, params, callback) => {
    if (!fetchModule) {
      callback("abort", 424);
      return;
    }
    let path = getPath(params.provider);
    switch (params.type) {
      case "icons": {
        const prefix = params.prefix;
        const icons = params.icons;
        const iconsList = icons.join(",");
        path += mergeParams(prefix + ".json", {
          icons: iconsList
        });
        break;
      }
      case "custom": {
        const uri = params.uri;
        path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
        break;
      }
      default:
        callback("abort", 400);
        return;
    }
    let defaultError = 503;
    fetchModule(host + path).then((response) => {
      const status = response.status;
      if (status !== 200) {
        setTimeout(() => {
          callback(shouldAbort(status) ? "abort" : "next", status);
        });
        return;
      }
      defaultError = 501;
      return response.json();
    }).then((data) => {
      if (typeof data !== "object" || data === null) {
        setTimeout(() => {
          callback("next", defaultError);
        });
        return;
      }
      setTimeout(() => {
        callback("success", data);
      });
    }).catch(() => {
      callback("next", defaultError);
    });
  };
  const fetchAPIModule = {
    prepare,
    send
  };

  function sortIcons(icons) {
    const result = {
      loaded: [],
      missing: [],
      pending: []
    };
    const storage = /* @__PURE__ */ Object.create(null);
    icons.sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider);
      }
      if (a.prefix !== b.prefix) {
        return a.prefix.localeCompare(b.prefix);
      }
      return a.name.localeCompare(b.name);
    });
    let lastIcon = {
      provider: "",
      prefix: "",
      name: ""
    };
    icons.forEach((icon) => {
      if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
        return;
      }
      lastIcon = icon;
      const provider = icon.provider;
      const prefix = icon.prefix;
      const name = icon.name;
      if (storage[provider] === void 0) {
        storage[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerStorage = storage[provider];
      if (providerStorage[prefix] === void 0) {
        providerStorage[prefix] = getStorage(provider, prefix);
      }
      const localStorage = providerStorage[prefix];
      let list;
      if (localStorage.icons[name] !== void 0) {
        list = result.loaded;
      } else if (prefix === "" || localStorage.missing[name] !== void 0) {
        list = result.missing;
      } else {
        list = result.pending;
      }
      const item = {
        provider,
        prefix,
        name
      };
      list.push(item);
    });
    return result;
  }

  const callbacks = /* @__PURE__ */ Object.create(null);
  const pendingUpdates = /* @__PURE__ */ Object.create(null);
  function removeCallback(sources, id) {
    sources.forEach((source) => {
      const provider = source.provider;
      if (callbacks[provider] === void 0) {
        return;
      }
      const providerCallbacks = callbacks[provider];
      const prefix = source.prefix;
      const items = providerCallbacks[prefix];
      if (items) {
        providerCallbacks[prefix] = items.filter((row) => row.id !== id);
      }
    });
  }
  function updateCallbacks(provider, prefix) {
    if (pendingUpdates[provider] === void 0) {
      pendingUpdates[provider] = /* @__PURE__ */ Object.create(null);
    }
    const providerPendingUpdates = pendingUpdates[provider];
    if (!providerPendingUpdates[prefix]) {
      providerPendingUpdates[prefix] = true;
      setTimeout(() => {
        providerPendingUpdates[prefix] = false;
        if (callbacks[provider] === void 0 || callbacks[provider][prefix] === void 0) {
          return;
        }
        const items = callbacks[provider][prefix].slice(0);
        if (!items.length) {
          return;
        }
        const storage = getStorage(provider, prefix);
        let hasPending = false;
        items.forEach((item) => {
          const icons = item.icons;
          const oldLength = icons.pending.length;
          icons.pending = icons.pending.filter((icon) => {
            if (icon.prefix !== prefix) {
              return true;
            }
            const name = icon.name;
            if (storage.icons[name] !== void 0) {
              icons.loaded.push({
                provider,
                prefix,
                name
              });
            } else if (storage.missing[name] !== void 0) {
              icons.missing.push({
                provider,
                prefix,
                name
              });
            } else {
              hasPending = true;
              return true;
            }
            return false;
          });
          if (icons.pending.length !== oldLength) {
            if (!hasPending) {
              removeCallback([
                {
                  provider,
                  prefix
                }
              ], item.id);
            }
            item.callback(icons.loaded.slice(0), icons.missing.slice(0), icons.pending.slice(0), item.abort);
          }
        });
      });
    }
  }
  let idCounter = 0;
  function storeCallback(callback, icons, pendingSources) {
    const id = idCounter++;
    const abort = removeCallback.bind(null, pendingSources, id);
    if (!icons.pending.length) {
      return abort;
    }
    const item = {
      id,
      icons,
      callback,
      abort
    };
    pendingSources.forEach((source) => {
      const provider = source.provider;
      const prefix = source.prefix;
      if (callbacks[provider] === void 0) {
        callbacks[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerCallbacks = callbacks[provider];
      if (providerCallbacks[prefix] === void 0) {
        providerCallbacks[prefix] = [];
      }
      providerCallbacks[prefix].push(item);
    });
    return abort;
  }

  function listToIcons(list, validate = true, simpleNames = false) {
    const result = [];
    list.forEach((item) => {
      const icon = typeof item === "string" ? stringToIcon(item, false, simpleNames) : item;
      if (!validate || validateIcon(icon, simpleNames)) {
        result.push({
          provider: icon.provider,
          prefix: icon.prefix,
          name: icon.name
        });
      }
    });
    return result;
  }

  // src/config.ts
  var defaultConfig = {
    resources: [],
    index: 0,
    timeout: 2e3,
    rotate: 750,
    random: false,
    dataAfterTimeout: false
  };

  // src/query.ts
  function sendQuery(config, payload, query, done) {
    const resourcesCount = config.resources.length;
    const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
    let resources;
    if (config.random) {
      let list = config.resources.slice(0);
      resources = [];
      while (list.length > 1) {
        const nextIndex = Math.floor(Math.random() * list.length);
        resources.push(list[nextIndex]);
        list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
      }
      resources = resources.concat(list);
    } else {
      resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
    }
    const startTime = Date.now();
    let status = "pending";
    let queriesSent = 0;
    let lastError;
    let timer = null;
    let queue = [];
    let doneCallbacks = [];
    if (typeof done === "function") {
      doneCallbacks.push(done);
    }
    function resetTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    function abort() {
      if (status === "pending") {
        status = "aborted";
      }
      resetTimer();
      queue.forEach((item) => {
        if (item.status === "pending") {
          item.status = "aborted";
        }
      });
      queue = [];
    }
    function subscribe(callback, overwrite) {
      if (overwrite) {
        doneCallbacks = [];
      }
      if (typeof callback === "function") {
        doneCallbacks.push(callback);
      }
    }
    function getQueryStatus() {
      return {
        startTime,
        payload,
        status,
        queriesSent,
        queriesPending: queue.length,
        subscribe,
        abort
      };
    }
    function failQuery() {
      status = "failed";
      doneCallbacks.forEach((callback) => {
        callback(void 0, lastError);
      });
    }
    function clearQueue() {
      queue.forEach((item) => {
        if (item.status === "pending") {
          item.status = "aborted";
        }
      });
      queue = [];
    }
    function moduleResponse(item, response, data) {
      const isError = response !== "success";
      queue = queue.filter((queued) => queued !== item);
      switch (status) {
        case "pending":
          break;
        case "failed":
          if (isError || !config.dataAfterTimeout) {
            return;
          }
          break;
        default:
          return;
      }
      if (response === "abort") {
        lastError = data;
        failQuery();
        return;
      }
      if (isError) {
        lastError = data;
        if (!queue.length) {
          if (!resources.length) {
            failQuery();
          } else {
            execNext();
          }
        }
        return;
      }
      resetTimer();
      clearQueue();
      if (!config.random) {
        const index = config.resources.indexOf(item.resource);
        if (index !== -1 && index !== config.index) {
          config.index = index;
        }
      }
      status = "completed";
      doneCallbacks.forEach((callback) => {
        callback(data);
      });
    }
    function execNext() {
      if (status !== "pending") {
        return;
      }
      resetTimer();
      const resource = resources.shift();
      if (resource === void 0) {
        if (queue.length) {
          timer = setTimeout(() => {
            resetTimer();
            if (status === "pending") {
              clearQueue();
              failQuery();
            }
          }, config.timeout);
          return;
        }
        failQuery();
        return;
      }
      const item = {
        status: "pending",
        resource,
        callback: (status2, data) => {
          moduleResponse(item, status2, data);
        }
      };
      queue.push(item);
      queriesSent++;
      timer = setTimeout(execNext, config.rotate);
      query(resource, payload, item.callback);
    }
    setTimeout(execNext);
    return getQueryStatus;
  }

  // src/index.ts
  function setConfig(config) {
    if (typeof config !== "object" || typeof config.resources !== "object" || !(config.resources instanceof Array) || !config.resources.length) {
      throw new Error("Invalid Reduncancy configuration");
    }
    const newConfig = /* @__PURE__ */ Object.create(null);
    let key;
    for (key in defaultConfig) {
      if (config[key] !== void 0) {
        newConfig[key] = config[key];
      } else {
        newConfig[key] = defaultConfig[key];
      }
    }
    return newConfig;
  }
  function initRedundancy(cfg) {
    const config = setConfig(cfg);
    let queries = [];
    function cleanup() {
      queries = queries.filter((item) => item().status === "pending");
    }
    function query(payload, queryCallback, doneCallback) {
      const query2 = sendQuery(config, payload, queryCallback, (data, error) => {
        cleanup();
        if (doneCallback) {
          doneCallback(data, error);
        }
      });
      queries.push(query2);
      return query2;
    }
    function find(callback) {
      const result = queries.find((value) => {
        return callback(value);
      });
      return result !== void 0 ? result : null;
    }
    const instance = {
      query,
      find,
      setIndex: (index) => {
        config.index = index;
      },
      getIndex: () => config.index,
      cleanup
    };
    return instance;
  }

  function emptyCallback$1() {
  }
  const redundancyCache = /* @__PURE__ */ Object.create(null);
  function getRedundancyCache(provider) {
    if (redundancyCache[provider] === void 0) {
      const config = getAPIConfig(provider);
      if (!config) {
        return;
      }
      const redundancy = initRedundancy(config);
      const cachedReundancy = {
        config,
        redundancy
      };
      redundancyCache[provider] = cachedReundancy;
    }
    return redundancyCache[provider];
  }
  function sendAPIQuery(target, query, callback) {
    let redundancy;
    let send;
    if (typeof target === "string") {
      const api = getAPIModule(target);
      if (!api) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      send = api.send;
      const cached = getRedundancyCache(target);
      if (cached) {
        redundancy = cached.redundancy;
      }
    } else {
      const config = createAPIConfig(target);
      if (config) {
        redundancy = initRedundancy(config);
        const moduleKey = target.resources ? target.resources[0] : "";
        const api = getAPIModule(moduleKey);
        if (api) {
          send = api.send;
        }
      }
    }
    if (!redundancy || !send) {
      callback(void 0, 424);
      return emptyCallback$1;
    }
    return redundancy.query(query, send, callback)().abort;
  }

  const cache = {};

  function emptyCallback() {
  }
  const pendingIcons = /* @__PURE__ */ Object.create(null);
  const iconsToLoad = /* @__PURE__ */ Object.create(null);
  const loaderFlags = /* @__PURE__ */ Object.create(null);
  const queueFlags = /* @__PURE__ */ Object.create(null);
  function loadedNewIcons(provider, prefix) {
    if (loaderFlags[provider] === void 0) {
      loaderFlags[provider] = /* @__PURE__ */ Object.create(null);
    }
    const providerLoaderFlags = loaderFlags[provider];
    if (!providerLoaderFlags[prefix]) {
      providerLoaderFlags[prefix] = true;
      setTimeout(() => {
        providerLoaderFlags[prefix] = false;
        updateCallbacks(provider, prefix);
      });
    }
  }
  const errorsCache = /* @__PURE__ */ Object.create(null);
  function loadNewIcons(provider, prefix, icons) {
    function err() {
      const key = (provider === "" ? "" : "@" + provider + ":") + prefix;
      const time = Math.floor(Date.now() / 6e4);
      if (errorsCache[key] < time) {
        errorsCache[key] = time;
        console.error('Unable to retrieve icons for "' + key + '" because API is not configured properly.');
      }
    }
    if (iconsToLoad[provider] === void 0) {
      iconsToLoad[provider] = /* @__PURE__ */ Object.create(null);
    }
    const providerIconsToLoad = iconsToLoad[provider];
    if (queueFlags[provider] === void 0) {
      queueFlags[provider] = /* @__PURE__ */ Object.create(null);
    }
    const providerQueueFlags = queueFlags[provider];
    if (pendingIcons[provider] === void 0) {
      pendingIcons[provider] = /* @__PURE__ */ Object.create(null);
    }
    const providerPendingIcons = pendingIcons[provider];
    if (providerIconsToLoad[prefix] === void 0) {
      providerIconsToLoad[prefix] = icons;
    } else {
      providerIconsToLoad[prefix] = providerIconsToLoad[prefix].concat(icons).sort();
    }
    if (!providerQueueFlags[prefix]) {
      providerQueueFlags[prefix] = true;
      setTimeout(() => {
        providerQueueFlags[prefix] = false;
        const icons2 = providerIconsToLoad[prefix];
        delete providerIconsToLoad[prefix];
        const api = getAPIModule(provider);
        if (!api) {
          err();
          return;
        }
        const params = api.prepare(provider, prefix, icons2);
        params.forEach((item) => {
          sendAPIQuery(provider, item, (data, error) => {
            const storage = getStorage(provider, prefix);
            if (typeof data !== "object") {
              if (error !== 404) {
                return;
              }
              const t = Date.now();
              item.icons.forEach((name) => {
                storage.missing[name] = t;
              });
            } else {
              try {
                const parsed = addIconSet(storage, data);
                if (!parsed.length) {
                  return;
                }
                const pending = providerPendingIcons[prefix];
                parsed.forEach((name) => {
                  delete pending[name];
                });
                if (cache.store) {
                  cache.store(provider, data);
                }
              } catch (err2) {
                console.error(err2);
              }
            }
            loadedNewIcons(provider, prefix);
          });
        });
      });
    }
  }
  const loadIcons = (icons, callback) => {
    const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
    const sortedIcons = sortIcons(cleanedIcons);
    if (!sortedIcons.pending.length) {
      let callCallback = true;
      if (callback) {
        setTimeout(() => {
          if (callCallback) {
            callback(sortedIcons.loaded, sortedIcons.missing, sortedIcons.pending, emptyCallback);
          }
        });
      }
      return () => {
        callCallback = false;
      };
    }
    const newIcons = /* @__PURE__ */ Object.create(null);
    const sources = [];
    let lastProvider, lastPrefix;
    sortedIcons.pending.forEach((icon) => {
      const provider = icon.provider;
      const prefix = icon.prefix;
      if (prefix === lastPrefix && provider === lastProvider) {
        return;
      }
      lastProvider = provider;
      lastPrefix = prefix;
      sources.push({
        provider,
        prefix
      });
      if (pendingIcons[provider] === void 0) {
        pendingIcons[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerPendingIcons = pendingIcons[provider];
      if (providerPendingIcons[prefix] === void 0) {
        providerPendingIcons[prefix] = /* @__PURE__ */ Object.create(null);
      }
      if (newIcons[provider] === void 0) {
        newIcons[provider] = /* @__PURE__ */ Object.create(null);
      }
      const providerNewIcons = newIcons[provider];
      if (providerNewIcons[prefix] === void 0) {
        providerNewIcons[prefix] = [];
      }
    });
    const time = Date.now();
    sortedIcons.pending.forEach((icon) => {
      const provider = icon.provider;
      const prefix = icon.prefix;
      const name = icon.name;
      const pendingQueue = pendingIcons[provider][prefix];
      if (pendingQueue[name] === void 0) {
        pendingQueue[name] = time;
        newIcons[provider][prefix].push(name);
      }
    });
    sources.forEach((source) => {
      const provider = source.provider;
      const prefix = source.prefix;
      if (newIcons[provider][prefix].length) {
        loadNewIcons(provider, prefix, newIcons[provider][prefix]);
      }
    });
    return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
  };

  const cacheVersion = "iconify2";
  const cachePrefix = "iconify";
  const countKey = cachePrefix + "-count";
  const versionKey = cachePrefix + "-version";
  const hour = 36e5;
  const cacheExpiration = 168;
  const config = {
    local: true,
    session: true
  };
  let loaded = false;
  const count = {
    local: 0,
    session: 0
  };
  const emptyList = {
    local: [],
    session: []
  };
  let _window = typeof window === "undefined" ? {} : window;
  function getGlobal(key) {
    const attr = key + "Storage";
    try {
      if (_window && _window[attr] && typeof _window[attr].length === "number") {
        return _window[attr];
      }
    } catch (err) {
    }
    config[key] = false;
    return null;
  }
  function setCount(storage, key, value) {
    try {
      storage.setItem(countKey, value.toString());
      count[key] = value;
      return true;
    } catch (err) {
      return false;
    }
  }
  function getCount(storage) {
    const count2 = storage.getItem(countKey);
    if (count2) {
      const total = parseInt(count2);
      return total ? total : 0;
    }
    return 0;
  }
  function initCache(storage, key) {
    try {
      storage.setItem(versionKey, cacheVersion);
    } catch (err) {
    }
    setCount(storage, key, 0);
  }
  function destroyCache(storage) {
    try {
      const total = getCount(storage);
      for (let i = 0; i < total; i++) {
        storage.removeItem(cachePrefix + i.toString());
      }
    } catch (err) {
    }
  }
  const loadCache = () => {
    if (loaded) {
      return;
    }
    loaded = true;
    const minTime = Math.floor(Date.now() / hour) - cacheExpiration;
    function load(key) {
      const func = getGlobal(key);
      if (!func) {
        return;
      }
      const getItem = (index) => {
        const name = cachePrefix + index.toString();
        const item = func.getItem(name);
        if (typeof item !== "string") {
          return false;
        }
        let valid = true;
        try {
          const data = JSON.parse(item);
          if (typeof data !== "object" || typeof data.cached !== "number" || data.cached < minTime || typeof data.provider !== "string" || typeof data.data !== "object" || typeof data.data.prefix !== "string") {
            valid = false;
          } else {
            const provider = data.provider;
            const prefix = data.data.prefix;
            const storage = getStorage(provider, prefix);
            valid = addIconSet(storage, data.data).length > 0;
          }
        } catch (err) {
          valid = false;
        }
        if (!valid) {
          func.removeItem(name);
        }
        return valid;
      };
      try {
        const version = func.getItem(versionKey);
        if (version !== cacheVersion) {
          if (version) {
            destroyCache(func);
          }
          initCache(func, key);
          return;
        }
        let total = getCount(func);
        for (let i = total - 1; i >= 0; i--) {
          if (!getItem(i)) {
            if (i === total - 1) {
              total--;
            } else {
              emptyList[key].push(i);
            }
          }
        }
        setCount(func, key, total);
      } catch (err) {
      }
    }
    for (const key in config) {
      load(key);
    }
  };
  const storeCache = (provider, data) => {
    if (!loaded) {
      loadCache();
    }
    function store(key) {
      if (!config[key]) {
        return false;
      }
      const func = getGlobal(key);
      if (!func) {
        return false;
      }
      let index = emptyList[key].shift();
      if (index === void 0) {
        index = count[key];
        if (!setCount(func, key, index + 1)) {
          return false;
        }
      }
      try {
        const item = {
          cached: Math.floor(Date.now() / hour),
          provider,
          data
        };
        func.setItem(cachePrefix + index.toString(), JSON.stringify(item));
      } catch (err) {
        return false;
      }
      return true;
    }
    if (!Object.keys(data.icons).length) {
      return;
    }
    if (data.not_found) {
      data = Object.assign({}, data);
      delete data.not_found;
    }
    if (!store("local")) {
      store("session");
    }
  };

  const separator = /[\s,]+/;
  function flipFromString(custom, flip) {
    flip.split(separator).forEach((str) => {
      const value = str.trim();
      switch (value) {
        case "horizontal":
          custom.hFlip = true;
          break;
        case "vertical":
          custom.vFlip = true;
          break;
      }
    });
  }
  function alignmentFromString(custom, align) {
    align.split(separator).forEach((str) => {
      const value = str.trim();
      switch (value) {
        case "left":
        case "center":
        case "right":
          custom.hAlign = value;
          break;
        case "top":
        case "middle":
        case "bottom":
          custom.vAlign = value;
          break;
        case "slice":
        case "crop":
          custom.slice = true;
          break;
        case "meet":
          custom.slice = false;
      }
    });
  }

  function rotateFromString(value, defaultValue = 0) {
    const units = value.replace(/^-?[0-9.]*/, "");
    function cleanup(value2) {
      while (value2 < 0) {
        value2 += 4;
      }
      return value2 % 4;
    }
    if (units === "") {
      const num = parseInt(value);
      return isNaN(num) ? 0 : cleanup(num);
    } else if (units !== value) {
      let split = 0;
      switch (units) {
        case "%":
          split = 25;
          break;
        case "deg":
          split = 90;
      }
      if (split) {
        let num = parseFloat(value.slice(0, value.length - units.length));
        if (isNaN(num)) {
          return 0;
        }
        num = num / split;
        return num % 1 === 0 ? cleanup(num) : 0;
      }
    }
    return defaultValue;
  }

  /**
   * Default SVG attributes
   */
  const svgDefaults = {
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'aria-hidden': true,
      'role': 'img',
  };
  /**
   * Generate icon from properties
   */
  function render(
  // Icon must be validated before calling this function
  icon, 
  // Properties
  props) {
      const customisations = mergeCustomisations(defaults, props);
      const componentProps = { ...svgDefaults };
      // Create style if missing
      let style = typeof props.style === 'string' ? props.style : '';
      // Get element properties
      for (let key in props) {
          const value = props[key];
          if (value === void 0) {
              continue;
          }
          switch (key) {
              // Properties to ignore
              case 'icon':
              case 'style':
              case 'onLoad':
                  break;
              // Boolean attributes
              case 'inline':
              case 'hFlip':
              case 'vFlip':
                  customisations[key] =
                      value === true || value === 'true' || value === 1;
                  break;
              // Flip as string: 'horizontal,vertical'
              case 'flip':
                  if (typeof value === 'string') {
                      flipFromString(customisations, value);
                  }
                  break;
              // Alignment as string
              case 'align':
                  if (typeof value === 'string') {
                      alignmentFromString(customisations, value);
                  }
                  break;
              // Color: copy to style, add extra ';' in case style is missing it
              case 'color':
                  style =
                      style +
                          (style.length > 0 && style.trim().slice(-1) !== ';'
                              ? ';'
                              : '') +
                          'color: ' +
                          value +
                          '; ';
                  break;
              // Rotation as string
              case 'rotate':
                  if (typeof value === 'string') {
                      customisations[key] = rotateFromString(value);
                  }
                  else if (typeof value === 'number') {
                      customisations[key] = value;
                  }
                  break;
              // Remove aria-hidden
              case 'ariaHidden':
              case 'aria-hidden':
                  if (value !== true && value !== 'true') {
                      delete componentProps['aria-hidden'];
                  }
                  break;
              default:
                  if (key.slice(0, 3) === 'on:') {
                      // Svelte event
                      break;
                  }
                  // Copy missing property if it does not exist in customisations
                  if (defaults[key] === void 0) {
                      componentProps[key] = value;
                  }
          }
      }
      // Generate icon
      const item = iconToSVG(icon, customisations);
      // Add icon stuff
      for (let key in item.attributes) {
          componentProps[key] =
              item.attributes[key];
      }
      if (item.inline) {
          // Style overrides it
          style = 'vertical-align: -0.125em; ' + style;
      }
      // Style
      if (style !== '') {
          componentProps.style = style;
      }
      // Counter for ids based on "id" property to render icons consistently on server and client
      let localCounter = 0;
      let id = props.id;
      if (typeof id === 'string') {
          // Convert '-' to '_' to avoid errors in animations
          id = id.replace(/-/g, '_');
      }
      // Generate HTML
      return {
          attributes: componentProps,
          body: replaceIDs(item.body, id ? () => id + 'ID' + localCounter++ : 'iconifySvelte'),
      };
  }
  /**
   * Initialise stuff
   */
  // Enable short names
  allowSimpleNames(true);
  // Set API module
  setAPIModule('', fetchAPIModule);
  /**
   * Browser stuff
   */
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      // Set cache and load existing cache
      cache.store = storeCache;
      loadCache();
      const _window = window;
      // Load icons from global "IconifyPreload"
      if (_window.IconifyPreload !== void 0) {
          const preload = _window.IconifyPreload;
          const err = 'Invalid IconifyPreload syntax.';
          if (typeof preload === 'object' && preload !== null) {
              (preload instanceof Array ? preload : [preload]).forEach((item) => {
                  try {
                      if (
                      // Check if item is an object and not null/array
                      typeof item !== 'object' ||
                          item === null ||
                          item instanceof Array ||
                          // Check for 'icons' and 'prefix'
                          typeof item.icons !== 'object' ||
                          typeof item.prefix !== 'string' ||
                          // Add icon set
                          !addCollection(item)) {
                          console.error(err);
                      }
                  }
                  catch (e) {
                      console.error(err);
                  }
              });
          }
      }
      // Set API from global "IconifyProviders"
      if (_window.IconifyProviders !== void 0) {
          const providers = _window.IconifyProviders;
          if (typeof providers === 'object' && providers !== null) {
              for (let key in providers) {
                  const err = 'IconifyProviders[' + key + '] is invalid.';
                  try {
                      const value = providers[key];
                      if (typeof value !== 'object' ||
                          !value ||
                          value.resources === void 0) {
                          continue;
                      }
                      if (!addAPIProvider(key, value)) {
                          console.error(err);
                      }
                  }
                  catch (e) {
                      console.error(err);
                  }
              }
          }
      }
  }
  /**
   * Check if component needs to be updated
   */
  function checkIconState(icon, state, mounted, callback, onload) {
      // Abort loading icon
      function abortLoading() {
          if (state.loading) {
              state.loading.abort();
              state.loading = null;
          }
      }
      // Icon is an object
      if (typeof icon === 'object' &&
          icon !== null &&
          typeof icon.body === 'string') {
          // Stop loading
          state.name = '';
          abortLoading();
          return { data: fullIcon(icon) };
      }
      // Invalid icon?
      let iconName;
      if (typeof icon !== 'string' ||
          (iconName = stringToIcon(icon, false, true)) === null) {
          abortLoading();
          return null;
      }
      // Load icon
      const data = getIconData(iconName);
      if (data === null) {
          // Icon needs to be loaded
          // Do not load icon until component is mounted
          if (mounted && (!state.loading || state.loading.name !== icon)) {
              // New icon to load
              abortLoading();
              state.name = '';
              state.loading = {
                  name: icon,
                  abort: loadIcons([iconName], callback),
              };
          }
          return null;
      }
      // Icon data is available
      abortLoading();
      if (state.name !== icon) {
          state.name = icon;
          if (onload && !state.destroyed) {
              onload(icon);
          }
      }
      // Add classes
      const classes = ['iconify'];
      if (iconName.prefix !== '') {
          classes.push('iconify--' + iconName.prefix);
      }
      if (iconName.provider !== '') {
          classes.push('iconify--' + iconName.provider);
      }
      return { data, classes };
  }
  /**
   * Generate icon
   */
  function generateIcon(icon, props) {
      return icon ? render(icon, props) : null;
  }

  /* node_modules\@iconify\svelte\dist\Icon.svelte generated by Svelte v3.50.0 */

  function create_if_block(ctx) {
  	let svg;
  	let raw_value = /*data*/ ctx[0].body + "";
  	let svg_levels = [/*data*/ ctx[0].attributes];
  	let svg_data = {};

  	for (let i = 0; i < svg_levels.length; i += 1) {
  		svg_data = internal.assign(svg_data, svg_levels[i]);
  	}

  	return {
  		c() {
  			svg = internal.svg_element("svg");
  			internal.set_svg_attributes(svg, svg_data);
  		},
  		m(target, anchor) {
  			internal.insert(target, svg, anchor);
  			svg.innerHTML = raw_value;
  		},
  		p(ctx, dirty) {
  			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			internal.set_svg_attributes(svg, svg_data = internal.get_spread_update(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
  		},
  		d(detaching) {
  			if (detaching) internal.detach(svg);
  		}
  	};
  }

  function create_fragment$3(ctx) {
  	let if_block_anchor;
  	let if_block = /*data*/ ctx[0] !== null && create_if_block(ctx);

  	return {
  		c() {
  			if (if_block) if_block.c();
  			if_block_anchor = internal.empty();
  		},
  		m(target, anchor) {
  			if (if_block) if_block.m(target, anchor);
  			internal.insert(target, if_block_anchor, anchor);
  		},
  		p(ctx, [dirty]) {
  			if (/*data*/ ctx[0] !== null) {
  				if (if_block) {
  					if_block.p(ctx, dirty);
  				} else {
  					if_block = create_if_block(ctx);
  					if_block.c();
  					if_block.m(if_block_anchor.parentNode, if_block_anchor);
  				}
  			} else if (if_block) {
  				if_block.d(1);
  				if_block = null;
  			}
  		},
  		i: internal.noop,
  		o: internal.noop,
  		d(detaching) {
  			if (if_block) if_block.d(detaching);
  			if (detaching) internal.detach(if_block_anchor);
  		}
  	};
  }

  function instance$2($$self, $$props, $$invalidate) {
  	const state = {
  		// Last icon name
  		name: '',
  		// Loading status
  		loading: null,
  		// Destroyed status
  		destroyed: false
  	};

  	// Mounted status
  	let mounted = false;

  	// Callback counter
  	let counter = 0;

  	// Generated data
  	let data;

  	const onLoad = icon => {
  		// Legacy onLoad property
  		if (typeof $$props.onLoad === 'function') {
  			$$props.onLoad(icon);
  		}

  		// on:load event
  		const dispatch = svelte.createEventDispatcher();

  		dispatch('load', { icon });
  	};

  	// Increase counter when loaded to force re-calculation of data
  	function loaded() {
  		$$invalidate(3, counter++, counter);
  	}

  	// Force re-render
  	svelte.onMount(() => {
  		$$invalidate(2, mounted = true);
  	});

  	// Abort loading when component is destroyed
  	svelte.onDestroy(() => {
  		$$invalidate(1, state.destroyed = true, state);

  		if (state.loading) {
  			state.loading.abort();
  			$$invalidate(1, state.loading = null, state);
  		}
  	});

  	$$self.$$set = $$new_props => {
  		$$invalidate(6, $$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props)));
  	};

  	$$self.$$.update = () => {
  		{
  			const iconData = checkIconState($$props.icon, state, mounted, loaded, onLoad);
  			$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

  			if (data && iconData.classes) {
  				// Add classes
  				$$invalidate(
  					0,
  					data.attributes['class'] = (typeof $$props['class'] === 'string'
  					? $$props['class'] + ' '
  					: '') + iconData.classes.join(' '),
  					data
  				);
  			}
  		}
  	};

  	$$props = internal.exclude_internal_props($$props);
  	return [data, state, mounted, counter];
  }

  class Icon extends internal.SvelteComponent {
  	constructor(options) {
  		super();
  		internal.init(this, options, instance$2, create_fragment$3, internal.safe_not_equal, {});
  	}
  }

  /* src\components\carousel.svelte generated by Svelte v3.50.0 */

  function add_css$2(target) {
  	internal.append_styles(target, "svelte-1cjmsns", ".carousel-container.svelte-1cjmsns.svelte-1cjmsns{height:100%;display:flex;flex-direction:column}div.svelte-1cjmsns .sc-carousel__carousel-container{height:100%}div.svelte-1cjmsns .sc-carousel__content-container{height:100%}.job-container.svelte-1cjmsns.svelte-1cjmsns{position:relative;list-style-type:none;width:100%;height:100%;perspective:1000px}.job-container.clicked .job{transform:rotateY(180deg)}.job-container.clicked .job-front{display:none}.job-container:not(.clicked) .job-front{display:block}.job-container.clicked .job-back{display:block}.job-container:not(.clicked) .job-back{display:none}.job.svelte-1cjmsns.svelte-1cjmsns{padding-bottom:100%;border-radius:1em;display:flex;flex-direction:column-reverse;position:absolute;width:100%;height:100%;transition:0.6s;transform-style:preserve-3d;position:relative}.job-front.svelte-1cjmsns.svelte-1cjmsns,.job-back.svelte-1cjmsns.svelte-1cjmsns{height:100%;transition:0.6s;transform-style:preserve-3d;position:relative;backface-visibility:hidden}.job-front.svelte-1cjmsns.svelte-1cjmsns{z-index:2;transform:rotateY(0deg)}.job-back.svelte-1cjmsns.svelte-1cjmsns{transform:rotateY(180deg);background-color:beige}.job-header.svelte-1cjmsns.svelte-1cjmsns{display:flex;flex-direction:column;align-items:flex-start;background-color:rgba(0, 0, 0, 0.35);color:white;padding:0.5em;border-bottom-left-radius:1em;border-bottom-right-radius:1em}.job-name.svelte-1cjmsns.svelte-1cjmsns{font-size:2em}.job-tag.svelte-1cjmsns.svelte-1cjmsns{background-color:rgba(255, 255, 255, 0.2);border-radius:5px;margin:2px;padding:2px}.stack-container.svelte-1cjmsns.svelte-1cjmsns{display:flex}.rating-container.svelte-1cjmsns.svelte-1cjmsns{padding:0;list-style-type:none;display:flex;justify-content:center;font-size:2em;margin-bottom:0;margin-top:0.5em}.rating-container.svelte-1cjmsns li.svelte-1cjmsns{padding:0.5em;margin:0 0.25em;height:1em;width:1em;border-radius:5em;display:flex}");
  }

  function get_each_context(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[4] = list[i].name;
  	child_ctx[5] = list[i].position;
  	child_ctx[6] = list[i].salary;
  	child_ctx[7] = list[i].description;
  	child_ctx[8] = list[i].techStack;
  	child_ctx[9] = list[i].slogan;
  	child_ctx[10] = list[i].picUrl;
  	return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
  	const child_ctx = ctx.slice();
  	child_ctx[13] = list[i];
  	return child_ctx;
  }

  // (21:8) {#each techStack as tech}
  function create_each_block_1(ctx) {
  	let span;
  	let t_value = /*tech*/ ctx[13] + "";
  	let t;

  	return {
  		c() {
  			span = internal.element("span");
  			t = internal.text(t_value);
  			internal.attr(span, "class", "job-tag svelte-1cjmsns");
  		},
  		m(target, anchor) {
  			internal.insert(target, span, anchor);
  			internal.append(span, t);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*jobs*/ 1 && t_value !== (t_value = /*tech*/ ctx[13] + "")) internal.set_data(t, t_value);
  		},
  		d(detaching) {
  			if (detaching) internal.detach(span);
  		}
  	};
  }

  // (12:2) {#each jobs as { name, position, salary, description, techStack, slogan, picUrl }}
  function create_each_block(ctx) {
  	let li;
  	let div4;
  	let div2;
  	let div1;
  	let span0;
  	let t0_value = /*name*/ ctx[4] + "";
  	let t0;
  	let t1;
  	let span1;
  	let t2_value = /*position*/ ctx[5] + "";
  	let t2;
  	let t3;
  	let span2;
  	let t4_value = /*formatter*/ ctx[2].format(/*salary*/ ctx[6]) + "";
  	let t4;
  	let t5;
  	let div0;
  	let t6;
  	let div3;
  	let t8;
  	let li_id_value;
  	let each_value_1 = /*techStack*/ ctx[8];
  	let each_blocks = [];

  	for (let i = 0; i < each_value_1.length; i += 1) {
  		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  	}

  	return {
  		c() {
  			li = internal.element("li");
  			div4 = internal.element("div");
  			div2 = internal.element("div");
  			div1 = internal.element("div");
  			span0 = internal.element("span");
  			t0 = internal.text(t0_value);
  			t1 = internal.space();
  			span1 = internal.element("span");
  			t2 = internal.text(t2_value);
  			t3 = internal.space();
  			span2 = internal.element("span");
  			t4 = internal.text(t4_value);
  			t5 = internal.space();
  			div0 = internal.element("div");

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			t6 = internal.space();
  			div3 = internal.element("div");
  			div3.textContent = "back";
  			t8 = internal.space();
  			internal.attr(span0, "class", "job-name svelte-1cjmsns");
  			internal.attr(span1, "class", "job-position job-tag svelte-1cjmsns");
  			internal.attr(span2, "class", "job-salary job-tag svelte-1cjmsns");
  			internal.attr(div0, "class", "stack-container svelte-1cjmsns");
  			internal.attr(div1, "class", "job-header svelte-1cjmsns");
  			internal.attr(div2, "class", "job-front svelte-1cjmsns");
  			internal.set_style(div2, "background-image", "url(" + /*picUrl*/ ctx[10] + ")");
  			internal.attr(div3, "class", "job-back svelte-1cjmsns");
  			internal.attr(div4, "class", "job svelte-1cjmsns");
  			internal.attr(li, "id", li_id_value = /*name*/ ctx[4].replace(/\s/g, ''));
  			internal.attr(li, "class", "job-container svelte-1cjmsns");
  			internal.attr(li, "ontouchstart", "this.classList.toggle('clicked');");
  		},
  		m(target, anchor) {
  			internal.insert(target, li, anchor);
  			internal.append(li, div4);
  			internal.append(div4, div2);
  			internal.append(div2, div1);
  			internal.append(div1, span0);
  			internal.append(span0, t0);
  			internal.append(div1, t1);
  			internal.append(div1, span1);
  			internal.append(span1, t2);
  			internal.append(div1, t3);
  			internal.append(div1, span2);
  			internal.append(span2, t4);
  			internal.append(div1, t5);
  			internal.append(div1, div0);

  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(div0, null);
  			}

  			internal.append(div4, t6);
  			internal.append(div4, div3);
  			internal.append(li, t8);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*jobs*/ 1 && t0_value !== (t0_value = /*name*/ ctx[4] + "")) internal.set_data(t0, t0_value);
  			if (dirty & /*jobs*/ 1 && t2_value !== (t2_value = /*position*/ ctx[5] + "")) internal.set_data(t2, t2_value);
  			if (dirty & /*jobs*/ 1 && t4_value !== (t4_value = /*formatter*/ ctx[2].format(/*salary*/ ctx[6]) + "")) internal.set_data(t4, t4_value);

  			if (dirty & /*jobs*/ 1) {
  				each_value_1 = /*techStack*/ ctx[8];
  				let i;

  				for (i = 0; i < each_value_1.length; i += 1) {
  					const child_ctx = get_each_context_1(ctx, each_value_1, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block_1(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(div0, null);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value_1.length;
  			}

  			if (dirty & /*jobs*/ 1) {
  				internal.set_style(div2, "background-image", "url(" + /*picUrl*/ ctx[10] + ")");
  			}

  			if (dirty & /*jobs*/ 1 && li_id_value !== (li_id_value = /*name*/ ctx[4].replace(/\s/g, ''))) {
  				internal.attr(li, "id", li_id_value);
  			}
  		},
  		d(detaching) {
  			if (detaching) internal.detach(li);
  			internal.destroy_each(each_blocks, detaching);
  		}
  	};
  }

  // (11:1) <Carousel bind:this={carousel} arrows={false} dots={false}>
  function create_default_slot(ctx) {
  	let each_1_anchor;
  	let each_value = /*jobs*/ ctx[0];
  	let each_blocks = [];

  	for (let i = 0; i < each_value.length; i += 1) {
  		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  	}

  	return {
  		c() {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].c();
  			}

  			each_1_anchor = internal.empty();
  		},
  		m(target, anchor) {
  			for (let i = 0; i < each_blocks.length; i += 1) {
  				each_blocks[i].m(target, anchor);
  			}

  			internal.insert(target, each_1_anchor, anchor);
  		},
  		p(ctx, dirty) {
  			if (dirty & /*jobs, formatter*/ 5) {
  				each_value = /*jobs*/ ctx[0];
  				let i;

  				for (i = 0; i < each_value.length; i += 1) {
  					const child_ctx = get_each_context(ctx, each_value, i);

  					if (each_blocks[i]) {
  						each_blocks[i].p(child_ctx, dirty);
  					} else {
  						each_blocks[i] = create_each_block(child_ctx);
  						each_blocks[i].c();
  						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
  					}
  				}

  				for (; i < each_blocks.length; i += 1) {
  					each_blocks[i].d(1);
  				}

  				each_blocks.length = each_value.length;
  			}
  		},
  		d(detaching) {
  			internal.destroy_each(each_blocks, detaching);
  			if (detaching) internal.detach(each_1_anchor);
  		}
  	};
  }

  function create_fragment$2(ctx) {
  	let div;
  	let carousel_1;
  	let t0;
  	let ul;
  	let li0;
  	let icon0;
  	let t1;
  	let li1;
  	let icon1;
  	let current;

  	let carousel_1_props = {
  		arrows: false,
  		dots: false,
  		$$slots: { default: [create_default_slot] },
  		$$scope: { ctx }
  	};

  	carousel_1 = new Carousel__default["default"]({ props: carousel_1_props });
  	/*carousel_1_binding*/ ctx[3](carousel_1);
  	icon0 = new Icon({ props: { icon: "uil:x" } });
  	icon1 = new Icon({ props: { icon: "uil:check-circle" } });

  	return {
  		c() {
  			div = internal.element("div");
  			internal.create_component(carousel_1.$$.fragment);
  			t0 = internal.space();
  			ul = internal.element("ul");
  			li0 = internal.element("li");
  			internal.create_component(icon0.$$.fragment);
  			t1 = internal.space();
  			li1 = internal.element("li");
  			internal.create_component(icon1.$$.fragment);
  			internal.attr(li0, "class", "svelte-1cjmsns");
  			internal.attr(li1, "class", "svelte-1cjmsns");
  			internal.attr(ul, "class", "rating-container svelte-1cjmsns");
  			internal.attr(div, "class", "carousel-container svelte-1cjmsns");
  		},
  		m(target, anchor) {
  			internal.insert(target, div, anchor);
  			internal.mount_component(carousel_1, div, null);
  			internal.append(div, t0);
  			internal.append(div, ul);
  			internal.append(ul, li0);
  			internal.mount_component(icon0, li0, null);
  			internal.append(ul, t1);
  			internal.append(ul, li1);
  			internal.mount_component(icon1, li1, null);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			const carousel_1_changes = {};

  			if (dirty & /*$$scope, jobs*/ 65537) {
  				carousel_1_changes.$$scope = { dirty, ctx };
  			}

  			carousel_1.$set(carousel_1_changes);
  		},
  		i(local) {
  			if (current) return;
  			internal.transition_in(carousel_1.$$.fragment, local);
  			internal.transition_in(icon0.$$.fragment, local);
  			internal.transition_in(icon1.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			internal.transition_out(carousel_1.$$.fragment, local);
  			internal.transition_out(icon0.$$.fragment, local);
  			internal.transition_out(icon1.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) internal.detach(div);
  			/*carousel_1_binding*/ ctx[3](null);
  			internal.destroy_component(carousel_1);
  			internal.destroy_component(icon0);
  			internal.destroy_component(icon1);
  		}
  	};
  }

  function instance$1($$self, $$props, $$invalidate) {
  	let carousel;
  	let { jobs } = $$props;
  	let formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  	function carousel_1_binding($$value) {
  		internal.binding_callbacks[$$value ? 'unshift' : 'push'](() => {
  			carousel = $$value;
  			$$invalidate(1, carousel);
  		});
  	}

  	$$self.$$set = $$props => {
  		if ('jobs' in $$props) $$invalidate(0, jobs = $$props.jobs);
  	};

  	return [jobs, carousel, formatter, carousel_1_binding];
  }

  class Carousel_1 extends internal.SvelteComponent {
  	constructor(options) {
  		super();
  		internal.init(this, options, instance$1, create_fragment$2, internal.safe_not_equal, { jobs: 0 }, add_css$2);
  	}
  }

  /* src\components\navmenu.svelte generated by Svelte v3.50.0 */

  function add_css$1(target) {
  	internal.append_styles(target, "svelte-n0ulae", ".nav-menu.svelte-n0ulae{list-style-type:none;font-size:2em;background-color:#565680;color:white;border-radius:.5em;padding:.5em;display:flex;justify-content:space-around;margin-top:.5em;margin-bottom:.5em}");
  }

  function create_fragment$1(ctx) {
  	let ul;
  	let li0;
  	let icon0;
  	let t0;
  	let li1;
  	let icon1;
  	let t1;
  	let li2;
  	let icon2;
  	let t2;
  	let li3;
  	let icon3;
  	let current;
  	icon0 = new Icon({ props: { icon: "uil:home-alt" } });
  	icon1 = new Icon({ props: { icon: "uil:comment-alt-notes" } });
  	icon2 = new Icon({ props: { icon: "uil:setting" } });
  	icon3 = new Icon({ props: { icon: "uil:user-circle" } });

  	return {
  		c() {
  			ul = internal.element("ul");
  			li0 = internal.element("li");
  			internal.create_component(icon0.$$.fragment);
  			t0 = internal.space();
  			li1 = internal.element("li");
  			internal.create_component(icon1.$$.fragment);
  			t1 = internal.space();
  			li2 = internal.element("li");
  			internal.create_component(icon2.$$.fragment);
  			t2 = internal.space();
  			li3 = internal.element("li");
  			internal.create_component(icon3.$$.fragment);
  			internal.attr(ul, "class", "nav-menu svelte-n0ulae");
  		},
  		m(target, anchor) {
  			internal.insert(target, ul, anchor);
  			internal.append(ul, li0);
  			internal.mount_component(icon0, li0, null);
  			internal.append(ul, t0);
  			internal.append(ul, li1);
  			internal.mount_component(icon1, li1, null);
  			internal.append(ul, t1);
  			internal.append(ul, li2);
  			internal.mount_component(icon2, li2, null);
  			internal.append(ul, t2);
  			internal.append(ul, li3);
  			internal.mount_component(icon3, li3, null);
  			current = true;
  		},
  		p: internal.noop,
  		i(local) {
  			if (current) return;
  			internal.transition_in(icon0.$$.fragment, local);
  			internal.transition_in(icon1.$$.fragment, local);
  			internal.transition_in(icon2.$$.fragment, local);
  			internal.transition_in(icon3.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			internal.transition_out(icon0.$$.fragment, local);
  			internal.transition_out(icon1.$$.fragment, local);
  			internal.transition_out(icon2.$$.fragment, local);
  			internal.transition_out(icon3.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) internal.detach(ul);
  			internal.destroy_component(icon0);
  			internal.destroy_component(icon1);
  			internal.destroy_component(icon2);
  			internal.destroy_component(icon3);
  		}
  	};
  }

  class Navmenu extends internal.SvelteComponent {
  	constructor(options) {
  		super();
  		internal.init(this, options, null, create_fragment$1, internal.safe_not_equal, {}, add_css$1);
  	}
  }

  /* src\App.svelte generated by Svelte v3.50.0 */

  function add_css(target) {
  	internal.append_styles(target, "svelte-113054l", "h1.svelte-113054l{color:#f00}");
  }

  function create_fragment(ctx) {
  	let div;
  	let h1;
  	let t1;
  	let carouselcomponent;
  	let updating_jobs;
  	let t2;
  	let navmenucomponent;
  	let current;

  	function carouselcomponent_jobs_binding(value) {
  		/*carouselcomponent_jobs_binding*/ ctx[1](value);
  	}

  	let carouselcomponent_props = {};

  	if (/*jobs*/ ctx[0] !== void 0) {
  		carouselcomponent_props.jobs = /*jobs*/ ctx[0];
  	}

  	carouselcomponent = new Carousel_1({ props: carouselcomponent_props });
  	internal.binding_callbacks.push(() => internal.bind(carouselcomponent, 'jobs', carouselcomponent_jobs_binding));
  	navmenucomponent = new Navmenu({});

  	return {
  		c() {
  			div = internal.element("div");
  			h1 = internal.element("h1");
  			h1.textContent = "Your Jobs";
  			t1 = internal.space();
  			internal.create_component(carouselcomponent.$$.fragment);
  			t2 = internal.space();
  			internal.create_component(navmenucomponent.$$.fragment);
  			internal.attr(h1, "class", "svelte-113054l");
  			internal.attr(div, "class", "main-content");
  		},
  		m(target, anchor) {
  			internal.insert(target, div, anchor);
  			internal.append(div, h1);
  			internal.append(div, t1);
  			internal.mount_component(carouselcomponent, div, null);
  			internal.append(div, t2);
  			internal.mount_component(navmenucomponent, div, null);
  			current = true;
  		},
  		p(ctx, [dirty]) {
  			const carouselcomponent_changes = {};

  			if (!updating_jobs && dirty & /*jobs*/ 1) {
  				updating_jobs = true;
  				carouselcomponent_changes.jobs = /*jobs*/ ctx[0];
  				internal.add_flush_callback(() => updating_jobs = false);
  			}

  			carouselcomponent.$set(carouselcomponent_changes);
  		},
  		i(local) {
  			if (current) return;
  			internal.transition_in(carouselcomponent.$$.fragment, local);
  			internal.transition_in(navmenucomponent.$$.fragment, local);
  			current = true;
  		},
  		o(local) {
  			internal.transition_out(carouselcomponent.$$.fragment, local);
  			internal.transition_out(navmenucomponent.$$.fragment, local);
  			current = false;
  		},
  		d(detaching) {
  			if (detaching) internal.detach(div);
  			internal.destroy_component(carouselcomponent);
  			internal.destroy_component(navmenucomponent);
  		}
  	};
  }

  function instance($$self, $$props, $$invalidate) {
  	let jobs = [];

  	class Job {
  		constructor(name, position, salary, description, techStack, slogan, picUrl) {
  			(this.name = name, this.position = position, this.salary = salary, this.description = description, this.techStack = techStack, this.slogan = slogan);
  			this.picUrl = picUrl;
  		}
  	}

  	populateJobs();

  	function populateJobs() {
  		jobs.push(new Job('Cool Tech Technologies', 'Senior Dev', 150000, 'Looking for a rlly cool dev who knows their stuff and is okay with never seeing their family.', ['React', 'Node', 'Eric', 'MongoDB', 'Express'], "Coolin Off and Techin' Out", "https://images.unsplash.com/photo-1636535845762-50d7c7a56570?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"));
  		jobs.push(new Job('Coin Op Bop', 'Junior Web Developer', 50000, 'All you can eat coins, all the time. Please note we are no longer giving away pennies, and do not support them.', ['PHP', 'Laravel', 'MySQL', 'Django'], "Coolin' Off and Techin' Out", "https://images.unsplash.com/photo-1586974710160-55f48f417990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80"));
  		jobs.push(new Job('Tiny Startup', 'CEO', 100, 'Please.', ['Everything'], "Help Us.", "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"));
  	}

  	function carouselcomponent_jobs_binding(value) {
  		jobs = value;
  		$$invalidate(0, jobs);
  	}

  	return [jobs, carouselcomponent_jobs_binding];
  }

  class App extends internal.SvelteComponent {
  	constructor(options) {
  		super();
  		internal.init(this, options, instance, create_fragment, internal.safe_not_equal, {}, add_css);
  	}
  }

  var app = new App({
    target: document.body,
  });

  return app;

})(internal, svelte, Carousel);
//# sourceMappingURL=bundle.js.map
