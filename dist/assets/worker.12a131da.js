/* NightVisionCharts v0.3.2 | License: MIT
 © 2022 ChartMaster. All rights reserved */
(function() {
  "use strict";
  function regression(data, len, offset) {
    data = data.slice(0, len).reverse().map((x, i2) => [i2, x]);
    var sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0, count = 0, m, b;
    for (var i = 0, len = data.length; i < len; i++) {
      if (!data[i])
        return NaN;
      var point = data[i];
      sum_x += point[0];
      sum_y += point[1];
      sum_xx += point[0] * point[0];
      sum_xy += point[0] * point[1];
      count++;
    }
    m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
    b = sum_y / count - m * sum_x / count;
    return m * (data.length - 1 - offset) + b;
  }
  var util$1 = {};
  function isArrayLike(o) {
    if (o && typeof o === "object" && isFinite(o.length) && o.length >= 0 && o.length === Math.floor(o.length) && o.length < 4294967296)
      return true;
    else
      return false;
  }
  function isSortable(o) {
    if (o && typeof o === "object" && typeof o.sort === "function")
      return true;
    else
      return false;
  }
  util$1.isSortableArrayLike = function(o) {
    return isArrayLike(o) && isSortable(o);
  };
  var compare = {
    numcmp: function(a, b) {
      return a - b;
    },
    strcmp: function(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };
  var binary = {};
  function loop(data, min, max, index, valpos) {
    var curr = max + min >>> 1;
    var diff = this.compare(data[curr][this.index], index);
    if (!diff) {
      return valpos[index] = {
        "found": true,
        "index": curr,
        "prev": null,
        "next": null
      };
    }
    if (min >= max) {
      return valpos[index] = {
        "found": false,
        "index": null,
        "prev": diff < 0 ? max : max - 1,
        "next": diff < 0 ? max + 1 : max
      };
    }
    if (diff > 0)
      return loop.call(this, data, min, curr - 1, index, valpos);
    else
      return loop.call(this, data, curr + 1, max, index, valpos);
  }
  function search(index) {
    var data = this.data;
    return loop.call(this, data, 0, data.length - 1, index, this.valpos);
  }
  binary.search = search;
  var util = util$1, cmp = compare, bin = binary;
  var lib = IndexedArray;
  function IndexedArray(data, index) {
    if (!util.isSortableArrayLike(data))
      throw new Error("Invalid data");
    if (!index || data.length > 0 && !(index in data[0]))
      throw new Error("Invalid index");
    this.data = data;
    this.index = index;
    this.setBoundaries();
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;
    this.search = bin.search;
    this.valpos = {};
    this.cursor = null;
    this.nextlow = null;
    this.nexthigh = null;
  }
  IndexedArray.prototype.setCompare = function(fn) {
    if (typeof fn !== "function")
      throw new Error("Invalid argument");
    this.compare = fn;
    return this;
  };
  IndexedArray.prototype.setSearch = function(fn) {
    if (typeof fn !== "function")
      throw new Error("Invalid argument");
    this.search = fn;
    return this;
  };
  IndexedArray.prototype.sort = function() {
    var self2 = this, index = this.index;
    this.data.sort(function(a, b) {
      return self2.compare(a[index], b[index]);
    });
    this.setBoundaries();
    return this;
  };
  IndexedArray.prototype.setBoundaries = function() {
    var data = this.data, index = this.index;
    this.minv = data.length && data[0][index];
    this.maxv = data.length && data[data.length - 1][index];
    return this;
  };
  IndexedArray.prototype.fetch = function(value) {
    if (this.data.length === 0) {
      this.cursor = null;
      this.nextlow = null;
      this.nexthigh = null;
      return this;
    }
    if (this.compare(value, this.minv) === -1) {
      this.cursor = null;
      this.nextlow = null;
      this.nexthigh = 0;
      return this;
    }
    if (this.compare(value, this.maxv) === 1) {
      this.cursor = null;
      this.nextlow = this.data.length - 1;
      this.nexthigh = null;
      return this;
    }
    var valpos = this.valpos, pos = valpos[value];
    if (pos) {
      if (pos.found) {
        this.cursor = pos.index;
        this.nextlow = null;
        this.nexthigh = null;
      } else {
        this.cursor = null;
        this.nextlow = pos.prev;
        this.nexthigh = pos.next;
      }
      return this;
    }
    var result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
  };
  IndexedArray.prototype.get = function(value) {
    if (value)
      this.fetch(value);
    var pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
  };
  IndexedArray.prototype.getRange = function(begin, end) {
    if (this.compare(begin, end) === 1) {
      return [];
    }
    this.fetch(begin);
    var start = this.cursor || this.nexthigh;
    this.fetch(end);
    var finish = this.cursor || this.nextlow;
    if (start === null || finish === null) {
      return [];
    }
    return this.data.slice(start, finish + 1);
  };
  const SECOND = 1e3;
  const MINUTE = SECOND * 60;
  const MINUTE3 = MINUTE * 3;
  const MINUTE5 = MINUTE * 5;
  const MINUTE15 = MINUTE * 15;
  const MINUTE30 = MINUTE * 30;
  const HOUR = MINUTE * 60;
  const HOUR4 = HOUR * 4;
  const HOUR12 = HOUR * 12;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = WEEK * 4;
  const YEAR = DAY * 365;
  const MONTHMAP = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const TIMESCALES = [
    YEAR * 10,
    YEAR * 5,
    YEAR * 3,
    YEAR * 2,
    YEAR,
    MONTH * 6,
    MONTH * 4,
    MONTH * 3,
    MONTH * 2,
    MONTH,
    DAY * 15,
    DAY * 10,
    DAY * 7,
    DAY * 5,
    DAY * 3,
    DAY * 2,
    DAY,
    HOUR * 12,
    HOUR * 6,
    HOUR * 3,
    HOUR * 1.5,
    HOUR,
    MINUTE30,
    MINUTE15,
    MINUTE * 10,
    MINUTE5,
    MINUTE * 2,
    MINUTE
  ];
  const $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
  const COLORS = {
    back: "#14151c",
    grid: "#252732",
    text: "#adadad",
    textHL: "#dedddd",
    textLG: "#c4c4c4",
    llValue: "#818989",
    llBack: "#14151c77",
    llSelect: "#2d7b2f",
    scale: "#606060",
    cross: "#8091a0",
    candleUp: "#41a376",
    candleDw: "#de4646",
    wickUp: "#23a77688",
    wickDw: "#e5415088",
    volUp: "#41a37682",
    volDw: "#de464682",
    panel: "#2a2f38",
    tbBack: void 0,
    tbBorder: "#8282827d"
  };
  const ChartConfig = {
    SBMIN: 60,
    SBMAX: Infinity,
    TOOLBAR: 57,
    TB_ICON: 25,
    TB_ITEM_M: 6,
    TB_ICON_BRI: 1,
    TB_ICON_HOLD: 420,
    TB_BORDER: 1,
    TB_B_STYLE: "dotted",
    TOOL_COLL: 7,
    EXPAND: 0.15,
    CANDLEW: 0.7,
    GRIDX: 100,
    GRIDY: 47,
    BOTBAR: 28,
    PANHEIGHT: 22,
    DEFAULT_LEN: 50,
    MINIMUM_LEN: 5,
    MIN_ZOOM: 5,
    MAX_ZOOM: 5e3,
    VOLSCALE: 0.15,
    UX_OPACITY: 0.9,
    ZOOM_MODE: "tv",
    L_BTN_SIZE: 21,
    L_BTN_MARGIN: "-6px 0 -6px 0",
    SCROLL_WHEEL: "prevent",
    QUANTIZE_AFTER: 0,
    AUTO_PRE_SAMPLE: 10
  };
  ChartConfig.FONT = `11px -apple-system,BlinkMacSystemFont,
    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,
    Fira Sans,Droid Sans,Helvetica Neue,
    sans-serif`;
  const IB_TF_WARN = `When using IB mode you should specify timeframe ('tf' filed in 'chart' object),otherwise you can get an unexpected behaviour`;
  const MAP_UNIT = {
    "1s": SECOND,
    "5s": SECOND * 5,
    "10s": SECOND * 10,
    "20s": SECOND * 20,
    "30s": SECOND * 30,
    "1m": MINUTE,
    "3m": MINUTE3,
    "5m": MINUTE5,
    "15m": MINUTE15,
    "30m": MINUTE30,
    "1H": HOUR,
    "2H": HOUR * 2,
    "3H": HOUR * 3,
    "4H": HOUR4,
    "12H": HOUR12,
    "1D": DAY,
    "1W": WEEK,
    "1M": MONTH,
    "1Y": YEAR,
    "1h": HOUR,
    "2h": HOUR * 2,
    "3h": HOUR * 3,
    "4h": HOUR4,
    "12h": HOUR12,
    "1d": DAY,
    "1w": WEEK,
    "1y": YEAR
  };
  const HPX = -0.5;
  var Const = {
    SECOND,
    MINUTE,
    MINUTE5,
    MINUTE15,
    MINUTE30,
    HOUR,
    HOUR4,
    DAY,
    WEEK,
    MONTH,
    YEAR,
    MONTHMAP,
    TIMESCALES,
    $SCALES,
    ChartConfig,
    MAP_UNIT,
    IB_TF_WARN,
    COLORS,
    HPX
  };
  var Utils = {
    clamp(num, min, max) {
      return num <= min ? min : num >= max ? max : num;
    },
    addZero(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    },
    dayStart(t) {
      let start = new Date(t);
      return start.setUTCHours(0, 0, 0, 0);
    },
    monthStart(t) {
      let date = new Date(t);
      return Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        1
      );
    },
    yearStart(t) {
      return Date.UTC(new Date(t).getFullYear());
    },
    getYear(t) {
      if (!t)
        return void 0;
      return new Date(t).getUTCFullYear();
    },
    getMonth(t) {
      if (!t)
        return void 0;
      return new Date(t).getUTCMonth();
    },
    nearestA(x, array) {
      let dist = Infinity;
      let val = null;
      let index = -1;
      for (var i = 0; i < array.length; i++) {
        var xi = array[i];
        if (Math.abs(xi - x) < dist) {
          dist = Math.abs(xi - x);
          val = xi;
          index = i;
        }
      }
      return [index, val];
    },
    nearestTs(t, ts) {
      let dist = Infinity;
      let val = null;
      let index = -1;
      for (var i = 0; i < ts.length; i++) {
        var ti = ts[i][0];
        if (Math.abs(ti - t) < dist) {
          dist = Math.abs(ti - t);
          val = ts[i];
          index = i;
        }
      }
      return [index, val];
    },
    nearestTsIb(i, ts, offset) {
      let index = Math.floor(i - offset) + 1;
      let val = ts[index] || null;
      return [index, val];
    },
    round(num, decimals = 8) {
      return parseFloat(num.toFixed(decimals));
    },
    strip(number) {
      return parseFloat(
        parseFloat(number).toPrecision(12)
      );
    },
    getDay(t) {
      return t ? new Date(t).getDate() : null;
    },
    overwrite(arr, new_arr) {
      arr.splice(0, arr.length, ...new_arr);
    },
    allOverlays(panes = []) {
      return panes.map((x) => x.overlays || []).flat();
    },
    detectTimeframe(data) {
      let len = Math.min(data.length - 1, 99);
      let min = Infinity;
      data.slice(0, len).forEach((x, i) => {
        let d = data[i + 1][0] - x[0];
        if (d === d && d < min)
          min = d;
      });
      if (min >= Const.MONTH && min <= Const.DAY * 30) {
        return Const.DAY * 31;
      }
      return min;
    },
    fastFilter(arr, t1, t2) {
      if (!arr.length)
        return [arr, void 0];
      try {
        let ia = new lib(arr, "0");
        let res = ia.getRange(t1, t2);
        let i0 = ia.valpos[t1].next;
        return [res, i0];
      } catch (e) {
        return [arr.filter(
          (x) => x[0] >= t1 && x[0] <= t2
        ), 0];
      }
    },
    fastFilter2(arr, t1, t2) {
      if (!arr.length)
        return [arr, void 0];
      try {
        let ia = new lib(arr, "0");
        ia.fetch(t1);
        let start = ia.cursor || ia.nexthigh;
        ia.fetch(t2);
        let finish = ia.cursor || ia.nextlow;
        return [start, finish + 1];
      } catch (e) {
        let subset = arr.filter(
          (x) => x[0] >= t1 && x[0] <= t2
        );
        let i1 = arr.indexOf(subset[0]);
        let i2 = arr.indexOf(subset[subset.length - 1]);
        return [i1, i2];
      }
    },
    fastFilterIB(arr, t1, t2) {
      if (!arr.length)
        return [void 0, void 0];
      let i1 = Math.floor(t1);
      if (i1 < 0)
        i1 = 0;
      let i2 = Math.floor(t2 + 1);
      return [i1, i2];
    },
    fastNearest(arr, t1) {
      let ia = new lib(arr, "0");
      ia.fetch(t1);
      return [ia.nextlow, ia.nexthigh];
    },
    now() {
      return new Date().getTime();
    },
    pause(delay) {
      return new Promise((rs, rj) => setTimeout(rs, delay));
    },
    smartWheel(delta) {
      let abs = Math.abs(delta);
      if (abs > 500) {
        return (200 + Math.log(abs)) * Math.sign(delta);
      }
      return delta;
    },
    getDeltaX(event) {
      return event.originalEvent.deltaX / 12;
    },
    getDeltaY(event) {
      return event.originalEvent.deltaY / 12;
    },
    applyOpacity(c, op) {
      if (c.length === 7) {
        let n = Math.floor(op * 255);
        n = this.clamp(n, 0, 255);
        c += n.toString(16);
      }
      return c;
    },
    parseTf(smth) {
      if (typeof smth === "string") {
        return Const.MAP_UNIT[smth];
      } else {
        return smth;
      }
    },
    indexShift(sub, data) {
      if (!data.length)
        return 0;
      let first = data[0][0];
      let second;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] !== first) {
          second = data[i][0];
          break;
        }
      }
      for (var j = 0; j < sub.length; j++) {
        if (sub[j][0] === second) {
          return j - i;
        }
      }
      return 0;
    },
    measureText(ctx, text, nvId) {
      let m = ctx.measureTextOrg(text);
      if (m.width === 0) {
        const doc = document;
        const id = "nvjs-measure-text";
        let el = doc.getElementById(id);
        if (!el) {
          let base = doc.getElementById(nvId);
          el = doc.createElement("div");
          el.id = id;
          el.style.position = "absolute";
          el.style.top = "-1000px";
          base.appendChild(el);
        }
        if (ctx.font)
          el.style.font = ctx.font;
        el.innerText = text.replace(/ /g, ".");
        return { width: el.offsetWidth };
      } else {
        return m;
      }
    },
    uuid(temp = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx") {
      return temp.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    },
    uuid2() {
      return this.uuid("xxxxxxxxxxxx");
    },
    uuid3() {
      return Math.random().toString().slice(2).replace(/^0+/, "");
    },
    warn(f, text, delay = 0) {
      setTimeout(() => {
        if (f())
          console.warn(text);
      }, delay);
    },
    delayedExec(v) {
      if (!v.script || !v.script.execInterval)
        return true;
      let t = this.now();
      let dt = v.script.execInterval;
      if (!v.settings.$last_exec || t > v.settings.$last_exec + dt) {
        v.settings.$last_exec = t;
        return true;
      }
      return false;
    },
    formatName(ov) {
      if (!ov.name)
        return void 0;
      let name = ov.name;
      for (var k in ov.settings || {}) {
        let val = ov.settings[k];
        let reg = new RegExp(`\\$${k}`, "g");
        name = name.replace(reg, val);
      }
      return name;
    },
    xMode() {
      return this.is_mobile ? "explore" : "default";
    },
    defaultPrevented(event) {
      if (event.original) {
        return event.original.defaultPrevented;
      }
      return event.defaultPrevented;
    },
    afterAll(object, f, time) {
      clearTimeout(object.__afterAllId__);
      object.__afterAllId__ = setTimeout(() => f(), time);
    },
    defaultPreSampler(el) {
      if (!el)
        return [];
      let out = [];
      for (var i = 1; i < el.length; i++) {
        if (typeof el[i] === "number") {
          out.push(el[i]);
        }
      }
      return out;
    },
    getScalesBySide(side, layout) {
      if (!layout)
        return [];
      let template = layout.settings.scaleTemplate;
      return template[side].map((id) => layout.scales[id]).filter((x) => x);
    },
    autoScaleSideId(S, sides, idxs) {
      if (sides[S].length) {
        if (!idxs[S] || !sides[S].includes(idxs[S])) {
          idxs[S] = sides[S][0];
        }
      } else {
        idxs[S] = void 0;
      }
    },
    callsPerSecond() {
      if (window.__counter__ === void 0) {
        window.__counter__ = 0;
      }
      window.__counter__++;
      if (window.__cpsId__)
        return;
      window.__cpsId__ = setTimeout(() => {
        console.log(window.__counter__, "upd/sec");
        window.__counter__ = 0;
        window.__cpsId__ = null;
      }, 1e3);
    },
    findIndexOffset(mainTs, ts) {
      let set1 = {};
      let set2 = {};
      for (var i = 0; i < mainTs.length; i++) {
        set1[mainTs[i][0]] = i;
      }
      for (var i = 0; i < ts.length; i++) {
        set2[ts[i][0]] = i;
      }
      let deltas = [];
      for (var t in set2) {
        if (set1[t] !== void 0) {
          let d = set1[t] - set2[t];
          if (!deltas.length || deltas[0] === d) {
            deltas.unshift(d);
          }
          if (deltas.length === 3) {
            return deltas.pop();
          }
        }
      }
      return 0;
    },
    formatCash(n) {
      if (n == void 0)
        return "x";
      if (typeof n !== "number")
        return n;
      if (n < 1e3)
        return n.toFixed(0);
      if (n >= 1e3 && n < 1e6)
        return +(n / 1e3).toFixed(2) + "K";
      if (n >= 1e6 && n < 1e9)
        return +(n / 1e6).toFixed(2) + "M";
      if (n >= 1e9 && n < 1e12)
        return +(n / 1e9).toFixed(2) + "B";
      if (n >= 1e12)
        return +(n / 1e12).toFixed(2) + "T";
    },
    realTimeRange(data) {
      if (!data.length)
        return 0;
      return data[data.length - 1][0] - data[0][0];
    },
    numberLR(x) {
      var str = x != null ? x.toString() : "";
      if (x < 1e-6) {
        var [ls, rs] = str.split("e-");
        var [l, r] = ls.split(".");
        if (!r)
          r = "";
        r = { length: r.length + parseInt(rs) || 0 };
      } else {
        var [l, r] = str.split(".");
      }
      return [l.length, r ? r.length : 0];
    },
    ovDispositionHash(panes) {
      let h = "";
      for (var pane of panes) {
        h += pane.uuid;
        for (var ov of pane.overlays) {
          if (ov.main)
            continue;
          h += ov.type;
        }
      }
      return h;
    },
    isMobile: ((w) => "onorientationchange" in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || ("ontouchstart" in w || w.DocumentTouch && document instanceof w.DocumentTouch)))(typeof window !== "undefined" ? window : {})
  };
  const FDEFS = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?)\)/gmi;
  const SBRACKETS = /([$A-Z_][0-9A-Z_$\.]*)[\s]*?\[([^"^\[^\]]+?)\]/gmi;
  const TFSTR = /(\d+)(\w*)/gm;
  const BUF_INC$1 = 5;
  var tf_cache = {};
  function f_args(src) {
    FDEFS.lastIndex = 0;
    var m = FDEFS.exec(src);
    if (m) {
      m[1].trim();
      m[2].trim();
      let fargs = m[3].trim();
      return fargs.split(",").map((x) => x.trim());
    }
    return [];
  }
  function f_body(src) {
    return src.slice(
      src.indexOf("{") + 1,
      src.lastIndexOf("}")
    );
  }
  function wrap_idxs(src, pre = "") {
    SBRACKETS.lastIndex = 0;
    let changed = false;
    do {
      var m = SBRACKETS.exec(src);
      if (m) {
        let vname = m[1].trim();
        let vindex = m[2].trim();
        if (vindex === "0" || parseInt(vindex) < BUF_INC$1) {
          continue;
        }
        switch (vname) {
          case "let":
          case "var":
          case "return":
            continue;
        }
        let wrap = `${vname}[${pre}_i(${vindex}, ${vname})]`;
        src = src.replace(m[0], wrap);
        changed = true;
      }
    } while (m);
    return changed ? src : src;
  }
  function tf_from_pair(num, pf) {
    var mult = 1;
    switch (pf) {
      case "s":
        mult = Const.SECOND;
        break;
      case "m":
        mult = Const.MINUTE;
        break;
      case "H":
        mult = Const.HOUR;
        break;
      case "D":
        mult = Const.DAY;
        break;
      case "W":
        mult = Const.WEEK;
        break;
      case "M":
        mult = Const.MONTH;
        break;
      case "Y":
        mult = Const.YEAR;
        break;
    }
    return parseInt(num) * mult;
  }
  function tf_from_str(str) {
    if (typeof str === "number")
      return str;
    if (tf_cache[str])
      return tf_cache[str];
    TFSTR.lastIndex = 0;
    let m = TFSTR.exec(str);
    if (m) {
      tf_cache[str] = tf_from_pair(m[1], m[2]);
      return tf_cache[str];
    }
    return void 0;
  }
  function get_fn_id(pre, id) {
    return pre + "-" + id.split("<-").pop();
  }
  function nextt(data, t, ti = 0) {
    let i0 = 0;
    let iN = data.length - 1;
    while (i0 <= iN) {
      var mid = Math.floor((i0 + iN) / 2);
      if (data[mid][ti] === t) {
        return mid;
      } else if (data[mid][ti] < t) {
        i0 = mid + 1;
      } else {
        iN = mid - 1;
      }
    }
    return t < data[mid][ti] ? mid : mid + 1;
  }
  function size_of_dss(data) {
    let bytes = 0;
    for (var id in data) {
      if (data[id].data && data[id].data[0]) {
        let s0 = size_of(data[id].data[0]);
        bytes += s0 * data[id].data.length;
      }
    }
    return bytes;
  }
  function size_of(object) {
    var list = [], stack = [object], bytes = 0;
    while (stack.length) {
      var value = stack.pop();
      var type = typeof value;
      if (type === "boolean") {
        bytes += 4;
      } else if (type === "string") {
        bytes += value.length * 2;
      } else if (type === "number") {
        bytes += 8;
      } else if (type === "object" && list.indexOf(value) === -1) {
        list.push(value);
        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
    return bytes;
  }
  function update(data, val) {
    const i = data.length - 1;
    const last = data[i];
    if (!last || val[0] > last[0]) {
      data.push(val);
    } else {
      data[i] = val;
    }
  }
  function now() {
    return new Date().getTime();
  }
  const DEF_LIMIT$2 = 5;
  function Sampler(T, auto = false) {
    let Ti = ["high", "low", "close", "vol"].indexOf(T);
    return function(x, t) {
      let tf = this.__tf__;
      this.__id__;
      t = t || se.t;
      let val = auto ? se[T][0] : x;
      if (!this.__t0__ || t >= this.__t0__ + tf) {
        this.unshift(Ti !== 3 ? val : 0);
        this.__t0__ = t - t % tf;
      }
      switch (Ti) {
        case 0:
          if (val > this[0])
            this[0] = val;
          break;
        case 1:
          if (val < this[0])
            this[0] = val;
          break;
        case 2:
          this[0] = val;
          break;
        case 3:
          this[0] += val;
      }
      this.length = this.__len__ || DEF_LIMIT$2;
    };
  }
  function TS(id, arr, len) {
    arr.__id__ = id;
    arr.__len__ = len;
    return arr;
  }
  const OHLCV = ["open", "high", "low", "close", "vol"];
  const ARR = 0;
  const TSS = 1;
  const NUM = 2;
  class Sym {
    constructor(data, params) {
      this.id = params.id;
      this.tf = tf_from_str(params.tf);
      this.format = params.format;
      this.aggtype = params.aggtype || "ohlcv";
      this.window = tf_from_str(params.window);
      this.fillgaps = params.fillgaps;
      this.data = data;
      this.data_type = ARR;
      this.main = !!params.main;
      this.idx = this.data_idx();
      this.tmap = {};
      this.tf = this.tf || se.tf;
      if (this.main)
        this.tf = se.tf;
      if (this.aggtype === "ohlcv") {
        for (var id of OHLCV) {
          this[id] = TS(`${this.id}_${id}`, []);
          this[id].__fn__ = Sampler(id).bind(this[id]);
          this[id].__tf__ = this.tf;
        }
      }
      if (this.aggtype === "copy") {
        for (var id of OHLCV) {
          this[id] = TS(`${this.id}_${id}`, []);
          this[id].__tf__ = this.tf;
        }
        for (var i = 0; i < this.data.length; i++) {
          this.tmap[this.data[i][0]] = i;
        }
      }
      if (typeof this.aggtype === "function") {
        this.close = TS(`${this.id}_close`, []);
        this.close.__fn__ = this.aggtype;
        this.close.__tf__ = this.tf;
      }
      if (this.main) {
        if (!this.tf)
          throw "Main tf should be defined";
        se.custom_main = this;
        let t0 = this.data[0][0];
        se.t = t0 - t0 % this.tf;
        this.update(null, se.t);
        se.data.ohlcv.data.length = 0;
        se.data.ohlcv.data.push([
          se.t,
          this.open[0],
          this.high[0],
          this.low[0],
          this.close[0],
          this.vol[0]
        ]);
      }
    }
    update(x, t) {
      if (this.aggtype === "ohlcv") {
        return this.update_ohlcv(x, t);
      } else if (this.aggtype === "copy") {
        return this.update_copy(x, t);
      } else if (typeof this.aggtype === "function") {
        return this.update_custom(x, t);
      }
    }
    update_ohlcv(x, t) {
      t = t || se.t;
      let idx = this.idx;
      switch (this.data_type) {
        case ARR:
          if (t > this.data[this.data.length - 1][0])
            return false;
          let t0 = this.window ? t - this.window + this.tf : t;
          let dt = t0 % this.tf;
          t0 -= dt;
          let i0 = nextt(this.data, t0);
          if (i0 >= this.data.length)
            return false;
          let t1 = t + se.tf;
          if (t < this.vol.__t0__ + this.tf)
            this.vol[0] = 0;
          let noevent = true;
          for (var i = i0; i < this.data.length; i++) {
            noevent = false;
            let dp = this.data[i];
            if (dp[idx.time] >= t1)
              break;
            this.open.__fn__(dp[idx.open], t);
            this.high.__fn__(dp[idx.high], t);
            this.low.__fn__(dp[idx.low], t);
            this.close.__fn__(dp[idx.close], t);
            this.vol.__fn__(dp[idx.vol], t);
          }
          if (noevent) {
            if (this.fillgaps === false && !this.main)
              return false;
            let last = this.close[0];
            this.open.__fn__(last, t);
            this.high.__fn__(last, t);
            this.low.__fn__(last, t);
            this.close.__fn__(last, t);
            this.vol.__fn__(0, t);
          }
          break;
      }
      return true;
    }
    update_copy(x, t) {
      t = t || se.t;
      let i = this.tmap[t];
      let s = this.data[i];
      let ts0 = this.__t0__;
      if (!ts0 || t >= ts0 + this.tf) {
        for (var k = 0; k < 5; k++) {
          let tsn = OHLCV[k];
          this[tsn].unshift(void 0);
        }
        this.__t0__ = t - t % this.tf;
        let last = this.data.length - 1;
        if (this.__t0__ === this.data[last][0]) {
          this.tmap[this.__t0__] = last;
          s = this.data[last];
        }
      }
      if (s) {
        for (var k = 0; k < 5; k++) {
          let tsn = OHLCV[k];
          this[tsn][0] = s[k + 1];
        }
      } else if (this.fillgaps) {
        for (var k = 0; k < 5; k++) {
          let tsn = OHLCV[k];
          this[tsn][0] = this.close[1];
        }
      }
    }
    update_custom(x, t) {
      t = t || se.t;
      let idx = this.idx;
      switch (this.data_type) {
        case ARR:
          if (!this.data.length)
            return false;
          if (t > this.data[this.data.length - 1][0])
            return false;
          let t0 = this.window ? t - this.window + this.tf : t;
          let dt = t0 % this.tf;
          t0 -= dt;
          let i0 = nextt(this.data, t0);
          if (i0 >= this.data.length)
            return false;
          let t1 = t + se.tf;
          let sub = [];
          for (var i = i0; i < this.data.length; i++) {
            let dp = this.data[i];
            if (dp[idx.time] >= t1)
              break;
            sub.push(dp);
          }
          if (sub.length || this.fillgaps === false) {
            var val = this.close.__fn__(sub);
          } else if (this.fillgaps !== false) {
            val = this.close[0];
          }
          let ts0 = this.close.__t0__;
          if (!ts0 || t >= ts0 + this.tf) {
            this.close.unshift(val);
            this.close.__t0__ = t - t % this.tf;
          } else {
            this.close[0] = val;
          }
          break;
      }
      return true;
    }
    data_idx() {
      let idx = {};
      switch (this.aggtype) {
        case "ohlcv":
          if (!this.format) {
            let x0 = this.data[0];
            if (!x0 || x0.length === 6) {
              this.format = "time:open:high:low:close:vol";
            } else if (x0.length === 3) {
              this.format = "time:open,high,low,close:vol";
            }
          }
          break;
        default:
          this.format = "time:close";
          break;
      }
      this.format.split(":").forEach((x, i) => {
        if (!x.length)
          return;
        let list = x.split(",");
        list.forEach((y) => idx[y] = i);
      });
      return idx;
    }
  }
  class View {
    constructor(std, name, props) {
      this.std = std;
      this.name = name;
      this.props = props || {};
      this.props.$synth = true;
      this.props.tf = tf_from_str(this.props.tf);
      this.tf = this.props.tf;
      this.iter = {
        onchart: (x, n, s) => this.onchart(x, n, s, true),
        offchart: (x, n, s) => this.offchart(x, n, s, true)
      };
    }
    chart(x, sett = {}) {
      if (this.tf && !this.std.onclose(this.tf))
        return;
      sett.view = this.name;
      sett.vprops = this.props;
      if (x && x.aggtype) {
        let x0 = [
          x.open[0],
          x.high[0],
          x.low[0],
          x.close[0],
          x.vol[0]
        ];
        this.std.chart(x0, sett);
      } else {
        this.std.chart(x, sett);
      }
    }
    onchart(x, name, sett = {}, iter) {
      if (this.tf && !this.std.onclose(this.tf) && !iter)
        return;
      sett.view = this.name;
      sett.vprops = this.props;
      name = sett.view + "/" + (name || "OV");
      this.std.onchart(x, name, sett);
    }
    offchart(x, name, sett = {}, iter) {
      if (this.tf && !this.std.onclose(this.tf) && !iter)
        return;
      sett.view = this.name;
      sett.vprops = this.props;
      name = sett.view + "/" + (name || "OV");
      this.std.offchart(x, name, sett);
    }
    $chart(data, sett = {}) {
      let type = sett.type;
      sett.$synth = true;
      sett.skipNaN = true;
      this.std.env.chart[this.name] = {
        type: type || "Candles",
        data,
        settings: sett,
        view: this.name,
        vprops: this.props,
        indexBased: this.props.ib,
        tf: this.props.tf
      };
      delete sett.type;
      delete sett.vprops;
      delete sett.view;
    }
    $onchart(data, name, sett = {}) {
      let type = sett.type;
      name = this.name + "/" + (name || "OV");
      sett.$synth = true;
      sett.skipNaN = true;
      this.std.env.onchart[name] = {
        name,
        type: type || "Spline",
        data,
        settings: sett,
        scripts: false,
        grid: sett.grid || {},
        view: this.name,
        vprops: this.props
      };
      delete sett.type;
      delete sett.grid;
    }
    $offchart(data, name, sett = {}) {
      let type = sett.type;
      name = this.name + "/" + (name || "OV");
      sett.$synth = true;
      sett.skipNaN = true;
      this.std.env.offchart[name] = {
        name,
        type: type || "Spline",
        data,
        settings: sett,
        scripts: false,
        grid: sett.grid || {},
        view: this.name,
        vprops: this.props
      };
      delete sett.type;
      delete sett.grid;
    }
  }
  const BUF_INC = 5;
  class ScriptStd {
    constructor(env) {
      this.env = env;
      this.se = se;
      this.SWMA = [1 / 6, 2 / 6, 2 / 6, 1 / 6];
      this.STDEV_EPS = 1e-10;
      this.STDEV_Z = 1e-4;
      this._index_tracking();
    }
    _index_tracking() {
      let proto = Object.getPrototypeOf(this);
      for (var k of Object.getOwnPropertyNames(proto)) {
        switch (k) {
          case "constructor":
          case "ts":
          case "tstf":
          case "sample":
          case "_index_tracking":
          case "_tsid":
          case "_i":
          case "_v":
          case "_add_i":
          case "chart":
          case "sym":
          case "view":
          case "prop":
          case "autoPrec":
            continue;
        }
        let f = this._add_i(k, this[k].toString());
        if (f)
          this[k] = f;
      }
    }
    prop(name, descr) {
      let props = this.env.src.props;
      if (!(name in props)) {
        props[name] = descr.def;
      }
    }
    autoPrec() {
      if (!se.data.ohlcv)
        return void 0;
      let data = se.data.ohlcv.data;
      let len = data.length;
      let i0 = Math.max(0, len - 100);
      let max = 0;
      for (var i = i0; i < len; i++) {
        let p = data[i];
        for (var k = 1; k < 5; k++) {
          let r = Utils.numberLR(p[k])[1];
          if (r > max)
            max = r;
        }
      }
      return max;
    }
    _add_i(name, src) {
      let args = f_args(src);
      src = f_body(src);
      let src2 = wrap_idxs(src, "this.");
      if (src2 !== src) {
        return new Function(...args, src2);
      }
      return null;
    }
    _tsid(prev, next) {
      return `${prev}<-${next}`;
    }
    _i(i, x) {
      if (x != void 0 && x === x && x.__id__) {
        if (!x.__len__ || i >= x.__len__) {
          x.__len__ = i + BUF_INC;
        }
      }
      return i;
    }
    _v(x, i) {
      if (x != void 0 && x === x && x.__id__) {
        if (!x.__len__ || i >= x.__len__) {
          x.__len__ = i + BUF_INC;
        }
      }
      return x;
    }
    ts(x, _id, _tf) {
      if (_tf)
        return this.tstf(x, _tf, _id);
      let ts = this.env.tss[_id];
      if (!ts) {
        ts = this.env.tss[_id] = [x];
        ts.__id__ = _id;
      } else {
        ts[0] = x;
      }
      return ts;
    }
    tstf(x, tf, _id) {
      let ts = this.env.tss[_id];
      if (!ts) {
        ts = this.env.tss[_id] = [x];
        ts.__id__ = _id;
        ts.__tf__ = tf_from_str(tf);
        ts.__fn__ = Sampler("close").bind(ts);
      } else {
        ts.__fn__(x);
      }
      return ts;
    }
    sample(x, type, tf, _id) {
      let ts = this.env.tss[_id];
      if (!ts) {
        ts = this.env.tss[_id] = [x];
        ts.__id__ = _id;
        ts.__tf__ = tf_from_str(tf);
        ts.__fn__ = Sampler(type).bind(ts);
      } else {
        ts.__fn__(x);
      }
      return ts;
    }
    nz(x, v) {
      if (x == void 0 || x !== x) {
        return v || 0;
      }
      return x;
    }
    na(x) {
      return x == void 0 || x !== x;
    }
    nf(x, v) {
      if (!isFinite(x)) {
        return v !== void 0 ? v : NaN;
      }
      return x;
    }
    add(x, y, _id) {
      let id = this._tsid(_id, `add`);
      let x0 = this.na(x) ? NaN : x.__id__ ? x[0] : x;
      let y0 = this.na(y) ? NaN : y.__id__ ? y[0] : y;
      return this.ts(x0 + y0, id, x.__tf__);
    }
    sub(x, y, _id) {
      let id = this._tsid(_id, `sub`);
      let x0 = this.na(x) ? NaN : x.__id__ ? x[0] : x;
      let y0 = this.na(y) ? NaN : y.__id__ ? y[0] : y;
      return this.ts(x0 - y0, id, x.__tf__);
    }
    mult(x, y, _id) {
      let id = this._tsid(_id, `mult`);
      let x0 = this.na(x) ? NaN : x.__id__ ? x[0] : x;
      let y0 = this.na(y) ? NaN : y.__id__ ? y[0] : y;
      return this.ts(x0 * y0, id, x.__tf__);
    }
    div(x, y, _id) {
      let id = this._tsid(_id, `div`);
      let x0 = this.na(x) ? NaN : x.__id__ ? x[0] : x;
      let y0 = this.na(y) ? NaN : y.__id__ ? y[0] : y;
      return this.ts(x0 / y0, id, x.__tf__);
    }
    neg(x, _id) {
      let id = this._tsid(_id, `neg`);
      let x0 = this.na(x) ? NaN : x.__id__ ? x[0] : x;
      return this.ts(-x0, id, x.__tf__);
    }
    abs(x) {
      return Math.abs(x);
    }
    acos(x) {
      return Math.acos(x);
    }
    signal(type, data = {}) {
      if (this.se.shared.event !== "update")
        return;
      this.se.send("script-signal", { type, data });
    }
    signalif(cond, type, data = {}) {
      if (this.se.shared.event !== "update")
        return;
      if (cond && cond.__id__)
        cond = cond[0];
      if (cond) {
        this.se.send("script-signal", { type, data });
      }
    }
    alma(src, len, offset, sigma, _id) {
      let id = this._tsid(_id, `alma(${len},${offset},${sigma})`);
      let m = Math.floor(offset * (len - 1));
      let s = len / sigma;
      let norm = 0;
      let sum = 0;
      for (var i = 0; i < len; i++) {
        let w = Math.exp(-1 * Math.pow(i - m, 2) / (2 * Math.pow(s, 2)));
        norm = norm + w;
        sum = sum + src[len - i - 1] * w;
      }
      return this.ts(sum / norm, id, src.__tf__);
    }
    asin(x) {
      return Math.asin(x);
    }
    atan(x) {
      return Math.atan(x);
    }
    atr(len, _id, _tf) {
      let tfs = _tf || "";
      let id = this._tsid(_id, `atr(${len})`);
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let close = this.env.shared[`close${tfs}`];
      let tr = this.ts(0, id, _tf);
      tr[0] = this.na(high[1]) ? high[0] - low[0] : Math.max(
        Math.max(
          high[0] - low[0],
          Math.abs(high[0] - close[1])
        ),
        Math.abs(low[0] - close[1])
      );
      return this.rma(tr, len, id);
    }
    avg(...args) {
      args.pop();
      let sum = 0;
      for (var i = 0; i < args.length; i++) {
        sum += args[i];
      }
      return sum / args.length;
    }
    since(cond, _id) {
      let id = this._tsid(_id, `since()`);
      if (cond && cond.__id__)
        cond = cond[0];
      let s = this.ts(void 0, id);
      s[0] = cond ? 0 : s[1] + 1;
      return s;
    }
    bb(src, len, mult, _id) {
      let id = this._tsid(_id, `bb(${len},${mult})`);
      let basis = this.sma(src, len, id);
      let dev = this.stdev(src, len, id)[0] * mult;
      return [
        basis,
        this.ts(basis[0] + dev, id + "1", src.__tf__),
        this.ts(basis[0] - dev, id + "2", src.__tf__)
      ];
    }
    bbw(src, len, mult, _id) {
      let id = this._tsid(_id, `bbw(${len},${mult})`);
      let basis = this.sma(src, len, id)[0];
      let dev = this.stdev(src, len, id)[0] * mult;
      return this.ts(2 * dev / basis, id, src.__tf__);
    }
    bool(x) {
      return !!x;
    }
    cci(src, len, _id) {
      let id = this._tsid(_id, `cci(${len})`);
      let ma = this.sma(src, len, id);
      let dev = this.dev(src, len, id);
      let cci = (src[0] - ma[0]) / (0.015 * dev[0]);
      return this.ts(cci, id, src.__tf__);
    }
    ceil(x) {
      return Math.ceil(x);
    }
    change(src, len = 1, _id) {
      let id = this._tsid(_id, `change(${len})`);
      return this.ts(src[0] - src[len], id, src.__tf__);
    }
    cmo(src, len, _id) {
      let id = this._tsid(_id, `cmo(${len})`);
      let mom = this.change(src, 1, id);
      let g = this.ts(mom[0] >= 0 ? mom[0] : 0, id + "g", src.__tf__);
      let l = this.ts(mom[0] >= 0 ? 0 : -mom[0], id + "l", src.__tf__);
      let sm1 = this.sum(g, len, id + "1")[0];
      let sm2 = this.sum(l, len, id + "2")[0];
      return this.ts(100 * (sm1 - sm2) / (sm1 + sm2), id, src.__tf__);
    }
    cog(src, len, _id) {
      let id = this._tsid(_id, `cmo(${len})`);
      let sum = this.sum(src, len, id)[0];
      let num = 0;
      for (var i = 0; i < len; i++) {
        num += src[i] * (i + 1);
      }
      return this.ts(-num / sum, id, src.__tf__);
    }
    corr() {
    }
    cos(x) {
      return Math.cos(x);
    }
    cross(src1, src2, _id) {
      let id = this._tsid(_id, `cross`);
      let x = src1[0] > src2[0] !== src1[1] > src2[1];
      return this.ts(x, id, src1.__tf__);
    }
    crossover(src1, src2, _id) {
      let id = this._tsid(_id, `crossover`);
      let x = src1[0] > src2[0] && src1[1] <= src2[1];
      return this.ts(x, id, src1.__tf__);
    }
    crossunder(src1, src2, _id) {
      let id = this._tsid(_id, `crossunder`);
      let x = src1[0] < src2[0] && src1[1] >= src2[1];
      return this.ts(x, id, src1.__tf__);
    }
    cum(src, _id) {
      let id = this._tsid(_id, `cum`);
      let res = this.ts(0, id, src.__tf__);
      res[0] = this.nz(src[0]) + this.nz(res[1]);
      return res;
    }
    dayofmonth(time) {
      return new Date(time || se.t).getUTCDate();
    }
    dayofweek(time) {
      return new Date(time || se.t).getUTCDay() + 1;
    }
    dev(src, len, _id) {
      let id = this._tsid(_id, `dev(${len})`);
      let mean = this.sma(src, len, id)[0];
      let sum = 0;
      for (var i = 0; i < len; i++) {
        sum += Math.abs(src[i] - mean);
      }
      return this.ts(sum / len, id, src.__tf__);
    }
    dmi(len, smooth, _id, _tf) {
      let id = this._tsid(_id, `dmi(${len},${smooth})`);
      let tfs = _tf || "";
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let up = this.change(high, 1, id + "1")[0];
      let down = this.neg(this.change(low, 1, id + "2"), id)[0];
      let plusDM = this.ts(
        100 * (this.na(up) ? NaN : up > down && up > 0 ? up : 0),
        id + "3",
        _tf
      );
      let minusDM = this.ts(
        100 * (this.na(down) ? NaN : down > up && down > 0 ? down : 0),
        id + "4",
        _tf
      );
      let trur = this.rma(this.tr(false, id, _tf), len, id + "5");
      let plus = this.div(
        this.rma(plusDM, len, id + "6"),
        trur,
        id + "8"
      );
      let minus = this.div(
        this.rma(minusDM, len, id + "7"),
        trur,
        id + "9"
      );
      let sum = this.add(plus, minus, id + "10")[0];
      let adx = this.rma(
        this.ts(100 * Math.abs(plus[0] - minus[0]) / (sum === 0 ? 1 : sum), id + "11", _tf),
        smooth,
        id + "12"
      );
      return [adx, plus, minus];
    }
    ema(src, len, _id) {
      let id = this._tsid(_id, `ema(${len})`);
      let a = 2 / (len + 1);
      let ema = this.ts(0, id, src.__tf__);
      ema[0] = this.na(ema[1]) ? this.sma(src, len, id)[0] : a * src[0] + (1 - a) * this.nz(ema[1]);
      return ema;
    }
    exp(x) {
      return Math.exp(x);
    }
    falling(src, len, _id) {
      let id = this._tsid(_id, `falling(${len})`);
      let bot = src[0];
      for (var i = 1; i < len + 1; i++) {
        if (bot >= src[i]) {
          return this.ts(false, id, src.__tf__);
        }
      }
      return this.ts(true, id, src.__tf__);
    }
    fixnan(src) {
      if (this.na(src[0])) {
        for (var i = 1; i < src.length; i++) {
          if (!this.na(src[i])) {
            src[0] = src[i];
            break;
          }
        }
      }
      return src;
    }
    floor(x) {
    }
    highest(src, len, _id) {
      let id = this._tsid(_id, `highest(${len})`);
      let high = -Infinity;
      for (var i = 0; i < len; i++) {
        if (src[i] > high)
          high = src[i];
      }
      return this.ts(high, id, src.__tf__);
    }
    highestbars(src, len, _id) {
      let id = this._tsid(_id, `highestbars(${len})`);
      let high = -Infinity;
      let hi = 0;
      for (var i = 0; i < len; i++) {
        if (src[i] > high) {
          high = src[i], hi = i;
        }
      }
      return this.ts(-hi, id, src.__tf__);
    }
    hma(src, len, _id) {
      let id = this._tsid(_id, `hma(${len})`);
      let len2 = Math.floor(len / 2);
      let len3 = Math.round(Math.sqrt(len));
      let a = this.mult(this.wma(src, len2, id + "1"), 2, id);
      let b = this.wma(src, len, id + "2");
      let delt = this.sub(a, b, id + "3");
      return this.wma(delt, len3, id + "4");
    }
    hour(time) {
      return new Date(time || se.t).getUTCHours();
    }
    iff(cond, x, y) {
      if (cond && cond.__id__)
        cond = cond[0];
      return cond ? x : y;
    }
    kc(src, len, mult, use_tr = true, _id, _tf) {
      let id = this._tsid(_id, `kc(${len},${mult},${use_tr})`);
      let tfs = _tf || "";
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let basis = this.ema(src, len, id + "1");
      let range = use_tr ? this.tr(false, id + "2", _tf) : this.ts(high[0] - low[0], id + "3", src.__tf__);
      let ema = this.ema(range, len, id + "4");
      return [
        basis,
        this.ts(basis[0] + ema[0] * mult, id + "5", src.__tf__),
        this.ts(basis[0] - ema[0] * mult, id + "6", src.__tf__)
      ];
    }
    kcw(src, len, mult, use_tr = true, _id, _tf) {
      let id = this._tsid(_id, `kcw(${len},${mult},${use_tr})`);
      let kc = this.kc(src, len, mult, use_tr, `kcw`, _tf);
      return this.ts((kc[1][0] - kc[2][0]) / kc[0][0], id, src.__tf__);
    }
    linreg(src, len, offset = 0, _id) {
      let id = this._tsid(_id, `linreg(${len})`);
      src.__len__ = Math.max(src.__len__ || 0, len);
      let lr = regression(src, len, offset);
      return this.ts(lr, id, src.__tf__);
    }
    log(x) {
      return Math.log(x);
    }
    log10(x) {
      return Math.log10(x);
    }
    lowest(src, len, _id) {
      let id = this._tsid(_id, `lowest(${len})`);
      let low = Infinity;
      for (var i = 0; i < len; i++) {
        if (src[i] < low)
          low = src[i];
      }
      return this.ts(low, id, src.__tf__);
    }
    lowestbars(src, len, _id) {
      let id = this._tsid(_id, `lowestbars(${len})`);
      let low = Infinity;
      let li = 0;
      for (var i = 0; i < len; i++) {
        if (src[i] < low) {
          low = src[i], li = i;
        }
      }
      return this.ts(-li, id, src.__tf__);
    }
    macd(src, fast, slow, sig, _id) {
      let id = this._tsid(_id, `macd(${fast}${slow}${sig})`);
      let fast_ma = this.ema(src, fast, id + "1");
      let slow_ma = this.ema(src, slow, id + "2");
      let macd = this.sub(fast_ma, slow_ma, id + "3");
      let signal = this.ema(macd, sig, id + "4");
      let hist = this.sub(macd, signal, id + "5");
      return [macd, signal, hist];
    }
    max(...args) {
      args.pop();
      return Math.max(...args);
    }
    modify(id, fields) {
      se.send("modify-overlay", { uuid: id, fields });
    }
    buffsize(src, len) {
      src.__len__ = len;
    }
    mfi(src, len, _id) {
      let id = this._tsid(_id, `mfi(${len})`);
      let vol = this.env.shared.vol;
      let ch = this.change(src, 1, id + "1")[0];
      let ts1 = this.mult(vol, ch <= 0 ? 0 : src[0], id + "2");
      let ts2 = this.mult(vol, ch >= 0 ? 0 : src[0], id + "3");
      let upper = this.sum(ts1, len, id + "4");
      let lower = this.sum(ts2, len, id + "5");
      let res = void 0;
      if (!this.na(lower)) {
        res = this.rsi(upper, lower, id + "6")[0];
      }
      return this.ts(res, id, src.__tf__);
    }
    min(...args) {
      args.pop();
      return Math.min(...args);
    }
    minute(time) {
      return new Date(time || se.t).getUTCMinutes();
    }
    mom(src, len, _id) {
      let id = this._tsid(_id, `mom(${len})`);
      return this.ts(src[0] - src[len], id, src.__tf__);
    }
    month(time) {
      return new Date(time || se.t).getUTCMonth();
    }
    chart(x, sett = {}, _id) {
      let view = sett.view || "main";
      let off = 0;
      if (x && x.__id__) {
        off = x.__offset__ || 0;
        x = x[0];
      }
      if (Array.isArray(x) && x[0] && x[0].__id__) {
        off = x[0].__offset__ || 0;
        x = x.map((x2) => x2[0]);
      }
      if (!this.env.chart[view]) {
        let type = sett.type;
        sett.$synth = true;
        sett.skipNaN = true;
        this.env.chart[view] = {
          type: type || "Candles",
          data: [],
          settings: sett,
          view,
          vprops: sett.vprops,
          indexBased: sett.vprops.ib,
          tf: sett.vprops.tf
        };
        delete sett.type;
        delete sett.vprops;
        delete sett.view;
      }
      off *= se.tf;
      let v = Array.isArray(x) ? [se.t + off, ...x] : [se.t + off, x];
      update(this.env.chart[view].data, v);
    }
    onclose(tf) {
      if (!this.env.shared.onclose)
        return false;
      if (!tf)
        tf = se.tf;
      return (se.t + se.tf) % tf_from_str(tf) === 0;
    }
    settings(upd) {
      this.env.send_modify({ settings: upd });
      Object.assign(this.env.src.sett, upd);
    }
    offset(src, num, _id) {
      if (src.__id__) {
        src.__offset__ = num;
        return src;
      }
      let id = this._tsid(_id, `offset(${num})`);
      let out = this.ts(src, id);
      out.__offset__ = num;
      return out;
    }
    linearint() {
    }
    nearestrank() {
    }
    now() {
      return new Date().getTime();
    }
    percentrank() {
    }
    pivothigh(src, left, right, _id) {
      let id = this._tsid(_id, `pivothigh(${left},${right})`);
      let len = left + right + 1;
      let top = src[right];
      for (var i = 0; i < len; i++) {
        if (top <= src[i] && i !== right) {
          return this.ts(NaN, id, src.__tf__);
        }
      }
      return this.ts(top, id, src.__tf__);
    }
    pivotlow(src, left, right, _id) {
      let id = this._tsid(_id, `pivotlow(${left},${right})`);
      let len = left + right + 1;
      let bot = src[right];
      for (var i = 0; i < len; i++) {
        if (bot >= src[i] && i !== right) {
          return this.ts(NaN, id, src.__tf__);
        }
      }
      return this.ts(bot, id, src.__tf__);
    }
    pow(x) {
      return Math.pow(x);
    }
    rising(src, len, _id) {
      let id = this._tsid(_id, `rising(${len})`);
      let top = src[0];
      for (var i = 1; i < len + 1; i++) {
        if (top <= src[i]) {
          return this.ts(false, id, src.__tf__);
        }
      }
      return this.ts(true, id, src.__tf__);
    }
    rma(src, len, _id) {
      let id = this._tsid(_id, `rma(${len})`);
      let a = len;
      let sum = this.ts(0, id, src.__tf__);
      sum[0] = this.na(sum[1]) ? this.sma(src, len, id)[0] : (src[0] + (a - 1) * this.nz(sum[1])) / a;
      return sum;
    }
    roc(src, len, _id) {
      let id = this._tsid(_id, `roc(${len})`);
      return this.ts(
        100 * (src[0] - src[len]) / src[len],
        id,
        src.__tf__
      );
    }
    round(x) {
      return Math.round(x);
    }
    rsi(x, y, _id) {
      if (!this.na(y) && y.__id__) {
        var id = this._tsid(_id, `rsi(x,y)`);
        var rsi = 100 - 100 / (1 + this.div(x, y, id)[0]);
      } else {
        var id = this._tsid(_id, `rsi(${y})`);
        let ch = this.change(x, 1, _id)[0];
        let pc = this.ts(Math.max(ch, 0), id + "1", x.__tf__);
        let nc = this.ts(-Math.min(ch, 0), id + "2", x.__tf__);
        let up = this.rma(pc, y, id + "3")[0];
        let down = this.rma(nc, y, id + "4")[0];
        var rsi = down === 0 ? 100 : up === 0 ? 0 : 100 - 100 / (1 + up / down);
      }
      return this.ts(rsi, id + "5", x.__tf__);
    }
    sar(start, inc, max, _id, _tf) {
      let id = this._tsid(_id, `sar(${start},${inc},${max})`);
      let tfs = _tf || "";
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let close = this.env.shared[`close${tfs}`];
      let minTick = 0;
      let out = this.ts(void 0, id + "1", _tf);
      let pos = this.ts(void 0, id + "2", _tf);
      let maxMin = this.ts(void 0, id + "3", _tf);
      let acc = this.ts(void 0, id + "4", _tf);
      let n = _tf ? out.__len__ - 1 : this.se.iter;
      let prev;
      let outSet = false;
      if (n >= 1) {
        prev = out[1];
        if (n === 1) {
          if (close[0] > close[1]) {
            pos[0] = 1;
            maxMin[0] = Math.max(high[0], high[1]);
            prev = Math.min(low[0], low[1]);
          } else {
            pos[0] = -1;
            maxMin[0] = Math.min(low[0], low[1]);
            prev = Math.max(high[0], high[1]);
          }
          acc[0] = start;
        } else {
          pos[0] = pos[1];
          acc[0] = acc[1];
          maxMin[0] = maxMin[1];
        }
        if (pos[0] === 1) {
          if (high[0] > maxMin[0]) {
            maxMin[0] = high[0];
            acc[0] = Math.min(acc[0] + inc, max);
          }
          if (low[0] <= prev) {
            pos[0] = -1;
            out[0] = maxMin[0];
            maxMin[0] = low[0];
            acc[0] = start;
            outSet = true;
          }
        } else {
          if (low[0] < maxMin[0]) {
            maxMin[0] = low[0];
            acc[0] = Math.min(acc[0] + inc, max);
          }
          if (high[0] >= prev) {
            pos[0] = 1;
            out[0] = maxMin[0];
            maxMin[0] = high[0];
            acc[0] = start;
            outSet = true;
          }
        }
        if (!outSet) {
          out[0] = prev + acc[0] * (maxMin[0] - prev);
          if (pos[0] === 1) {
            if (out[0] >= low[0])
              out[0] = low[0] - minTick;
          }
          if (pos[0] === -1) {
            if (out[0] <= high[0])
              out[0] = high[0] + minTick;
          }
        }
      }
      return out;
    }
    second(time) {
      return new Date(time || se.t).getUTCSeconds();
    }
    sign(x) {
      return Math.sign(x);
    }
    sin(x) {
      return Math.sin(x);
    }
    sma(src, len, _id) {
      let id = this._tsid(_id, `sma(${len})`);
      let sum = 0;
      for (var i = 0; i < len; i++) {
        sum = sum + src[i];
      }
      return this.ts(sum / len, id, src.__tf__);
    }
    sqrt(x) {
      return Math.sqrt(x);
    }
    stdev(src, len, _id) {
      let sumf = (x, y) => {
        let res = x + y;
        return res;
      };
      let id = this._tsid(_id, `stdev(${len})`);
      let avg = this.sma(src, len, id);
      let sqd = 0;
      for (var i = 0; i < len; i++) {
        let sum = sumf(src[i], -avg[0]);
        sqd += sum * sum;
      }
      return this.ts(Math.sqrt(sqd / len), id, src.__tf__);
    }
    stoch(src, high, low, len, _id) {
      let id = this._tsid(_id, `sum(${len})`);
      let x = 100 * (src[0] - this.lowest(low, len)[0]);
      let y = this.highest(high, len)[0] - this.lowest(low, len)[0];
      return this.ts(x / y, id, src.__tf__);
    }
    sum(src, len, _id) {
      let id = this._tsid(_id, `sum(${len})`);
      let sum = 0;
      for (var i = 0; i < len; i++) {
        sum = sum + src[i];
      }
      return this.ts(sum, id, src.__tf__);
    }
    supertrend(factor, atrlen, _id, _tf) {
      let id = this._tsid(_id, `supertrend(${factor},${atrlen})`);
      let tfs = _tf || "";
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let close = this.env.shared[`close${tfs}`];
      let hl2 = (high[0] + low[0]) * 0.5;
      let atr = factor * this.atr(atrlen, id + "1", _tf)[0];
      let ls = this.ts(hl2 - atr, id + "2", _tf);
      let ls1 = this.nz(ls[1], ls[0]);
      ls[0] = close[1] > ls1 ? Math.max(ls[0], ls1) : ls[0];
      let ss = this.ts(hl2 + atr, id + "3", _tf);
      let ss1 = this.nz(ss[1], ss);
      ss[0] = close[1] < ss1 ? Math.min(ss[0], ss1) : ss[0];
      let dir = this.ts(1, id + "4", _tf);
      dir[0] = this.nz(dir[1], dir[0]);
      dir[0] = dir[0] === -1 && close[0] > ss1 ? 1 : dir[0] === 1 && close[0] < ls1 ? -1 : dir[0];
      let plot = this.ts(dir[0] === 1 ? ls[0] : ss[0], id + "5", _tf);
      return [plot, this.neg(dir, id + "6")];
    }
    swma(src, _id) {
      let id = this._tsid(_id, `swma`);
      let sum = src[3] * this.SWMA[0] + src[2] * this.SWMA[1] + src[1] * this.SWMA[2] + src[0] * this.SWMA[3];
      return this.ts(sum, id, src.__tf__);
    }
    sym(x, y = {}, _id) {
      let id = y.id || this._tsid(_id, `sym`);
      y.id = id;
      if (this.env.syms[id]) {
        this.env.syms[id].update(x);
        return this.env.syms[id];
      }
      switch (typeof x) {
        case "object":
          var sym = new Sym(x, y);
          this.env.syms[id] = sym;
          if (x.__id__) {
            sym.data_type = TSS;
          } else {
            sym.data_type = ARR;
          }
          break;
        case "number":
          sym = new Sym(null, y);
          sym.data_type = NUM;
          break;
        case "string":
          y.tf = x;
          sym = new Sym(se.data.ohlcv.data, y);
          sym.data_type = ARR;
          break;
      }
      this.env.syms[id] = sym;
      return sym;
    }
    tan(x) {
      return Math.tan(x);
    }
    time(res, sesh) {
    }
    timestamp() {
    }
    tr(fixnan = false, _id, _tf) {
      let id = this._tsid(_id, `tr(${fixnan})`);
      let tfs = _tf || "";
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let close = this.env.shared[`close${tfs}`];
      let res = 0;
      if (this.na(close[1]) && fixnan) {
        res = high[0] - low[0];
      } else {
        res = Math.max(
          high[0] - low[0],
          Math.abs(high[0] - close[1]),
          Math.abs(low[0] - close[1])
        );
      }
      return this.ts(res, id, _tf);
    }
    tsi(src, short, long, _id) {
      let id = this._tsid(_id, `tsi(${short},${long})`);
      let m = this.change(src, 1, id + "0");
      let m_abs = this.ts(Math.abs(m[0]), id + "1", src.__tf__);
      let tsi = this.ema(this.ema(m, long, id + "1"), short, id + "2")[0] / this.ema(this.ema(m_abs, long, id + "3"), short, id + "4")[0];
      return this.ts(tsi, id, src.__tf__);
    }
    variance(src, len) {
    }
    view(name, props = {}, _id) {
      if (!this.env.views[name]) {
        let view = new View(this, name, props);
        this.env.views[name] = view;
        return view;
      }
      return this.env.views[name];
    }
    vwap(src) {
    }
    vwma(src, len, _id) {
      let id = this._tsid(_id, `vwma(${len})`);
      let vol = this.env.shared.vol;
      let sxv = this.ts(src[0] * vol[0], id + "1", src.__tf__);
      let res = this.sma(sxv, len, id + "2")[0] / this.sma(vol, len, id + "3")[0];
      return this.ts(res, id + "4", src.__tf__);
    }
    weekofyear(time) {
      let date = new Date(time || se.t);
      date.setUTCHours(0, 0, 0, 0);
      date.setDate(date.getUTCDate() + 3 - (date.getUTCDay() + 6) % 7);
      let week1 = new Date(date.getUTCFullYear(), 0, 4);
      return 1 + Math.round(
        ((date - week1) / 864e5 - 3 + (week1.getUTCDay() + 6) % 7) / 7
      );
    }
    wma(src, len, _id) {
      let id = this._tsid(_id, `wma(${len})`);
      let norm = 0;
      let sum = 0;
      for (var i = 0; i < len; i++) {
        let w = (len - i) * len;
        norm += w;
        sum += src[i] * w;
      }
      return this.ts(sum / norm, id, src.__tf__);
    }
    wpr(len, _id, _tf) {
      let id = this._tsid(_id, `wpr(${len})`);
      let tfs = _tf || "";
      let high = this.env.shared[`high${tfs}`];
      let low = this.env.shared[`low${tfs}`];
      let close = this.env.shared[`close${tfs}`];
      let hh = this.highest(high, len, id);
      let ll = this.lowest(low, len, id);
      let res = (hh[0] - close[0]) / (hh[0] - ll[0]);
      return this.ts(-res * 100, id, _tf);
    }
    year(time) {
      return new Date(time || se.t).getUTCFullYear();
    }
  }
  class Pane {
    constructor(env) {
      this.scriptId = env.id;
      this.env = env;
      this.selfId = this.findSelfId(env.id);
      this.paneMap = this.createMap();
      this.name2ov = {};
      this.self = this.paneLib(this.selfId);
    }
    paneLib(uuid) {
      let lib2 = {};
      for (var k in self.scriptLib.prefabs) {
        lib2[k] = ((type) => {
          return (v, specs, _id) => {
            let name = get_fn_id(type, _id != null ? _id : specs);
            if (!this.name2ov[name]) {
              let pane = this.paneMap[uuid];
              if (!pane)
                pane = this.createPane();
              this.name2ov[name] = this.newOverlay(
                pane,
                name,
                type,
                specs
              );
            }
            let ov = this.name2ov[name];
            this.addNewValue(ov, v);
          };
        })(k);
      }
      return lib2;
    }
    createMap() {
      let map = {};
      for (var pane of self.paneStruct) {
        map[pane.uuid] = pane;
      }
      return map;
    }
    findSelfId(id) {
      for (var pane of self.paneStruct) {
        for (var script of pane.scripts) {
          if (script.uuid === id) {
            return pane.uuid;
          }
        }
      }
    }
    newOverlay(pane, name, type, specs) {
      var _a, _b, _c;
      if (!pane.overlays)
        pane.overlays = [];
      let ov = {
        name: (_a = specs.name) != null ? _a : name,
        type,
        settings: (_b = specs.settings) != null ? _b : {},
        props: (_c = specs.props) != null ? _c : {},
        uuid: Utils.uuid3(),
        prod: this.scriptId,
        data: []
      };
      pane.overlays.push(ov);
      return ov;
    }
    addNewValue(ov, x) {
      let off = 0;
      if (x && x.__id__) {
        off = x.__offset__ || 0;
        x = x[0];
      }
      if (Array.isArray(x) && x[0] && x[0].__id__) {
        off = x[0].__offset__ || 0;
        x = x.map((x2) => x2[0]);
      }
      off *= se.tf;
      let v = Array.isArray(x) ? [se.t + off, ...x] : [se.t + off, x];
      update(ov.data, v);
    }
    createPane() {
    }
  }
  const FDEFS1 = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?\s*)\)/mi;
  const FDEFS2 = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*\s*)\)/gmis;
  const DEF_LIMIT$1 = 5;
  class ScriptEnv {
    constructor(s, data) {
      this.std = se.std_inject(new ScriptStd(this));
      this.id = s.uuid;
      this.src = s;
      this.output = {};
      this.data = [];
      this.tss = {};
      this.syms = {};
      this.views = {};
      this.shared = data;
      this.output.box_maker = this.make_box();
      this.pane = new Pane(this);
    }
    build() {
      this.output.box_maker(this, this.shared, se);
      delete this.output.box_maker;
    }
    init() {
      this.output.init();
    }
    step(unshift = true) {
      if (unshift)
        this.unshift();
      this.output.update();
      this.limit();
    }
    unshift() {
      for (var id in this.tss) {
        if (this.tss[id].__tf__)
          continue;
        this.tss[id].unshift(void 0);
      }
    }
    limit() {
      for (var id in this.tss) {
        let ts = this.tss[id];
        ts.length = ts.__len__ || DEF_LIMIT$1;
      }
    }
    make_box() {
      let code = this.src.code;
      let proto = Object.getPrototypeOf(this.std);
      let std = ``;
      for (var k of Object.getOwnPropertyNames(proto)) {
        if (k === "constructor")
          continue;
        std += `const std_${k} = self.std.${k}.bind(self.std)
`;
      }
      let tss = ``;
      for (var k in this.shared) {
        if (this.shared[k] && this.shared[k].__id__) {
          tss += `const ${k} = shared.${k}
`;
        }
      }
      let dss = ``;
      try {
        return Function("self,shared,se", `
                'use strict';

                // Built-in functions (aliases)
                ${std}

                // Modules (API / interfaces)
                ${this.make_modules()}

                // Timeseries
                ${tss}

                // Direct data ts
                const data = self.data
                const ohlcv = shared.dss.ohlcv.data
                ${dss}

                // Script's properties (init)
                const $props = self.src.props

                // Globals
                const settings = self.src.settings
                const tf = shared.tf
                const range = shared.range
                const pane = self.pane

                this.init = (_id = 'root') => {
                    ${this.prep(code.init)}
                }

                this.update = (_id = 'root') => {
                    const t = shared.t()
                    const iter = shared.iter()
                    ${this.prep(code.update)}
                }

                this.post = (_id = 'root') => {
                    ${this.prep(code.post)}
                }
            `);
      } catch (e) {
        console.log(e);
        return Function("self,shared", `
                'use strict';
                this.init = () => {}
                this.update = () => {}
                this.post = () => {}
            `);
      }
    }
    make_modules() {
      let s = ``;
      for (var id in se.mods) {
        if (!se.mods[id].api)
          continue;
        s += `const ${id} = se.mods['${id}'].api[self.id]`;
        s += "\n";
      }
      return s;
    }
    prep(src) {
      let h = this.src.type;
      src = "		  let _pref = `${_id}<-" + h + "<-`\n" + src;
      FDEFS2.lastIndex = 0;
      let call_id = 0;
      let prefabs = self.scriptLib.prefabs;
      do {
        var m = FDEFS2.exec(src);
        if (m) {
          let fkeyword = m[1].trim();
          let fname = m[2];
          m[3];
          if (fkeyword === "function")
            ;
          else {
            let off = m.index + m[0].indexOf("(");
            let i1 = m.index;
            let m0 = this.parentheses(m[0]);
            let i2 = m.index + m0.length;
            let args2 = this.args2(m[0]);
            if (this.std[fname]) {
              src = this.postfix(src, m, ++call_id);
              off += 4;
            } else if (fname in prefabs) {
              off += 10;
              let utsid = `_pref+"f${++call_id}"`;
              src = this.replace(
                src,
                `pane.self.${fname}(${args2}, ${utsid})`,
                i1,
                i2
              );
            } else if (fname.slice(0, 4) === "pane" && fname.split(".").pop() in prefabs) {
              let utsid = `_pref+"f${++call_id}"`;
              src = this.replace(
                src,
                `${fname}(${args2}, ${utsid})`,
                i1,
                i2
              );
            }
            FDEFS2.lastIndex = off;
          }
        }
      } while (m);
      return wrap_idxs(src, "std_");
    }
    postfix(src, m, call_id) {
      let target = this.get_args(this.fdef(m[2])).length;
      let m0 = this.parentheses(m[0]);
      let args = this.get_args_2(m0);
      for (var i = args.length; i < target; i++) {
        args.push("void 0");
      }
      args.push(`_pref+"f${call_id}"`);
      return src.replace(m0, `std_${m[2]}(${args.join(", ")})`);
    }
    replace(src, str, i1, i2) {
      return [src.slice(0, i1), str, src.slice(i2)].join("");
    }
    parentheses(str) {
      var count = 0, first = false;
      for (var i = 0; i < str.length; i++) {
        if (str[i] === "(") {
          count++;
          first = true;
        } else if (str[i] === ")") {
          count--;
        }
        if (first && count === 0) {
          return str.substr(0, i + 1);
        }
      }
      return str;
    }
    args2(str) {
      var count = 0, first = false;
      var i1 = 0;
      for (var i = 0; i < str.length; i++) {
        if (str[i] === "(") {
          count++;
          if (!first)
            i1 = i + 1;
          first = true;
        } else if (str[i] === ")") {
          count--;
        }
        if (first && count === 0) {
          return str.substring(i1, i);
        }
      }
      return str;
    }
    fdef(fname) {
      return this.std[fname].toString();
    }
    get_args(src) {
      let reg = this.regex_clone(FDEFS1);
      reg.lastIndex = 0;
      let m = reg.exec(src);
      if (!m[3].trim().length)
        return [];
      let arr = m[3].split(",").map((x) => x.trim()).filter((x) => x !== "_id" && x !== "_tf");
      return arr;
    }
    get_args_2(str) {
      let parts = [];
      let c = 0;
      let s = 0;
      var q1 = false, q2 = false, q3 = false;
      let part;
      for (var i = 0; i < str.length; i++) {
        if (str[i] === "(") {
          c++;
          if (!part)
            part = [i + 1];
        }
        if (str[i] === ")")
          c--;
        if (str[i] === "[")
          s++;
        if (str[i] === "]")
          s--;
        if (str[i] === "'")
          q1 = !q1;
        if (str[i] === '"')
          q2 = !q2;
        if (str[i] === "`")
          q3 = !q3;
        if (str[i] === "," && c === 1 && !s && !q1 && !q2 && !q3) {
          if (part) {
            part[1] = i;
            parts.push(part);
            part = [i + 1];
          }
        }
        if (c === 0 && part) {
          part[1] = i;
          parts.push(part);
          part = null;
        }
      }
      return parts.map((x) => str.slice(...x)).filter((x) => /[^\s]+/.exec(x));
    }
    regex_clone(rex) {
      return new RegExp(rex.source, rex.flags);
    }
    send_modify(upd) {
      se.send("modify-overlay", {
        uuid: this.id,
        fields: upd
      });
    }
  }
  const SYMTF = /(open|high|low|close|vol)(\d+)(\w*)/gm;
  const FNSTD = /(a?tr|kcw?|dmi|sar|supertrend|wpr)(\d+?\w*)\s*\(/gm;
  const SYMSTD = /(?:hl2|hlc3|ohlc4)/gm;
  var symstd = {
    parse(s) {
      let ss = s.code;
      let all = `${ss.init}
${ss.update}
${ss.post}`;
      SYMTF.lastIndex = 0;
      FNSTD.lastIndex = 0;
      SYMSTD.lastIndex = 0;
      do {
        var m = SYMTF.exec(all);
        if (m) {
          if (m[0] in se.tss)
            continue;
          let ts = se.tss[m[0]] = TS(m[0], []);
          ts.__tf__ = tf_from_pair(m[2], m[3]);
          ts.__fn__ = Sampler(m[1], true).bind(ts);
        }
      } while (m);
      do {
        var m = SYMSTD.exec(all);
        if (m) {
          if (m[0] in se.tss)
            continue;
          this.parse_ts_sym(m[0]);
        }
      } while (m);
      do {
        var m = FNSTD.exec(all);
        if (m) {
          let fn = m[1] + m[2];
          let tf = m[2];
          if (fn in se.std_plus)
            continue;
          switch (m[1]) {
            case "tr":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(fixnan = false, _id) {
                return this.tr(fixnan, _id, tf);
              };
              break;
            case "atr":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(len, _id) {
                return this.atr(len, _id, tf);
              };
              break;
            case "kc":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(src, len, mult, use_tr = true, _id) {
                return this.kc(src, len, mult, use_tr, _id, tf);
              };
              break;
            case "kcw":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(src, len, mult, use_tr = true, _id) {
                return this.kcw(src, len, mult, use_tr, _id, tf);
              };
              break;
            case "dmi":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(len, smooth, _id) {
                return this.dmi(len, smooth, _id, tf);
              };
              break;
            case "sar":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(start, inc, max, _id) {
                return this.sar(start, inc, max, _id, tf);
              };
              break;
            case "supertrend":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(factor, atrlen, _id) {
                return this.supertrend(factor, atrlen, _id, tf);
              };
              break;
            case "wpr":
              this.deps(["high", "low", "close"], m[2]);
              se.std_plus[fn] = function(len, _id) {
                return this.wpr(len, _id, tf);
              };
              break;
          }
        }
      } while (m);
    },
    parse_ts_sym(sym, tf) {
      switch (sym) {
        case "hl2":
          se.tss["hl2"] = TS("hl2", []);
          se.tss["hl2"].__fn__ = () => {
            return (se.high[0] + se.low[0]) * 0.5;
          };
          break;
        case "hlc3":
          se.tss["hlc3"] = TS("hlc3", []);
          se.tss["hlc3"].__fn__ = () => {
            return (se.high[0] + se.low[0] + se.close[0]) / 3;
          };
          break;
        case "ohlc4":
          se.tss["ohlc4"] = TS("ohlc4", []);
          se.tss["ohlc4"].__fn__ = () => {
            return (se.open[0] + se.high[0] + se.low[0] + se.close[0]) * 0.25;
          };
          break;
      }
    },
    deps(types, tf) {
      for (var type of types) {
        let sym = type + tf;
        if (sym in se.tss)
          continue;
        let ts = se.tss[sym] = TS(sym, []);
        ts.__tf__ = tf_from_str(tf);
        ts.__fn__ = Sampler(type, true).bind(ts);
      }
    }
  };
  const DEF_LIMIT = 5;
  class ScriptEngine {
    constructor() {
      this.map = {};
      this.data = {};
      this.queue = [];
      this.delta_queue = [];
      this.update_queue = [];
      this.sett = {};
      this.state = {};
      this.mods = {};
      this.std_plus = {};
      this.tf = void 0;
    }
    async exec_all() {
      if (!this.data.ohlcv)
        return;
      this.map = this.struct_to_map(self.paneStruct);
      if (!this.init_state())
        return;
      this.init_map();
      if (Object.keys(this.map).length) {
        await this.run();
        this.drain_queues();
      } else {
        this.send("overlay-data", this.format_data());
      }
      this.send_state();
    }
    async exec_sel(delta) {
      if (!this.data.ohlcv)
        return;
      let sel = Object.keys(delta).filter((x) => x in this.map);
      if (!this.init_state(sel)) {
        this.delta_queue.push(delta);
        return;
      }
      for (var id in delta) {
        if (!this.map[id])
          continue;
        let props = this.map[id].src.props || {};
        for (var k in props) {
          if (k in delta[id]) {
            props[k].val = delta[id][k];
          }
        }
        this.add_script(this.map[id]);
      }
      await this.run(sel);
      this.drain_queues();
      this.send_state();
    }
    add_script(s) {
      let script = self.scriptLib.iScripts[s.type];
      if (!script) {
        delete this.map[s.uuid];
        return console.log("Unknown script: ", s.type);
      }
      s.code = {
        init: script.code.init || "",
        update: script.code.update || "",
        post: script.code.post || ""
      };
      symstd.parse(s);
      for (var id in this.mods) {
        if (this.mods[id].pre_env) {
          this.mods[id].pre_env(s.uuid, s);
        }
      }
      s.env = new ScriptEnv(s, Object.assign(this.shared, {
        open: this.open,
        high: this.high,
        low: this.low,
        close: this.close,
        vol: this.vol,
        dss: this.data,
        t: () => this.t,
        iter: () => this.iter,
        tf: this.tf,
        range: this.range,
        onclose: true
      }, this.tss));
      this.map[s.uuid] = s;
      for (var id in this.mods) {
        if (this.mods[id].new_env) {
          this.mods[id].new_env(s.uuid, s);
        }
      }
      s.env.build();
    }
    update(candles, e) {
      if (!this.data.ohlcv || !this.data.ohlcv.data.length) {
        return this.send_update(e.data.id);
      }
      if (this.running) {
        this.update_queue.push([candles, e]);
        return;
      }
      let mfs1 = this.make_mods_hooks("pre_step");
      let mfs2 = this.make_mods_hooks("post_step");
      let step = (sel, unshift) => {
        for (var m = 0; m < mfs1.length; m++) {
          mfs1[m](sel);
        }
        for (var id of sel) {
          this.map[id].env.step(unshift);
        }
        for (var m = 0; m < mfs2.length; m++) {
          mfs2[m](sel);
        }
      };
      try {
        let ohlcv = this.data.ohlcv.data;
        let i = ohlcv.length - 1;
        let last = ohlcv[i];
        let sel = Object.keys(this.map);
        let unshift = false;
        this.shared.event = "update";
        for (var candle of candles) {
          if (candle[0] > last[0]) {
            this.shared.onclose = true;
            step(sel, false);
            ohlcv.push(candle);
            unshift = true;
            i++;
          } else if (candle[0] < last[0]) {
            continue;
          } else {
            ohlcv[i] = candle;
          }
        }
        this.iter = i;
        this.t = ohlcv[i][0];
        this.step(ohlcv[i], unshift);
        this.shared.onclose = false;
        step(sel, unshift);
        this.limit();
        this.send_update(e.data.id);
        this.send_state();
      } catch (err) {
        console.log(err);
      }
    }
    init_state(sel) {
      sel = sel != null ? sel : Object.keys(this.map);
      let task = sel.join(",");
      if (this.running) {
        this._restart = task === this.task;
        return false;
      }
      this.open = TS("open", []);
      this.high = TS("high", []);
      this.low = TS("low", []);
      this.close = TS("close", []);
      this.vol = TS("vol", []);
      this.tss = {};
      this.std_plus = {};
      this.shared = {};
      this.iter = 0;
      this.t = 0;
      this.skip = false;
      this.running = false;
      this.task = task;
      return true;
    }
    struct_to_map(struct) {
      var _a;
      let map = {};
      let list = [];
      for (var pane of struct) {
        for (var s of pane.scripts) {
          list.push([s.uuid, s, (_a = s.settings.execOrder) != null ? _a : 1]);
        }
      }
      list.sort((a, b) => a[2] - b[2]);
      list.forEach((x) => {
        map[x[0]] = x[1];
      });
      return map;
    }
    std_inject(std) {
      let proto = Object.getPrototypeOf(std);
      Object.assign(proto, this.std_plus);
      return std;
    }
    send_state() {
      this.send("engine-state", {
        scripts: Object.keys(this.map).length,
        last_perf: this.perf,
        iter: this.iter,
        last_t: this.t,
        data_size: this.data_size,
        running: false
      });
    }
    send_update(taskId) {
      this.send(
        "overlay-update",
        this.format_update(),
        taskId
      );
    }
    init_map() {
      for (var id in this.map) {
        this.add_script(this.map[id]);
      }
    }
    async run(sel) {
      this.send("engine-state", { running: true });
      var t1 = Utils.now();
      sel = sel || Object.keys(this.map);
      this.pre_run_mods(sel);
      let mfs1 = this.make_mods_hooks("pre_step");
      let mfs2 = this.make_mods_hooks("post_step");
      this.running = true;
      try {
        for (var id of sel) {
          this.map[id].env.init();
        }
        let ohlcv = this.data.ohlcv.data;
        let start = this.start(ohlcv);
        this.shared.event = "step";
        for (var i = start; i < ohlcv.length; i++) {
          if (i % 5e3 === 0)
            await Utils.pause(0);
          if (this.restarted())
            return;
          this.iter = i - start;
          this.t = ohlcv[i][0];
          this.step(ohlcv[i]);
          this.shared.onclose = i !== ohlcv.length - 1;
          for (var m = 0; m < mfs1.length; m++) {
            mfs1[m](sel);
          }
          for (var id of sel)
            this.map[id].env.step();
          for (var m = 0; m < mfs2.length; m++) {
            mfs2[m](sel);
          }
          this.limit();
        }
        for (var id of sel) {
          this.map[id].env.output.post();
        }
      } catch (err) {
        console.log(err);
      }
      this.post_run_mods(sel);
      this.perf = Utils.now() - t1;
      this.running = false;
      this.send("overlay-data", this.format_data());
    }
    step(data, unshift = true) {
      if (unshift) {
        this.open.unshift(data[1]);
        this.high.unshift(data[2]);
        this.low.unshift(data[3]);
        this.close.unshift(data[4]);
        this.vol.unshift(data[5]);
        for (var id in this.tss) {
          if (this.tss[id].__tf__)
            this.tss[id].__fn__();
          else
            this.tss[id].unshift(this.tss[id].__fn__());
        }
      } else {
        this.open[0] = data[1];
        this.high[0] = data[2];
        this.low[0] = data[3];
        this.close[0] = data[4];
        this.vol[0] = data[5];
        for (var id in this.tss) {
          if (this.tss[id].__tf__)
            this.tss[id].__fn__();
          else
            this.tss[id][0] = this.tss[id].__fn__();
        }
      }
    }
    limit() {
      this.open.length = this.open.__len__ || DEF_LIMIT;
      this.high.length = this.high.__len__ || DEF_LIMIT;
      this.low.length = this.low.__len__ || DEF_LIMIT;
      this.close.length = this.close.__len__ || DEF_LIMIT;
      this.vol.length = this.vol.__len__ || DEF_LIMIT;
    }
    start(ohlcv) {
      let depth = this.sett.script_depth;
      return depth ? Math.max(ohlcv.length - depth, 0) : 0;
    }
    drain_queues() {
      if (this.queue.length) {
        this.exec_all();
      } else if (this.delta_queue.length) {
        this.exec_sel(this.delta_queue.pop());
        this.delta_queue = [];
      } else {
        while (this.update_queue.length) {
          let upd = this.update_queue.shift();
          this.update(...upd);
        }
      }
    }
    format_data() {
      return self.paneStruct.map((x) => ({
        id: x.id,
        uuid: x.uuid,
        overlays: x.overlays || []
      }));
    }
    format_update() {
      let map = {};
      for (var pane of self.paneStruct) {
        for (var ov of pane.overlays || []) {
          map[ov.uuid] = ov.data[ov.data.length - 1];
        }
      }
      return map;
    }
    restarted() {
      if (this._restart) {
        this._restart = false;
        this.running = false;
        this.perf = 0;
        return true;
      }
      return false;
    }
    remove_scripts(ids) {
      for (var id of ids)
        delete this.map[id];
      this.send_state();
    }
    pre_run_mods(sel) {
      for (var id in this.mods) {
        if (this.mods[id].pre_run) {
          this.mods[id].pre_run(sel);
        }
      }
    }
    post_run_mods(sel) {
      for (var id in this.mods) {
        if (this.mods[id].post_run) {
          this.mods[id].post_run(sel);
        }
      }
    }
    make_mods_hooks(name) {
      let arr = [];
      for (var id in this.mods) {
        if (this.mods[id][name]) {
          arr.push(this.mods[id][name].bind(this.mods[id]));
        }
      }
      return arr;
    }
    recalc_size() {
      while (true) {
        var sz = size_of_dss(this.data) / (1024 * 1024);
        let lim = this.sett.ww_ram_limit;
        if (lim && sz > lim) {
          this.limit_size();
        } else
          break;
      }
      this.data_size = +sz.toFixed(2);
      this.send_state();
    }
    limit_size() {
      let dss = Object.values(this.data).map((x) => ({
        id: x.id,
        t: x.last_upd
      }));
      dss.sort((a, b) => a.t - b.t);
      if (dss.length) {
        delete this.data[dss[0].id];
      }
    }
  }
  var se = new ScriptEngine();
  class DatasetWW {
    constructor(id, data) {
      this.last_upd = now();
      this.id = id;
      if (Array.isArray(data)) {
        this.data = data;
        if (id === "ohlcv")
          this.type = "OHLCV";
      } else {
        this.data = data.data;
        this.type = data.type;
      }
    }
    static update_all(se2, data) {
      for (var k in data) {
        if (k === "ohlcv")
          continue;
        let id = k.split(".")[1] || k;
        if (!se2.data[id])
          continue;
        let arr = se2.data[id].data;
        let iN = arr.length - 1;
        let last = arr[iN];
        for (var dp of data[k]) {
          if (!last || dp[0] > last[0]) {
            arr.push(dp);
          }
        }
        se2.data[id].last_upd = now();
      }
    }
    merge(data) {
      let len = this.data.length;
      if (!len) {
        this.data = data;
        return;
      }
      let t0 = this.data[0][0];
      let tN = this.data[len - 1][0];
      let l = data.filter((x) => x[0] < t0);
      let r = data.filter((x) => x[0] > tN);
      this.data = l.concat(this.data, r);
    }
    op(se2, op) {
      this.last_upd = now();
      switch (op.type) {
        case "set":
          this.data = op.data;
          se2.recalc_size();
          break;
        case "del":
          delete se2.data[this.id];
          se2.recalc_size();
          break;
        case "mrg":
          this.merge(op.data);
          se2.recalc_size();
          break;
      }
    }
  }
  self.scriptLib = {};
  self.paneStruct = {};
  self.onmessage = async (e) => {
    switch (e.data.type) {
      case "upload-scripts":
        self.scriptLib = e.data.data;
        break;
      case "send-meta-info":
        se.tf = tf_from_str(e.data.data.tf);
        se.range = e.data.data.range;
        break;
      case "upload-data":
        se.tf = tf_from_str(e.data.data.meta.tf);
        se.range = e.data.data.meta.range;
        for (var id in e.data.data.dss) {
          let data = e.data.data.dss[id];
          se.data[id] = new DatasetWW(id, data);
        }
        se.recalc_size();
        se.send("data-uploaded", {}, e.data.id);
        break;
      case "exec-all-scripts":
        self.paneStruct = e.data.data;
        se.exec_all();
        break;
      case "update-data":
        DatasetWW.update_all(se, e.data.data);
        if (e.data.data.ohlcv) {
          se.update(e.data.data.ohlcv, e);
        }
        break;
    }
  };
  se.send = (type, data, id) => {
    id = id != null ? id : Utils.uuid();
    switch (type) {
      case "data-uploaded":
      case "overlay-data":
      case "overlay-update":
      case "engine-state":
      case "modify-overlay":
      case "module-data":
      case "script-signal":
        self.postMessage({
          type,
          data,
          id
        });
        break;
    }
  };
})();
