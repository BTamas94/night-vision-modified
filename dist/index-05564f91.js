/* NightVisionCharts v0.3.6 | License: MIT
 © 2022 ChartMaster. All rights reserved */
function noop() {
}
const identity = (x) => x;
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop$1(callback) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function append(target, node) {
  target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);
  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element("style");
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
}
function get_root_for_style(node) {
  if (!node)
    return document;
  const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
  if (root && root.host) {
    return root;
  }
  return node.ownerDocument;
}
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
function append_stylesheet(node, style) {
  append(node.head || node, style);
  return style.sheet;
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data2) {
  return document.createTextNode(data2);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event2, handler, options) {
  node.addEventListener(event2, handler, options);
  return () => node.removeEventListener(event2, handler, options);
}
function stop_propagation(fn) {
  return function(event2) {
    event2.stopPropagation();
    return fn.call(this, event2);
  };
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data2) {
  data2 = "" + data2;
  if (text2.data === data2)
    return;
  text2.data = data2;
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
}
class HtmlTag {
  constructor(is_svg = false) {
    this.is_svg = false;
    this.is_svg = is_svg;
    this.e = this.n = null;
  }
  c(html) {
    this.h(html);
  }
  m(html, target, anchor = null) {
    if (!this.e) {
      if (this.is_svg)
        this.e = svg_element(target.nodeName);
      else
        this.e = element(target.nodeType === 11 ? "TEMPLATE" : target.nodeName);
      this.t = target.tagName !== "TEMPLATE" ? target : target.content;
      this.c(html);
    }
    this.i(anchor);
  }
  h(html) {
    this.e.innerHTML = html;
    this.n = Array.from(this.e.nodeName === "TEMPLATE" ? this.e.content.childNodes : this.e.childNodes);
  }
  i(anchor) {
    for (let i = 0; i < this.n.length; i += 1) {
      insert(this.t, this.n[i], anchor);
    }
  }
  p(html) {
    this.d();
    this.h(html);
    this.i(this.a);
  }
  d() {
    this.n.forEach(detach);
  }
}
const managed_styles = /* @__PURE__ */ new Map();
let active = 0;
function hash(str) {
  let hash2 = 5381;
  let i = str.length;
  while (i--)
    hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
  return hash2 >>> 0;
}
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  managed_styles.set(doc, info);
  return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
  const step = 16.666 / duration;
  let keyframes = "{\n";
  for (let p = 0; p <= 1; p += step) {
    const t = a + (b - a) * ease(p);
    keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
  }
  const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
    // remove all Svelte animations
  );
  const deleted = previous.length - next.length;
  if (deleted) {
    node.style.animation = next.join(", ");
    active -= deleted;
    if (!active)
      clear_rules();
  }
}
function clear_rules() {
  raf(() => {
    if (active)
      return;
    managed_styles.forEach((info) => {
      const { ownerNode } = info.stylesheet;
      if (ownerNode)
        detach(ownerNode);
    });
    managed_styles.clear();
  });
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function flush_render_callbacks(fns) {
  const filtered = [];
  const targets = [];
  render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
  targets.forEach((c) => c());
  render_callbacks = filtered;
}
let promise;
function wait() {
  if (!promise) {
    promise = Promise.resolve();
    promise.then(() => {
      promise = null;
    });
  }
  return promise;
}
function dispatch(node, direction, kind) {
  node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
    // parent group
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
  const options = { direction: "both" };
  let config = fn(node, params, options);
  let t = intro ? 0 : 1;
  let running_program = null;
  let pending_program = null;
  let animation_name = null;
  function clear_animation() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function init2(program, duration) {
    const d = program.b - t;
    duration *= Math.abs(d);
    return {
      a: t,
      b: program.b,
      d,
      duration,
      start: program.start,
      end: program.start + duration,
      group: program.group
    };
  }
  function go(b) {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    const program = {
      start: now() + delay,
      b
    };
    if (!b) {
      program.group = outros;
      outros.r += 1;
    }
    if (running_program || pending_program) {
      pending_program = program;
    } else {
      if (css) {
        clear_animation();
        animation_name = create_rule(node, t, b, duration, delay, easing, css);
      }
      if (b)
        tick(0, 1);
      running_program = init2(program, duration);
      add_render_callback(() => dispatch(node, b, "start"));
      loop$1((now2) => {
        if (pending_program && now2 > pending_program.start) {
          running_program = init2(pending_program, duration);
          pending_program = null;
          dispatch(node, running_program.b, "start");
          if (css) {
            clear_animation();
            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
          }
        }
        if (running_program) {
          if (now2 >= running_program.end) {
            tick(t = running_program.b, 1 - t);
            dispatch(node, running_program.b, "end");
            if (!pending_program) {
              if (running_program.b) {
                clear_animation();
              } else {
                if (!--running_program.group.r)
                  run_all(running_program.group.c);
              }
            }
            running_program = null;
          } else if (now2 >= running_program.start) {
            const p = now2 - running_program.start;
            t = running_program.a + running_program.d * easing(p / running_program.duration);
            tick(t, 1 - t);
          }
        }
        return !!(running_program || pending_program);
      });
    }
  }
  return {
    run(b) {
      if (is_function(config)) {
        wait().then(() => {
          config = config(options);
          go(b);
        });
      } else {
        go(b);
      }
    },
    end() {
      clear_animation();
      running_program = pending_program = null;
    }
  };
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    flush_render_callbacks($$.after_update);
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles2, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles2 && append_styles2($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var util$1 = {};
function isArrayLike(o) {
  if (o && // o is not null, undefined, etc.
  typeof o === "object" && // o is an object
  isFinite(o.length) && // o.length is a finite number
  o.length >= 0 && // o.length is non-negative
  o.length === Math.floor(o.length) && // o.length is an integer
  o.length < 4294967296)
    return true;
  else
    return false;
}
function isSortable(o) {
  if (o && // o is not null, undefined, etc.
  typeof o === "object" && // o is an object
  typeof o.sort === "function")
    return true;
  else
    return false;
}
util$1.isSortableArrayLike = function(o) {
  return isArrayLike(o) && isSortable(o);
};
var compare = {
  /**
   * Compare two numbers.
   *
   * @param {Number} a
   * @param {Number} b
   * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
   */
  numcmp: function(a, b) {
    return a - b;
  },
  /**
   * Compare two strings.
   *
   * @param {Number|String} a
   * @param {Number|String} b
   * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
   */
  strcmp: function(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
};
var binary = {};
function loop(data2, min, max, index, valpos) {
  var curr = max + min >>> 1;
  var diff = this.compare(data2[curr][this.index], index);
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
    return loop.call(this, data2, min, curr - 1, index, valpos);
  else
    return loop.call(this, data2, curr + 1, max, index, valpos);
}
function search(index) {
  var data2 = this.data;
  return loop.call(this, data2, 0, data2.length - 1, index, this.valpos);
}
binary.search = search;
var util = util$1, cmp = compare, bin = binary;
var lib = IndexedArray;
function IndexedArray(data2, index) {
  if (!util.isSortableArrayLike(data2))
    throw new Error("Invalid data");
  if (!index || data2.length > 0 && !(index in data2[0]))
    throw new Error("Invalid index");
  this.data = data2;
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
  var data2 = this.data, index = this.index;
  this.minv = data2.length && data2[0][index];
  this.maxv = data2.length && data2[data2.length - 1][index];
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
const IndexedArray$1 = /* @__PURE__ */ getDefaultExportFromCjs(lib);
const SECOND = 1e3;
const MINUTE$1 = SECOND * 60;
const MINUTE3 = MINUTE$1 * 3;
const MINUTE5 = MINUTE$1 * 5;
const MINUTE15$1 = MINUTE$1 * 15;
const MINUTE30 = MINUTE$1 * 30;
const HOUR$2 = MINUTE$1 * 60;
const HOUR4 = HOUR$2 * 4;
const HOUR12 = HOUR$2 * 12;
const DAY$2 = HOUR$2 * 24;
const WEEK$2 = DAY$2 * 7;
const MONTH$2 = WEEK$2 * 4;
const YEAR$2 = DAY$2 * 365;
const MONTHMAP$1 = [
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
const TIMESCALES$1 = [
  YEAR$2 * 10,
  YEAR$2 * 5,
  YEAR$2 * 3,
  YEAR$2 * 2,
  YEAR$2,
  MONTH$2 * 6,
  MONTH$2 * 4,
  MONTH$2 * 3,
  MONTH$2 * 2,
  MONTH$2,
  DAY$2 * 15,
  DAY$2 * 10,
  DAY$2 * 7,
  DAY$2 * 5,
  DAY$2 * 3,
  DAY$2 * 2,
  DAY$2,
  HOUR$2 * 12,
  HOUR$2 * 6,
  HOUR$2 * 3,
  HOUR$2 * 1.5,
  HOUR$2,
  MINUTE30,
  MINUTE15$1,
  MINUTE$1 * 10,
  MINUTE5,
  MINUTE$1 * 2,
  MINUTE$1
];
const $SCALES$2 = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
const COLORS = {
  back: "#14151c",
  // Background color
  grid: "#252732",
  // Grid color
  text: "#adadad",
  // Regular text color
  textHL: "#dedddd",
  // Highlighted text color
  textLG: "#c4c4c4",
  // Legend text color
  llValue: "#818989",
  // Legend value color
  llBack: "#14151c77",
  // Legend bar background
  llSelect: "#2d7b2f",
  // Legend select border
  scale: "#606060",
  // Scale edge color
  cross: "#8091a0",
  // Crosshair color
  candleUp: "#41a376",
  // "Green" candle color
  candleDw: "#de4646",
  // "Red" candle color
  wickUp: "#23a77688",
  // "Green" wick color
  wickDw: "#e5415088",
  // "Red" wick color
  volUp: "#41a37682",
  // "Green" volume color
  volDw: "#de464682",
  // "Red" volume color
  panel: "#2a2f38",
  // Scale panel color
  tbBack: void 0,
  // Toolbar background
  tbBorder: "#8282827d"
  // Toolbar border color
};
const ChartConfig = {
  SBMIN: 60,
  // Minimal sidebar, px
  SBMAX: Infinity,
  // Max sidebar, px
  TOOLBAR: 57,
  // Toolbar width, px
  TB_ICON: 25,
  // Toolbar icon size, px
  TB_ITEM_M: 6,
  // Toolbar item margin, px
  TB_ICON_BRI: 1,
  // Toolbar icon brightness
  TB_ICON_HOLD: 420,
  // Wait to expand, ms
  TB_BORDER: 1,
  // Toolbar border, px
  TB_B_STYLE: "dotted",
  // Toolbar border style
  TOOL_COLL: 7,
  // Tool collision threshold
  EXPAND: 0.15,
  // Expand y-range, %/100 of range
  CANDLEW: 0.7,
  // Candle width, %/100 of step
  GRIDX: 100,
  // Grid x-step target, px
  GRIDY: 47,
  // Grid y-step target, px
  BOTBAR: 28,
  // Bottom bar height, px
  PANHEIGHT: 22,
  // Scale panel height, px
  DEFAULT_LEN: 50,
  // Starting range, candles
  MINIMUM_LEN: 5,
  // Minimal starting range, candles
  MIN_ZOOM: 5,
  // Minimal zoom, candles
  MAX_ZOOM: 5e3,
  // Maximal zoom, candles,
  VOLSCALE: 0.15,
  // Volume bars height, %/100 of layout.height
  UX_OPACITY: 0.9,
  // Ux background opacity
  ZOOM_MODE: "tv",
  // Zoom mode, 'tv' or 'tl'
  L_BTN_SIZE: 21,
  // Legend Button size, px
  L_BTN_MARGIN: "-6px 0 -6px 0",
  // css margin
  SCROLL_WHEEL: "prevent",
  // Scroll wheel morde, 'prevent', 'pass', 'click',
  QUANTIZE_AFTER: 0,
  // Quantize cursor after, ms
  AUTO_PRE_SAMPLE: 10
  // Sample size for auto-precision
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
  "1m": MINUTE$1,
  "3m": MINUTE3,
  "5m": MINUTE5,
  "15m": MINUTE15$1,
  "30m": MINUTE30,
  "1H": HOUR$2,
  "2H": HOUR$2 * 2,
  "3H": HOUR$2 * 3,
  "4H": HOUR4,
  "12H": HOUR12,
  "1D": DAY$2,
  "1W": WEEK$2,
  "1M": MONTH$2,
  "1Y": YEAR$2,
  // Lower case variants
  "1h": HOUR$2,
  "2h": HOUR$2 * 2,
  "3h": HOUR$2 * 3,
  "4h": HOUR4,
  "12h": HOUR12,
  "1d": DAY$2,
  "1w": WEEK$2,
  "1y": YEAR$2
};
const HPX$8 = -0.5;
const Const = {
  SECOND,
  MINUTE: MINUTE$1,
  MINUTE5,
  MINUTE15: MINUTE15$1,
  MINUTE30,
  HOUR: HOUR$2,
  HOUR4,
  DAY: DAY$2,
  WEEK: WEEK$2,
  MONTH: MONTH$2,
  YEAR: YEAR$2,
  MONTHMAP: MONTHMAP$1,
  TIMESCALES: TIMESCALES$1,
  $SCALES: $SCALES$2,
  ChartConfig,
  MAP_UNIT,
  IB_TF_WARN,
  COLORS,
  HPX: HPX$8
};
const Utils = {
  clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  },
  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  // Start of the day (zero millisecond)
  dayStart(t) {
    let start = new Date(t);
    return start.setUTCHours(0, 0, 0, 0);
  },
  // Start of the month
  monthStart(t) {
    let date = new Date(t);
    return Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      1
    );
  },
  // Start of the year
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
  // Nearest in array
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
  // Nearest value by time (in timeseries)
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
  // Nearest value by index (in timeseries)
  nearestTsIb(i, ts, offset) {
    let index = Math.floor(i - offset) + 1;
    let val = ts[index] || null;
    return [index, val];
  },
  round(num, decimals = 8) {
    return parseFloat(num.toFixed(decimals));
  },
  // Strip? No, it's ugly floats in js
  strip(number) {
    return parseFloat(
      parseFloat(number).toPrecision(12)
    );
  },
  getDay(t) {
    return t ? new Date(t).getDate() : null;
  },
  // Update array keeping the same reference
  overwrite(arr, new_arr) {
    arr.splice(0, arr.length, ...new_arr);
  },
  // Get full list of overlays on all panes
  allOverlays(panes = []) {
    return panes.map((x) => x.overlays || []).flat();
  },
  // Detects a timeframe of the data
  detectTimeframe(data2) {
    let len = Math.min(data2.length - 1, 99);
    let min = Infinity;
    data2.slice(0, len).forEach((x, i) => {
      let d = data2[i + 1][0] - x[0];
      if (d === d && d < min)
        min = d;
    });
    if (min >= Const.MONTH && min <= Const.DAY * 30) {
      return Const.DAY * 31;
    }
    return min;
  },
  // Fast filter. Really fast, like 10X
  fastFilter(arr, t1, t2) {
    if (!arr.length)
      return [arr, void 0];
    try {
      let ia = new IndexedArray$1(arr, "0");
      let res = ia.getRange(t1, t2);
      let i0 = ia.valpos[t1].next;
      return [res, i0];
    } catch (e) {
      return [arr.filter(
        (x) => x[0] >= t1 && x[0] <= t2
      ), 0];
    }
  },
  // Fast filter 2 (returns indices)
  fastFilter2(arr, t1, t2) {
    if (!arr.length)
      return [arr, void 0];
    try {
      let ia = new IndexedArray$1(arr, "0");
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
  // Fast filter (index-based)
  fastFilterIB(arr, t1, t2) {
    if (!arr.length)
      return [void 0, void 0];
    let i1 = Math.floor(t1);
    if (i1 < 0)
      i1 = 0;
    let i2 = Math.floor(t2 + 1);
    return [i1, i2];
  },
  // Nearest indexes (left and right)
  fastNearest(arr, t1) {
    let ia = new IndexedArray$1(arr, "0");
    ia.fetch(t1);
    return [ia.nextlow, ia.nexthigh];
  },
  now() {
    return (/* @__PURE__ */ new Date()).getTime();
  },
  pause(delay) {
    return new Promise((rs, rj) => setTimeout(rs, delay));
  },
  // Limit crazy wheel delta values
  smartWheel(delta) {
    let abs = Math.abs(delta);
    if (abs > 500) {
      return (200 + Math.log(abs)) * Math.sign(delta);
    }
    return delta;
  },
  // Parse the original mouse event to find deltaX
  getDeltaX(event2) {
    return event2.originalEvent.deltaX / 12;
  },
  // Parse the original mouse event to find deltaY
  getDeltaY(event2) {
    return event2.originalEvent.deltaY / 12;
  },
  // Apply opacity to a hex color
  applyOpacity(c, op) {
    if (c.length === 7) {
      let n = Math.floor(op * 255);
      n = this.clamp(n, 0, 255);
      c += n.toString(16);
    }
    return c;
  },
  // Parse timeframe or return value in ms
  // TODO: add full parser
  // (https://github.com/tvjsx/trading-vue-js/
  // blob/master/src/helpers/script_utils.js#L98)
  parseTf(smth) {
    if (typeof smth === "string") {
      return Const.MAP_UNIT[smth];
    } else {
      return smth;
    }
  },
  // Detect index shift between the main data subset
  // and the overlay's subset (for IB-mode)
  indexShift(sub, data2) {
    if (!data2.length)
      return 0;
    let first = data2[0][0];
    let second;
    for (var i = 1; i < data2.length; i++) {
      if (data2[i][0] !== first) {
        second = data2[i][0];
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
  // Fallback fix for Brave browser
  // https://github.com/brave/brave-browser/issues/1738
  measureText(ctx, text2, nvId) {
    let m = ctx.measureTextOrg(text2);
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
      el.innerText = text2.replace(/ /g, ".");
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
  // Delayed warning, f = condition lambda fn
  warn(f, text2, delay = 0) {
    setTimeout(() => {
      if (f())
        console.warn(text2);
    }, delay);
  },
  // Checks if script props updated
  // (and not style settings or something else)
  /*isScrPropsUpd(n, prev) {
          let p = prev.find(x => x.v.$uuid === n.v.$uuid)
          if (!p) return false
  
          let props = n.p.settings.$props
          if (!props) return false
  
          return props.some(x => n.v[x] !== p.v[x])
      },*/
  // Checks if it's time to make a script update
  // (based on execInterval in ms)
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
  // Format names such 'RSI, $length', where
  // length - is one of the settings
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
  // Default cursor mode
  xMode() {
    return this.is_mobile ? "explore" : "default";
  },
  defaultPrevented(event2) {
    if (event2.original) {
      return event2.original.defaultPrevented;
    }
    return event2.defaultPrevented;
  },
  // Get a view from the data by the name
  /*view(data, name) {
      if (!data.views) return data
      let v = data.views.find(x => x.name === name)
      if (!v) return data
      return v.data
  },*/
  /*concatArrays(arrays) {
      var acc = []
      for (var a of arrays) {
          acc = acc.concat(a)
      }
      return acc
  },*/
  // Call
  afterAll(object, f, time) {
    clearTimeout(object.__afterAllId__);
    object.__afterAllId__ = setTimeout(() => f(), time);
  },
  // Default auto-precision sampler for a generic
  // timeseries-element: [time, x1, x2, x3, ...]
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
  // Get scales by side id (0 - left, 1 - right)
  getScalesBySide(side, layout) {
    if (!layout)
      return [];
    let template = layout.settings.scaleTemplate;
    return template[side].map((id) => layout.scales[id]).filter((x) => x);
  },
  // If scaleTemplate is changed there could be a
  // situation when user forget to reset scaleSideIdxs.
  // Here we attemp to get them in sync
  autoScaleSideId(S, sides, idxs) {
    if (sides[S].length) {
      if (!idxs[S] || !sides[S].includes(idxs[S])) {
        idxs[S] = sides[S][0];
      }
    } else {
      idxs[S] = void 0;
    }
  },
  // Debug function, shows how many times
  // this method is called per second
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
  // Calculate an index offset for a timeseries
  // against the main ts. (for indexBased mode)
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
  // Format cash values
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
  // Time range of a data subset (from i0 to iN-1)
  realTimeRange(data2) {
    if (!data2.length)
      return 0;
    return data2[data2.length - 1][0] - data2[0][0];
  },
  // Get sizes left and right parts of a number
  // (11.22 -> ['11', '22'])
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
  // Get a hash of current overlay disposition:
  // pane1.uuid+ov1.type+ov2.type+...+pane2.uuid+...
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
  // WTF with modern web development
  isMobile: ((w) => "onorientationchange" in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || ("ontouchstart" in w || w.DocumentTouch && document instanceof w.DocumentTouch)))(typeof window !== "undefined" ? window : {})
};
const math = {
  // Distance from point to line
  // p1 = point, (p2, p3) = line
  point2line(p1, p2, p3) {
    let { area: area2, base } = this.tri(p1, p2, p3);
    return Math.abs(this.tri_h(area2, base));
  },
  // Distance from point to segment
  // p1 = point, (p2, p3) = segment
  point2seg(p1, p2, p3) {
    let { area: area2, base } = this.tri(p1, p2, p3);
    let proj = this.dot_prod(p1, p2, p3) / base;
    let l1 = Math.max(-proj, 0);
    let l2 = Math.max(proj - base, 0);
    let h = Math.abs(this.tri_h(area2, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray(p1, p2, p3) {
    let { area: area2, base } = this.tri(p1, p2, p3);
    let proj = this.dot_prod(p1, p2, p3) / base;
    let l1 = Math.max(-proj, 0);
    let h = Math.abs(this.tri_h(area2, base));
    return Math.max(h, l1);
  },
  tri(p1, p2, p3) {
    let area2 = this.area(p1, p2, p3);
    let dx = p3[0] - p2[0];
    let dy = p3[1] - p2[1];
    let base = Math.sqrt(dx * dx + dy * dy);
    return { area: area2, base };
  },
  /* Area of triangle:
          p1
        /    \
      p2  _  p3
  */
  area(p1, p2, p3) {
    return p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]);
  },
  // Triangle height
  tri_h(area2, base) {
    return area2 / base;
  },
  // Dot product of (p2, p3) and (p2, p1)
  dot_prod(p1, p2, p3) {
    let v1 = [p3[0] - p2[0], p3[1] - p2[1]];
    let v2 = [p1[0] - p2[0], p1[1] - p2[1]];
    return v1[0] * v2[0] + v1[1] * v2[1];
  },
  // Symmetrical log
  log(x) {
    return Math.sign(x) * Math.log(Math.abs(x) + 1);
  },
  // Symmetrical exp
  exp(x) {
    return Math.sign(x) * (Math.exp(Math.abs(x)) - 1);
  },
  // Middle line on log scale based on range & px height
  log_mid(r, h) {
    let log_hi = this.log(r[0]);
    let log_lo = this.log(r[1]);
    let px = h / 2;
    let gx = log_hi - px * (log_hi - log_lo) / h;
    return this.exp(gx);
  },
  // Return new adjusted range, based on the previous
  // range, new $hi, target middle line
  re_range(r1, hi2, mid) {
    let log_hi1 = this.log(r1[0]);
    let log_lo1 = this.log(r1[1]);
    let log_hi2 = this.log(hi2);
    let log_$ = this.log(mid);
    let W = (log_hi2 - log_$) * (log_hi1 - log_lo1) / (log_hi1 - log_$);
    return this.exp(log_hi2 - W);
  }
  // Return new adjusted range, based on the previous
  // range, new $hi, target middle line + dy (shift)
  // WASTE
  /*range_shift(r1, hi2, mid, dy, h) {
          let log_hi1 = this.log(r1[0])
          let log_lo1 = this.log(r1[1])
          let log_hi2 = this.log(hi2)
          let log_$ = this.log(mid)
  
          let W = h * (log_hi2 - log_$) /
                  (h * (log_hi1 - log_$) / (log_hi1 - log_lo1) + dy)
  
          return this.exp(log_hi2 - W)
  
      }*/
};
class Cursor {
  constructor(meta) {
    this.meta = meta;
  }
  xSync(hub, layout, props, update2) {
    if (update2.visible === false) {
      this.hide();
      return this;
    }
    let prevX = this.x;
    let prevY = this.y;
    Object.assign(this, update2);
    if (update2.freeze === true)
      return this;
    let start = layout.main.startx;
    let step = layout.main.pxStep;
    this.yValues(layout);
    if ((this.locked || this.freeze) && !this.meta.scrollLock) {
      this.x = prevX;
      this.y = prevY;
      return this;
    }
    this.x = Math.round((this.x - start) / step) * step + start;
    this.x = Math.floor(this.x - 1) + 0.5;
    return this.xValues(hub, layout, props);
  }
  // Get nearest data values
  xValues(hub, layout, props) {
    if (!this.locked || this.meta.scrollLock) {
      this.ti = layout.main.x2ti(this.x);
    }
    let values = [];
    let vi;
    for (var pane of hub.panes()) {
      let arr = [];
      for (var i = 0; i < pane.overlays.length; i++) {
        let ov = pane.overlays[i];
        if (!layout.indexBased) {
          vi = Utils.nearestTs(this.ti, ov.dataSubset) || [];
        } else {
          let off = ov.indexOffset;
          vi = Utils.nearestTsIb(this.ti, ov.data, off) || [];
        }
        if (ov.main) {
          this.time = vi[1] ? vi[1][0] : void 0;
        }
        arr.push(vi[1]);
      }
      values.push(arr);
    }
    this.values = values;
    this.quantizeTime(hub, layout, props);
    return this;
  }
  // Calculate y-values for each scale
  yValues(layout) {
    let gridId = this.gridId;
    if (!layout.grids[gridId])
      return;
    this.scales = {};
    let grid = layout.grids[gridId];
    for (var scale of Object.values(grid.scales)) {
      let $ = this.y2value(this.y, scale);
      this.scales[scale.scaleSpecs.id] = $;
    }
  }
  // Quantize time (by interval)
  quantizeTime(hub, layout, props) {
    let id = hub.chart.id;
    let ovId = hub.mainOv.id;
    if (!this.values || !this.values[id])
      return;
    let v = this.values[id][ovId];
    if (!v)
      return;
    let r = Math.abs((v[0] - this.ti) / props.interval);
    if (r >= 0.5) {
      let n = Math.round(this.ti / props.interval);
      this.ti = n * props.interval;
    } else {
      this.ti = v[0];
    }
    if (!layout.indexBased) {
      this.time = this.ti;
    }
  }
  // Copy of the same function from layoutFn.js
  y2value(y, scale) {
    let ls = scale.scaleSpecs.log;
    if (ls)
      return math.exp((y - scale.B) / scale.A);
    return (y - scale.B) / scale.A;
  }
  getValue(paneId, ovId) {
    if (!this.values)
      return void 0;
    let paneValues = this.values[paneId] || [];
    return paneValues[ovId];
  }
  hide() {
    this.visible = false;
    delete this.scales;
    delete this.x;
    delete this.y;
    if (!this.locked)
      delete this.ti;
  }
}
class Events {
  // TODO: add component call priority (think)
  // TODO: build event inspector (think)
  constructor() {
    this.handlers = {};
  }
  // Immediately calls all handlers with the
  // specified type (there can be only one
  // listener of this type per each component)
  emit(type, obj) {
    let components = this.handlers[type];
    if (!components)
      return;
    for (var name in components) {
      components[name](obj);
    }
  }
  // Component-specific update
  emitSpec(comp, type, obj) {
    let components = this.handlers[type];
    if (!components)
      return;
    if (!components[comp])
      return;
    components[comp](obj);
  }
  // TODO: imlement more specific emitter, e.g.
  // emitRegex() which uses RegEx to match
  // components
  // Add event listener to a specific component:
  // '<component>:<event-type>'
  on(compAndType, f) {
    let [comp, type] = compAndType.split(":");
    if (!this.handlers[type]) {
      this.handlers[type] = {};
    }
    this.handlers[type][comp] = f;
  }
  // Remove event listeners / one listener
  off(comp, type = null) {
    if (type && this.handlers[type]) {
      delete this.handlers[type][comp];
      return;
    }
    for (var type in this.handlers) {
      delete this.handlers[type][comp];
    }
  }
}
let instances$6 = {};
function instance$j(id) {
  if (!instances$6[id]) {
    instances$6[id] = new Events(id);
  }
  return instances$6[id];
}
const Events$1 = { instance: instance$j };
class SeClient {
  constructor(id, chart) {
    this.chart = chart;
    this.ww = chart.ww;
    this.ww.onevent = this.onEvent.bind(this);
  }
  setRefs(hub, scan) {
    this.hub = hub;
    this.scan = scan;
  }
  // Listen to the events from web-worker
  onEvent(e) {
    switch (e.data.type) {
      case "overlay-data":
        this.onOverlayData(e.data.data);
      case "engine-state":
        this.onEngineState(e.data.data);
        break;
    }
  }
  // Upload initial data
  async uploadData() {
    if (!this.hub.mainOv)
      return;
    await this.ww.exec("upload-data", {
      meta: {
        range: this.chart.range,
        tf: this.scan.tf
      },
      dss: {
        // TODO: 'cv' data key for [close, vol] chart
        ohlcv: this.hub.mainOv.data
      }
    });
  }
  // Update data (when new live data arrives)
  // TODO: autoscroll
  async updateData() {
    let ohlcv = this.hub.mainOv.data;
    let data2 = await this.ww.exec("update-data", {
      // Send the last two candles
      ohlcv: ohlcv.slice(-2)
    });
    let unshift = false;
    for (var ov of this.hub.allOverlays()) {
      if (data2[ov.uuid]) {
        let last = ov.data[ov.data.length - 1];
        let nw = data2[ov.uuid];
        if (!last || nw[0] > last[0]) {
          ov.data.push(nw);
          unshift = true;
        } else if (nw[0] === last[0]) {
          ov.data[ov.data.length - 1] = nw;
        }
      }
    }
    if (unshift) {
      this.chart.update("data");
    } else {
      this.chart.update();
    }
  }
  async execScripts() {
    let list = this.hub.panes().map((x) => ({
      id: x.id,
      uuid: x.uuid,
      scripts: x.scripts
    }));
    await this.ww.exec("exec-all-scripts", list);
  }
  async uploadAndExec() {
    await this.uploadData();
    await this.execScripts();
  }
  // Remove all overlays produced by scripts & add new
  replaceOverlays(data2) {
    for (var pane of this.hub.panes()) {
      pane.overlays = pane.overlays.filter((x) => !x.prod);
      let p = data2.find((x) => x.uuid === pane.uuid);
      if (p && p.overlays) {
        pane.overlays.push(...p.overlays);
      }
    }
    this.chart.update();
  }
  // Opdate data of overlays produced by scripts
  updateOverlays(data2) {
    for (var pane of this.hub.panes()) {
      let p = data2.find((x) => x.uuid === pane.uuid);
      if (p && p.overlays) {
        let ovs = pane.overlays.filter((x) => x.prod);
        for (var i = 0; i < ovs.length; i++) {
          let dst = ovs[i];
          let src = p.overlays[i];
          if (dst && src) {
            dst.name = src.name;
            dst.data = src.data;
            dst.uuid = src.uuid;
          }
        }
      }
    }
    this.chart.update("data", { updateHash: true });
  }
  // Event handlers
  onOverlayData(data2) {
    let h1 = Utils.ovDispositionHash(this.hub.panes());
    let h2 = Utils.ovDispositionHash(data2);
    if (h1 === h2) {
      this.updateOverlays(data2);
    } else {
      this.replaceOverlays(data2);
    }
  }
  onEngineState(data2) {
    this.state = Object.assign(this.state || {}, data2);
  }
}
let instances$5 = {};
function instance$i(id, chart) {
  if (!instances$5[id]) {
    instances$5[id] = new SeClient(id, chart);
  }
  return instances$5[id];
}
const SeClient$1 = { instance: instance$i };
class DataView$ {
  constructor(src, i1, i2) {
    this.src = src;
    this.i1 = Math.max(0, i1 - 1);
    this.i2 = Math.min(i2, src.length - 1);
    this.length = this.i2 - this.i1 + 1;
  }
  makeSubset() {
    return this.src.slice(
      this.i1,
      this.i2 + 1
    );
  }
}
class DataHub {
  constructor(nvId) {
    let events = Events$1.instance(nvId);
    let se = SeClient$1.instance(nvId);
    this.events = events;
    this.se = se;
    se.hub = this;
    events.on("hub:set-scale-index", this.onScaleIndex.bind(this));
    events.on("hub:display-overlay", this.onDisplayOv.bind(this));
  }
  init(data2) {
    var _a;
    this.data = data2;
    this.indexBased = (_a = data2.indexBased) != null ? _a : false;
    this.chart = null;
    this.offchart = null;
    this.mainOv = null;
    this.mainPaneId = null;
  }
  // Update data on 'range-changed'. Should apply
  // filters only (not updating the full structure)
  updateRange(range) {
    for (var pane of this.data.panes) {
      for (var ov of pane.overlays) {
        let off = ov.indexOffset;
        ov.dataView = this.filter(ov.data, range, off);
        ov.dataSubset = ov.dataView.makeSubset();
      }
    }
  }
  // Calculate visible data section
  // (& completes the main structure)
  // TODO: smarter algo of adding/removing panes. Uuids
  // should remain the same if pane still exists
  calcSubset(range) {
    var paneId = 0;
    for (var pane of this.data.panes || []) {
      pane.id = paneId++;
      pane.overlays = pane.overlays || [];
      pane.settings = pane.settings || {};
      var ovId = 0;
      for (var ov of pane.overlays) {
        ov.id = ovId++;
        ov.main = !!ov.main;
        ov.data = ov.data || [];
        ov.dataView = this.filter(
          ov.data,
          range,
          ov.indexOffset
        );
        ov.dataSubset = ov.dataView.makeSubset();
        ov.settings = ov.settings || {};
        ov.props = ov.props || {};
        ov.uuid = ov.uuid || Utils.uuid3();
      }
      pane.uuid = pane.uuid || Utils.uuid3();
    }
  }
  // Load indicator scripts
  async loadScripts(exec = false) {
    for (var pane of this.data.panes || []) {
      var scriptId = 0;
      pane.scripts = pane.scripts || [];
      for (var s of pane.scripts) {
        s.id = scriptId++;
        s.settings = s.settings || {};
        s.props = s.props || {};
        s.uuid = s.uuid || Utils.uuid3();
      }
    }
    if (exec) {
      await Utils.pause(0);
      await this.se.uploadAndExec();
    }
  }
  // Detect the main chart, define offcharts
  detectMain() {
    let all = Utils.allOverlays(this.data.panes);
    let mainOv = all.find((x) => x.main) || all[0];
    if (!all.length || !mainOv)
      return;
    mainOv.main = true;
    this.chart = this.data.panes.find(
      (x) => x.overlays.find(
        (y) => y.main
      )
    );
    this.offchart = this.data.panes.filter(
      (x) => x !== this.chart
    );
    this.mainOv = mainOv;
    this.mainPaneId = this.panes().indexOf(this.chart);
    for (var ov of all) {
      if (ov !== mainOv)
        ov.main = false;
    }
  }
  // [API] Create a subset of timeseries
  filter(data2, range, offset = 0) {
    let filter = this.indexBased ? Utils.fastFilterIB : Utils.fastFilter2;
    var ix = filter(
      data2,
      range[0] - offset,
      range[1] - offset
    );
    return new DataView$(data2, ix[0], ix[1]);
  }
  // [API] Get all active panes (with uuid)
  panes() {
    return (this.data.panes || []).filter((x) => x.uuid);
  }
  // [API] Get overlay ref by paneId & ovId
  overlay(paneId, ovId) {
    var _a;
    return (_a = this.panes()[paneId]) == null ? void 0 : _a.overlays[ovId];
  }
  // [API] Get overlay data by paneId & ovId
  ovData(paneId, ovId) {
    var _a, _b;
    return (_b = (_a = this.panes()[paneId]) == null ? void 0 : _a.overlays[ovId]) == null ? void 0 : _b.data;
  }
  // [API] Get overlay data subset by paneId & ovId
  ovDataSubset(paneId, ovId) {
    var _a, _b;
    return (_b = (_a = this.panes()[paneId]) == null ? void 0 : _a.overlays[ovId]) == null ? void 0 : _b.dataSubset;
  }
  // [API] Get All overlays
  allOverlays(type) {
    let all = Utils.allOverlays(this.data.panes);
    return type ? all.filter((x) => x.type === type) : all;
  }
  // Event handlers
  onScaleIndex(event2) {
    let pane = this.panes()[event2.paneId];
    if (!pane)
      return;
    pane.settings.scaleIndex = event2.index;
    pane.settings.scaleSideIdxs = event2.sideIdxs;
    this.events.emitSpec("chart", "update-layout");
  }
  onDisplayOv(event2) {
    let pane = this.panes()[event2.paneId];
    if (!pane)
      return;
    let ov = pane.overlays[event2.ovId];
    if (!ov)
      return;
    ov.settings.display = event2.flag;
    let llId = `${event2.paneId}-${event2.ovId}`;
    this.events.emitSpec("chart", "update-layout");
    this.events.emitSpec(`ll-${llId}`, "update-ll");
  }
}
let instances$4 = {};
function instance$h(id) {
  if (!instances$4[id]) {
    instances$4[id] = new DataHub(id);
  }
  return instances$4[id];
}
const DataHub$1 = { instance: instance$h };
class MetaHub {
  constructor(nvId) {
    let events = Events$1.instance(nvId);
    this.hub = DataHub$1.instance(nvId);
    this.events = events;
    events.on("meta:sidebar-transform", this.onYTransform.bind(this));
    events.on("meta:select-overlay", this.onOverlaySelect.bind(this));
    events.on("meta:grid-mousedown", this.onGridMousedown.bind(this));
    events.on("meta:scroll-lock", this.onScrollLock.bind(this));
    this.storage = {};
  }
  init(props) {
    this.panes = 0;
    this.legendFns = [];
    this.yTransforms = [];
    this.preSamplers = [];
    this.yRangeFns = [];
    this.autoPrecisions = [];
    this.valueTrackers = [];
    this.selectedOverlay = void 0;
    this.ohlcMap = [];
    this.ohlcFn = void 0;
    this.scrollLock = false;
  }
  // Extract meta functions from overlay
  exctractFrom(overlay) {
    var _a;
    let gridId = overlay.gridId();
    let id = overlay.id();
    var yrfs = this.yRangeFns[gridId] || [];
    yrfs[id] = overlay.yRange ? {
      exec: overlay.yRange,
      preCalc: overlay.yRangePreCalc
    } : null;
    var aps = this.preSamplers[gridId] || [];
    aps[id] = overlay.preSampler;
    var lfs = this.legendFns[gridId] || [];
    lfs[id] = {
      legend: overlay.legend,
      legendHtml: overlay.legendHtml,
      noLegend: (_a = overlay.noLegend) != null ? _a : false
    };
    var vts = this.valueTrackers[gridId] || [];
    vts[id] = overlay.valueTracker;
    let main = this.hub.overlay(gridId, id).main;
    if (main) {
      this.ohlcFn = overlay.ohlc;
    }
    this.yRangeFns[gridId] = yrfs;
    this.preSamplers[gridId] = aps;
    this.legendFns[gridId] = lfs;
    this.valueTrackers[gridId] = vts;
  }
  // Maps timestamp => ohlc, index
  // TODO: should add support for indexBased? 
  calcOhlcMap() {
    this.ohlcMap = {};
    let data2 = this.hub.mainOv.data;
    for (var i = 0; i < data2.length; i++) {
      this.ohlcMap[data2[i][0]] = {
        ref: data2[i],
        index: i
      };
    }
  }
  // Store auto precision for a specific overlay
  setAutoPrec(gridId, ovId, prec) {
    let aps = this.autoPrecisions[gridId] || [];
    aps[ovId] = prec;
    this.autoPrecisions[gridId] = aps;
  }
  // Call this after all overlays are processed
  // We need to make an update to apply freshly
  // extracted functions
  // TODO: probably can do better
  finish() {
    this.panes++;
    if (this.panes < this.hub.panes().length)
      return;
    this.autoPrecisions = [];
    this.calcOhlcMap();
    setTimeout(() => {
      this.events.emitSpec("chart", "update-layout");
      this.events.emit("update-legend");
    });
  }
  // Store some meta info such as ytransform by
  // (pane.uuid + scaleId) hash
  store() {
    this.storage = {};
    let yts = this.yTransforms || [];
    for (var paneId in yts) {
      let paneYts = yts[paneId];
      let pane = this.hub.panes()[paneId];
      if (!pane)
        continue;
      for (var scaleId in paneYts) {
        let hash2 = `yts:${pane.uuid}:${scaleId}`;
        this.storage[hash2] = paneYts[scaleId];
      }
    }
  }
  // Restore that info after an update in the
  // pane/overlay order
  restore() {
    let yts = this.yTransforms;
    for (var hash2 in this.storage) {
      let [type, uuid1, uuid2] = hash2.split(":");
      let pane = this.hub.panes().find((x) => x.uuid === uuid1);
      if (!pane)
        continue;
      switch (type) {
        case "yts":
          if (!yts[pane.id])
            yts[pane.id] = [];
          yts[pane.id][uuid2] = this.storage[hash2];
          break;
      }
    }
    this.store();
  }
  // [API] Get y-transform of a specific scale
  getYtransform(gridId, scaleId) {
    return (this.yTransforms[gridId] || [])[scaleId];
  }
  // [API] Get auto precision of a specific overlay
  getAutoPrec(gridId, ovId) {
    return (this.autoPrecisions[gridId] || [])[ovId];
  }
  // [API] Get a precision smapler of a specific overlay
  getPreSampler(gridId, ovId) {
    return (this.preSamplers[gridId] || [])[ovId];
  }
  // [API] Get legend formatter of a specific overlay
  getLegendFns(gridId, ovId) {
    return (this.legendFns[gridId] || [])[ovId];
  }
  // [API] Get OHLC values to use as "magnet" values
  ohlc(t) {
    let el = this.ohlcMap[t];
    if (!el || !this.ohlcFn)
      return;
    return this.ohlcFn(el.ref);
  }
  // EVENT HANDLERS
  // User changed y-range
  onYTransform(event2) {
    let yts = this.yTransforms[event2.gridId] || {};
    let tx = yts[event2.scaleId] || {};
    yts[event2.scaleId] = Object.assign(tx, event2);
    this.yTransforms[event2.gridId] = yts;
    if (event2.updateLayout) {
      this.events.emitSpec("chart", "update-layout");
    }
    this.store();
  }
  // User tapped legend & selected the overlay
  onOverlaySelect(event2) {
    this.selectedOverlay = event2.index;
    this.events.emit("$overlay-select", {
      index: event2.index,
      ov: this.hub.overlay(...event2.index)
    });
  }
  // User tapped grid (& deselected all overlays)
  onGridMousedown(event2) {
    this.selectedOverlay = void 0;
    this.events.emit("$overlay-select", {
      index: void 0,
      ov: void 0
    });
  }
  // Overlay/user set lock on scrolling
  onScrollLock(event2) {
    this.scrollLock = event2;
  }
}
let instances$3 = {};
function instance$g(id) {
  if (!instances$3[id]) {
    instances$3[id] = new MetaHub(id);
  }
  return instances$3[id];
}
const MetaHub$1 = { instance: instance$g };
class DataScanner {
  constructor() {
  }
  init(props) {
    this.props = props;
    this.hub = DataHub$1.instance(props.id);
  }
  detectInterval() {
    this.all = Utils.allOverlays(this.hub.data.panes);
    if (this.all.filter((x) => x.main).length > 1) {
      console.warn(
        `Two or more overlays with flagged as 'main'`
      );
    }
    let mainOv = this.all.find((x) => x.main) || this.all[0];
    mainOv = mainOv || {};
    this.main = mainOv.data || [];
    let userTf = (mainOv.settings || {}).timeFrame;
    if (userTf !== void 0) {
      this.tf = Utils.parseTf(userTf);
    } else {
      this.tf = Utils.detectTimeframe(this.main);
    }
    this.interval = this.hub.data.indexBased ? 1 : this.tf;
    this.ibMode = this.hub.data.indexBased;
    return this.interval;
  }
  getTimeframe() {
    return this.tf;
  }
  // [API] Range that shown on a chart startup
  defaultRange() {
    const dl = this.props.config.DEFAULT_LEN;
    const ml = this.props.config.MINIMUM_LEN + 0.5;
    const l = this.main.length - 1;
    if (this.main.length < 2)
      return [];
    if (this.main.length <= dl) {
      var s = 0, d = ml;
    } else {
      s = l - dl, d = 0.5;
    }
    if (!this.hub.data.indexBased) {
      return [
        this.main[s][0] - this.interval * d,
        this.main[l][0] + this.interval * ml
      ];
    } else {
      return [
        s - this.interval * d,
        l + this.interval * ml
      ];
    }
  }
  // Calculate index offsets to adjust non-main ovs
  calcIndexOffsets() {
    var _a, _b;
    if (!this.hub.data.indexBased)
      return;
    for (var ov of this.all) {
      if (ov.data === this.main) {
        ov.indexOffset = (_a = ov.indexOffset) != null ? _a : 0;
        continue;
      }
      let d = Utils.findIndexOffset(this.main, ov.data);
      ov.indexOffset = (_b = ov.indexOffset) != null ? _b : d;
    }
  }
  // Calculte hash of the current panes
  calcPanesHash() {
    let hash2 = "";
    for (var pane of this.hub.data.panes || []) {
      hash2 += pane.uuid;
      for (var ov of pane.overlays || []) {
        hash2 += ov.uuid;
      }
    }
    return hash2;
  }
  // Detect changes in pane order/collection
  panesChanged() {
    let hash2 = this.calcPanesHash();
    return hash2 !== this.panesHash;
  }
  updatePanesHash() {
    this.panesHash = this.calcPanesHash();
  }
}
let instances$2 = {};
function instance$f(id) {
  if (!instances$2[id]) {
    instances$2[id] = new DataScanner(id);
  }
  return instances$2[id];
}
const DataScan = { instance: instance$f };
const HPX$7 = Const.HPX;
function layoutFn(self2, range, overlay = null) {
  var _a;
  const dt = range[1] - range[0];
  const r = self2.spacex / dt;
  const ls = (self2.scaleSpecs || {}).log || false;
  const offset = (_a = overlay ? overlay.indexOffset : 0) != null ? _a : 0;
  Object.assign(self2, {
    // Time and global index to screen x-coordinate
    // (universal mapping that works both in timeBased
    // & indexBased modes):
    // Time-index switch (returns time or index depending on the mode)
    ti: (t, i) => {
      return self2.indexBased ? i : t;
    },
    // Time-or-index to screen x-coordinate
    ti2x: (t, i) => {
      let src = self2.indexBased ? i + offset : t;
      return Math.floor((src - range[0]) * r) + HPX$7;
    },
    // Time to screen x-coordinates
    time2x: (t) => {
      return Math.floor((t - range[0]) * r) + HPX$7;
    },
    // Price/value to screen y-coordinates
    value2y: (y) => {
      if (ls)
        y = math.log(y);
      return Math.floor(y * self2.A + self2.B) + HPX$7;
    },
    // Time-axis nearest step
    tMagnet: (t) => {
    },
    // Screen-Y to dollar value (or whatever)
    y2value: (y) => {
      if (ls)
        return math.exp((y - self2.B) / self2.A);
      return (y - self2.B) / self2.A;
    },
    // Screen-X to timestamp
    x2time: (x) => {
      return range[0] + x / r;
    },
    // Screen-X to time-index
    x2ti: (x) => {
      return range[0] + x / r;
    },
    // $-axis nearest step
    $magnet: (price) => {
    },
    // Nearest candlestick
    cMagnet: (t) => {
      const cn = self2.candles || self2.master_grid.candles;
      const arr = cn.map((x) => x.raw[0]);
      const i = Utils.nearestA(t, arr)[0];
      return cn[i];
    },
    // Nearest data points
    dataMagnet: (t) => {
    }
  });
  return self2;
}
const logScale = {
  candle(self2, mid, p, $p) {
    return {
      x: mid,
      w: self2.pxStep * $p.config.CANDLEW,
      o: Math.floor(math.log(p[1]) * self2.A + self2.B),
      h: Math.floor(math.log(p[2]) * self2.A + self2.B),
      l: Math.floor(math.log(p[3]) * self2.A + self2.B),
      c: Math.floor(math.log(p[4]) * self2.A + self2.B),
      raw: p
    };
  },
  expand(self2, height) {
    let A = -height / (math.log(self2.$hi) - math.log(self2.$lo));
    let B = -math.log(self2.$hi) * A;
    let top = -height * 0.1;
    let bot = height * 1.1;
    self2.$hi = math.exp((top - B) / A);
    self2.$lo = math.exp((bot - B) / A);
  }
};
const { $SCALES: $SCALES$1 } = Const;
function Scale(id, src, specs) {
  let { hub, props, settings, height } = specs;
  let { ctx } = props;
  let meta = MetaHub$1.instance(props.id);
  let self2 = {};
  let yt = (meta.yTransforms[src.gridId] || [])[id];
  let gridId = src.gridId;
  let ovs = src.ovs;
  let ls = src.log;
  const SAMPLE = props.config.AUTO_PRE_SAMPLE;
  function calcSidebar() {
    let maxlen = Math.max(...ovs.map((x) => x.dataSubset.length));
    if (maxlen < 2) {
      self2.prec = 0;
      self2.sb = props.config.SBMIN;
      return;
    }
    if (src.precision !== void 0) {
      self2.prec = src.precision;
    } else {
      self2.prec = 0;
      for (var ov of ovs) {
        if (ov.settings.precision !== void 0) {
          var prec = ov.settings.precision;
        } else {
          var prec = calcPrecision(ov);
        }
        if (prec > self2.prec)
          self2.prec = prec;
      }
    }
    if (!isFinite(self2.$hi) || !isFinite(self2.$lo)) {
      self2.sb = props.config.SBMIN;
      return;
    }
    let lens = [];
    lens.push(self2.$hi.toFixed(self2.prec).length);
    lens.push(self2.$lo.toFixed(self2.prec).length);
    let str = "0".repeat(Math.max(...lens)) + "    ";
    self2.sb = ctx.measureText(str).width;
    self2.sb = Math.max(Math.floor(self2.sb), props.config.SBMIN);
    self2.sb = Math.min(self2.sb, props.config.SBMAX);
  }
  function calc$Range() {
    var hi = -Infinity, lo = Infinity;
    for (var ov of ovs) {
      if (ov.settings.display === false || ov.settings.dontScale == true)
        continue;
      let yfn = (meta.yRangeFns[gridId] || [])[ov.id];
      let data2 = ov.dataSubset;
      var h = -Infinity, l = Infinity;
      if (!yfn || yfn && yfn.preCalc) {
        for (var i = 0; i < data2.length; i++) {
          for (var j = 1; j < data2[i].length; j++) {
            let v = data2[i][j];
            if (v > h)
              h = v;
            if (v < l)
              l = v;
          }
        }
      }
      if (yfn) {
        var yfnResult = yfn.exec(h, l);
        if (yfnResult) {
          var [h, l, exp] = yfn.exec(h, l);
        } else {
          var [h, l] = [hi, lo];
        }
      }
      if (h > hi)
        hi = h;
      if (l < lo)
        lo = l;
    }
    if (yt && !yt.auto && yt.range) {
      self2.$hi = yt.range[0];
      self2.$lo = yt.range[1];
    } else {
      if (!ls) {
        exp = exp === false ? 0 : 1;
        self2.$hi = hi + (hi - lo) * props.config.EXPAND * exp;
        self2.$lo = lo - (hi - lo) * props.config.EXPAND * exp;
      } else {
        self2.$hi = hi;
        self2.$lo = lo;
        logScale.expand(self2, height);
      }
      if (self2.$hi === self2.$lo) {
        if (!ls) {
          self2.$hi *= 1.05;
          self2.$lo *= 0.95;
        } else {
          logScale.expand(self2, height);
        }
      }
    }
  }
  function calcPrecision(ov) {
    let maxR = 0;
    let sample = [];
    let f = meta.getPreSampler(gridId, ov.id);
    f = f || Utils.defaultPreSampler;
    for (var i = 0; i < SAMPLE; i++) {
      let n = Math.floor(Math.random() * ov.dataSubset.length);
      let x = f(ov.dataSubset[n]);
      if (typeof x === "number")
        sample.push(x);
      else
        sample = sample.concat(x);
    }
    sample.forEach((x) => {
      let right = Utils.numberLR(x)[1];
      if (right > maxR)
        maxR = right;
    });
    let aprec = meta.getAutoPrec(gridId, ov.id);
    if (aprec === void 0 || maxR > aprec) {
      meta.setAutoPrec(gridId, ov.id, maxR);
      return maxR;
    }
    return aprec;
  }
  function calcTransform() {
    if (!ls) {
      self2.A = -height / (self2.$hi - self2.$lo);
      self2.B = -self2.$hi * self2.A;
    } else {
      self2.A = -height / (math.log(self2.$hi) - math.log(self2.$lo));
      self2.B = -math.log(self2.$hi) * self2.A;
    }
  }
  function dollarStep() {
    let yrange = self2.$hi - self2.$lo;
    let m = yrange * (props.config.GRIDY / height);
    let p = parseInt(yrange.toExponential().split("e")[1]);
    let d = Math.pow(10, p);
    let s = $SCALES$1.map((x) => x * d);
    return Utils.strip(Utils.nearestA(m, s)[1]);
  }
  function dollarMult() {
    let mult_hi = dollarMultHi();
    let mult_lo = dollarMultLo();
    return Math.max(mult_hi, mult_lo);
  }
  function dollarMultHi() {
    let h = Math.min(self2.B, height);
    if (h < props.config.GRIDY)
      return 1;
    let n = h / props.config.GRIDY;
    let yrange = self2.$hi;
    if (self2.$lo > 0) {
      var yratio = self2.$hi / self2.$lo;
    } else {
      yratio = self2.$hi / 1;
    }
    yrange * (props.config.GRIDY / h);
    parseInt(yrange.toExponential().split("e")[1]);
    return Math.pow(yratio, 1 / n);
  }
  function dollarMultLo() {
    let h = Math.min(height - self2.B, height);
    if (h < props.config.GRIDY)
      return 1;
    let n = h / props.config.GRIDY;
    let yrange = Math.abs(self2.$lo);
    if (self2.$hi < 0 && self2.$lo < 0) {
      var yratio = Math.abs(self2.$lo / self2.$hi);
    } else {
      yratio = Math.abs(self2.$lo) / 1;
    }
    yrange * (props.config.GRIDY / h);
    parseInt(yrange.toExponential().split("e")[1]);
    return Math.pow(yratio, 1 / n);
  }
  function gridY() {
    let m = Math.pow(10, -self2.prec);
    self2.$step = Math.max(m, dollarStep());
    self2.ys = [];
    let y1 = self2.$lo - self2.$lo % self2.$step;
    for (var y$ = y1; y$ <= self2.$hi; y$ += self2.$step) {
      let y = Math.floor(y$ * self2.A + self2.B);
      if (y > height)
        continue;
      self2.ys.push([y, Utils.strip(y$)]);
    }
  }
  function gridYLog() {
    self2.$_mult = dollarMult();
    self2.ys = [];
    if (!data.length)
      return;
    let v = Math.abs(data[data.length - 1][1] || 1);
    let y1 = searchStartPos(v);
    let y2 = searchStartNeg(-v);
    let yp = -Infinity;
    let n = height / props.config.GRIDY;
    let q = 1 + (self2.$_mult - 1) / 2;
    for (var y$ = y1; y$ > 0; y$ /= self2.$_mult) {
      y$ = logRounder(y$, q);
      let y = Math.floor(math.log(y$) * self2.A + self2.B);
      self2.ys.push([y, Utils.strip(y$)]);
      if (y > height)
        break;
      if (y - yp < props.config.GRIDY * 0.7)
        break;
      if (self2.ys.length > n + 1)
        break;
      yp = y;
    }
    yp = Infinity;
    for (var y$ = y2; y$ < 0; y$ /= self2.$_mult) {
      y$ = logRounder(y$, q);
      let y = Math.floor(math.log(y$) * self2.A + self2.B);
      if (yp - y < props.config.GRIDY * 0.7)
        break;
      self2.ys.push([y, Utils.strip(y$)]);
      if (y < 0)
        break;
      if (self2.ys.length > n * 3 + 1)
        break;
      yp = y;
    }
  }
  function searchStartPos(value) {
    let N = height / props.config.GRIDY;
    var y = Infinity, y$ = value, count = 0;
    while (y > 0) {
      y = Math.floor(math.log(y$) * self2.A + self2.B);
      y$ *= self2.$_mult;
      if (count++ > N * 3)
        return 0;
    }
    return y$;
  }
  function searchStartNeg(value) {
    let N = height / props.config.GRIDY;
    var y = -Infinity, y$ = value, count = 0;
    while (y < height) {
      y = Math.floor(math.log(y$) * self2.A + self2.B);
      y$ *= self2.$_mult;
      if (count++ > N * 3)
        break;
    }
    return y$;
  }
  function logRounder(x, quality) {
    let s = Math.sign(x);
    x = Math.abs(x);
    if (x > 10) {
      for (var div = 10; div < MAX_INT; div *= 10) {
        let nice = Math.floor(x / div) * div;
        if (x / nice > quality) {
          break;
        }
      }
      div /= 10;
      return s * Math.floor(x / div) * div;
    } else if (x < 1) {
      for (var ro = 10; ro >= 1; ro--) {
        let nice = Utils.round(x, ro);
        if (x / nice > quality) {
          break;
        }
      }
      return s * Utils.round(x, ro + 1);
    } else {
      return s * Math.floor(x);
    }
  }
  calc$Range();
  calcSidebar();
  calcTransform();
  ls ? gridYLog() : gridY();
  self2.scaleSpecs = {
    id,
    log: src.log,
    ovIdxs: src.ovIdxs
  };
  self2.height = height;
  return self2;
}
const { TIMESCALES, $SCALES, WEEK: WEEK$1, MONTH: MONTH$1, YEAR: YEAR$1, HOUR: HOUR$1, DAY: DAY$1 } = Const;
function GridMaker(id, specs, mainGrid = null) {
  let { hub, meta, props, settings, height } = specs;
  let { interval, timeFrame, range, ctx, timezone } = props;
  let ls = !!settings.logScale;
  let ovs = hub.panes()[id].overlays;
  let data2 = hub.mainOv.dataSubset;
  let view = hub.mainOv.dataView;
  let self2 = { indexBased: hub.indexBased };
  function scaleSplit() {
    let scales = unpackScales();
    for (var i = 0; i < ovs.length; i++) {
      let ov = ovs[i];
      let id2 = ov.settings.scale || "A";
      if (!scales[id2]) {
        scales[id2] = defineNewScale(id2);
      }
      scales[id2].ovs.push(ov);
      scales[id2].ovIdxs.push(i);
    }
    return Object.values(scales);
  }
  function unpackScales() {
    let out = {
      "A": defineNewScale("A")
    };
    for (var scaleId in settings.scales || {}) {
      let proto = settings.scales[scaleId];
      out[scaleId] = defineNewScale(scaleId, proto);
    }
    return out;
  }
  function defineNewScale(scaleId, proto = {}) {
    var _a;
    return {
      id: scaleId,
      gridId: id,
      ovs: [],
      ovIdxs: [],
      log: (_a = proto.log) != null ? _a : ls,
      precision: proto.precision
    };
  }
  function calcPositions() {
    if (data2.length < 2)
      return;
    let dt = range[1] - range[0];
    self2.spacex = props.width - self2.sbMax[0] - self2.sbMax[1];
    let capacity = dt / interval;
    self2.pxStep = self2.spacex / capacity;
    let r = self2.spacex / dt;
    self2.startx = (data2[0][0] - range[0]) * r;
  }
  function timeStep() {
    let k = self2.indexBased ? timeFrame : 1;
    let xrange = (range[1] - range[0]) * k;
    let m = xrange * (props.config.GRIDX / props.width);
    let s = TIMESCALES;
    return Utils.nearestA(m, s)[1];
  }
  function gridX() {
    if (!mainGrid) {
      calcPositions();
      self2.tStep = timeStep();
      self2.xs = [];
      const dt = range[1] - range[0];
      const r = self2.spacex / dt;
      let realDt = Utils.realTimeRange(data2);
      if (!self2.indexBased)
        realDt = dt;
      if (self2.indexBased && range[1] - view.src.length > 0) {
        let k = 1 - (range[1] - view.src.length) / dt;
        realDt /= k;
      }
      let fixOffset = realDt / DAY$1 > 10;
      let fixOffset2 = realDt / MONTH$1 > 10;
      let i0 = view.i1;
      if (fixOffset2) {
        i0 = findYearStart(view.i1);
      } else if (fixOffset) {
        i0 = findMonthStart(view.i1);
      }
      for (var i = i0, n = view.i2; i <= n; i++) {
        let p = view.src[i];
        let prev = view.src[i - 1] || [];
        let prev_xs = self2.xs[self2.xs.length - 1] || [0, []];
        let ti = self2.indexBased ? i : p[0];
        let x = Math.floor((ti - range[0]) * r);
        insertLine(prev, p, x);
        let xs = self2.xs[self2.xs.length - 1] || [0, []];
        if (prev_xs === xs)
          continue;
        if (xs[1] - prev_xs[1] < self2.tStep * 0.8) {
          if (xs[2] * xs[3] <= prev_xs[2] * prev_xs[3]) {
            self2.xs.pop();
          } else {
            self2.xs.splice(self2.xs.length - 2, 1);
          }
        }
      }
      if (!self2.indexBased && timeFrame < WEEK$1 && r > 0) {
        extendLeft(dt, r);
        extendRight(dt, r);
      }
    } else {
      self2.tStep = mainGrid.tStep;
      self2.pxStep = mainGrid.pxStep;
      self2.startx = mainGrid.startx;
      self2.spacex = mainGrid.spacex;
      self2.xs = mainGrid.xs;
    }
  }
  function findMonthStart(i1) {
    let m0 = Utils.getMonth(view.src[i1][0]);
    for (var i = i1 - 1; i >= 0; i--) {
      let mi = Utils.getMonth(view.src[i][0]);
      if (mi !== m0)
        return i;
    }
    return 0;
  }
  function findYearStart(i1) {
    let y0 = Utils.getYear(view.src[i1][0]);
    for (var i = i1 - 1; i >= 0; i--) {
      let yi = Utils.getYear(view.src[i][0]);
      if (yi !== y0)
        return i;
    }
    return 0;
  }
  function insertLine(prev, p, x, m0) {
    let prevT = prev[0];
    let t = p[0];
    if (timeFrame < DAY$1) {
      prevT += timezone * HOUR$1;
      t += timezone * HOUR$1;
    }
    if ((prev[0] || timeFrame === YEAR$1) && Utils.getYear(t) !== Utils.getYear(prevT)) {
      self2.xs.push([x, t, YEAR$1, 1]);
    } else if (prev[0] && Utils.getMonth(t) !== Utils.getMonth(prevT)) {
      self2.xs.push([x, t, MONTH$1, 1]);
    } else if (Utils.dayStart(t) === t) {
      let r2 = Utils.getDay(t) === 13 ? 0 : 0.9;
      self2.xs.push([x, t, DAY$1, r2]);
    } else if (t % self2.tStep === 0) {
      self2.xs.push([x, t, timeFrame, 1]);
    }
  }
  function extendLeft(dt, r) {
    if (!self2.xs.length || !isFinite(r))
      return;
    let t = self2.xs[0][1];
    while (true) {
      t -= self2.tStep;
      let x = Math.floor((t - range[0]) * r);
      if (x < 0)
        break;
      if (t % timeFrame === 0) {
        self2.xs.unshift([x, t, timeFrame, 1]);
      }
    }
  }
  function extendRight(dt, r) {
    if (!self2.xs.length || !isFinite(r))
      return;
    let t = self2.xs[self2.xs.length - 1][1];
    while (true) {
      t += self2.tStep;
      let x = Math.floor((t - range[0]) * r);
      if (x > self2.spacex)
        break;
      if (t % interval === 0) {
        self2.xs.push([x, t, interval, 1]);
      }
    }
  }
  function applySizes() {
    self2.width = props.width - self2.sbMax[0] - self2.sbMax[1];
    self2.height = height;
  }
  function makeScales() {
    let scales = {};
    for (var src of scaleSplit()) {
      let scale = new Scale(src.id, src, specs);
      scales[src.id] = scale;
    }
    self2.scales = scales;
  }
  function selectSidebars() {
    if (!self2.scales[settings.scaleIndex]) {
      settings.scaleIndex = "A";
    }
    self2.scaleIndex = settings.scaleIndex;
    if (!settings.scaleTemplate) {
      settings.scaleTemplate = [[], Object.keys(self2.scales)];
    }
    let sides = settings.scaleTemplate;
    if (!sides[0] || !sides[1]) {
      console.error("Define scaleTemplate as [[],[]]");
    }
    if (!settings.scaleSideIdxs) {
      settings.scaleSideIdxs = [];
    }
    let idxs = settings.scaleSideIdxs;
    Utils.autoScaleSideId(0, sides, idxs);
    Utils.autoScaleSideId(1, sides, idxs);
    self2.sb = [];
    let lid = sides[0].includes(idxs[0]) ? idxs[0] : null;
    self2.sb.push(self2.scales[lid] ? self2.scales[lid].sb : 0);
    let rid = sides[1].includes(idxs[1]) ? idxs[1] : null;
    self2.sb.push(self2.scales[rid] ? self2.scales[rid].sb : 0);
  }
  function mergeScale() {
    let sb2 = self2.sb;
    Object.assign(self2, self2.scales[self2.scaleIndex]);
    self2.sb = sb2;
    self2.ys = self2.ys || [];
  }
  makeScales();
  selectSidebars();
  return {
    // First we need to calculate max sidebar width
    // (among all grids). Then we can actually make
    // them
    create: () => {
      gridX();
      applySizes();
      if (mainGrid) {
        self2.mainGrid = mainGrid;
      }
      self2.settings = settings;
      self2.main = !mainGrid;
      self2.id = id;
      mergeScale();
      self2.ohlc = meta.ohlc.bind(meta);
      return layoutFn(self2, range);
    },
    getLayout: () => self2,
    setMaxSidebar: (v) => self2.sbMax = v,
    getSidebar: () => self2.sb,
    id: () => id
  };
}
function Layout(props, hub, meta) {
  let chart = hub.chart;
  let offchart = hub.offchart;
  let panes = hub.panes().filter((x) => x.settings);
  if (!chart)
    return {};
  function gridHs() {
    const height = props.height - props.config.BOTBAR;
    if (panes.find((x) => x.settings.height)) {
      return weightedHs(height);
    }
    const n = offchart.length;
    const off_h = 2 * Math.sqrt(n) / 7 / (n || 1);
    const px = Math.floor(height * off_h);
    const m = height - px * n;
    let hs2 = Array(n + 1).fill(px);
    hs2[hub.mainPaneId] = m;
    return hs2;
  }
  function weightedHs(height) {
    let hs2 = hub.panes().map((x) => {
      var _a;
      return (_a = x.settings.height) != null ? _a : 1;
    });
    let sum = hs2.reduce((a, b) => a + b, 0);
    hs2 = hs2.map((x) => Math.floor(x / sum * height));
    sum = hs2.reduce((a, b) => a + b, 0);
    for (var i2 = 0; i2 < height - sum; i2++)
      hs2[i2 % hs2.length]++;
    return hs2;
  }
  const hs = gridHs();
  let specs = (i2) => ({
    hub,
    meta,
    props,
    settings: panes[i2].settings,
    height: hs[i2]
  });
  let mainGm = new GridMaker(
    hub.mainPaneId,
    specs(hub.mainPaneId)
  );
  let gms = [mainGm];
  for (var [i, pane] of panes.entries()) {
    if (i !== hub.mainPaneId) {
      gms.push(
        new GridMaker(
          i,
          specs(i),
          mainGm.getLayout()
        )
      );
    }
  }
  let sb2 = [
    Math.max(...gms.map((x) => x.getSidebar()[0])),
    Math.max(...gms.map((x) => x.getSidebar()[1]))
  ];
  let grids = [], offset = 0;
  for (var i = 0; i < gms.length; i++) {
    let id = gms[i].id();
    gms[i].setMaxSidebar(sb2);
    grids[id] = gms[i].create();
  }
  for (var i = 0; i < grids.length; i++) {
    grids[i].offset = offset;
    offset += grids[i].height;
  }
  return {
    grids,
    main: grids.find((x) => x.main),
    indexBased: hub.indexBased,
    botbar: {
      width: props.width,
      height: props.config.BOTBAR,
      offset,
      xs: grids[0] ? grids[0].xs : []
    }
  };
}
function Context($p) {
  let el = document.createElement("canvas");
  let ctx = el.getContext("2d");
  ctx.font = $p.config.FONT;
  return ctx;
}
const ArrowTrades = "\n// Navy ~ 0.1-lite\n\n// <ds>Stacked arrow trades</ds>\n// Format: [<timestamp>, [<dir>, <?label> <?big>], ...]\n// <dir> :: 1 for buy -1 for sell\n// <?label> :: trade label (null for no label)\n// <?big> :: true/false, make an arrow big\n\n[OVERLAY name=ArrowTrades, ctx=Canvas, version=1.0.0]\n\nprop('buyColor', {  type: 'color', def: '#08c65e' })\nprop('sellColor', {  type: 'color', def: '#e42633' })\nprop('size', {  type: 'number', def: 7 })\nprop('showLabels', {  type: 'boolean', def: true })\nprop('markerOutline', {  type: 'boolean', def: true })\nprop('outlineWidth', {  type: 'number', def: 4 })\n\n// Draw function (called on each update)\n// Library provides a lot of useful variables to make\n// overlays ($core in the main collection)\ndraw(ctx) {\n    ctx.lineWidth = $props.outlineWidth\n    const layout = $core.layout\n    const data = $core.data // Full dataset\n    const view = $core.view // Visible view\n\n    // Fill sell trades\n    ctx.fillStyle = $props.buyColor\n    ctx.beginPath()\n    let lbls1 = iterTrades(ctx, view, data, layout, -1)\n    ctx.fill()\n\n    // Fill buy trades\n    ctx.fillStyle = $props.sellColor\n    ctx.beginPath()\n    let lbls2 = iterTrades(ctx, view, data, layout, 1)\n    ctx.fill()\n\n    // Draw labels\n    if ($props.showLabels) {\n        ctx.fillStyle = $core.colors.textHL\n        ctx.font = $core.props.config.FONT\n        let all = [...lbls1, ...lbls2]\n        drawLabels(ctx, view, layout, all)\n    }\n\n}\n\n// Iter through arcs\niterTrades(ctx, view, data, layout, dir) {\n    let lables = []\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let ohlc = layout.ohlc(p[0])\n        if (!ohlc) continue\n        let x = layout.ti2x(p[0], i)\n        if (dir > 0) {\n            var y = layout.value2y(ohlc[1])\n        } else {\n            var y = layout.value2y(ohlc[2])\n        }\n        for (var k = 1; k < p.length; k++) {\n            if (Math.sign(p[k][0]) === dir) continue\n            let size = $props.size\n            if (p[k][2]) size *= 1.5\n            let yk = y - dir * (15 * (k - 1) + 10)\n            let align = dir < 0 ? 'right' : 'left'\n            let dy = p[k][2] ? - dir * 1 : 0\n            if (p[k][1]) {\n                lables.push([ x + 10 * dir, yk + dy, p[k][1], align])\n            }\n            drawArrow(ctx, x, yk, -dir, size)\n        }\n    }\n    return lables\n}\n\ndrawArrow(ctx, x, y, dir, size) {\n    ctx.moveTo(x, y)\n    ctx.lineTo(x + size * dir * 0.63, y + size * dir)\n    ctx.lineTo(x - size * dir * 0.63, y + size * dir)\n}\n\n// Draw simple lables\ndrawLabels(ctx, view, layout, lables) {\n    for (var l of lables) {\n        ctx.textAlign = l[3]\n        let dy = l[3] === 'right' ? 7 : 0\n        ctx.fillText(l[2], l[0], l[1] + dy)\n    }\n}\n\n// Not affecting the y-range\nyRange() => null\n\n// Legend formatter, Array of [value, color] pairs\n// x represents one data item e.g. [<time>, <value>]\nlegend(x) {\n    let items = []\n    for (var i = 1; i < x.length; i++) {\n        items.push([\n            x[i][1] || (x[i][0] > 0 ? 'Buy' : 'Sell'),\n            x[i][0] > 0 ? $props.buyColor : $props.sellColor\n        ])\n    }\n    return items\n}\n";
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ArrowTrades
}, Symbol.toStringTag, { value: "Module" }));
const Band = "// Navy ~ 0.1-lite\n\n// <ds>Bands indicator, e.g. BollingerBands</ds> \n// format: [<timestamp>, <high>, <mid>, <low>]\n\n[OVERLAY name=Band, ctx=Canvas, verion=1.0.0]\n\n// Overlay props\nprop('color', { type: 'Color', def: '#b41d70' })\nprop('backColor', { type: 'Color', def: $props.color + '11' })\nprop('lineWidth', { type: 'number', def: 1 })\nprop('showMid', { type: 'boolean', def: true })\n\n// Draw call\ndraw(ctx) {\n     // Background\n    const data = $core.data\n    const view = $core.view\n    const layout = $core.layout\n    ctx.beginPath()\n    ctx.fillStyle = $props.backColor\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1] || undefined)\n        ctx.lineTo(x, y)\n    }\n    for (var i = view.i2, i1 = view.i1; i >= i1; i--) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[3] || undefined)\n        ctx.lineTo(x, y)\n    }\n    ctx.fill()\n    // Lines\n    // TODO: can be faster by combining line\n    // into one path with moveTo in b/w\n    ctx.lineWidth = $props.lineWidth\n    ctx.strokeStyle = $props.color\n    // Top line\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1] || undefined)\n        ctx.lineTo(x, y)\n    }\n    ctx.stroke()\n    // Bottom line\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[3] || undefined)\n        ctx.lineTo(x, y)\n    }\n    ctx.stroke()\n    // Middle line\n    if (!$props.showMid) return\n    ctx.beginPath()\n    for (var i = 0; i < data.length; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[2] || undefined)\n        ctx.lineTo(x, y)\n    }\n    ctx.stroke()\n}\n\n// Legend, defined as pairs [value, color]\nlegend(x) => $props.showMid ? [\n    [x[1], $props.color],\n    [x[2], $props.color],\n    [x[3], $props.color]\n] : [\n    [x[1], $props.color],\n    [x[3], $props.color]\n]\n";
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Band
}, Symbol.toStringTag, { value: "Module" }));
const CandlesPlus = `
// NavyJS ~ 0.1-lite

// <ds>Colored Candles (Warning: coloring makes it slower)</ds>
// Format: [<timestamp>, <open>, <high>, <low>, <close>, <?volume>, <?color>]
// <?color> :: Candle body color

[OVERLAY name=CandlesPlus, ctx=Canvas, version=1.0.0]

// Define the props
prop('colorBodyUp', { type: 'color', def: $core.colors.candleUp })
prop('colorBodyDw', { type: 'color', def: $core.colors.candleDw })
prop('colorWickUp', { type: 'color', def: $core.colors.wickUp })
prop('colorWickDw', { type: 'color', def: $core.colors.wickDw })
prop('colorVolUp', { type: 'color', def: $core.colors.volUp })
prop('colorVolDw', { type: 'color', def: $core.colors.volDw })
prop('showVolume', { type: 'boolean', def: true })
prop('showWicks', { type: 'boolean', def: true })
prop('currencySymbol', { type: 'string', def: '$' })
prop('showAvgVolume', { type: 'boolean', def: true })
prop('avgVolumeSMA', { type: 'number', def: 20 })
prop('colorAvgVol', { type: 'color', def: '#1cccb777'})
prop('scaleSymbol', { type: 'string|boolean', def: false })
prop('priceLine', { type: 'boolean', def: true })
prop('showValueTracker', { type: 'boolean', def: true })
prop('coloringBodies', { type: 'boolean', def: true })
prop('coloringWicks', { type: 'boolean', def: false })
prop('coloringVolume', { type: 'boolean', def: false })

// Draw call
draw(ctx) {

    let cnv = $lib.layoutCnv($core, true, $props.showVolume)
    let bodies = cnv.upBodies.length ? cnv.upBodies : cnv.dwBodies
    if (!bodies.length) return
    let w = Math.max(bodies[0].w, 1)
    let sw = $props.showWicks
    let cb = $props.coloringBodies
    let cw = $props.coloringWicks
    let cv = $props.coloringVolume

    if (sw) {
        drawCvPart(ctx, $lib.candleWick, cnv.dwWicks, 1, 'colorWickDw', cw)
        drawCvPart(ctx, $lib.candleWick, cnv.upWicks, 1, 'colorWickUp', cw)
    }
    drawCvPart(ctx, $lib.candleBody, cnv.dwBodies, w, 'colorBodyDw', cb)
    drawCvPart(ctx, $lib.candleBody, cnv.upBodies, w, 'colorBodyUp', cb)
    drawCvPart(ctx, $lib.volumeBar, cnv.dwVolbars, w, 'colorVolDw', cv)
    drawCvPart(ctx, $lib.volumeBar, cnv.upVolbars, w, 'colorVolUp', cv)

    if ($props.showVolume && $props.showAvgVolume) {
        $lib.avgVolume(ctx, $core, $props, cnv)
    }

}

// Draw candle part
drawCvPart(ctx, f, arr, w, color, coloring = false) {
    let layout = $core.layout
    let prevColor = null
    ctx.lineWidth = w
    ctx.strokeStyle = $props[color]
    ctx.beginPath()
    for (var i = 0, n = arr.length; i < n; i++) {
        if (coloring) {
            var c = arr[i].src[6]
            if (c) {
                if (c !== prevColor) {
                    ctx.stroke()
                    ctx.beginPath()
                }
                ctx.strokeStyle = c
            } else if (prevColor !== $props[color]) {
                ctx.stroke()
                ctx.beginPath()
                ctx.strokeStyle = $props[color]
                prevColor = $props[color]
            }
            prevColor = c
        }
        f(ctx, arr[i], layout)
    }
    ctx.stroke()
}

// Define y-range (by finding max High, min Low)
yRange() {
    // Getting updated data faster
    // (we need 1 more update when using $core.dataSubset)
    let data = $core.hub.ovDataSubset($core.paneId, $core.id)
    let len = data.length
    var h, l, high = -Infinity, low = Infinity
    for(var i = 0; i < len; i++) {
        let point = data[i]
        if (point[2] > high) high = point[2]
        if (point[3] < low) low = point[3]
    }
    return [high, low]
}

// Use [Open, Close] for precision detection
preSampler(x) => [x[1], x[4]]

// Map data item to OHLC (for candle magnets etc.)
ohlc(x) => [x[1], x[2], x[3], x[4]]

// Price label + Scale symbol + price line
valueTracker(x) => {
    show: $props.showValueTracker,
    symbol: $props.scaleSymbol,
    line: $props.priceLine,
    color: $lib.candleColor($props, $core.data[$core.data.length - 1]),
    value: x[4] // close
}

// Define the OHLCV legend
legendHtml(x, prec, f) {
    let color1 = $core.colors.text
    let v = $core.cursor.getValue($core.paneId, $core.id)
    let sym = $props.currencySymbol
    let color2 = v[4] >= v[1] ?
        $props.colorBodyUp : $props.colorBodyDw
    if ($props.coloringBodies && x[6]) {
        color2 = x[6]
    }
    let fc = $lib.formatCash
    return \`
    <span style="color: \${color2}">
        <span style="margin-left: 3px;"></span>
        <span style="color: \${color1}">O</span>
        <span class="nvjs-ll-value">\${f(x[1])}</span>
        <span style="color: \${color1}">H</span>
        <span class="nvjs-ll-value">\${f(x[2])}</span>
        <span style="color: \${color1}">L</span>
        <span class="nvjs-ll-value">\${f(x[3])}</span>
        <span style="color: \${color1}">C</span>
        <span class="nvjs-ll-value">\${f(x[4])}</span>
    \`
    + ($props.showVolume ? \`
        <span style="color: \${color1}">V</span>
        <span class="nvjs-ll-value">\${sym+fc(x[5])}</span>\` : \`\`)
    + \`</span>\`
    }
`;
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CandlesPlus
}, Symbol.toStringTag, { value: "Module" }));
const Cloud = "// Navy ~ 0.1-lite\n\n// <ds>Cloud</ds>, format [<timestamp>, <line1>, <line2>]\n[OVERLAY name=Cloud, ctx=Canvas, verion=0.1.0]\n\n// Overlay props\nprop('color1', { type: 'color', def: '#55d7b0aa' })\nprop('color2', { type: 'color', def: '#d94d64aa' })\nprop('back1', { type: 'color', def: '#79ffde22' })\nprop('back2', { type: 'color', def: '#ff246c22' })\nprop('drawLines', { type: 'boolean', def: false })\n\n// Draw call\n// TODO: speed-up (draw segment with the same color together)\ndraw(ctx) {\n\n    const layout = $core.layout\n    const data = $core.data\n    const view = $core.view\n\n    ctx.lineWidth = 1\n\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p1 = map(layout, data[i], i)\n        let p2 = map(layout, data[i+1], i+1)\n\n        if (!p2) continue\n        if (p1.y1 !== p1.y1) continue // Fix NaN\n\n         // Background\n        ctx.beginPath()\n        ctx.fillStyle =  p1.y1 < p1.y2 ? $props.back1 : $props.back2\n        ctx.moveTo(p1.x, p1.y1)\n        ctx.lineTo(p2.x + 0.1, p2.y1)\n        ctx.lineTo(p2.x + 0.1, p2.y2)\n        ctx.lineTo(p1.x, p1.y2)\n        ctx.fill()\n        // Lines\n        if (!$props.drawLines) continue\n        ctx.beginPath()\n        ctx.strokeStyle = $props.color1\n        ctx.moveTo(p1.x, p1.y1)\n        ctx.lineTo(p2.x, p2.y1)\n        ctx.stroke()\n        ctx.beginPath()\n        ctx.strokeStyle = $props.color2\n        ctx.moveTo(p1.x, p1.y2)\n        ctx.lineTo(p2.x, p2.y2)\n        ctx.stroke()\n    }\n}\n\nmap(layout, p, i) {\n    return p && {\n        x:  layout.ti2x(p[0], i),\n        y1: layout.value2y(p[1]),\n        y2: layout.value2y(p[2])\n    }\n}\n\n// Legend, defined as pairs [value, color]\nlegend(x) => [[x[1], $props.color1], [x[2], $props.color2]]\n";
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Cloud
}, Symbol.toStringTag, { value: "Module" }));
const Histogram = `// Navy ~ 0.1-lite

// <ds>Colored histogram, can be used for MACD</ds>
// Format: [<timestamp>, <hist>, <?value>, <?signal>]
// <hist> :: histogram value (e.g. MACD bars)
// <?value> :: value of the first line (e.g. MACD value)
// <?signal> :: value of the second line (e.g. MACD signal)

[OVERLAY name=Histogram, ctx=Canvas, verion=1.0.1]
// "#35a776", "#79e0b3", "#e54150", "#ea969e"
// Overlay props
prop('barWidth', { type: 'number', def: 4 })
prop('lineWidth', { type: 'number', def: 1 })
prop('colorUp', { type: 'Color', def: '#35a776' })
prop('colorDw', { type: 'Color', def: '#e54150' })
prop('colorSemiUp', { type: 'Color', def: '#79e0b3' })
prop('colorSemiDw', { type: 'Color', def: '#ea969e' })
prop('colorValue', { type: 'Color', def: '#3782f2' })
prop('colorSignal', { type: 'Color', def: '#f48709' })

// Draw call
draw(ctx) {

    const layout = $core.layout
    const view = $core.view

    let groups = splitBars(view, layout, view.src)

    ctx.lineWidth = detectBarWidth(view, layout, view.src)

    // Semi-down

    ctx.strokeStyle = $props.colorSemiDw
    drawBars(ctx, layout, groups.semiDw)

    // Semi-up
    ctx.strokeStyle = $props.colorSemiUp
    drawBars(ctx, layout, groups.semiUp)

    // Down
    ctx.strokeStyle = $props.colorDw
    drawBars(ctx, layout, groups.dw)

    // Up
    ctx.strokeStyle = $props.colorUp
    drawBars(ctx, layout, groups.up)

    // Drawing the lines
    ctx.lineWidth = $props.lineWidth
    ctx.lineJoin = "round"

    ctx.strokeStyle = $props.colorValue
    drawSpline(ctx, view, layout, 2)

    ctx.strokeStyle = $props.colorSignal
    drawSpline(ctx, view, layout, 3)

}

detectBarWidth(view, layout, data) {
    if (!data[view.i2 - 1]) return 0
    let p1 = layout.ti2x(data[view.i2 - 1][0], view.i2 - 1)
    let p2 = layout.ti2x(data[view.i2][0], view.i2)
    if ((p2 - p1) < 1) {
        return 1
    } else {
        return $props.barWidth
    }
}

splitBars(view, layout, data) {
    const off = $props.barWidth % 2 ? 0 : 0.5
    let semiDw = []
    let semiUp = []
    let dw = []
    let up = []
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let prev = data[i - 1]
        let p = data[i]
        let x = layout.ti2x(p[0], i) - off
        let y = layout.value2y(p[1]) - 0.5
        let bar = {x, y}
        if (p[1] >= 0) {
            var color = 0
            if (prev && p[1] < prev[1]) color = 1
        } else {
            var color = 2
            if (prev && p[1] > prev[1]) color = 3
        }
        switch(color) {
            case 0:
                up.push(bar)
                break
            case 1:
                semiUp.push(bar)
                break
            case 2:
                dw.push(bar)
                break
            case 3:
                semiDw.push(bar)
                break
        }
    }
    return { semiDw, semiUp, dw, up }
}

drawBars(ctx, layout, group) {
    const data = $core.data
    const base = layout.value2y(0) + 0.5
    ctx.beginPath()
    for (var bar of group) {
        ctx.moveTo(bar.x, base)
        ctx.lineTo(bar.x, bar.y)
    }
    ctx.stroke()
}

drawSpline(ctx, view, layout, idx) {
    ctx.beginPath()
    const data = view.src
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(p[idx])
        ctx.lineTo(x, y)
    }
    ctx.stroke()
}

// Legend, defined as pairs [value, color]
// TODO: colorize the hist point
legend(x) => [
    [x[1], $props.color],
    [x[2], $props.colorValue],
    [x[3], $props.colorSignal]
]
`;
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Histogram
}, Symbol.toStringTag, { value: "Module" }));
const PriceLabels = `// Navy ~ 0.1-lite

// <ds>Price labels that stick to candles</ds>
// Format: [<timestamp>, <LabelObject>]
// <LabelObject> {
//   text :: string, text of the label
//   dir :: direction, 1 = points up, -1 = points down
//   pin :: "open" | "high" | "low" | "close"
//   ?color :: color, text color
//   ?back :: color, background
//   ?stroke :: stroke color
//   ?offset, px, offest from the pin
// }

[OVERLAY name=PriceLabels, ctx=Canvas, verion=1.0.0]

// Overlay props
prop('color', { type: 'Color', def: $core.colors.text })
prop('back', { type: 'Color', def: $core.colors.back })
prop('stroke', { type: 'Color', def: $core.colors.scale })
prop('borderRadius', { type: 'number', def: 3 })
prop('offset', { type: 'number', def: 5 })

const PINMAP = {
    open: 0,
    high: 1,
    low: 2,
    close: 3
}

// Draw call
draw(ctx) {
    const layout = $core.layout
    const view = $core.view
    const data = $core.data

    ctx.font = $core.props.config.FONT

    let items = calcItems(ctx, layout, view, data)

    // Draw items
    ctx.lineWidth = 1
    ctx.textAlign = 'center'
    for (var item of items) {
        let off = (item.o ?? $props.offset) * item.dir
        let dy = (item.dir > 0 ? 19 : -11)
        item.y += off
        ctx.strokeStyle = item.s || $props.stroke
        ctx.fillStyle = item.b || $props.back
        ctx.beginPath()
        drawBody(ctx, item)
        ctx.stroke()
        ctx.fill()
        ctx.fillStyle = item.c || $props.color
        ctx.fillText(item.text, item.x, item.y + dy)
    }



    // Draw texts

}

calcItems(ctx, layout, view, data) {

    let items = []
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let specs = p[1]
        let ohlc = layout.ohlc(p[0])
        if (!ohlc) continue
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(ohlc[PINMAP[specs.pin]])
        let w = ctx.measureText(specs.text).width
        let h = 20
        let dir = specs.dir
        items.push({
            x, y, w, h, dir,
            c: specs.color,
            b: specs.back,
            s: specs.stroke,
            o: specs.offset,
            text: specs.text})
    }
    return items
}

drawBody(ctx, item) {
    let r = $props.borderRadius
    let hw = item.w // half width
    let d = - item.dir
    let x = item.x
    let y = item.y
    ctx.moveTo(x, y)
    ctx.lineTo(x + 5, y - 5 * d)
    ctx.lineTo(x + hw - r, y - 5 * d)
    ctx.quadraticCurveTo(x + hw, y - 5 * d, x + hw, y - (5 + r) * d)
    ctx.lineTo(x + hw, y - (5 + item.h - r) * d)
    ctx.quadraticCurveTo(x + hw, y - (5 + item.h) * d, x + hw - r, y - (5 + item.h) * d)
    ctx.lineTo(x - hw + r, y - (5 + item.h) * d)
    ctx.quadraticCurveTo(x - hw, y - (5 + item.h) * d, x - hw, y - (5 + item.h - r) * d)
    ctx.lineTo(x - hw, y - (5 + r) * d)
    ctx.quadraticCurveTo(x - hw, y - 5 * d, x - hw + r, y - 5 * d)
    ctx.lineTo(x - 5, y - 5 * d)
    ctx.lineTo(x, y)


}

// Legend, defined as pairs [value, color]
legend(x) => [[x[1].text, x[1].color || $props.color]]
`;
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PriceLabels
}, Symbol.toStringTag, { value: "Module" }));
const Range = `// Navy ~ 0.1-lite

// <ds>Ranging indicator, e.g. RSI</ds>
// Format: [<timestamp>, <value>]

[OVERLAY name=Range, ctx=Canvas, verion=1.0.1]

// Overlay props
prop('color', { type: 'Color', def: '#ec206e' })
prop('backColor', { type: 'Color', def: '#381e9c16' })
prop('bandColor', { type: 'Color', def: '#535559' })
prop('lineWidth', { type: 'number', def: 1 })
prop('upperBand', { type: 'number', def: 70 })
prop('lowerBand', { type: 'number', def: 30 })

// Draw call
draw(ctx) {
    const layout = $core.layout
    const upper = layout.value2y($props.upperBand)
    const lower = layout.value2y($props.lowerBand)
    const data = $core.data
    const view = $core.view
    // RSI values
    ctx.lineWidth = $props.lineWidth
    ctx.lineJoin = "round"
    ctx.strokeStyle = $props.color
    ctx.beginPath()
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(p[1])
        ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.strokeStyle = $props.bandColor
    ctx.setLineDash([5]) // Will be removed after draw()
    ctx.beginPath()
    // Fill the area between the bands
    ctx.fillStyle = $props.backColor
    ctx.fillRect(0, upper, layout.width, lower - upper)
    // Upper band
    ctx.moveTo(0, upper)
    ctx.lineTo(layout.width, upper)
    // Lower band
    ctx.moveTo(0, lower)
    ctx.lineTo(layout.width, lower)
    ctx.stroke()
}

yRange(hi, lo) => [
    Math.max(hi, $props.upperBand),
    Math.min(lo, $props.lowerBand)
]

// Legend, defined as pairs [value, color]
legend(x) => [[x[1], $props.color]]
`;
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Range
}, Symbol.toStringTag, { value: "Module" }));
const Sparse = "// Navy ~ 0.1-lite\n\n// <ds>Sparse data: points, squares, crosses, triangles</ds>\n// Format: [<timestamp>, <value>, <?direction>]\n// <value> :: Price/value\n// <?direction> :: Triangle direction: 1 | -1\n\n[OVERLAY name=Sparse, ctx=Canvas, verion=1.0.0]\n\n// Overlay props\nprop('color', { type: 'Color', def: '#898989' })\nprop('size', { type: 'number', def: 3 })\nprop('shape', {\n    type: 'string',\n    def: 'point',\n    options: ['point', 'square', 'cross', 'triangle']\n})\n\n// Draw call\ndraw(ctx) {\n    const layout = $core.layout\n    const view = $core.view\n\n    ctx.fillStyle = $props.color\n    ctx.strokeStyle = $props.color\n\n    switch($props.shape) {\n        case 'point':\n            drawArcs(ctx, view, layout)\n        break\n        case 'square':\n            drawSquares(ctx, view, layout)\n        break\n        case 'cross':\n            drawCrosses(ctx, view, layout)\n        break\n        case 'triangle':\n            drawTriandles(ctx, view, layout)\n        break\n    }\n}\n\ndrawArcs(ctx, view, layout) {\n    const radius = $props.size\n    const data = view.src\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1])\n        ctx.moveTo(x+radius, y)\n        ctx.arc(x, y, radius, 0, Math.PI * 2, false)\n    }\n    ctx.fill()\n}\n\ndrawSquares(ctx, view, layout) {\n    const half = $props.size\n    const side = half * 2\n    const data = view.src\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1])\n        ctx.moveTo(x-half, y-half)\n        ctx.lineTo(x+half, y-half)\n        ctx.lineTo(x+half, y+half)\n        ctx.lineTo(x-half, y+half)\n    }\n    ctx.fill()\n}\n\ndrawCrosses(ctx, view, layout) {\n    const half = $props.size\n    const side = half * 2\n    const data = view.src\n    ctx.lineWidth = Math.max(half - 1, 1)\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1])\n        ctx.moveTo(x-half, y)\n        ctx.lineTo(x+half, y)\n        ctx.moveTo(x, y-half)\n        ctx.lineTo(x, y+half)\n    }\n    ctx.stroke()\n}\n\ndrawTriandles(ctx, view, layout) {\n    const half = $props.size\n    const side = half * 2\n    const data = view.src\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1])\n        let dir = p[2] ?? 1\n        ctx.moveTo(x, y)\n        ctx.lineTo(x + side * dir * 0.63, y + side * dir)\n        ctx.lineTo(x - side * dir * 0.63, y + side * dir)\n    }\n    ctx.fill()\n}\n\nyRange() {\n    let data = $core.hub.ovDataSubset($core.paneId, $core.id)\n    let len = data.length\n    var h, l, high = -Infinity, low = Infinity\n    for(var i = 0; i < len; i++) {\n        let point = data[i][1]\n        if (point > high) high = point\n        if (point < low) low = point\n    }\n    return [high, low]\n}\n\npreSampler(x) => [x[1]]\n\n// Legend, defined as pairs [value, color]\nlegend(x) => [[Math.random(), $props.color]]\n";
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Sparse
}, Symbol.toStringTag, { value: "Module" }));
const Splines = `
// NavyJS ~ 0.1-lite

// <ds>Multiple splines</ds> 
// Format: [<timestamp>, <line1>, <line2>, ...]

[OVERLAY name=Splines, ctx=Canvas, version=1.0.0]

prop('lineWidth', { type: 'number', def: 1 })
prop('widths', { type: 'Array', def: [] })
prop('colors', { type: 'Array', def: [] })
prop('skipNan', { type: 'boolean', def: false })

const COLORS = $props.colors.length ? $props.colors : [
    '#53c153', '#d1c045', '#d37734', '#d63953', '#c43cb9',
    '#6c3cc4', '#444bc9', '#44c2c9', '#44c98d'
]
draw(ctx) {

    let num = ($core.data[0] || []).length ?? 0
    for (var i = 0; i < num; i++) {
        let _i = i % COLORS.length
        ctx.strokeStyle = COLORS[_i]
        ctx.lineJoin = "round"
        ctx.lineWidth = $props.widths[i] || $props.lineWidth
        ctx.beginPath()
        drawSpline(ctx, i)
        ctx.stroke()
    }

}

drawSpline(ctx, idx) {
    const layout = $core.layout
    const data = $core.data
    const view = $core.view
    if (!this.skipNan) {
        for (var i = view.i1, n = view.i2; i <= n; i++) {
            let p = data[i]
            let x = layout.ti2x(p[0], i)
            let y = layout.value2y(p[idx + 1])
            ctx.lineTo(x, y)
        }
    } else {
        var skip = false
        for (var i = view.i1, n = view.i2; i <= n; i++) {
            let p = data[i]
            let x = layout.ti2x(p[0], i)
            let y = layout.value2y(p[idx + 1])
            if (p[idx + 1] == null || y !== y) {
                skip = true
            } else {
                if (skip) ctx.moveTo(x, y)
                ctx.lineTo(x, y)
                skip = false
            }
        }
    }
}

// Legend, defined as pairs [value, color]
legend(x) => x.slice(1) // remove time
    .map((v, i) => [ // map value => color
        v, COLORS[i % COLORS.length]
    ])
`;
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Splines
}, Symbol.toStringTag, { value: "Module" }));
const SuperBands = "// Navy ~ 0.1-lite\n\n// <ds>Two bands: above and below the price (like LuxAlgo Reverse Zones)</ds>\n// Format: [<timestamp>, <high1>, <mid1>, <low1>, <high2>, <mid2>, <low2>]\n/*\n--- <high1> ---\n--- <mid1> ---\n--- <low1> ---\n~~~ price ~~~\n--- <high2> ---\n--- <mid2> ---\n--- <low2> ---\n*/\n\n[OVERLAY name=SuperBands, ctx=Canvas, verion=1.0.0]\n\n// Overlay props\nprop('color1', { type: 'color', def: '#d80d3848' })\nprop('color1dark', { type: 'color', def: '#d80d3824' })\nprop('color2', { type: 'color', def: '#1edbbe33' })\nprop('color2dark', { type: 'color', def: '#1edbbe15' })\n\n// Draw call\ndraw(ctx) {\n    const view = $core.view\n    const layout = $core.layout\n\n    ctx.fillStyle = $props.color1\n    drawBand(ctx, layout, view, 1, 2)\n\n    ctx.fillStyle = $props.color1dark\n    drawBand(ctx, layout, view, 2, 3)\n\n    ctx.fillStyle = $props.color2dark\n    drawBand(ctx, layout, view, 4, 5)\n\n    ctx.fillStyle = $props.color2\n    drawBand(ctx, layout, view, 5, 6)\n\n}\n\n\ndrawBand(ctx, layout, view, i1, i2) {\n    let data = $core.view.src\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[i1] || undefined)\n        ctx.lineTo(x, y)\n    }\n    for (var i = view.i2, i1 = view.i1; i >= i1; i--) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[i2] || undefined)\n        ctx.lineTo(x, y)\n    }\n    ctx.fill()\n}\n\n// Legend, defined as pairs [value, color]\nlegend(x) => [\n    [x[1], $props.color1], [x[2], $props.color1], [x[3], $props.color1],\n    [x[4], $props.color2], [x[5], $props.color2], [x[6], $props.color2]\n]\n";
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SuperBands
}, Symbol.toStringTag, { value: "Module" }));
const Trades = "\n// Navy ~ 0.1-lite\n\n// <ds>Simple trades</ds>\n// Format: [<timestamp>, <dir>, <price>, <?label>]\n// <dir> :: 1 for buy -1 for sell\n// <price> :: trade price\n// <?label> :: trade label\n[OVERLAY name=Trades, ctx=Canvas, version=1.0.0]\n\nprop('buyColor', {  type: 'color', def: '#08b2c6' })\nprop('sellColor', {  type: 'color', def: '#e42633' })\nprop('radius', {  type: 'number', def: 4 })\nprop('showLabels', {  type: 'boolean', def: true })\nprop('markerOutline', {  type: 'boolean', def: true })\nprop('outlineWidth', {  type: 'number', def: 4 })\n\n// Draw function (called on each update)\n// Library provides a lot of useful variables to make\n// overlays ($core in the main collection)\ndraw(ctx) {\n    ctx.lineWidth = $props.outlineWidth\n    const layout = $core.layout\n    const data = $core.data // Full dataset\n    const view = $core.view // Visible view\n\n    // Outline\n    if ($props.markerOutline) {\n        ctx.strokeStyle = $core.colors.back\n        ctx.beginPath()\n        iterArcs(ctx, view, data, layout)\n        ctx.stroke()\n    }\n\n    // Fill sell trades\n    ctx.fillStyle = $props.buyColor\n    ctx.beginPath()\n    iterArcs(ctx, view, data, layout, -1)\n    ctx.fill()\n\n    // Fill buy trades\n    ctx.fillStyle = $props.sellColor\n    ctx.beginPath()\n    iterArcs(ctx, view, data, layout, 1)\n    ctx.fill()\n\n    // Draw labels\n    if ($props.showLabels) {\n        ctx.fillStyle = $core.colors.textHL\n        ctx.font = $core.props.config.FONT\n        ctx.textAlign = 'center'\n        drawLabels(ctx, view, data, layout)\n    }\n\n}\n\n// Iter through arcs\niterArcs(ctx, view, data, layout, dir) {\n    const radius = $props.radius\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        if (Math.sign(p[1]) === dir) continue\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[2])\n        ctx.moveTo(x+radius, y)\n        ctx.arc(x, y, radius, 0, Math.PI * 2, false)\n    }\n}\n\n// Draw simple lables\ndrawLabels(ctx, view, data, layout) {\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[2])\n        ctx.fillText(p[3], x, y - 25)\n    }\n}\n\n// Sample data point with index 2\npreSampler(x) => x[2]\n\n// Not affecting the y-range\nyRange() => null\n\n// Legend formatter, Array of [value, color] pairs\n// x represents one data item e.g. [<time>, <value>]\nlegend(x) {\n    if (x[1] > 0) {\n        return [\n            ['Buy', $props.buyColor],\n            [x[2], $core.colors.text],\n            [x[3]]\n        ]\n    } else {\n        return [\n            ['Sell', $props.sellColor],\n            [x[2], $core.colors.text],\n            [x[3]]\n        ]\n    }\n}\n";
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Trades
}, Symbol.toStringTag, { value: "Module" }));
const Volume = "// Navy ~ 0.1-lite\n\n// <ds>Regular volume</ds> \n// Format: [<timestamp>, <volume>, <direction>]\n// <direction> :: 1 for green volume, - 1 for red volume\n\n[OVERLAY name=Volume, ctx=Canvas, verion=1.0.0]\n\n// Overlay props\nprop('colorVolUp', { type: 'color', def: '#41a37682' })\nprop('colorVolDw', { type: 'color', def: '#de464682' })\nprop('barsHeight', { type: 'number', def: 0.15, step: 0.1 })\nprop('currencySymbol', { type: 'string', def: '$' })\nprop('showAvgVolume', { type: 'boolean', def: true })\nprop('avgVolumeSMA', { type: 'number', def: 20 })\nprop('colorAvgVol', { type: 'color', def: '#17e2bb99'})\n\n// Draw call\ndraw(ctx) {\n\n    let height = $core.id === 0 ? 0.8 : $props.barsHeight\n    let cnv = $lib.layoutCnv($core, false, true, 1, 2, height)\n    let bars = cnv.upVolbars.length ? cnv.upVolbars : cnv.dwVolbars\n    if (!bars.length) return\n\n    drawCvPart(ctx, $lib.volumeBar, cnv.dwVolbars, 'colorVolDw')\n    drawCvPart(ctx, $lib.volumeBar, cnv.upVolbars, 'colorVolUp')\n\n    if ($props.showAvgVolume) $lib.avgVolume(ctx, $core, $props, cnv, 1)\n}\n\n// Draw candle part\ndrawCvPart(ctx, f, arr, color) {\n    let layout = $core.layout\n    ctx.strokeStyle = $props[color]\n    ctx.beginPath()\n    for (var i = 0, n = arr.length; i < n; i++) {\n        f(ctx, arr[i], layout)\n    }\n    ctx.stroke()\n}\n\n// Custom y-range\nyRange(hi, lo) {\n    // Remove this overlay for yRange calculation\n    // if it's not the main overlay of the pane\n    if ($core.id !== 0) {\n        return null\n    } else {\n        return [hi, lo, false]\n    }\n}\n\n// Legend, defined as pairs [value, color]\nlegend(x) {\n    let v = $core.cursor.getValue($core.paneId, $core.id)\n    let sym = $props.currencySymbol\n    let color = v[2] > 0 ?\n        $props.colorVolUp : $props.colorVolDw\n    let fc = $lib.formatCash\n    return [[sym + fc(x[1]), color.slice(0, 7)]]\n}\n";
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Volume
}, Symbol.toStringTag, { value: "Module" }));
const VolumeDelta = `// Navy ~ 0.1-lite

// <ds>Volume bars with delta ( = buyVol - sellVol)</ds>
// Format: [<timestamp>, <buyVol>, <sellVol>, <total>, <delta>]

[OVERLAY name=VolumeDelta, ctx=Canvas, verion=1.0.0]

// Overlay props
prop('colorVolUp', { type: 'color', def: '#41a37682' })
prop('colorVolDw', { type: 'color', def: '#de464682' })
prop('colorVolDeltaUp', { type: 'color', def: '#41a376' })
prop('colorVolDeltaDw', { type: 'color', def: '#de4646' })
prop('barsHeight', { type: 'number', def: 0.15, step: 0.1 })

// Draw call
draw(ctx) {

    let height = $core.id === 0 ? 0.8 : $props.barsHeight
    let cnv = $lib.layoutCnv($core, false, true, 1, 4, height)
    let bars = cnv.upVolbars.length ? cnv.upVolbars : cnv.dwVolbars
    if (!bars.length) return

    drawCvPart(ctx, $lib.volumeBar, cnv.dwVolbars, 'colorVolDw')
    drawCvPart(ctx, $lib.volumeBar, cnv.upVolbars, 'colorVolUp')

    let dwDelta = makeDelta(cnv.dwVolbars)
    let upDelta = makeDelta(cnv.upVolbars)

    drawCvPart(ctx, $lib.volumeBar, dwDelta, 'colorVolDeltaDw')
    drawCvPart(ctx, $lib.volumeBar, upDelta, 'colorVolDeltaUp')

}

// Draw candle part
drawCvPart(ctx, f, arr, color) {
    let layout = $core.layout
    ctx.strokeStyle = $props[color]
    ctx.beginPath()
    for (var i = 0, n = arr.length; i < n; i++) {
        f(ctx, arr[i], layout)
    }
    ctx.stroke()
}

makeDelta(bars) {
    let delta = []
    for (var bar of bars) {
        let src = bar.src
        let k = Math.abs(src[4]) / src[3]
        bar.h =  bar.h * k
        delta.push(bar)
    }
    return delta
}

// Custom y-range
yRange(hi, lo) {
    // Remove this overlay for yRange calculation
    // if it's not the main overlay of the pane
    if ($core.id !== 0) {
        return null
    } else {
        return [hi, lo, false]
    }
}

// Legend, defined as pairs [value, color]
legendHtml(x) {
    let v = $core.cursor.getValue($core.paneId, $core.id)
    let sym = $props.currencySymbol
    let color1 = $core.colors.text
    let color2 = v[4] > 0 ?
        $props.colorVolDeltaUp : $props.colorVolDeltaDw
    let fc = $lib.formatCash
    let sign = v[4] > 0 ? '+' : ''
    return \`
    <span style="color: \${color2}">
        <span style="margin-left: 3px;"></span>
        <span style="color: \${color1}">B</span>
        <span class="nvjs-ll-value">\${fc(x[1])}</span>
        <span style="color: \${color1}">S</span>
        <span class="nvjs-ll-value">\${fc(x[2])}</span>
        <span style="color: \${color1}">Σ</span>
        <span class="nvjs-ll-value">\${fc(x[3])}</span>
        <span style="color: \${color1}">Δ</span>
        <span class="nvjs-ll-value">\${sign}\${fc(x[4])}</span>
    \`
    //return [[sym + fc(x[1]), color.slice(0, 7)]]
}
`;
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: VolumeDelta
}, Symbol.toStringTag, { value: "Module" }));
const area = `
// NavyJS ~ 0.1-lite

// <ds>Area chart</ds>, format: [<timestamp>, <value>]

[OVERLAY name=Area, ctx=Canvas, version=1.0.0]

// Define new props
prop('color', { type: 'color', def: '#31ce31' })
prop('lineWidth', { type: 'number', def: 1.25 })
prop('back1', { type: 'color', def: $props.color + '15' })
prop('back2', { type: 'color', def: $props.color + '01' })
prop('dataIndex', { type: 'integer', def: 1 })

draw(ctx) {
   
    const layout = $core.layout
    const data = $core.data // Full dataset
    const view = $core.view // Visible view
    const idx = $props.dataIndex
    const grd = ctx.createLinearGradient(0, 0, 0, layout.height)
    grd.addColorStop(0, $props.back1)
    grd.addColorStop(1, $props.back2)

    // Line
    ctx.lineWidth = $props.lineWidth
    ctx.strokeStyle = $props.color
    ctx.lineJoin = "round"
    ctx.beginPath()
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(p[idx])
        ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Area
    ctx.fillStyle = grd
    ctx.beginPath()
    let p0 = (data[0] || [])[0]
    let pN = (data[data.length - 1] || [])[0]
    ctx.lineTo(layout.ti2x(p0, 0), layout.height)
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(p[idx])
        ctx.lineTo(x, y)
    }
    ctx.lineTo(layout.ti2x(pN, i - 1), layout.height)
    ctx.fill()

}

// Precision sampling
preSampler(x) => [x[$props.dataIndex]]

// Map data item to OHLC (for candle magnets etc.)
// Here we simulate a candle with 0 height
ohlc(x) => Array(4).fill(x[$props.dataIndex])

// Legend, defined as pairs [value, color]
yRange() {
    let data = $core.hub.ovDataSubset($core.paneId, $core.id)
    let di = $props.dataIndex
    let len = data.length
    var h, l, high = -Infinity, low = Infinity
    for(var i = 0; i < len; i++) {
        let point = data[i][di]
        if (point > high) high = point
        if (point < low) low = point
    }
    return [high, low]
}

// Legend, defined as pairs [value, color]
legend(x) => [[x[$props.dataIndex], $props.color]]
`;
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: area
}, Symbol.toStringTag, { value: "Module" }));
const candles = `
// NavyJS ~ 0.1-lite

// <ds>Standart japanese candles</ds>, format:
// [<timestamp>, <open>, <high>, <low>, <close>, <?volume>]

[OVERLAY name=Candles, ctx=Canvas, version=1.0.0]

// Define the props
prop('colorBodyUp', { type: 'color', def: $core.colors.candleUp })
prop('colorBodyDw', { type: 'color', def: $core.colors.candleDw })
prop('colorWickUp', { type: 'color', def: $core.colors.wickUp })
prop('colorWickDw', { type: 'color', def: $core.colors.wickDw })
prop('colorVolUp', { type: 'color', def: $core.colors.volUp })
prop('colorVolDw', { type: 'color', def: $core.colors.volDw })
prop('showVolume', { type: 'boolean', def: true })
prop('currencySymbol', { type: 'string', def: '$' })
prop('showAvgVolume', { type: 'boolean', def: true })
prop('avgVolumeSMA', { type: 'number', def: 20 })
prop('colorAvgVol', { type: 'color', def: '#1cccb777'})
prop('scaleSymbol', { type: 'string|boolean', def: false })
prop('priceLine', { type: 'boolean', def: true })
prop('showValueTracker', { type: 'boolean', def: true })


// Draw call
draw(ctx) {

    let cnv = $lib.layoutCnv($core, true, $props.showVolume)
    let bodies = cnv.upBodies.length ? cnv.upBodies : cnv.dwBodies
    if (!bodies.length) return
    let w = Math.max(bodies[0].w, 1)

    drawCvPart(ctx, $lib.candleWick, cnv.dwWicks, 1, 'colorWickDw')
    drawCvPart(ctx, $lib.candleWick, cnv.upWicks, 1, 'colorWickUp')
    drawCvPart(ctx, $lib.candleBody, cnv.dwBodies, w, 'colorBodyDw')
    drawCvPart(ctx, $lib.candleBody, cnv.upBodies, w, 'colorBodyUp')
    drawCvPart(ctx, $lib.volumeBar, cnv.dwVolbars, w, 'colorVolDw')
    drawCvPart(ctx, $lib.volumeBar, cnv.upVolbars, w, 'colorVolUp')

    if ($props.showVolume && $props.showAvgVolume) {
        $lib.avgVolume(ctx, $core, $props, cnv)
    }

}

// Draw candle part
drawCvPart(ctx, f, arr, w, color) {
    let layout = $core.layout
    ctx.lineWidth = w
    ctx.strokeStyle = $props[color]
    ctx.beginPath()
    for (var i = 0, n = arr.length; i < n; i++) {
        f(ctx, arr[i], layout)
    }
    ctx.stroke()
}

// Define y-range (by finding max High, min Low)
yRange() {
    // Getting updated data faster
    // (we need 1 more update when using $core.dataSubset)
    let data = $core.hub.ovDataSubset($core.paneId, $core.id)
    let len = data.length
    var h, l, high = -Infinity, low = Infinity
    for(var i = 0; i < len; i++) {
        let point = data[i]
        if (point[2] > high) high = point[2]
        if (point[3] < low) low = point[3]
    }
    return [high, low]
}

// Use [Open, Close] for precision detection
preSampler(x) => [x[1], x[4]]

// Map data item to OHLC (for candle magnets etc.)
ohlc(x) => [x[1], x[2], x[3], x[4]]

// Price label + Scale symbol + price line
valueTracker(x) => {
    show: $props.showValueTracker,
    symbol: $props.scaleSymbol,
    line: $props.priceLine,
    color: $lib.candleColor($props, $core.data[$core.data.length - 1]),
    value: x[4] // close
}

// Define the OHLCV legend
legendHtml(x, prec, f) {
    let color1 = $core.colors.text
    let v = $core.cursor.getValue($core.paneId, $core.id)
    let sym = $props.currencySymbol
    let color2 = v[4] >= v[1] ?
        $props.colorBodyUp : $props.colorBodyDw
    let fc = $lib.formatCash
    return \`
    <span style="color: \${color2}">
        <span style="margin-left: 3px;"></span>
        <span style="color: \${color1}">O</span>
        <span class="nvjs-ll-value">\${f(x[1])}</span>
        <span style="color: \${color1}">H</span>
        <span class="nvjs-ll-value">\${f(x[2])}</span>
        <span style="color: \${color1}">L</span>
        <span class="nvjs-ll-value">\${f(x[3])}</span>
        <span style="color: \${color1}">C</span>
        <span class="nvjs-ll-value">\${f(x[4])}</span>
    \`
    + ($props.showVolume ? \`
        <span style="color: \${color1}">V</span>
        <span class="nvjs-ll-value">\${sym+fc(x[5])}</span>\` : \`\`)
    + \`</span>\`
    }
`;
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: candles
}, Symbol.toStringTag, { value: "Module" }));
const spline = `
// NavyJS ~ 0.1-lite

// <ds>Single spline</ds>
// Format: [<timestamp>, <number>]

[OVERLAY name=Spline, ctx=Canvas, version=1.1.0]

// Define new props
prop('color', { type: 'color', def: '#31ce31' })
prop('lineWidth', { type: 'number', def: 1 })
prop('dataIndex', { type: 'integer', def: 1 })


draw(ctx) {
    ctx.lineWidth = $props.lineWidth
    ctx.lineJoin = "round"
    ctx.strokeStyle = $props.color
    ctx.beginPath()
    const layout = $core.layout
    const data = $core.data // Full dataset
    const view = $core.view // Visible view
    const idx = $props.dataIndex
    for (var i = view.i1, n = view.i2; i <= n; i++) {
        let p = data[i]
        let x = layout.ti2x(p[0], i)
        let y = layout.value2y(p[idx])
        ctx.lineTo(x, y)
    }
    ctx.stroke()
}

// Price label + Scale symbol + price line
/*valueTracker(x) => {
    show: true,
    symbol: $core.src.name,
    line: true,
    color: $props.color,
    value: x[$props.dataIndex]
}*/

preSampler(x) => [x[$props.dataIndex]]

// Map data item to OHLC (for candle magnets etc.)
// Here we simulate a candle with 0 height
ohlc(x) => Array(4).fill(x[$props.dataIndex])

yRange() {
    let data = $core.hub.ovDataSubset($core.paneId, $core.id)
    let di = $props.dataIndex
    let len = data.length
    var h, l, high = -Infinity, low = Infinity
    for(var i = 0; i < len; i++) {
        let point = data[i][di]
        if (point > high) high = point
        if (point < low) low = point
    }
    return [high, low]
}

// Legend, defined as pairs [value, color]
legend(x) => [[x[$props.dataIndex], $props.color]]
`;
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: spline
}, Symbol.toStringTag, { value: "Module" }));
const RangeTool = "// Navy ~ 0.1-lite\n// <ds>Time & value measurment tool [Shift+Click]</ds>\n\n[OVERLAY name=RangeTool, ctx=Canvas, verion=1.0.1, author=GPT4]\n\nlet pin1 = null \nlet pin2 = null \nlet shift = false\nlet state = 'idle'\n\ndraw(ctx) {\n    const layout = $core.layout \n\n    if (pin1 && pin2) {\n        const x1 = layout.time2x(pin1.t) // time to x coordinate\n        const x2 = layout.time2x(pin2.t) // time to x coordinate\n        const y1 = layout.value2y(pin1.v) // value to y coordinate\n        const y2 = layout.value2y(pin2.v) // value to y coordinate\n\n         // change fill color based on percentage\n        let color = percent() >= 0 ? '#3355ff' : '#ff3333';\n        ctx.fillStyle = color + '33';\n        ctx.fillRect(x1, y1, x2 - x1, y2 - y1)\n\n        // draw arrows in the middle of rectangle\n        let midX = (x1 + x2) / 2;\n        let midY = (y1 + y2) / 2;\n        $lib.drawArrow(ctx, midX, y1, midX, y2, color, Math.abs(y2 - y1) > 42); \n        $lib.drawArrow(ctx, x1, midY, x2, midY, color, Math.abs(x2 - x1) > 42);  \n\n        // draw rounded rectangle with text\n        const text1 = `${deltaValue().toFixed(2)} (${percent().toFixed(2)}%)`;\n        const text2 = `${bars()} bars, ${timeText()}`;\n        const text = `${text1}\\n${text2}`;\n        const textWidth = ctx.measureText(text).width;\n        \n        const padding = 10;\n        const mainRectCenterX = (x1 + x2) / 2; // calculate center of the main rectangle\n        const roundRectX = mainRectCenterX - textWidth / 2 - padding; // center the text rectangle relative to the main rectangle\n        const roundRectWidth = textWidth + 2 * padding;\n        const roundRectHeight = 50;  // adjust as needed\n        const roundRectY = percent() > 0 ? Math.min(y1, y2) - roundRectHeight - padding : Math.max(y1, y2) + padding;\n        const roundRectRadius = 5;   // adjust as needed\n        ctx.fillStyle = color + 'cc';\n        $lib.roundRect(ctx, roundRectX, roundRectY, roundRectWidth, roundRectHeight, roundRectRadius);\n\n        // draw text\n        ctx.fillStyle = '#ffffffcc' // color;\n        ctx.font = $lib.rescaleFont($core.props.config.FONT, 14);\n        ctx.textAlign = 'center';\n        ctx.textBaseline = 'middle';\n        ctx.fillText(text1, roundRectX + roundRectWidth / 2, roundRectY + roundRectHeight / 4);\n        ctx.fillText(text2, roundRectX + roundRectWidth / 2, roundRectY + 3 * roundRectHeight / 4);\n      \n    }\n}\n\n// Calculate the percentage of the are between pins v-values\n// assuming that pin2 is above pin1 equals positive value\n// and negative otherwise\npercent() {\n    if (pin1 && pin2) {\n        let delta = 100 * (pin2.v - pin1.v)\n        if (delta > 0) {\n            return delta / pin1.v\n        } else {\n            return delta / pin2.v\n        }\n    }\n    return 0\n}\n\n// Calculate delta time between pins t-values\n// assuming that pin2 on the right of pin1 equals positive value\n// and negative otherwise\ndeltaTime() {\n    if (pin1 && pin2) {\n        return pin2.t - pin1.t\n    }\n    return 0\n}\n\n// Calculate delta value between pins v-values\n// assuming that pin2 is above pin1 equals positive value\n// and negative otherwise\ndeltaValue() {\n    if (pin1 && pin2) {\n        return pin2.v - pin1.v\n    }\n    return 0\n}\n\n// Delta time in bars\nbars() {\n    let data = $core.hub.mainOv.dataSubset\n    if (pin1 && pin2) {\n        const layout = $core.layout\n        const bars = data.filter(bar => {\n            return bar[0] >= Math.min(pin1.t, pin2.t) && bar[0] <= Math.max(pin1.t, pin2.t)\n        });\n        let count = bars.length - 1; // reduce the count by 1\n        return pin2.t < pin1.t ? -count : count; // make it negative if pin2.t < pin1.t\n    }\n    return 0\n}\n\n// Delta time in text format\ntimeText() {\n    let deltaTimeMs = deltaTime();  // returns delta time in milliseconds\n    let timeFrameMs = $core.props.timeFrame;  // returns current chart timeframe in milliseconds\n\n    let negative = deltaTimeMs < 0;\n    deltaTimeMs = Math.abs(deltaTimeMs);\n\n    let minutes = Math.floor((deltaTimeMs / (1000 * 60)) % 60);\n    let hours = Math.floor((deltaTimeMs / (1000 * 60 * 60)) % 24);\n    let days = Math.floor(deltaTimeMs / (1000 * 60 * 60 * 24));\n\n    let result = \"\";\n    if (days > 0) {\n        result += days + \"d \";\n    }\n    if ((hours > 0 || days > 0) && hours !== 0) {\n        result += hours + \"h \";\n    }\n    if (minutes > 0 && timeFrameMs < 60 * 60 * 1000 && minutes !== 0) {\n        result += minutes + \"m\";\n    }\n\n    return (negative ? '-' : '') + result.trim();\n}\n\n\n\nkeydown(event) {\n    if (event.key === 'Shift') {\n        shift = true\n    }\n}\n\nkeyup(event) {\n    if (event.key === 'Shift') {\n        shift = false\n    }\n}\n\nmousedown(event) {\n    const layout = $core.layout \n    if (state === 'idle' && shift) {\n        // Create the first pin \n        pin1 = {\n            t: $core.cursor.time,\n            v: layout.y2value(event.layerY)\n        }\n        pin2 = { ...pin1 }\n        state = 'drawing'\n    } else if (state === 'drawing') {\n        state = 'finished'\n    } else if (state === 'finished') {\n        state = 'idle'\n        pin1 = null \n        pin2 = null \n    }\n    $events.emitSpec('chart', 'update-layout')\n}\n\nmousemove(event) {\n    if (state === 'drawing') {\n        const layout = $core.layout \n        // Create the second pin \n        pin2 = {\n            t: $core.cursor.time,\n            v: layout.y2value(event.layerY)\n        }\n    }\n}\n\n// Disable legend by returning null\nlegend() => null\n";
const __vite_glob_1_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: RangeTool
}, Symbol.toStringTag, { value: "Module" }));
const ALMA = "\n// Navy ~ 0.1-lite\n// <ds>Arnaud Legoux Moving Average</ds>\n\n[INDICATOR name=ALMA, version=1.0.0]\n\nprop('length', { type: 'integer', def: 10 })\nprop('offset', { type: 'number', def: 0.9 })\nprop('sigma', { type: 'number', def: 5 })\nprop('color', { type: 'color', def: '#559de0' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nlet $ = $props\n\nthis.specs = {\n    name: `ALMA ${$.length} ${$.offset} ${$.sigma}`,\n    props: {\n        color: $props.color,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nlet offset = $props.offset\nlet sigma = $props.sigma\n\nSpline(alma(close, length, offset, sigma), this.specs)\n";
const __vite_glob_2_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ALMA
}, Symbol.toStringTag, { value: "Module" }));
const ATR = "\n// Navy ~ 0.1-lite\n// <ds>Average True Range</ds>\n\n[INDICATOR name=ATR, version=1.0.0]\n\nprop('length', { type: 'integer', def: 15 })\nprop('color', { type: 'color', def: '#e52468' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: 'ATR ' + $props.length,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nSpline(atr($props.length), this.specs)\n";
const __vite_glob_2_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ATR
}, Symbol.toStringTag, { value: "Module" }));
const ATRp = "\n// Navy ~ 0.1-lite\n// <ds>Average True Range, percentage</ds>\n\n[INDICATOR name=ATRp, version=1.0.0]\n\nprop('length', { type: 'integer', def: 15 })\nprop('color', { type: 'color', def: '#f44336' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: 'ATR% ' + $props.length,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet k = 100 / close[0]\nSpline(atr($props.length)[0] * k, this.specs)\n";
const __vite_glob_2_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ATRp
}, Symbol.toStringTag, { value: "Module" }));
const BB = "\n// Navy ~ 0.1-lite\n// <ds>Bollinger Bands</ds>\n\n[INDICATOR name=BB, version=1.0.0]\n\nprop('length', { type: 'integer', def: 21 })\nprop('stddev', { type: 'number', def: 2 })\nprop('color', { type: 'color', def: '#2cc6c9ab' })\nprop('backColor', { type: 'color', def: '#2cc6c90a' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `BB ${$props.length} ${$props.stddev}`,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nlet stddev = $props.stddev\nlet [m, h, l] = bb(close, length, stddev)\nBand([h[0], m[0], l[0]], this.specs)\n";
const __vite_glob_2_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BB
}, Symbol.toStringTag, { value: "Module" }));
const BBW = "\n// Navy ~ 0.1-lite\n// <ds>Bollinger Bands Width</ds>\n\n[INDICATOR name=BBW, version=1.0.0]\n\nprop('length', { type: 'integer', def: 21 })\nprop('stddev', { type: 'number', def: 2 })\nprop('color', { type: 'color', def: '#2cc6c9ab' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `BBW ${$props.length} ${$props.stddev}`,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nlet stddev = $props.stddev\nSpline(bbw(close, length, stddev), this.specs)\n";
const __vite_glob_2_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BBW
}, Symbol.toStringTag, { value: "Module" }));
const CCI = "\n// Navy ~ 0.1-lite\n// <ds>Commodity Channel Index</ds>\n\n[INDICATOR name=CCI, version=1.0.0]\n\nprop('length', { type: 'integer', def: 21 })\nprop('upperBand', { type: 'number', def: 100 })\nprop('lowerBand', { type: 'number', def: -100 })\nprop('color', { type: 'color', def: '#e28a3dee' })\nprop('backColor', { type: 'color', def: '#e28a3d11' })\nprop('bandColor', { type: 'color', def: '#999999' })\nprop('prec', { type: 'integer', def: 2 })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: 'CCI ' + $props.length,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n        bandColor: $props.bandColor,\n        upperBand: $props.upperBand,\n        lowerBand: $props.lowerBand,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nRange(cci(close, $props.length), this.specs)\n";
const __vite_glob_2_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CCI
}, Symbol.toStringTag, { value: "Module" }));
const CMO = "\n// Navy ~ 0.1-lite\n// <ds>Chande Momentum Oscillator</ds>\n\n[INDICATOR name=CMO, version=1.0.0]\n\nprop('length', { type: 'integer', def: 10 })\nprop('color', { type: 'color', def: '#559de0' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `CMO ${$props.length}`,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nSpline(cmo(close, length), this.specs)\n";
const __vite_glob_2_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CMO
}, Symbol.toStringTag, { value: "Module" }));
const COG = "\n// Navy ~ 0.1-lite\n// <ds>Center of Gravity</ds>\n\n[INDICATOR name=COG, version=1.0.0]\n\nprop('length', { type: 'integer', def: 10 })\nprop('color', { type: 'color', def: '#559de0' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `COG ${$props.length}`,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nSpline(cog(close, length), this.specs)\n";
const __vite_glob_2_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: COG
}, Symbol.toStringTag, { value: "Module" }));
const DMI = `
// Navy ~ 0.1-lite
// <ds>Directional Movement Index</ds>

[INDICATOR name=DMI, version=1.0.0]

prop('length', { type: 'integer', def: 15 })
prop('smooth', { type: 'integer', def: 15 })
prop('color1', { type: 'color', def: "#ef1360" })
prop('color2', { type: 'color', def: "#3782f2" })
prop('color3', { type: 'color', def: "#f48709" })
prop('prec', { type: 'integer', def: 2 })
prop('zIndex', { type: 'integer', def: 0 })

this.specs = {
    name: \`DMI \${$props.length} \${$props.smooth}\`,
    props: {
        colors: [$props.color1, $props.color2, $props.color3]
    },
    settings: {
        precision: $props.prec,
        zIndex: $props.zIndex
    }
}

[UPDATE]

let [adx, dp, dn] = dmi($props.length, $props.smooth)
Splines([adx[0], dp[0], dn[0]], this.specs)
`;
const __vite_glob_2_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DMI
}, Symbol.toStringTag, { value: "Module" }));
const EMA = "\n// Navy ~ 0.1-lite\n// <ds>Exponential Moving Average</ds>\n\n[INDICATOR name=EMA, version=1.0.0]\n\nprop('length', { type: 'integer', def: 12 })\nprop('color', { type: 'color', def: '#f7890c' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `EMA ${$props.length}`,\n    props: {\n        color: $props.color,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nSpline(ema(close, $props.length), this.specs)\n";
const __vite_glob_2_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EMA
}, Symbol.toStringTag, { value: "Module" }));
const HMA = "\n// Navy ~ 0.1-lite\n// <ds>Hull Moving Average</ds>\n\n[INDICATOR name=HMA, version=1.0.0]\n\nprop('length', { type: 'integer', def: 10 })\nprop('color', { type: 'color', def: '#3af475' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `HMA ${$props.length}`,\n    props: {\n        color: $props.color,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nSpline(hma(close, $props.length), this.specs)\n";
const __vite_glob_2_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HMA
}, Symbol.toStringTag, { value: "Module" }));
const Ichimoku = "\n// Navy ~ 0.1-lite\n// <ds>Ichimoku Cloud</ds>\n\n[INDICATOR name=Ichimoku, version=1.0.0]\n\nprop('convLength', { type: 'integer', def: 9 })\nprop('baseLength', { type: 'integer', def: 26 })\nprop('laggingLength', { type: 'integer', def: 52 })\nprop('displacement', { type: 'integer', def: 26 })\nprop('cloudUpColor', { type: 'color', def: '#79ffde18' })\nprop('cloudDwColor', { type: 'color', def: '#ff246c18' })\nprop('convColor', { type: 'color', def: '#4eb6d8' })\nprop('baseColor', { type: 'color', def: '#d626a1' })\nprop('laggingColor', { type: 'color', def: '#66cc66' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = ({name, props}) => ({\n    name: name,\n    props: props,\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n})\n\n[UPDATE]\n\nlet $ = $props\nlet donchian = (len, id) => ts(\n    avg(lowest(low, len)[0], highest(high, len)[0]), id\n)\nlet conversionLine = donchian($.convLength, 1)\nlet baseLine = donchian($.baseLength, 2)\nlet leadLine1 = ts(avg(conversionLine[0], baseLine[0]))\nlet leadLine2 = donchian($.laggingLength, 3)\nlet lagging = ts(close[0])\noffset(leadLine1, $.displacement - 1)\noffset(leadLine2, $.displacement - 1)\noffset(lagging, -$.displacement + 1)\n\nCloud([leadLine1, leadLine2], this.specs({\n    name: `Cloud`,\n    props: {\n        back1: $props.cloudUpColor,\n        back2: $props.cloudDwColor\n    }\n}))\n\nSplines([conversionLine, baseLine], this.specs({\n    name: `Base Lines ${$.convLength} ${$.baseLength}`,\n    props: {\n        colors: [\n            $props.convColor,\n            $props.baseColor\n        ]\n    }\n}))\n\nSpline(lagging, this.specs({\n    name: `Lagging Span ${$.laggingLength}`,\n    props: {\n        color: $props.laggingColor\n    }\n}))\n";
const __vite_glob_2_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ichimoku
}, Symbol.toStringTag, { value: "Module" }));
const KC = "\n// Navy ~ 0.1-lite\n// <ds>Keltner Channels</ds>\n\n[INDICATOR name=KC, version=1.0.0]\n\nprop('length', { type: 'integer', def: 20 })\nprop('mult', { type: 'number', def: 1 })\nprop('trueRange', { type: 'boolean', def: true })\nprop('color', { type: 'color', def: '#4c8dffab' })\nprop('backColor', { type: 'color', def: '#4c8dff0a' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `KC ${$props.length} ${$props.mult}`,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nlet [m, h, l] = kc(close, $.length, $.mult, $.trueRange)\nBand([h[0], m[0], l[0]], this.specs)\n";
const __vite_glob_2_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: KC
}, Symbol.toStringTag, { value: "Module" }));
const KCW = "\n// Navy ~ 0.1-lite\n// <ds>Keltner Channels Width</ds>\n\n[INDICATOR name=KCW, version=1.0.0]\n\nprop('length', { type: 'integer', def: 20 })\nprop('mult', { type: 'number', def: 1 })\nprop('trueRange', { type: 'boolean', def: true })\nprop('color', { type: 'color', def: '#4c8dffab' })\nprop('backColor', { type: 'color', def: '#4c8dff0a' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `KCW ${$props.length} ${$props.mult}`,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nlet w = kcw(close, $.length, $.mult, $.trueRange)\nSpline(w, this.specs)\n";
const __vite_glob_2_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: KCW
}, Symbol.toStringTag, { value: "Module" }));
const MACD = "\n// Navy ~ 0.1-lite\n// <ds>Moving Average Convergence/Divergence</ds>\n\n[INDICATOR name=MACD, version=1.0.0]\n\nprop('fast', { type: 'integer', def: 12 })\nprop('slow', { type: 'integer', def: 26 })\nprop('smooth', { type: 'integer', def: 9 })\nprop('colorMacd', { type: 'color', def: '#3782f2' })\nprop('colorSignal', { type: 'color', def: '#f48709' })\nprop('colorUp', { type: 'Color', def: '#35a776' })\nprop('colorDw', { type: 'Color', def: '#e54150' })\nprop('colorSemiUp', { type: 'Color', def: '#79e0b3' })\nprop('colorSemiDw', { type: 'Color', def: '#ea969e' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nlet $ = $props\nthis.specs = {\n    name: `MACD ${$.fast} ${$.slow} ${$.smooth}`,\n    props: {\n        colorValue: $.colorMacd,\n        colorSignal: $.colorSignal,\n        colorUp: $.colorUp,\n        colorDw: $.colorDw,\n        colorSemiUp: $.colorSemiUp,\n        colorSemiDw: $.colorSemiDw\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nlet [m, s, h] = macd(close, $.fast, $.slow, $.smooth)\n\nHistogram([h[0], m[0], s[0]], this.specs)\n";
const __vite_glob_2_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MACD
}, Symbol.toStringTag, { value: "Module" }));
const MFI = "\n// Navy ~ 0.1-lite\n// <ds>Money Flow Index	</ds>\n\n[INDICATOR name=MFI, version=1.0.0]\n\nprop('length', { type: 'integer', def: 14 })\nprop('upperBand', { type: 'number', def: 80 })\nprop('lowerBand', { type: 'number', def: 20 })\nprop('color', { type: 'color', def: '#85c427ee' })\nprop('backColor', { type: 'color', def: '#85c42711' })\nprop('bandColor', { type: 'color', def: '#999999' })\nprop('prec', { type: 'integer', def: 2 })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: 'MFI ' + $props.length,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n        bandColor: $props.bandColor,\n        upperBand: $props.upperBand,\n        lowerBand: $props.lowerBand,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet hlc3 = ts((high[0] + low[0] + close[0]) / 3)\nRange(mfi(hlc3, $props.length), this.specs)\n";
const __vite_glob_2_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MFI
}, Symbol.toStringTag, { value: "Module" }));
const MOM = "\n// Navy ~ 0.1-lite\n// <ds>Momentum</ds>\n\n[INDICATOR name=MOM, version=1.0.0]\n\nprop('length', { type: 'integer', def: 11 })\nprop('color', { type: 'color', def: '#bcc427ee' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `MOM ${$props.length}`,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nSpline(mom(close, length), this.specs)\n";
const __vite_glob_2_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MOM
}, Symbol.toStringTag, { value: "Module" }));
const ROC = "\n// Navy ~ 0.1-lite\n// <ds>Rate of Change</ds>\n\n[INDICATOR name=ROC, version=1.0.0]\n\nprop('length', { type: 'integer', def: 9 })\nprop('color', { type: 'color', def: '#279fc4' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `ROC ${$props.length}`,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet length = $props.length\nSpline(roc(close, length), this.specs)\n";
const __vite_glob_2_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ROC
}, Symbol.toStringTag, { value: "Module" }));
const RSI = "\n// Navy ~ 0.1-lite\n// <ds>Relative Strength Index</ds>\n\n[INDICATOR name=RSI, version=1.0.0]\n\nprop('length', { type: 'integer', def: 14 })\nprop('color', { type: 'color', def: '#3399ff' })\nprop('prec', { type: 'integer', def: 2 })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: 'RSI ' + $props.length,\n    props: {\n        color: $props.color\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nRange(rsi(close, $props.length), this.specs)\n";
const __vite_glob_2_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: RSI
}, Symbol.toStringTag, { value: "Module" }));
const Ribbon = "\n// Navy ~ 0.1-lite\n// <ds>Exponential Moving Average Ribbon</ds>\n\n[INDICATOR name=Ribbon, version=1.0.0]\n\nprop('start', { type: 'integer', def: 10 })\nprop('number', { type: 'integer', def: 5 })\nprop('step', { type: 'integer', def: 10 })\nprop('colors', { type: 'array', def: [\"#3aaaf4ee\"] })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `EMA x ${$props.number}`,\n    props: {\n        colors: $props.colors,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nlet arr = []\nfor (var i = 0; i < $.number; i++) {\n    let l = $.start + i * $.step\n    arr.push(ema(close, l)[0])\n}\n\nSplines(arr, this.specs)\n";
const __vite_glob_2_19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ribbon
}, Symbol.toStringTag, { value: "Module" }));
const SAR = "\n// Navy ~ 0.1-lite\n// <ds>Parabolic SAR</ds>\n\n[INDICATOR name=SAR, version=1.0.0]\n\nprop('start', { type: 'number', def: 0.02 })\nprop('inc', { type: 'number', def: 0.02 })\nprop('max', { type: 'number', def: 0.2 })\nprop('color', { type: 'color', def: '#35a9c6' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nlet $ = $props\nthis.specs = {\n    name: `SAR ${$.start} ${$.inc} ${$.max}`,\n    props: {\n        color: $props.color,\n        shape: 'cross'\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nSparse(sar($.start, $.inc, $.max), this.specs)\n";
const __vite_glob_2_20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SAR
}, Symbol.toStringTag, { value: "Module" }));
const SMA = "\n// Navy ~ 0.1-lite\n// <ds>Simple Moving Average</ds>\n\n[INDICATOR name=SMA, version=1.0.0]\n\nprop('length', { type: 'integer', def: 12 })\nprop('color', { type: 'color', def: '#d1385c' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `SMA ${$props.length}`,\n    props: {\n        color: $props.color,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nSpline(sma(close, $props.length), this.specs)\n";
const __vite_glob_2_21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SMA
}, Symbol.toStringTag, { value: "Module" }));
const SWMA = "\n// Navy ~ 0.1-lite\n// <ds>Symmetrically Weighted Moving Average</ds>\n\n[INDICATOR name=SWMA, version=1.0.0]\n\nprop('color', { type: 'color', def: '#e57440' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `SWMA`,\n    props: {\n        color: $props.color,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nSpline(swma(close), this.specs)\n";
const __vite_glob_2_22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SWMA
}, Symbol.toStringTag, { value: "Module" }));
const Stoch = "\n// Navy ~ 0.1-lite\n// <ds>Stochastic</ds>, format: [<timestamp>, <kLine>, <dLine>]\n\n[OVERLAY name=Stoch, version=1.0.0]\n\nprop('kColor', { type: 'color', def: '#3782f2' })\nprop('dColor', { type: 'color', def: '#f48709' })\nprop('bandColor', { type: 'color', def: '#535559' })\nprop('backColor', { type: 'color', def: '#381e9c16' })\nprop('upperBand', { type: 'number', def: 80 })\nprop('lowerBand', { type: 'number', def: 20 })\n\ndraw(ctx) {\n    const layout = $core.layout\n    const upper = layout.value2y($props.upperBand)\n    const lower = layout.value2y($props.lowerBand)\n    const data = $core.data\n    const view = $core.view\n\n    // K\n    ctx.lineWidth = 1\n    ctx.strokeStyle = $props.kColor\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[1])\n        ctx.lineTo(x, y)\n    }\n    ctx.stroke()\n\n    // D\n    ctx.strokeStyle = $props.dColor\n    ctx.beginPath()\n    for (var i = view.i1, n = view.i2; i <= n; i++) {\n        let p = data[i]\n        let x = layout.ti2x(p[0], i)\n        let y = layout.value2y(p[2])\n        ctx.lineTo(x, y)\n    }\n    ctx.stroke()\n\n    ctx.strokeStyle = $props.bandColor\n    ctx.setLineDash([5]) // Will be removed after draw()\n    ctx.beginPath()\n    // Fill the area between the bands\n    ctx.fillStyle = $props.backColor\n    ctx.fillRect(0, upper, layout.width, lower - upper)\n    // Upper band\n    ctx.moveTo(0, upper)\n    ctx.lineTo(layout.width, upper)\n    // Lower band\n    ctx.moveTo(0, lower)\n    ctx.lineTo(layout.width, lower)\n    ctx.stroke()\n}\n\nyRange(hi, lo) => [\n    Math.max(hi, $props.upperBand),\n    Math.min(lo, $props.lowerBand)\n]\n\n// Legend, defined as pairs [value, color]\nlegend(x) => [[x[1], $props.kColor], [x[1], $props.dColor]]\n\n\n[INDICATOR name=Stoch, version=1.0.0]\n\nprop('paramK', { def: 14 })\nprop('paramD', { def: 3 })\nprop('smooth', { def: 3 })\nprop('kColor', { type: 'color', def: '#3782f2' })\nprop('dColor', { type: 'color', def: '#f48709' })\nprop('prec', { type: 'integer', def: 2 })\nprop('zIndex', { type: 'integer', def: 0 })\n\nlet $ = $props\nthis.specs = {\n    name: `Stoch ${$.paramK} ${$.paramD} ${$.smooth}`,\n    props: {\n        kColor: $props.kColor,\n        dColor: $props.dColor\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nlet k = sma(stoch(close, high, low, $.paramK), $.smooth)\nlet d = sma(k, $.paramD)\nStoch([k[0], d[0]], this.specs)\n";
const __vite_glob_2_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Stoch
}, Symbol.toStringTag, { value: "Module" }));
const TSI = "\n// Navy ~ 0.1-lite\n// <ds>True Strength Index</ds>\n\n[INDICATOR name=TSI, version=1.0.0]\n\nprop('long', { type: 'integer', def: 25 })\nprop('short', { type: 'integer', def: 13 })\nprop('signal', { type: 'integer', def: 13 })\nprop('color1', { type: 'color', def: '#3bb3e4' })\nprop('color2', { type: 'color', def: '#f7046d' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nlet $ = $props\nthis.specs = {\n    name: `TSI ${$.long} ${$.short} ${$.signal}`,\n    props: {\n        colors: [$.color1, $.color2]\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nlet $ = $props\nlet val = tsi(close, $.short, $.long)\nlet sig = ema(val, $.signal)\nSplines([val[0] * 100, sig[0] * 100], this.specs)\n";
const __vite_glob_2_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TSI
}, Symbol.toStringTag, { value: "Module" }));
const VWMA = "\n// Navy ~ 0.1-lite\n// <ds>Volume Weighted Moving Average</ds>\n\n[INDICATOR name=VWMA, version=1.0.0]\n\nprop('length', { type: 'integer', def: 20 })\nprop('color', { type: 'color', def: '#db0670' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `VWMA ${$props.length}`,\n    props: {\n        color: $props.color,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nSpline(vwma(close, $props.length), this.specs)\n";
const __vite_glob_2_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: VWMA
}, Symbol.toStringTag, { value: "Module" }));
const WilliamsR = "\n// Navy ~ 0.1-lite\n// <ds>Williams %R</ds>\n\n[INDICATOR name=WilliamsR, version=1.0.0]\n\nprop('length', { type: 'integer', def: 14 })\nprop('upperBand', { type: 'number', def: -20 })\nprop('lowerBand', { type: 'number', def: -80 })\nprop('color', { type: 'color', def: '#0980e8' })\nprop('backColor', { type: 'color', def: '#9b9ba316' })\nprop('bandColor', { type: 'color', def: '#535559' })\nprop('prec', { type: 'integer', def: autoPrec() })\nprop('zIndex', { type: 'integer', def: 0 })\n\nthis.specs = {\n    name: `%R ${$props.length}`,\n    props: {\n        color: $props.color,\n        backColor: $props.backColor,\n        bandColor: $props.bandColor,\n        upperBand: $props.upperBand,\n        lowerBand: $props.lowerBand,\n    },\n    settings: {\n        precision: $props.prec,\n        zIndex: $props.zIndex\n    }\n}\n\n[UPDATE]\n\nRange(wpr($props.length), this.specs)\n";
const __vite_glob_2_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: WilliamsR
}, Symbol.toStringTag, { value: "Module" }));
var stripComments = { exports: {} };
const compile$1 = (cst, options = {}) => {
  const keepProtected = options.safe === true || options.keepProtected === true;
  let firstSeen = false;
  const walk = (node) => {
    let output = "";
    let inner;
    let lines;
    for (const child of node.nodes) {
      switch (child.type) {
        case "block":
          if (options.first && firstSeen === true) {
            output += walk(child);
            break;
          }
          if (options.preserveNewlines === true) {
            inner = walk(child);
            lines = inner.split("\n");
            output += "\n".repeat(lines.length - 1);
            break;
          }
          if (keepProtected === true && child.protected === true) {
            output += walk(child);
            break;
          }
          firstSeen = true;
          break;
        case "line":
          if (options.first && firstSeen === true) {
            output += child.value;
            break;
          }
          if (keepProtected === true && child.protected === true) {
            output += child.value;
          }
          firstSeen = true;
          break;
        case "open":
        case "close":
        case "text":
        case "newline":
        default: {
          output += child.value || "";
          break;
        }
      }
    }
    return output;
  };
  return walk(cst);
};
var compile_1 = compile$1;
let Node$1 = class Node {
  constructor(node) {
    this.type = node.type;
    if (node.value)
      this.value = node.value;
    if (node.match)
      this.match = node.match;
    this.newline = node.newline || "";
  }
  get protected() {
    return Boolean(this.match) && this.match[1] === "!";
  }
};
let Block$1 = class Block extends Node$1 {
  constructor(node) {
    super(node);
    this.nodes = node.nodes || [];
  }
  push(node) {
    this.nodes.push(node);
  }
  get protected() {
    return this.nodes.length > 0 && this.nodes[0].protected === true;
  }
};
var Node_1 = { Node: Node$1, Block: Block$1 };
var languages$1 = {};
(function(exports) {
  exports.ada = { LINE_REGEX: /^--.*/ };
  exports.apl = { LINE_REGEX: /^⍝.*/ };
  exports.applescript = {
    BLOCK_OPEN_REGEX: /^\(\*/,
    BLOCK_CLOSE_REGEX: /^\*\)/
  };
  exports.csharp = {
    LINE_REGEX: /^\/\/.*/
  };
  exports.haskell = {
    BLOCK_OPEN_REGEX: /^\{-/,
    BLOCK_CLOSE_REGEX: /^-\}/,
    LINE_REGEX: /^--.*/
  };
  exports.javascript = {
    BLOCK_OPEN_REGEX: /^\/\*\*?(!?)/,
    BLOCK_CLOSE_REGEX: /^\*\/(\n?)/,
    LINE_REGEX: /^\/\/(!?).*/
  };
  exports.lua = {
    BLOCK_OPEN_REGEX: /^--\[\[/,
    BLOCK_CLOSE_REGEX: /^\]\]/,
    LINE_REGEX: /^--.*/
  };
  exports.matlab = {
    BLOCK_OPEN_REGEX: /^%{/,
    BLOCK_CLOSE_REGEX: /^%}/,
    LINE_REGEX: /^%.*/
  };
  exports.perl = {
    LINE_REGEX: /^#.*/
  };
  exports.php = {
    ...exports.javascript,
    LINE_REGEX: /^(#|\/\/).*?(?=\?>|\n)/
  };
  exports.python = {
    BLOCK_OPEN_REGEX: /^"""/,
    BLOCK_CLOSE_REGEX: /^"""/,
    LINE_REGEX: /^#.*/
  };
  exports.ruby = {
    BLOCK_OPEN_REGEX: /^=begin/,
    BLOCK_CLOSE_REGEX: /^=end/,
    LINE_REGEX: /^#.*/
  };
  exports.shebang = exports.hashbang = {
    LINE_REGEX: /^#!.*/
  };
  exports.c = exports.javascript;
  exports.csharp = exports.javascript;
  exports.css = exports.javascript;
  exports.java = exports.javascript;
  exports.js = exports.javascript;
  exports.less = exports.javascript;
  exports.pascal = exports.applescript;
  exports.ocaml = exports.applescript;
  exports.sass = exports.javascript;
  exports.sql = exports.ada;
  exports.swift = exports.javascript;
  exports.ts = exports.javascript;
  exports.typscript = exports.javascript;
})(languages$1);
const { Node: Node2, Block: Block2 } = Node_1;
const languages = languages$1;
const constants = {
  ESCAPED_CHAR_REGEX: /^\\./,
  QUOTED_STRING_REGEX: /^(['"`])((?:\\\1|[^\1])*?)(\1)/,
  NEWLINE_REGEX: /^\r*\n/
};
const parse$1 = (input, options = {}) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected input to be a string");
  }
  const cst = new Block2({ type: "root", nodes: [] });
  const stack = [cst];
  const name = (options.language || "javascript").toLowerCase();
  const lang = languages[name];
  if (typeof lang === "undefined") {
    throw new Error(`Language "${name}" is not supported by strip-comments`);
  }
  const { LINE_REGEX, BLOCK_OPEN_REGEX, BLOCK_CLOSE_REGEX } = lang;
  let block = cst;
  let remaining = input;
  let token;
  let prev;
  const source = [BLOCK_OPEN_REGEX, BLOCK_CLOSE_REGEX].filter(Boolean);
  let tripleQuotes = false;
  if (source.every((regex) => regex.source === '^"""')) {
    tripleQuotes = true;
  }
  const consume = (value = remaining[0] || "") => {
    remaining = remaining.slice(value.length);
    return value;
  };
  const scan = (regex, type = "text") => {
    const match = regex.exec(remaining);
    if (match) {
      consume(match[0]);
      return { type, value: match[0], match };
    }
  };
  const push = (node) => {
    if (prev && prev.type === "text" && node.type === "text") {
      prev.value += node.value;
      return;
    }
    block.push(node);
    if (node.nodes) {
      stack.push(node);
      block = node;
    }
    prev = node;
  };
  const pop = () => {
    if (block.type === "root") {
      throw new SyntaxError("Unclosed block comment");
    }
    stack.pop();
    block = stack[stack.length - 1];
  };
  while (remaining !== "") {
    if (token = scan(constants.ESCAPED_CHAR_REGEX, "text")) {
      push(new Node2(token));
      continue;
    }
    if (block.type !== "block" && (!prev || !/\w$/.test(prev.value)) && !(tripleQuotes && remaining.startsWith('"""'))) {
      if (token = scan(constants.QUOTED_STRING_REGEX, "text")) {
        push(new Node2(token));
        continue;
      }
    }
    if (token = scan(constants.NEWLINE_REGEX, "newline")) {
      push(new Node2(token));
      continue;
    }
    if (BLOCK_OPEN_REGEX && options.block && !(tripleQuotes && block.type === "block")) {
      if (token = scan(BLOCK_OPEN_REGEX, "open")) {
        push(new Block2({ type: "block" }));
        push(new Node2(token));
        continue;
      }
    }
    if (BLOCK_CLOSE_REGEX && block.type === "block" && options.block) {
      if (token = scan(BLOCK_CLOSE_REGEX, "close")) {
        token.newline = token.match[1] || "";
        push(new Node2(token));
        pop();
        continue;
      }
    }
    if (LINE_REGEX && block.type !== "block" && options.line) {
      if (token = scan(LINE_REGEX, "line")) {
        push(new Node2(token));
        continue;
      }
    }
    if (token = scan(/^[a-zABD-Z0-9\t ]+/, "text")) {
      push(new Node2(token));
      continue;
    }
    push(new Node2({ type: "text", value: consume(remaining[0]) }));
  }
  return cst;
};
var parse_1 = parse$1;
/*!
 * strip-comments <https://github.com/jonschlinkert/strip-comments>
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */
const compile = compile_1;
const parse = parse_1;
const strip = stripComments.exports = (input, options) => {
  const opts = { ...options, block: true, line: true };
  return compile(parse(input, opts), opts);
};
strip.block = (input, options) => {
  const opts = { ...options, block: true };
  return compile(parse(input, opts), opts);
};
strip.line = (input, options) => {
  const opts = { ...options, line: true };
  return compile(parse(input, opts), opts);
};
strip.first = (input, options) => {
  const opts = { ...options, block: true, line: true, first: true };
  return compile(parse(input, opts), opts);
};
strip.parse = parse;
var stripCommentsExports = stripComments.exports;
const strip$1 = /* @__PURE__ */ getDefaultExportFromCjs(stripCommentsExports);
function decomment(src, file) {
  return strip$1(src);
}
function maskStrings(src, file) {
  let quotes = findStrings(src, file);
  for (var q of quotes) {
    let tmp = src.slice(0, q[0] + 1);
    tmp += src.slice(q[0] + 1, q[1]).replaceAll("/*", "[!C~1!]").replaceAll("//", "[!C~2!]");
    tmp += src.slice(q[1]);
    src = tmp;
  }
  return src;
}
function unmaskStrings(src, file) {
  return src.replaceAll("[!C~1!]", "/*").replaceAll("[!C~2!]", "//");
}
function findStrings(src, file) {
  let count = { "'": 0, '"': 0, "`": 0 };
  let pairs = [];
  let pair = null;
  for (var i = 0; i < src.length; i++) {
    for (var type in count) {
      if (src[i] === type && src[i - 1] !== "\\") {
        count[type]++;
        if (!pair)
          pair = [i, void 0];
      }
      if (src[i] === type && src[i - 1] !== "\\" && i > pair[0]) {
        count[type] = 0;
        if (pair && Object.values(count).every((x) => !x)) {
          pair[1] = i;
          pairs.push(pair);
          pair = null;
        }
      }
      if (count[type] < 0) {
        throw `Missing quote ${type} in ${file}`;
      }
    }
  }
  if (pair !== null) {
    throw `Missing quote in ${file}: ${JSON.stringify(count)}`;
  }
  return pairs;
}
function maskRegex(src, f = btoa) {
  let rex = /\/([^*\/]?.+)\//g;
  do {
    var m = rex.exec(src);
    if (m) {
      let length = m[0].length;
      if (m[1].slice(-1) === "*") {
        length--;
        m[1] = m[1].slice(0, -1);
      }
      let tmp = src.slice(0, m.index + 1);
      let r = f(m[1]);
      tmp += r + src.slice(m.index + length - 1);
      src = tmp;
      rex.lastIndex = m.index + r.length;
    }
  } while (m);
  return src;
}
function findClosingBracket(src, startPos, file, btype = "{}") {
  let open = btype[0];
  let close = btype[1];
  let count = { "'": 0, '"': 0, "`": 0 };
  let count2 = 0;
  let pair = null;
  for (var i = startPos; i < src.length; i++) {
    for (var type in count) {
      if (src[i] === type && src[i - 1] !== "\\") {
        count[type]++;
        if (!pair)
          pair = [i, void 0];
      }
      if (src[i] === type && src[i - 1] !== "\\" && i > pair[0]) {
        count[type] = 0;
        if (pair && Object.values(count).every((x) => !x)) {
          pair[1] = i;
          pair = null;
        }
      }
      if (count[type] < 0) {
        throw `Missing quote ${type} in ${file}`;
      }
    }
    let sum = count["'"] + count['"'] + count["`"];
    if (sum === 0) {
      if (src[i] === open)
        count2++;
      if (src[i] === close)
        count2--;
      if (count2 === 0)
        break;
    }
  }
  if (count2 !== 0) {
    throw `Missing bracket in ${file}: ${btype}`;
  }
  if (pair !== null) {
    throw `Missing quote in ${file}: ${JSON.stringify(count)}`;
  }
  return i;
}
const tools = {
  maskStrings,
  unmaskStrings,
  findStrings,
  maskRegex,
  decomment,
  findClosingBracket
};
const FREGX1 = /(function[\s]+|)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\(([^()]*?)\)[\s]*?{/gmi;
const FREGX2 = /(function[\s]+|)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\(([^()]*?)\)[\s]*?=>[\s]*?{/gmi;
const FREGX3 = /(function[\s]+|)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\(([^()]*?)\)[\s]*?=>/gmi;
const KWORDS = ["if", "for", "while", "switch", "catch", "with"];
class ParserOV {
  constructor(tagProps, src) {
    this.tagProps = this.parseTagProps(tagProps);
    this.src = src;
    this.flags = "";
    this.parseBody();
  }
  parseTagProps(src) {
    let obj = {};
    let pairs = src.split(",");
    for (var p of pairs) {
      let [key, val] = p.split("=");
      obj[key.trim()] = val.trim();
    }
    return obj;
  }
  parseBody() {
    let code = tools.decomment(this.src);
    code = this.prepFuncions1(code);
    code = this.prepFuncions2(code);
    code = this.prepFuncions3(code);
    this.prefab = this.wrapTheCode(code, this.flags);
  }
  // Find all function declarations & replace them with
  // arrow functions (first category: f() {} )
  prepFuncions1(code) {
    let copy = "";
    let i = 0;
    FREGX1.lastIndex = 0;
    do {
      var m = FREGX1.exec(code);
      if (m) {
        m[1].trim();
        let fname = m[2];
        let fargs = m[3];
        let open = FREGX1.lastIndex - 1;
        let close = tools.findClosingBracket(code, open);
        if (!KWORDS.includes(fname)) {
          let block = code.slice(open, close + 1);
          copy += code.slice(i, m.index);
          copy += `var ${fname} = (${fargs}) => ${block}`;
          this.parseFlags(fname, fargs, block);
        } else {
          copy += code.slice(i, close + 1);
        }
        FREGX1.lastIndex = close;
        i = close + 1;
      }
    } while (m);
    return copy + code.slice(i);
  }
  // Find all function declarations & replace them with
  // arrow functions (third category: f() => {})
  prepFuncions2(code) {
    let copy = "";
    let i = 0;
    FREGX2.lastIndex = 0;
    do {
      var m = FREGX2.exec(code);
      if (m) {
        m[1].trim();
        let fname = m[2];
        let fargs = m[3];
        let open = FREGX2.lastIndex - 1;
        let close = tools.findClosingBracket(code, open);
        if (!KWORDS.includes(fname)) {
          let block = code.slice(open, close + 1);
          copy += code.slice(i, m.index);
          copy += `var ${fname} = (${fargs}) => (${block})`;
          this.parseFlags(fname, fargs, block);
        } else {
          copy += code.slice(i, close + 1);
        }
        FREGX2.lastIndex = close;
        i = close + 1;
      }
    } while (m);
    return copy + code.slice(i);
  }
  // Find all function declarations & replace them with
  // arrow functions (third category: f() => Expression)
  prepFuncions3(code) {
    let copy = "";
    let i = 0;
    FREGX3.lastIndex = 0;
    do {
      var m = FREGX3.exec(code);
      if (m) {
        m[1].trim();
        let fname = m[2];
        let fargs = m[3];
        let arrow = FREGX3.lastIndex;
        copy += code.slice(i, m.index);
        copy += `var ${fname} = (${fargs}) => `;
        let block = code.slice(arrow).split("\n")[0].trim();
        this.parseFlags(fname, fargs, block);
        i = arrow + 1;
      }
    } while (m);
    return copy + code.slice(i);
  }
  // Add some flag for the future use (e.g. in layout)
  parseFlags(name, fargs, block) {
    if (name === "yRange") {
      let x = !!fargs.trim().length;
      this.flags += `yRangePreCalc: ${x},
`;
    } else if (name === "legend") {
      if (block === "null" || block === "undefined") {
        this.flags += `noLegend: true,
`;
      }
    }
  }
  // Create a function that returns a new overlay object
  wrapTheCode(code, flags) {
    return new Function("env", `

            // Setup the environment
            let { $core, $props, $events } = env
            let prop = (...args) => env.prop(...args)
            let watchProp = (...args) => env.watchProp(...args)

            // Add primitives
            let $lib = env.lib

            // Function stubs
            var init = () => {}
            var destroy = () => {}
            var meta = () => null
            var dataFormat = () => null
            var draw = () => {}
            var drawSidebar = null
            var drawBotbar = null
            var yRange = null
            var preSampler = null
            var legend = null
            var legendHtml = null
            var valueTracker = null
            var ohlc = null

            // Event handler stubs
            var mousemove = null
            var mouseout = null
            var mouseup = null
            var mousedown = null
            var click = null
            var keyup = null
            var keydown = null
            var keypress = null
            var press = null

            // Overlay code
            ${code}

            // Output overlay object
            return {
                gridId: () => $core.layout.id,
                id: () => $core.id,
                init, destroy, meta, dataFormat,
                draw, drawSidebar, drawBotbar,
                yRange, preSampler,
                legend, legendHtml,
                valueTracker, ohlc,
                mousemove, mouseout, mouseup,
                mousedown, click, keyup, keydown,
                keypress, press,
                // Generated flags
                ${flags}
            }
        `);
  }
}
const SPLIT = /\[[\s]*?UPDATE[\s]*?\]|\[[\s]*?POST[\s]*?\]/gm;
const UPDATE = /\[[\s]*?UPDATE[\s]*?\]([\s\S]*?)(\[POST|\[UPDATE|\[EOF)/gm;
const POST = /\[[\s]*?POST[\s]*?\]([\s\S]*?)(\[POST|\[UPDATE|\[EOF)/gm;
class ParserIND {
  constructor(tagProps, src) {
    this.tagProps = this.parseTagProps(tagProps);
    this.src = src;
    this.parseBody();
  }
  parseTagProps(src) {
    let obj = {};
    let pairs = src.split(",");
    for (var p of pairs) {
      let [key, val] = p.split("=");
      obj[key.trim()] = val.trim();
    }
    return obj;
  }
  parseBody() {
    SPLIT.lastIndex = 0;
    UPDATE.lastIndex = 0;
    POST.lastIndex = 0;
    let code = tools.decomment(this.src);
    this.init = code.split(SPLIT)[0];
    code += "\n[EOF]";
    this.update = (UPDATE.exec(code) || [])[1];
    this.post = (POST.exec(code) || [])[1];
  }
}
const VERSION = 0.1;
const TAG = "lite";
const VERS_REGX = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
const OV_REGX = /\[OVERLAY[\s]+([\s\S]*?)]([\s\S]*?)(\[OVERLAY|\[INDICATOR|\[EOF)/gm;
const IND_REGX = /\[INDICATOR[\s]+([\s\S]*?)]([\s\S]*?)(\[OVERLAY|\[INDICATOR|\[EOF)/gm;
class Parser {
  constructor(src, name = "Unknown Script") {
    this.version = VERSION;
    this.src = src + "\n[EOF]";
    this.scriptName = name;
    this.scriptVers = this.navyVers()[0];
    this.scriptTag = this.navyVers()[1];
    this.overlays = [];
    this.indicators = [];
    if (this.scriptVers === 0) {
      console.warn(`${name}: There is no script version string`);
    }
    if (this.scriptVers > this.version) {
      console.warn(`${name}: Script version > parser version`);
    }
    if (this.scriptTag !== TAG) {
      console.warn(
        `${name}: Script version should have 'lite' tag
Most likely are using the community version of NavyJS
with a script written for the PRO version.
If not the case just use 'lite' tag: ${VERSION}-lite`
      );
    }
    this.overlayTags();
    this.indicatorTags();
  }
  // Parse the version
  navyVers() {
    let first = (this.src.match(VERS_REGX) || [])[0];
    if (first) {
      let pair = first.split("~");
      if (pair.length < 2)
        return [0];
      let vers = parseFloat(pair[1]);
      let tag = pair[1].split("-")[1];
      return [vers === vers ? vers : 0, tag];
    }
    return [0];
  }
  // Parse [OVERLAY] tags
  overlayTags() {
    OV_REGX.lastIndex = 0;
    var match;
    while (match = OV_REGX.exec(this.src)) {
      this.overlays.push(new ParserOV(
        match[1],
        match[2]
      ));
      OV_REGX.lastIndex -= 10;
    }
  }
  // Parse [INDICATOR] tags
  indicatorTags() {
    IND_REGX.lastIndex = 0;
    var match;
    while (match = IND_REGX.exec(this.src)) {
      this.indicators.push(new ParserIND(
        match[1],
        match[2]
      ));
      IND_REGX.lastIndex -= 12;
    }
  }
}
class WebWork {
  constructor(id, chart) {
    this.chart = chart;
    this.tasks = {};
    this.onevent = () => {
    };
    this.start();
  }
  start() {
    if (this.worker)
      this.worker.terminate();
    this.worker = new Worker(new URL("/assets/worker-0fc67022.js", self.location), {
      type: "module"
    });
    this.worker.onmessage = (e) => this.onmessage(e);
  }
  // TODO: Do we need this ???
  startSocket() {
  }
  send(msg, txKeys) {
    if (txKeys) {
      let txObjs = txKeys.map((k) => msg.data[k]);
      this.worker.postMessage(msg, txObjs);
    } else {
      this.worker.postMessage(msg);
    }
  }
  // Send to node.js via websocket
  sendToNode(msg, txKeys) {
  }
  onmessage(e) {
    if (e.data.id in this.tasks) {
      this.tasks[e.data.id](e.data.data);
      delete this.tasks[e.data.id];
    } else {
      this.onevent(e);
    }
  }
  // Execute a task
  async exec(type, data2, txKeys) {
    return new Promise((rs, rj) => {
      let id = Utils.uuid();
      this.send({ type, id, data: data2 }, txKeys);
      this.tasks[id] = (res) => {
        rs(res);
      };
    });
  }
  // Execute a task, but just fucking do it,
  // do not wait for the result
  just(type, data2, txKeys) {
    let id = Utils.uuid();
    this.send({ type, id, data: data2 }, txKeys);
  }
  // Relay an event from iframe postMessage
  // (for the future)
  async relay(event2, just = false) {
    return new Promise((rs, rj) => {
      this.send(event2, event2.txKeys);
      if (!just) {
        this.tasks[event2.id] = (res) => {
          rs(res);
        };
      }
    });
  }
  stop() {
    if (this.worker)
      this.worker.terminate();
  }
}
let instances$1 = {};
function instance$e(id, chart) {
  if (!instances$1[id]) {
    instances$1[id] = new WebWork(id, chart);
  }
  return instances$1[id];
}
const WebWork$1 = { instance: instance$e };
const Overlays = /* @__PURE__ */ Object.assign({
  "../scripts/ArrowTrades.navy": __vite_glob_0_0,
  "../scripts/Band.navy": __vite_glob_0_1,
  "../scripts/CandlesPlus.navy": __vite_glob_0_2,
  "../scripts/Cloud.navy": __vite_glob_0_3,
  "../scripts/Histogram.navy": __vite_glob_0_4,
  "../scripts/PriceLabels.navy": __vite_glob_0_5,
  "../scripts/Range.navy": __vite_glob_0_6,
  "../scripts/Sparse.navy": __vite_glob_0_7,
  "../scripts/Splines.navy": __vite_glob_0_8,
  "../scripts/SuperBands.navy": __vite_glob_0_9,
  "../scripts/Trades.navy": __vite_glob_0_10,
  "../scripts/Volume.navy": __vite_glob_0_11,
  "../scripts/VolumeDelta.navy": __vite_glob_0_12,
  "../scripts/area.navy": __vite_glob_0_13,
  "../scripts/candles.navy": __vite_glob_0_14,
  "../scripts/spline.navy": __vite_glob_0_15
});
const Tools = /* @__PURE__ */ Object.assign({
  "../scripts/tools/RangeTool.navy": __vite_glob_1_0
});
const Indicators = /* @__PURE__ */ Object.assign({
  "../scripts/indicators/ALMA.navy": __vite_glob_2_0,
  "../scripts/indicators/ATR.navy": __vite_glob_2_1,
  "../scripts/indicators/ATRp.navy": __vite_glob_2_2,
  "../scripts/indicators/BB.navy": __vite_glob_2_3,
  "../scripts/indicators/BBW.navy": __vite_glob_2_4,
  "../scripts/indicators/CCI.navy": __vite_glob_2_5,
  "../scripts/indicators/CMO.navy": __vite_glob_2_6,
  "../scripts/indicators/COG.navy": __vite_glob_2_7,
  "../scripts/indicators/DMI.navy": __vite_glob_2_8,
  "../scripts/indicators/EMA.navy": __vite_glob_2_9,
  "../scripts/indicators/HMA.navy": __vite_glob_2_10,
  "../scripts/indicators/Ichimoku.navy": __vite_glob_2_11,
  "../scripts/indicators/KC.navy": __vite_glob_2_12,
  "../scripts/indicators/KCW.navy": __vite_glob_2_13,
  "../scripts/indicators/MACD.navy": __vite_glob_2_14,
  "../scripts/indicators/MFI.navy": __vite_glob_2_15,
  "../scripts/indicators/MOM.navy": __vite_glob_2_16,
  "../scripts/indicators/ROC.navy": __vite_glob_2_17,
  "../scripts/indicators/RSI.navy": __vite_glob_2_18,
  "../scripts/indicators/Ribbon.navy": __vite_glob_2_19,
  "../scripts/indicators/SAR.navy": __vite_glob_2_20,
  "../scripts/indicators/SMA.navy": __vite_glob_2_21,
  "../scripts/indicators/SWMA.navy": __vite_glob_2_22,
  "../scripts/indicators/Stoch.navy": __vite_glob_2_23,
  "../scripts/indicators/TSI.navy": __vite_glob_2_24,
  "../scripts/indicators/VWMA.navy": __vite_glob_2_25,
  "../scripts/indicators/WilliamsR.navy": __vite_glob_2_26
});
class Scripts {
  constructor(id) {
    this.ww = WebWork$1.instance(id);
  }
  async init(srcs) {
    this.srcLib = Object.values(Overlays).map((x) => x.default);
    this.srcLib.push(...Object.values(Tools).map((x) => x.default));
    this.srcLib.push(...Object.values(Indicators).map((x) => x.default));
    this.srcLib.push(...srcs);
    this.prefabs = {};
    this.iScripts = {};
    this.parse();
    this.ww.exec("upload-scripts", {
      // Removing make() functions
      prefabs: Object.keys(this.prefabs).reduce((a, k) => {
        a[k] = {
          name: this.prefabs[k].name,
          author: this.prefabs[k].author,
          version: this.prefabs[k].version
        };
        return a;
      }, {}),
      iScripts: this.iScripts
    });
  }
  parse() {
    this.prefabs = {};
    for (var s of this.srcLib) {
      let parser = new Parser(s);
      for (var ov of parser.overlays) {
        this.prefabs[ov.tagProps.name] = {
          name: ov.tagProps.name,
          author: ov.tagProps.author,
          version: ov.tagProps.version,
          ctx: ov.tagProps.ctx || "Canvas",
          make: ov.prefab
        };
      }
      for (var ind of parser.indicators) {
        this.iScripts[ind.tagProps.name] = {
          name: ind.tagProps.name,
          author: ind.tagProps.author,
          version: ind.tagProps.version,
          code: {
            init: ind.init,
            update: ind.update,
            post: ind.post
          }
        };
      }
    }
  }
}
let instances = {};
function instance$d(id) {
  if (!instances[id]) {
    instances[id] = new Scripts(id);
  }
  return instances[id];
}
const Scripts$1 = { instance: instance$d };
Const.HPX;
class Candle {
  constructor(core, props, ctx, data2) {
    this.ctx = ctx;
    this.core = core;
    this.style = data2.src[6] || props;
    this.draw(data2);
  }
  draw(data2) {
    const green = data2.src[4] >= data2.src[1];
    const bodyColor = green ? this.style.colorCandleUp : this.style.colorCandleDw;
    const wickColor = green ? this.style.colorWickUp : this.style.colorWickDw;
    let w = Math.max(data2.w, 1);
    let x05 = data2.x - 1;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = wickColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x05, Math.floor(data2.h));
    this.ctx.lineTo(x05, Math.floor(data2.l));
    this.ctx.stroke();
    this.ctx.lineWidth = w;
    this.ctx.strokeStyle = bodyColor;
    this.ctx.beginPath();
    this.ctx.moveTo(
      x05,
      Math.floor(Math.min(data2.o, data2.c))
    );
    this.ctx.lineTo(
      x05,
      Math.floor(Math.max(data2.o, data2.c)) + (data2.o === data2.c ? 1 : 0)
    );
    this.ctx.stroke();
  }
}
function candleBody(ctx, data2) {
  let x05 = data2.x - 1;
  ctx.moveTo(
    x05,
    Math.floor(Math.min(data2.o - 1, data2.c - 1))
  );
  ctx.lineTo(
    x05,
    Math.floor(Math.max(data2.o, data2.c))
    //+ (data.o === data.c ? 1 : 0)
  );
}
function candleWick(ctx, data2) {
  let x05 = data2.x - 1;
  ctx.moveTo(x05, Math.floor(data2.h));
  ctx.lineTo(x05, Math.floor(data2.l));
}
const HPX$6 = Const.HPX;
function volumeBar(ctx, data2, layout) {
  let y0 = layout.height;
  let w = Math.max(1, data2.x2 - data2.x1 + HPX$6);
  let h = data2.h;
  let x05 = (data2.x2 + data2.x1) * 0.5;
  ctx.lineWidth = w;
  ctx.moveTo(x05, y0 - h);
  ctx.lineTo(x05, y0);
}
const HPX$5 = Const.HPX;
class VolbarExt {
  constructor(core, props, ctx, data2) {
    this.ctx = ctx;
    this.style = data2.src[6] || props;
    this.layout = core.layout;
    this.draw(data2);
  }
  draw(data2) {
    let y0 = this.layout.height;
    let w = data2.x2 - data2.x1;
    let h = Math.floor(data2.h);
    this.ctx.fillStyle = data2.green ? this.style.colorVolUp : this.style.colorVolDw;
    this.ctx.fillRect(
      Math.floor(data2.x1),
      Math.floor(y0 - h + HPX$5),
      Math.floor(w),
      Math.floor(h + 1)
    );
  }
}
const HPX$4 = Const.HPX;
function layoutCnv(core, $c = true, $v = true, vIndex = 5, dirIndex, vScale) {
  let config = core.props.config;
  let interval = core.props.interval;
  let data2 = core.data;
  let ti2x = core.layout.ti2x;
  let layout = core.layout;
  let view = core.view;
  let upBodies = [];
  let dwBodies = [];
  let upWicks = [];
  let dwWicks = [];
  let upVolbars = [];
  let dwVolbars = [];
  if ($v) {
    var volScale = vScale != null ? vScale : config.VOLSCALE;
    var maxv = maxVolume(core.dataSubset, vIndex);
    var vs = volScale * layout.height / maxv;
  }
  var x1, x2, mid, prev = void 0;
  let { A, B, pxStep } = layout;
  let w = pxStep * config.CANDLEW;
  let splitter = pxStep > 5 ? 1 : 0;
  for (var i = view.i1, n = view.i2; i <= n; i++) {
    let p = data2[i];
    let green = dirIndex ? p[dirIndex] > 0 : p[4] >= p[1];
    mid = ti2x(p[0], i) + 1;
    if (data2[i - 1] && p[0] - data2[i - 1][0] > interval) {
      prev = null;
    }
    if ($c) {
      let candle = {
        x: mid,
        w,
        o: Math.floor(p[1] * A + B),
        h: Math.floor(p[2] * A + B),
        l: Math.floor(p[3] * A + B),
        c: Math.floor(p[4] * A + B),
        green,
        src: p
      };
      if (green) {
        upBodies.push(candle);
        upWicks.push(candle);
      } else {
        dwBodies.push(candle);
        dwWicks.push(candle);
      }
    }
    if ($v) {
      x1 = prev || Math.floor(mid - pxStep * 0.5);
      x2 = Math.floor(mid + pxStep * 0.5) + HPX$4;
      let volbar = {
        x1,
        x2,
        h: p[vIndex] * vs,
        green,
        src: p
      };
      if (green) {
        upVolbars.push(volbar);
      } else {
        dwVolbars.push(volbar);
      }
    }
    prev = x2 + splitter;
  }
  return {
    upBodies,
    upWicks,
    dwBodies,
    dwWicks,
    upVolbars,
    dwVolbars,
    maxVolume: maxv,
    volScale: vs
  };
}
function maxVolume(data2, index) {
  let max = 0;
  for (var i = 0; i < data2.length; i++) {
    let val = data2[i][index];
    if (val > max)
      max = val;
  }
  return max;
}
function fastSma(data2, di, i0, iN, length) {
  let acc = 0;
  let out = [];
  let counter = 0;
  let mult = 1 / length;
  let start = Math.max(i0 - length, 0);
  for (var i = start; i <= iN; i++) {
    acc += data2[i][di];
    counter++;
    if (counter > length) {
      acc -= data2[i - length][di];
      counter--;
    }
    if (counter === length) {
      out.push([data2[i][0], acc * mult]);
    }
  }
  return out;
}
function candleColor(props, candle = []) {
  if (candle[4] >= candle[1]) {
    return props.colorBodyUp;
  } else {
    return props.colorBodyDw;
  }
}
function rescaleFont(fontString, newSize) {
  let pair = fontString.split("px");
  return newSize + "px" + pair[1];
}
function avgVolume(ctx, core, props, cnv, vIndex = 5) {
  let i1 = core.view.i1;
  let i2 = core.view.i2;
  let len = props.avgVolumeSMA;
  let sma = fastSma(core.data, vIndex, i1, i2, len);
  let layout = core.layout;
  cnv.maxVolume;
  let vs = cnv.volScale;
  let h = layout.height;
  core.props.config.VOLSCALE * 0.5 * h;
  ctx.lineJoin = "round";
  ctx.lineWidth = 0.75;
  ctx.strokeStyle = props.colorAvgVol;
  ctx.beginPath();
  if (core.layout.indexBased)
    return;
  let offset = core.data.length - sma.length;
  for (var i = 0, n = sma.length; i < n; i++) {
    let x = layout.ti2x(sma[i][0], i + offset);
    let y = h - sma[i][1] * vs;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function roundRect$2(ctx, x, y, width, height, radius, fill = true, stroke) {
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
function drawArrow(context, fromX, fromY, toX, toY, color, head = true) {
  const headLength = 7;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  if (head) {
    context.moveTo(toX, toY);
    context.lineTo(toX - headLength * Math.cos(angle - Math.PI / 5), toY - headLength * Math.sin(angle - Math.PI / 5));
    context.moveTo(toX, toY);
    context.lineTo(toX - headLength * Math.cos(angle + Math.PI / 5), toY - headLength * Math.sin(angle + Math.PI / 5));
  }
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.stroke();
}
const formatCash = Utils.formatCash;
class OverlayEnv {
  // TODO: auto update on prop/data change
  constructor(id, ovSrc, layout, props) {
    let hub = DataHub$1.instance(props.id);
    let meta = MetaHub$1.instance(props.id);
    let events = Events$1.instance(props.id);
    let scan = DataScan.instance(props.id);
    this.ovSrc = ovSrc;
    this.overlay = null;
    this.id = id;
    this.handlers = {};
    this.$core = { hub, meta, scan };
    this.update(ovSrc, layout, props);
    this.$props = ovSrc.props;
    this.$events = events;
    this.lib = {
      Candle,
      Volbar: VolbarExt,
      layoutCnv,
      formatCash,
      candleBody,
      candleWick,
      volumeBar,
      fastSma,
      avgVolume,
      candleColor,
      roundRect: roundRect$2,
      rescaleFont,
      drawArrow,
      Utils
    };
  }
  // Defines new property
  prop(name, obj = {}) {
    if (!(name in this.$props)) {
      this.$props[name] = obj.def;
    }
  }
  // Update evnironment variables
  update(overlay, layout, props) {
    if (!layout)
      return;
    let core = this.$core;
    core.layout = this.buildLayout(
      layout,
      props.range,
      overlay
    );
    core.dataSubset = overlay.dataSubset;
    core.data = overlay.data;
    core.view = overlay.dataView;
    core.id = overlay.id;
    core.paneId = core.layout.id;
    core.uuid = overlay.uuid;
    core.range = props.range;
    core.colors = props.colors;
    core.cursor = props.cursor;
    core.src = overlay;
    core.props = props;
    core.indexOffset = overlay.indexOffset;
  }
  // Build the final layout API by merging
  // the selected scale to the rest layout
  // variables
  buildLayout(layout, range, overlay) {
    let obj = {};
    this.scaleId = /*this.scaleId !== undefined ?
    this.scaleId :*/
    this.getScaleId(layout);
    let s = layout.scales[this.scaleId];
    return layoutFn(
      Object.assign(obj, layout, s),
      range,
      overlay
    );
  }
  // Get the scale id of this overlay
  getScaleId(layout) {
    let scales = layout.scales;
    for (var i in scales) {
      let ovIdxs = scales[i].scaleSpecs.ovIdxs;
      if (ovIdxs.includes(this.id)) {
        return i;
      }
    }
  }
  watchProp(propName, handler) {
    this.handlers[propName] = this.handlers[propName] || [];
    this.handlers[propName].push(handler);
    let oldValue = this.$props[propName];
    delete this.$props[propName];
    Object.defineProperty(this.$props, propName, {
      get: () => oldValue,
      set: (newValue) => {
        let tmp = oldValue;
        oldValue = newValue;
        for (let handler2 of this.handlers[propName]) {
          handler2(newValue, tmp);
        }
      },
      enumerable: true,
      configurable: true
    });
  }
  destroy() {
    for (let prop in this.handlers) {
      let value = this.$props[prop];
      delete this.$props[prop];
      this.$props[prop] = value;
    }
    this.handlers = {};
  }
}
class Layer {
  constructor(id, name, nvId) {
    this.id = id;
    this.nvId = nvId;
    this.name = name;
    this.zIndex = 0;
    this.overlay = null;
    this.ovSrc = null;
    this.env = null;
    this.ctxType = null;
    this.display = true;
    this.opacity = void 0;
  }
  update() {
    var _a;
    if (!this.ovSrc)
      return;
    this.display = (_a = this.ovSrc.settings.display) != null ? _a : true;
  }
}
class FrameAnimation {
  constructor(cb) {
    this.t0 = this.t = Utils.now();
    this.id = setInterval(() => {
      if (Utils.now() - this.t > 100)
        return;
      if (Utils.now() - this.t0 > 1200) {
        this.stop();
      }
      if (this.id)
        cb(this);
      this.t = Utils.now();
    }, 16);
  }
  stop() {
    clearInterval(this.id);
    this.id = null;
  }
}
let recentEventFrom = "key";
let recentFocusFrom = recentEventFrom;
let recentTouch = false;
let recentMouse = false;
let recentWindowFocus = false;
let recentTouchTimeoutId;
const setRecentEventFromTouch = (touchDelay) => {
  recentTouch = true;
  recentEventFrom = "touch";
  window.clearTimeout(recentTouchTimeoutId);
  recentTouchTimeoutId = window.setTimeout(() => {
    recentTouch = false;
  }, touchDelay);
};
let recentMouseTimeoutId;
const setRecentEventFromMouse = () => {
  recentMouse = true;
  recentEventFrom = "mouse";
  window.clearTimeout(recentMouseTimeoutId);
  recentMouseTimeoutId = window.setTimeout(() => {
    recentMouse = false;
  }, 200);
};
const handleTouchEvent = (touchDelay) => () => setRecentEventFromTouch(touchDelay);
const handlePointerEvent = (touchDelay) => (e) => {
  switch (e.pointerType) {
    case "mouse":
      setRecentEventFromMouse();
      break;
    case "pen":
    case "touch":
      setRecentEventFromTouch(touchDelay);
      break;
  }
};
const handleMouseEvent = () => {
  if (!recentTouch) {
    setRecentEventFromMouse();
  }
};
const handleKeyEvent = () => {
  recentEventFrom = "key";
};
let recentWindowFocusTimeoutId;
const handleWindowFocusEvent = (e) => {
  if (e.target === window || e.target === document) {
    recentWindowFocus = true;
    window.clearTimeout(recentWindowFocusTimeoutId);
    recentWindowFocusTimeoutId = window.setTimeout(() => {
      recentWindowFocus = false;
    }, 300);
  }
};
const handleDocumentFocusEvent = () => {
  if (!recentWindowFocus || recentMouse || recentTouch) {
    recentFocusFrom = recentEventFrom;
  }
};
const listenerOptions = { capture: true, passive: true };
const documentListeners = [
  ["touchstart", handleTouchEvent(750)],
  ["touchend", handleTouchEvent(300)],
  ["touchcancel", handleTouchEvent(300)],
  ["pointerenter", handlePointerEvent(300)],
  ["pointerover", handlePointerEvent(300)],
  ["pointerout", handlePointerEvent(300)],
  ["pointerleave", handlePointerEvent(300)],
  ["pointerdown", handlePointerEvent(750)],
  ["pointerup", handlePointerEvent(300)],
  ["pointercancel", handlePointerEvent(300)],
  ["mouseenter", handleMouseEvent],
  ["mouseover", handleMouseEvent],
  ["mouseout", handleMouseEvent],
  ["mouseleave", handleMouseEvent],
  ["mousedown", handleMouseEvent],
  ["mouseup", handleMouseEvent],
  ["keydown", handleKeyEvent],
  ["keyup", handleKeyEvent],
  ["focus", handleDocumentFocusEvent]
];
if (typeof window !== "undefined" && typeof document !== "undefined") {
  documentListeners.forEach(([eventName, eventHandler]) => {
    document.addEventListener(eventName, eventHandler, listenerOptions);
  });
  window.addEventListener("focus", handleWindowFocusEvent, listenerOptions);
}
const eventFrom = (event2) => {
  switch (event2.pointerType) {
    case "mouse":
      setRecentEventFromMouse();
      break;
    case "pen":
    case "touch":
      if (!recentTouch) {
        setRecentEventFromTouch(300);
      } else {
        recentEventFrom = "touch";
      }
      break;
  }
  if (/mouse/.test(event2.type) && !recentTouch) {
    setRecentEventFromMouse();
  }
  if (/touch/.test(event2.type)) {
    if (!recentTouch) {
      setRecentEventFromTouch(300);
    } else {
      recentEventFrom = "touch";
    }
  }
  if (/focus/.test(event2.type)) {
    return recentFocusFrom;
  }
  return recentEventFrom;
};
let mDownStart = 0;
let blockNextClick = false;
class Input {
  async setup(comp) {
    this.MIN_ZOOM = comp.props.config.MIN_ZOOM;
    this.MAX_ZOOM = comp.props.config.MAX_ZOOM;
    if (Utils.isMobile)
      this.MIN_ZOOM *= 0.5;
    this.canvas = comp.canvas;
    this.ctx = comp.ctx;
    this.props = comp.props;
    this.layout = comp.layout;
    this.rrId = comp.rrUpdId;
    this.gridUpdId = comp.gridUpdId;
    this.gridId = comp.id;
    this.cursor = {};
    this.oldMeta = {};
    this.range = this.props.range;
    this.interval = this.props.interval;
    this.offsetX = 0;
    this.offsetY = 0;
    this.deltas = 0;
    this.wmode = this.props.config.SCROLL_WHEEL;
    this.hub = DataHub$1.instance(this.props.id);
    this.meta = MetaHub$1.instance(this.props.id);
    this.events = Events$1.instance(this.props.id);
    await this.listeners();
    this.mouseEvents("addEventListener");
  }
  mouseEvents(cmd) {
    ["mousemove", "mouseout", "mouseup", "mousedown", "click"].forEach((e) => {
      if (cmd === "addEventListener") {
        this["_" + e] = this[e].bind(this);
      }
      this.canvas[cmd](e, this["_" + e]);
    });
  }
  async listeners() {
    const Hamster = await import("./hamster-d98ab3ff.js").then((n) => n.h);
    const Hammer = await import("./hammer-f2b9e56a.js").then((n) => n.h);
    this.hm = Hamster.default(this.canvas);
    this.hm.wheel((event2, delta) => this.mousezoom(-delta * 50, event2));
    let mc = this.mc = new Hammer.Manager(this.canvas);
    let T = Utils.isMobile ? 10 : 0;
    mc.add(new Hammer.Pan({ threshold: T }));
    mc.add(new Hammer.Tap());
    mc.add(new Hammer.Pinch({ threshold: 0 }));
    mc.get("pinch").set({ enable: true });
    mc.add(new Hammer.Press());
    mc.on("tap", (event2) => {
      if (!Utils.isMobile)
        return;
      this.calcOffset();
      this.emitCursorCoord(event2, { mode: "aim" });
      this.simulateClick(event2);
      if (this.fade)
        this.fade.stop();
      this.events.emit("cursor-changed", {
        mode: "explore"
      });
      this.events.emitSpec(this.rrId, "update-rr");
    });
    mc.on("press", (event2) => {
      event2.from = eventFrom(event2);
      this.calcOffset();
      this.emitCursorCoord(event2, { mode: "aim" });
      this.simulateMousedown(event2);
      this.events.emit("press", event2);
      console.log("Press event");
      this.events.emitSpec(this.rrId, "update-rr");
    });
    mc.on("panstart", (event2) => {
      event2.from = eventFrom(event2);
      if (this.cursor.mode === "aim") {
        return this.emitCursorCoord(event2);
      }
      let scaleId = this.layout.scaleIndex;
      let tfrm = this.meta.getYtransform(this.gridId, scaleId);
      this.drug = {
        x: event2.center.x + this.offsetX,
        y: event2.center.y + this.offsetY,
        r: this.range.slice(),
        t: this.range[1] - this.range[0],
        o: tfrm ? tfrm.offset || 0 : 0,
        y_r: tfrm && tfrm.range ? tfrm.range.slice() : void 0,
        B: this.layout.B,
        t0: Utils.now()
      };
      this.events.emit("cursor-changed", {
        gridId: this.gridId,
        x: event2.center.x + this.offsetX,
        y: event2.center.y + this.offsetY
      });
    });
    mc.on("panmove", (event2) => {
      if (Utils.isMobile) {
        this.calcOffset();
        this.emitCursorCoord(event2, { mode: "aim" });
        this.simulateMousemove(event2);
      }
      if (this.fade)
        this.fade.stop();
      if (this.props.cursor.scroll_lock)
        return;
      {
        this.mousedrag(
          this.drug.x + event2.deltaX,
          this.drug.y + event2.deltaY
        );
      }
      this.events.emitSpec(this.rrId, "update-rr");
    });
    mc.on("panend", (event2) => {
      if (!Utils.isMobile)
        return;
      this.calcOffset();
      this.emitCursorCoord(event2, { mode: "aim" });
      this.simulateMouseup(event2);
      if (this.drug) {
        this.panFade(event2);
        this.drug = null;
      }
      this.events.emitSpec(this.rrId, "update-rr");
    });
    mc.on("pinchstart", () => {
      this.drug = null;
      this.pinch = {
        t: this.range[1] - this.range[0],
        r: this.range.slice()
      };
    });
    mc.on("pinchend", () => {
      this.pinch = null;
    });
    mc.on("pinch", (event2) => {
      if (this.pinch)
        this.pinchZoom(event2.scale);
    });
    let add = this.canvas.addEventListener;
    add("gesturestart", this.gesturestart);
    add("gesturechange", this.gesturechange);
    add("gestureend", this.gestureend);
  }
  gesturestart(event2) {
    event2.preventDefault();
  }
  gesturechange(event2) {
    event2.preventDefault();
  }
  gestureend(event2) {
    event2.preventDefault();
  }
  click(event2) {
    if (blockNextClick) {
      blockNextClick = false;
      return;
    }
    event2.from = eventFrom(event2);
    if (event2.from !== "mouse")
      return;
    this.events.emit("click", event2);
    this.propagate("click", event2);
  }
  simulateClick(event2) {
    if (blockNextClick) {
      blockNextClick = false;
      return;
    }
    event2.from = eventFrom(event2);
    if (event2.from === "mouse")
      return;
    this.events.emit("click", this.touch2mouse(event2));
    this.propagate("click", this.touch2mouse(event2));
  }
  mousemove(event2) {
    event2.from = eventFrom(event2);
    if (event2.from !== "mouse")
      return;
    this.events.emit("cursor-changed", {
      visible: true,
      gridId: this.gridId,
      x: event2.layerX,
      y: event2.layerY - 1
      // Align with the crosshair
    });
    this.calcOffset();
    this.events.emit("mousemove", event2);
    this.propagate("mousemove", event2);
  }
  simulateMousemove(event2) {
    event2.from = eventFrom(event2);
    if (event2.from === "mouse")
      return;
    this.events.emit("mousemove", this.touch2mouse(event2));
    this.propagate("mousemove", this.touch2mouse(event2));
  }
  mouseout(event2) {
    event2.from = eventFrom(event2);
    if (event2.from !== "mouse")
      return;
    this.events.emit("cursor-changed", { visible: false });
    this.propagate("mouseout", event2);
  }
  mouseup(event2) {
    event2.from = eventFrom(event2);
    if (event2.from !== "mouse")
      return;
    this.drug = null;
    if (Date.now() - mDownStart > 750)
      blockNextClick = true;
    this.events.emit("mouseup", false);
    this.propagate("mouseup", event2);
  }
  simulateMouseup(event2) {
    event2.from = eventFrom(event2);
    if (event2.from === "mouse")
      return;
    this.drug = null;
    this.events.emit("mouseup", this.touch2mouse(event2));
    this.propagate("mouseup", this.touch2mouse(event2));
  }
  mousedown(event2) {
    event2.from = eventFrom(event2);
    if (event2.from !== "mouse")
      return;
    if (event2.defaultPrevented)
      return;
    mDownStart = Date.now();
    this.events.emit("mousedown", event2);
    this.propagate("mousedown", event2);
  }
  simulateMousedown(event2) {
    event2.from = eventFrom(event2);
    if (event2.from === "mouse")
      return;
    mDownStart = Date.now();
    this.events.emit("mousedown", this.touch2mouse(event2));
    this.propagate("mousedown", this.touch2mouse(event2));
  }
  mousedrag(x, y) {
    event.from = eventFrom(event);
    let dt = this.drug.t * (this.drug.x - x) / this.layout.width;
    let d$ = this.layout.$hi - this.layout.$lo;
    d$ *= (this.drug.y - y) / this.layout.height;
    let offset = this.drug.o + d$;
    let ls = this.layout.settings.logScale;
    if (ls && this.drug.y_r) {
      let dy = this.drug.y - y;
      var range = this.drug.y_r.slice();
      range[0] = math.exp((0 - this.drug.B + dy) / this.layout.A);
      range[1] = math.exp(
        (this.layout.height - this.drug.B + dy) / this.layout.A
      );
    }
    let scaleId = this.layout.scaleIndex;
    let yTransform = this.meta.getYtransform(this.gridId, scaleId);
    if (this.drug.y_r && yTransform && !yTransform.auto) {
      this.events.emit("sidebar-transform", {
        gridId: this.gridId,
        scaleId,
        range: ls ? range || this.drug.y_r : [
          this.drug.y_r[0] - offset,
          this.drug.y_r[1] - offset
        ]
      });
    }
    this.range[0] = this.drug.r[0] + dt;
    this.range[1] = this.drug.r[1] + dt;
    this.changeRange();
  }
  mousezoom(delta, event2) {
    var _a;
    event2.from = eventFrom(event2);
    if (this.wmode !== "pass") {
      if (this.wmode === "click" && !this.oldMeta.activated) {
        return;
      }
      event2.originalEvent.preventDefault();
      event2.preventDefault();
    }
    event2.deltaX = event2.deltaX || Utils.getDeltaX(event2);
    event2.deltaY = event2.deltaY || Utils.getDeltaY(event2);
    if (Math.abs(event2.deltaX) > 0) {
      this.trackpad = true;
      if (Math.abs(event2.deltaX) >= Math.abs(event2.deltaY)) {
        delta *= 0.1;
      }
      this.trackpadScroll(event2);
    }
    if (this.trackpad)
      delta *= 0.032;
    delta = Utils.smartWheel(delta);
    const dpr2 = (_a = window.devicePixelRatio) != null ? _a : 1;
    let data2 = this.hub.mainOv.dataSubset;
    if (delta < 0 && data2.length <= this.MIN_ZOOM)
      return;
    if (delta > 0 && data2.length > this.MAX_ZOOM)
      return;
    let k = this.interval / 1e3;
    let diff = delta * k * data2.length;
    let tl = this.props.config.ZOOM_MODE === "tl";
    if (event2.originalEvent.ctrlKey || tl) {
      let offset = event2.originalEvent.offsetX;
      let diff1 = offset / (this.canvas.width / dpr2 - 1) * diff;
      let diff2 = diff - diff1;
      this.range[0] -= diff1;
      this.range[1] += diff2;
    } else {
      this.range[0] -= diff;
    }
    if (tl) {
      let offset = event2.originalEvent.offsetY;
      let diff1 = offset / (this.canvas.height / dpr2 - 1) * 2;
      let diff2 = 2 - diff1;
      let z = diff / (this.range[1] - this.range[0]);
      this.events.emit("rezoom-range", {
        gridId: this.gridId,
        z,
        diff1,
        diff2
      });
    }
    this.changeRange();
  }
  pinchZoom(scale) {
    let data2 = this.hub.mainOv.dataSubset;
    if (scale > 1 && data2.length <= this.MIN_ZOOM)
      return;
    if (scale < 1 && data2.length > this.MAX_ZOOM)
      return;
    let t = this.pinch.t;
    let nt = t * 1 / scale;
    this.range[0] = this.pinch.r[0] - (nt - t) * 0.5;
    this.range[1] = this.pinch.r[1] + (nt - t) * 0.5;
    this.changeRange();
  }
  trackpadScroll(event2) {
    let dt = this.range[1] - this.range[0];
    this.range[0] += event2.deltaX * dt * 0.011;
    this.range[1] += event2.deltaX * dt * 0.011;
    this.changeRange();
  }
  calcOffset() {
    let rect = this.canvas.getBoundingClientRect();
    this.offsetX = -rect.x;
    this.offsetY = -rect.y;
  }
  // Convert touch to "mouse" event
  touch2mouse(e) {
    this.calcOffset();
    return {
      original: e.srcEvent,
      layerX: e.center.x + this.offsetX,
      layerY: e.center.y + this.offsetY,
      preventDefault: function() {
        this.original.preventDefault();
      }
    };
  }
  emitCursorCoord(event2, add = {}) {
    this.events.emit("cursor-changed", Object.assign({
      gridId: this.gridId,
      x: event2.center.x + this.offsetX,
      y: event2.center.y + this.offsetY
      //+ this.layout.offset
    }, add));
  }
  panFade(event2) {
    let dt = Utils.now() - this.drug.t0;
    let dx = this.range[1] - this.drug.r[1];
    let v = 42 * dx / dt;
    let v0 = Math.abs(v * 0.01);
    if (dt > 500)
      return;
    if (this.fade)
      this.fade.stop();
    this.fade = new FrameAnimation((self2) => {
      v *= 0.85;
      if (Math.abs(v) < v0) {
        self2.stop();
      }
      this.range[0] += v;
      this.range[1] += v;
      this.changeRange();
    });
  }
  changeRange() {
    let data2 = this.hub.mainOv.data;
    if (!this.range.length || data2.length < 2)
      return;
    let l = data2.length - 1;
    let range = this.range;
    let layout = this.layout;
    range[0] = Utils.clamp(
      range[0],
      -Infinity,
      layout.ti(data2[l][0], l) - this.interval * 5.5
    );
    range[1] = Utils.clamp(
      range[1],
      layout.ti(data2[0][0], 0) + this.interval * 5.5,
      Infinity
    );
    this.events.emit("range-changed", range);
  }
  propagate(name, event2) {
    this.events.emitSpec(this.gridUpdId, "propagate", {
      name,
      event: event2
    });
  }
  destroy() {
    let rm = this.canvas.removeEventListener;
    rm("gesturestart", this.gesturestart);
    rm("gesturechange", this.gesturechange);
    rm("gestureend", this.gestureend);
    if (this.mc)
      this.mc.destroy();
    if (this.hm)
      this.hm.unwheel();
    this.mouseEvents("removeEventListener");
  }
}
class Keyboard {
  constructor(updId, events) {
    this._keydown = this.keydown.bind(this);
    this._keyup = this.keyup.bind(this);
    this._keypress = this.keypress.bind(this);
    window.addEventListener("keydown", this._keydown);
    window.addEventListener("keyup", this._keyup);
    window.addEventListener("keypress", this._keypress);
    this.events = events;
    this.updId = updId;
  }
  off() {
    window.removeEventListener("keydown", this._keydown);
    window.removeEventListener("keyup", this._keyup);
    window.removeEventListener("keypress", this._keypress);
  }
  keydown(event2) {
    this.events.emitSpec(this.updId, "propagate", {
      name: "keydown",
      event: event2
    });
  }
  keyup(event2) {
    this.events.emitSpec(this.updId, "propagate", {
      name: "keyup",
      event: event2
    });
  }
  keypress(event2) {
    this.events.emitSpec(this.updId, "propagate", {
      name: "keypress",
      event: event2
    });
  }
}
const HPX$3 = Const.HPX;
class Crosshair extends Layer {
  constructor(id) {
    super(id, "__$Crosshair__");
    this.id = id;
    this.zIndex = 1e6;
    this.ctxType = "Canvas";
    this.overlay = {
      draw: this.draw.bind(this),
      destroy: this.destroy.bind(this)
    };
    this.env = {
      update: this.envEpdate.bind(this),
      destroy: () => {
      }
    };
  }
  draw(ctx) {
    if (!this.layout)
      return;
    const cursor = this.props.cursor;
    if (!cursor.visible)
      return;
    ctx.save();
    ctx.strokeStyle = this.props.colors.cross;
    ctx.beginPath();
    ctx.setLineDash([5]);
    if (cursor.gridId === this.layout.id) {
      ctx.moveTo(0, cursor.y + HPX$3);
      ctx.lineTo(this.layout.width + HPX$3, cursor.y + HPX$3);
    }
    ctx.moveTo(cursor.x, 0);
    ctx.lineTo(cursor.x, this.layout.height);
    ctx.stroke();
    ctx.restore();
  }
  envEpdate(ovSrc, layout, props) {
    this.ovSrc = ovSrc;
    this.layout = layout;
    this.props = props;
  }
  onCursor(update2) {
    if (this.props)
      this.props.cursor = update2;
  }
  destroy() {
  }
}
const HPX$2 = Const.HPX;
class Grid extends Layer {
  constructor(id) {
    super(id, "__$Grid__");
    this.id = id;
    this.zIndex = -1e6;
    this.ctxType = "Canvas";
    this.overlay = {
      draw: this.draw.bind(this),
      destroy: this.destroy.bind(this)
    };
    this.env = {
      update: this.envEpdate.bind(this),
      destroy: () => {
      }
    };
  }
  draw(ctx) {
    let layout = this.layout;
    if (!layout)
      return;
    ctx.strokeStyle = this.props.colors.grid;
    ctx.beginPath();
    const ymax = layout.height;
    for (var [x, p] of layout.xs) {
      ctx.moveTo(x + HPX$2, 0);
      ctx.lineTo(x + HPX$2, ymax);
    }
    for (var [y, y$] of layout.ys) {
      ctx.moveTo(0, y + HPX$2);
      ctx.lineTo(layout.width, y + HPX$2);
    }
    ctx.stroke();
  }
  envEpdate(ovSrc, layout, props) {
    this.ovSrc = ovSrc;
    this.layout = layout;
    this.props = props;
  }
  destroy() {
  }
}
const HPX$1 = Const.HPX;
function body$1(props, layout, scale, side, ctx) {
  var points = scale.ys;
  ctx.font = props.config.FONT;
  var { x, y, w, h } = border(props, layout, side, ctx);
  ctx.fillStyle = props.colors.text;
  ctx.beginPath();
  for (var p of points) {
    if (p[0] > layout.height)
      continue;
    var x1 = side === "left" ? w + HPX$1 : x + HPX$1;
    var x2 = side === "left" ? x1 - 4.5 : x1 + 4.5;
    ctx.moveTo(x1, p[0] + HPX$1);
    ctx.lineTo(x2, p[0] + HPX$1);
    var offst = side === "left" ? -10 : 10;
    ctx.textAlign = side === "left" ? "end" : "start";
    let d = scale.prec;
    ctx.fillText(p[1].toFixed(d), x1 + offst, p[0] + 4);
  }
  ctx.stroke();
}
function border(props, layout, side, ctx) {
  var S = side === "right" ? 1 : 0;
  var sb2 = layout.sbMax[S];
  var x, y, w, h;
  switch (side) {
    case "left":
      x = 0;
      y = 0;
      w = Math.floor(sb2);
      h = layout.height;
      ctx.clearRect(x, y, w, h);
      ctx.strokeStyle = props.colors.scale;
      ctx.beginPath();
      ctx.moveTo(x + HPX$1 + w, 0);
      ctx.lineTo(x + HPX$1 + w, h);
      ctx.stroke();
      break;
    case "right":
      x = 0;
      y = 0;
      w = Math.floor(sb2);
      h = layout.height;
      ctx.clearRect(x, y, w, h);
      ctx.strokeStyle = props.colors.scale;
      ctx.beginPath();
      ctx.moveTo(x - HPX$1, 0);
      ctx.lineTo(x - HPX$1, h);
      ctx.stroke();
      break;
  }
  return { x, y, w, h };
}
function panel$1(props, layout, scale, side, ctx) {
  const panHeight = props.config.PANHEIGHT;
  let $ = props.cursor.scales[scale.scaleSpecs.id] || 0;
  let lbl = $.toFixed(scale.prec);
  ctx.fillStyle = props.colors.panel;
  var S = side === "right" ? 1 : 0;
  let panWidth = layout.sbMax[S] - 5;
  let x = S ? 1 : 4;
  let y = props.cursor.y - panHeight * 0.5 + HPX$1;
  let a = S ? 7 : panWidth - 3;
  roundRect$1(ctx, x, y, panWidth, panHeight, 3, S);
  ctx.fillStyle = props.colors.textHL;
  ctx.textAlign = S ? "left" : "right";
  ctx.fillText(lbl, a, y + 15);
}
function tracker(props, layout, scale, side, ctx, tracker2) {
  const panHeight = Math.floor(props.config.PANHEIGHT * 0.8);
  let $ = tracker2.value;
  let lbl = $.toFixed(scale.prec);
  ctx.fillStyle = tracker2.color;
  var S = side === "right" ? 1 : 0;
  let panWidth = layout.sbMax[S] - 5;
  let x = S ? 1 : 4;
  let y = tracker2.y - panHeight * 0.5 + HPX$1;
  let a = S ? 7 : panWidth - 3;
  roundRect$1(ctx, x, y, panWidth, panHeight, 3, S);
  ctx.fillStyle = props.colors.back;
  ctx.textAlign = S ? "left" : "right";
  ctx.fillText(lbl, a, y + panHeight - 4);
}
function roundRect$1(ctx, x, y, w, h, r, s) {
  if (w < 2 * r)
    r = w / 2;
  if (h < 2 * r)
    r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r * s);
  ctx.arcTo(x + w, y + h, x, y + h, r * s);
  ctx.arcTo(x, y + h, x, y, r * (1 - s));
  ctx.arcTo(x, y, x + w, y, r * (1 - s));
  ctx.closePath();
  ctx.fill();
}
function upperBorder(props, layout, ctx) {
  ctx.strokeStyle = props.colors.scale;
  ctx.beginPath();
  ctx.moveTo(0, 0.5);
  ctx.lineTo(layout.width, 0.5);
  ctx.stroke();
}
function error(props, layout, side, ctx) {
  var S = side === "right" ? 1 : 0;
  var sb2 = layout.sbMax[S];
  ctx.font = props.config.FONT;
  border(props, layout, side, ctx);
  if (layout.id)
    upperBorder(props, layout, ctx);
  let x = Math.floor(sb2 * 0.5);
  let y = Math.floor(layout.height * 0.5);
  ctx.fillStyle = props.colors.text;
  ctx.textAlign = "center";
  ctx.fillText("Error", x, y);
}
const sb = {
  body: body$1,
  panel: panel$1,
  upperBorder,
  error,
  tracker
};
function priceLine(layout, ctx, tracker2) {
  ctx.strokeStyle = tracker2.color;
  ctx.setLineDash([1, 2]);
  ctx.beginPath();
  ctx.moveTo(0, tracker2.y);
  ctx.lineTo(layout.width, tracker2.y);
  ctx.stroke();
  ctx.setLineDash([]);
}
class Trackers extends Layer {
  constructor(id, props, gridId) {
    super(id, "__$Trackers__");
    this.id = id;
    this.zIndex = 5e5;
    this.ctxType = "Canvas";
    this.hub = DataHub$1.instance(props.id);
    this.meta = MetaHub$1.instance(props.id);
    this.gridId = gridId;
    this.props = props;
    this.overlay = {
      draw: this.draw.bind(this),
      destroy: this.destroy.bind(this),
      drawSidebar: this.drawSidebar.bind(this)
    };
    this.env = {
      update: this.envEpdate.bind(this),
      destroy: () => {
      }
    };
  }
  draw(ctx) {
    if (!this.layout)
      return;
    let trackers = this.meta.valueTrackers[this.gridId] || [];
    this.trackers = [];
    for (var i = 0; i < trackers.length; i++) {
      let vt = trackers[i];
      if (!vt)
        continue;
      let data2 = this.hub.ovData(this.gridId, i) || [];
      let last = data2[data2.length - 1] || [];
      let tracker2 = vt(last);
      tracker2.ovId = i;
      if (!tracker2.show || tracker2.value === void 0)
        continue;
      tracker2.y = this.layout.value2y(tracker2.value);
      tracker2.color = tracker2.color || this.props.colors.scale;
      if (tracker2.line) {
        priceLine(this.layout, ctx, tracker2);
      }
      this.trackers.push(tracker2);
    }
  }
  drawSidebar(ctx, side, scale) {
    if (!this.layout)
      return;
    for (var tracker2 of this.trackers || []) {
      let scaleId = this.getScaleId(tracker2.ovId);
      if (scaleId !== scale.scaleSpecs.id)
        continue;
      sb.tracker(
        this.props,
        this.layout,
        scale,
        side,
        ctx,
        tracker2
      );
    }
  }
  envEpdate(ovSrc, layout, props) {
    this.ovSrc = ovSrc;
    this.layout = layout;
    this.props = props;
    this.scaleId = this.getScaleId();
  }
  // Get the scale id of this overlay
  // TODO: more efficient method of getting ov scale
  getScaleId(ovId) {
    let scales = this.layout.scales;
    for (var i in scales) {
      let ovIdxs = scales[i].scaleSpecs.ovIdxs;
      if (ovIdxs.includes(ovId)) {
        return i;
      }
    }
  }
  destroy() {
  }
}
function setup(id, w, h) {
  let canvas = document.getElementById(id);
  let dpr2 = window.devicePixelRatio || 1;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  if (dpr2 < 1)
    dpr2 = 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr2;
  canvas.height = rect.height * dpr2;
  let ctx = canvas.getContext("2d", {});
  ctx.scale(dpr2, dpr2);
  if (!ctx.measureTextOrg) {
    ctx.measureTextOrg = ctx.measureText;
  }
  let nvjsId = id.split("-").shift();
  ctx.measureText = (text2) => Utils.measureText(ctx, text2, nvjsId);
  return [canvas, ctx];
}
function resize(canvas, ctx, w, h) {
  let dpr2 = window.devicePixelRatio || 1;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  if (dpr2 < 1)
    dpr2 = 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr2;
  canvas.height = rect.height * dpr2;
  ctx.scale(dpr2, dpr2);
}
const dpr = { setup, resize };
function create_fragment$c(ctx) {
  let div;
  let canvas_1;
  return {
    c() {
      div = element("div");
      canvas_1 = element("canvas");
      attr(
        canvas_1,
        "id",
        /*canvasId*/
        ctx[2]
      );
      attr(
        div,
        "id",
        /*rrId*/
        ctx[1]
      );
      attr(
        div,
        "style",
        /*rrStyle*/
        ctx[0]
      );
      attr(div, "class", "nvjs-canvas-rendrer svelte-8n0n7w");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, canvas_1);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*rrStyle*/
      1) {
        attr(
          div,
          "style",
          /*rrStyle*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$c($$self, $$props, $$invalidate) {
  let rrStyle;
  let width;
  let height;
  let { id } = $$props;
  let { props = {} } = $$props;
  let { rr = {} } = $$props;
  let { layout = {} } = $$props;
  let events = Events$1.instance(props.id);
  let rrUpdId = `rr-${id}-${rr.id}`;
  let gridUpdId = `grid-${id}`;
  let rrId = `${props.id}-rr-${id}-${rr.id}`;
  let canvasId = `${props.id}-canvas-${id}-${rr.id}`;
  events.on(`${rrUpdId}:update-rr`, update2);
  events.on(`${rrUpdId}:run-rr-task`, onTask);
  let canvas;
  let ctx;
  let input;
  onMount(() => {
    setup2();
  });
  onDestroy(() => {
    events.off(`${rrUpdId}`);
    if (input)
      input.destroy();
  });
  function attach($input) {
    input = $input;
    input.setup({
      id,
      canvas,
      ctx,
      props,
      layout,
      rrUpdId,
      gridUpdId
    });
  }
  function detach2() {
    if (input) {
      input.destroy();
      input = null;
    }
  }
  function getInput() {
    return input;
  }
  function setup2() {
    [canvas, ctx] = dpr.setup(canvasId, layout.width, layout.height);
    update2();
  }
  function update2($layout = layout) {
    $$invalidate(3, layout = $layout);
    if (!ctx || !layout)
      return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rr.layers.forEach((l) => {
      if (!l.display)
        return;
      ctx.save();
      let r = l.overlay;
      if (l.opacity)
        ctx.globalAlpha = l.opacity;
      try {
        r.draw(ctx);
      } catch (e) {
        console.log(`Layer ${id}.${l.id}`, e);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });
    if (id > 0)
      upperBorder2();
  }
  function onTask(event2) {
    event2.handler(canvas, ctx, input);
  }
  function upperBorder2() {
    ctx.strokeStyle = props.colors.scale;
    ctx.beginPath();
    ctx.moveTo(0, 0.5);
    ctx.lineTo(layout.width, 0.5);
    ctx.stroke();
  }
  function resizeWatch() {
    if (!canvas)
      return;
    dpr.resize(canvas, ctx, layout.width, layout.height);
    update2();
  }
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(4, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(5, props = $$props2.props);
    if ("rr" in $$props2)
      $$invalidate(6, rr = $$props2.rr);
    if ("layout" in $$props2)
      $$invalidate(3, layout = $$props2.layout);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*layout*/
    8) {
      $$invalidate(0, rrStyle = `
    left: ${layout.sbMax[0]}px;
    top: ${layout.offset || 0}px;
    position: absolute;
    height: ${layout.height}px;
}`);
    }
    if ($$self.$$.dirty & /*layout*/
    8) {
      $$invalidate(11, width = layout.width);
    }
    if ($$self.$$.dirty & /*layout*/
    8) {
      $$invalidate(10, height = layout.height);
    }
    if ($$self.$$.dirty & /*width, height*/
    3072) {
      resizeWatch();
    }
  };
  return [
    rrStyle,
    rrId,
    canvasId,
    layout,
    id,
    props,
    rr,
    attach,
    detach2,
    getInput,
    height,
    width
  ];
}
class Canvas extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$c, create_fragment$c, safe_not_equal, {
      id: 4,
      props: 5,
      rr: 6,
      layout: 3,
      attach: 7,
      detach: 8,
      getInput: 9
    });
  }
  get attach() {
    return this.$$.ctx[7];
  }
  get detach() {
    return this.$$.ctx[8];
  }
  get getInput() {
    return this.$$.ctx[9];
  }
}
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[23] = list[i];
  child_ctx[24] = list;
  child_ctx[25] = i;
  return child_ctx;
}
function create_if_block$6(ctx) {
  let canvas;
  let each_value = (
    /*each_value*/
    ctx[24]
  );
  let i = (
    /*i*/
    ctx[25]
  );
  let current;
  const assign_canvas = () => (
    /*canvas_binding*/
    ctx[7](canvas, each_value, i)
  );
  const unassign_canvas = () => (
    /*canvas_binding*/
    ctx[7](null, each_value, i)
  );
  let canvas_props = {
    id: (
      /*id*/
      ctx[1]
    ),
    layout: (
      /*layout*/
      ctx[0]
    ),
    props: (
      /*props*/
      ctx[2]
    ),
    rr: (
      /*rr*/
      ctx[23]
    )
  };
  canvas = new Canvas({ props: canvas_props });
  assign_canvas();
  return {
    c() {
      create_component(canvas.$$.fragment);
    },
    m(target, anchor) {
      mount_component(canvas, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (each_value !== /*each_value*/
      ctx2[24] || i !== /*i*/
      ctx2[25]) {
        unassign_canvas();
        each_value = /*each_value*/
        ctx2[24];
        i = /*i*/
        ctx2[25];
        assign_canvas();
      }
      const canvas_changes = {};
      if (dirty & /*id*/
      2)
        canvas_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*layout*/
      1)
        canvas_changes.layout = /*layout*/
        ctx2[0];
      if (dirty & /*props*/
      4)
        canvas_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*renderers*/
      8)
        canvas_changes.rr = /*rr*/
        ctx2[23];
      canvas.$set(canvas_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(canvas.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(canvas.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      unassign_canvas();
      destroy_component(canvas, detaching);
    }
  };
}
function create_each_block$4(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*rr*/
    ctx[23].ctxType === "Canvas" && create_if_block$6(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*rr*/
        ctx2[23].ctxType === "Canvas"
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*renderers*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$6(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_fragment$b(ctx) {
  let div;
  let current;
  let each_value = (
    /*renderers*/
    ctx[3]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "nvjs-grid svelte-1ctdodr");
      attr(
        div,
        "style",
        /*style*/
        ctx[4]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*id, layout, props, renderers*/
      15) {
        each_value = /*renderers*/
        ctx2[3];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$4(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$4(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (!current || dirty & /*style*/
      16) {
        attr(
          div,
          "style",
          /*style*/
          ctx2[4]
        );
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$b($$self, $$props, $$invalidate) {
  let style;
  let { id } = $$props;
  let { props } = $$props;
  let { main } = $$props;
  let { layout } = $$props;
  function getLayers() {
    return layers;
  }
  let hub = DataHub$1.instance(props.id);
  let meta = MetaHub$1.instance(props.id);
  let events = Events$1.instance(props.id);
  let scripts = Scripts$1.instance(props.id);
  let layers = [];
  let renderers = [];
  let input = null;
  let keyboard = null;
  events.on(`grid-${id}:update-grid`, update2);
  events.on(`grid-${id}:remake-grid`, make);
  events.on(`grid-${id}:propagate`, propagate);
  events.on(`grid-${id}:run-grid-task`, onTask);
  onMount(() => {
    make();
    keyboard = new Keyboard(`grid-${id}`, events);
  });
  onDestroy(() => {
    events.off(`grid-${id}`);
    keyboard.off();
  });
  function make(event2) {
    if (!hub.panes()[id])
      return;
    destroyLayers();
    layers = makeLayers();
    $$invalidate(3, renderers = mergeByCtx());
    let last = renderers[renderers.length - 1];
    if (last)
      setTimeout(() => {
        if (last.ref) {
          detachInputs();
          last.ref.attach(input = new Input());
        }
      });
  }
  function detachInputs() {
    for (var rr of renderers) {
      rr.ref.detach();
    }
  }
  function destroyLayers() {
    for (var layer of layers) {
      layer.overlay.destroy();
      layer.env.destroy();
    }
  }
  function makeLayers() {
    let list = hub.panes()[id].overlays || [];
    let layers2 = [];
    for (var i = 0; i < list.length; i++) {
      let ov = list[i];
      let prefab = scripts.prefabs[ov.type];
      if (!prefab)
        continue;
      let l = new Layer(i, ov.name, props.id);
      let z = ov.settings.zIndex;
      l.zIndex = z != null ? z : ov.main ? 0 : -1;
      let env = new OverlayEnv(i, ov, layout, props);
      l.overlay = prefab.make(env);
      l.env = env;
      l.ovSrc = ov;
      l.ctxType = prefab.ctx;
      env.overlay = l.overlay;
      meta.exctractFrom(l.overlay);
      layers2.push(l);
      l.overlay.init();
    }
    layers2.push(new Crosshair(i++));
    layers2.push(new Grid(i++));
    layers2.push(new Trackers(i++, props, id));
    layers2.sort((l1, l2) => l1.zIndex - l2.zIndex);
    meta.finish();
    return layers2;
  }
  function mergeByCtx() {
    let rrs = [];
    let lastCtx = null;
    for (var l of layers) {
      if (l.ctxType !== lastCtx) {
        var last = {
          ctxType: l.ctxType,
          layers: [],
          id: rrs.length,
          ref: null
          // Renderer reference
        };
        rrs.push(last);
        lastCtx = l.ctxType;
      }
      last.layers.push(l);
    }
    return rrs;
  }
  function update2($layout = layout) {
    $$invalidate(0, layout = $layout);
    if (input)
      input.layout = layout;
    for (var l of layers) {
      l.env.update(l.ovSrc, layout, props);
      l.update();
    }
    for (var rr of renderers) {
      events.emitSpec(`rr-${id}-${rr.id}`, "update-rr", layout);
    }
  }
  function propagate(e) {
    let { name, event: event2 } = e;
    for (var layer of layers) {
      if (layer.overlay[name]) {
        layer.overlay[name](event2);
      }
    }
  }
  function onTask(event2) {
    event2.handler(layers, renderers, { update: update2 });
  }
  function canvas_binding($$value, each_value, i) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      each_value[i].ref = $$value;
      $$invalidate(3, renderers);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(2, props = $$props2.props);
    if ("main" in $$props2)
      $$invalidate(5, main = $$props2.main);
    if ("layout" in $$props2)
      $$invalidate(0, layout = $$props2.layout);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*layout, props*/
    5) {
      $$invalidate(4, style = `
    width: ${layout.width}px;
    height: ${layout.height}px;
    background: ${props.colors.back};
    margin-left: ${layout.sbMax[0]}px;
`);
    }
  };
  return [layout, id, props, renderers, style, main, getLayers, canvas_binding];
}
class Grid_1 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$b, create_fragment$b, safe_not_equal, {
      id: 1,
      props: 2,
      main: 5,
      layout: 0,
      getLayers: 6
    });
  }
  get getLayers() {
    return this.$$.ctx[6];
  }
}
function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function add_css$4(target) {
  append_styles(target, "svelte-16w6gr6", ".scale-selector.svelte-16w6gr6{position:absolute;bottom:5px;display:grid;justify-content:center;align-content:center}.scale-button.svelte-16w6gr6{border-radius:3px;text-align:center;user-select:none;margin:auto;margin-top:1px}.scale-button.svelte-16w6gr6:hover{filter:brightness(1.2)}");
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[15] = i;
  const constants_0 = (
    /*scale*/
    child_ctx[13].scaleSpecs.id
  );
  child_ctx[1] = constants_0;
  return child_ctx;
}
function create_each_block$3(ctx) {
  let div;
  let t0_value = (
    /*id*/
    ctx[1] + ""
  );
  let t0;
  let t1;
  let div_style_value;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[10](
        /*id*/
        ctx[1]
      )
    );
  }
  return {
    c() {
      div = element("div");
      t0 = text(t0_value);
      t1 = space();
      attr(div, "class", "scale-button svelte-16w6gr6");
      attr(div, "style", div_style_value = /*sbStyle*/
      ctx[2](
        /*id*/
        ctx[1]
      ));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t0);
      append(div, t1);
      if (!mounted) {
        dispose = listen(div, "click", stop_propagation(click_handler));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*scales*/
      1 && t0_value !== (t0_value = /*id*/
      ctx[1] + ""))
        set_data(t0, t0_value);
      if (dirty & /*sbStyle, scales*/
      5 && div_style_value !== (div_style_value = /*sbStyle*/
      ctx[2](
        /*id*/
        ctx[1]
      ))) {
        attr(div, "style", div_style_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$a(ctx) {
  let div;
  let div_transition;
  let current;
  let each_value = (
    /*scales*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "scale-selector svelte-16w6gr6");
      attr(
        div,
        "id",
        /*ssId*/
        ctx[4]
      );
      attr(
        div,
        "style",
        /*ssStyle*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*sbStyle, scales, onClick*/
      37) {
        each_value = /*scales*/
        ctx2[0];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$3(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$3(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (!current || dirty & /*ssStyle*/
      8) {
        attr(
          div,
          "style",
          /*ssStyle*/
          ctx2[3]
        );
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks, detaching);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function instance$a($$self, $$props, $$invalidate) {
  let specs;
  let ssStyle;
  let sbStyle;
  let { id } = $$props;
  let { props } = $$props;
  let { layout } = $$props;
  let { scales } = $$props;
  let { side } = $$props;
  let events = Events$1.instance(props.id);
  let S = side === "right" ? 1 : 0;
  let ssId = `${props.id}-ss-${id}-${side}`;
  function onClick(index) {
    scales[index];
    let idxs = layout.settings.scaleSideIdxs;
    idxs[S] = index;
    events.emitSpec("hub", "set-scale-index", { paneId: id, index, sideIdxs: idxs });
  }
  const click_handler = (id2) => onClick(id2);
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(6, props = $$props2.props);
    if ("layout" in $$props2)
      $$invalidate(7, layout = $$props2.layout);
    if ("scales" in $$props2)
      $$invalidate(0, scales = $$props2.scales);
    if ("side" in $$props2)
      $$invalidate(8, side = $$props2.side);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*layout, scales*/
    129) {
      $$invalidate(9, specs = function ssWidth() {
        let obj = {};
        let sb2 = layout.sbMax[S];
        switch (scales.length) {
          case 2:
          case 4:
          default:
            obj.ssw = 46;
            obj.ssm = (sb2 - obj.ssw) / 2;
            obj.bw = 18;
            obj.bh = 18;
            obj.tmp = `50% 50%`;
            break;
          case 3:
            obj.ssw = 54;
            obj.ssm = (sb2 - obj.ssw) / 3;
            obj.bw = 15;
            obj.bh = 15;
            obj.tmp = `33% 33% 33%`;
            break;
        }
        return obj;
      }());
    }
    if ($$self.$$.dirty & /*specs, props*/
    576) {
      $$invalidate(3, ssStyle = `
    grid-template-columns: ${specs.tmp};
    font: ${props.config.FONT};
    width: ${specs.ssw}px;
    margin-left: ${specs.ssm}px;
`);
    }
    if ($$self.$$.dirty & /*layout, props, specs*/
    704) {
      $$invalidate(2, sbStyle = (i) => {
        let sel = i === layout.settings.scaleSideIdxs[S];
        let color = sel ? props.colors.text : props.colors.scale;
        return `
    background: ${props.colors.back};
    line-height: ${specs.bh}px;
    width: ${specs.bw}px;
    height: ${specs.bh}px;
    box-shadow: 0 0 0 1px ${props.colors.back};
    border: 1px solid ${color};
    color: ${color};
`;
      });
    }
  };
  return [
    scales,
    id,
    sbStyle,
    ssStyle,
    ssId,
    onClick,
    props,
    layout,
    side,
    specs,
    click_handler
  ];
}
class ScaleSelector extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$a,
      create_fragment$a,
      safe_not_equal,
      {
        id: 1,
        props: 6,
        layout: 7,
        scales: 0,
        side: 8
      },
      add_css$4
    );
  }
}
function create_if_block$5(ctx) {
  let scaleselector;
  let current;
  scaleselector = new ScaleSelector({
    props: {
      id: (
        /*id*/
        ctx[1]
      ),
      props: (
        /*props*/
        ctx[2]
      ),
      layout: (
        /*layout*/
        ctx[0]
      ),
      scales: (
        /*scales*/
        ctx[4]
      ),
      side: (
        /*side*/
        ctx[3]
      )
    }
  });
  return {
    c() {
      create_component(scaleselector.$$.fragment);
    },
    m(target, anchor) {
      mount_component(scaleselector, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const scaleselector_changes = {};
      if (dirty[0] & /*id*/
      2)
        scaleselector_changes.id = /*id*/
        ctx2[1];
      if (dirty[0] & /*props*/
      4)
        scaleselector_changes.props = /*props*/
        ctx2[2];
      if (dirty[0] & /*layout*/
      1)
        scaleselector_changes.layout = /*layout*/
        ctx2[0];
      if (dirty[0] & /*scales*/
      16)
        scaleselector_changes.scales = /*scales*/
        ctx2[4];
      if (dirty[0] & /*side*/
      8)
        scaleselector_changes.side = /*side*/
        ctx2[3];
      scaleselector.$set(scaleselector_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(scaleselector.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(scaleselector.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(scaleselector, detaching);
    }
  };
}
function create_fragment$9(ctx) {
  let div;
  let canvas_1;
  let t;
  let current;
  let mounted;
  let dispose;
  let if_block = (
    /*scales*/
    ctx[4].length > 1 && /*showSwitch*/
    ctx[5] && create_if_block$5(ctx)
  );
  return {
    c() {
      div = element("div");
      canvas_1 = element("canvas");
      t = space();
      if (if_block)
        if_block.c();
      attr(
        canvas_1,
        "id",
        /*canvasId*/
        ctx[8]
      );
      attr(
        div,
        "id",
        /*sbId*/
        ctx[7]
      );
      attr(
        div,
        "style",
        /*sbStyle*/
        ctx[6]
      );
      attr(div, "class", "nvjs-sidebar svelte-gpuvhh");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, canvas_1);
      append(div, t);
      if (if_block)
        if_block.m(div, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            div,
            "click",
            /*onClick*/
            ctx[9]
          ),
          listen(
            div,
            "mouseover",
            /*onMouseOver*/
            ctx[10]
          ),
          listen(
            div,
            "mouseleave",
            /*onMouseLeave*/
            ctx[11]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*scales*/
        ctx2[4].length > 1 && /*showSwitch*/
        ctx2[5]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*scales, showSwitch*/
          48) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$5(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      if (!current || dirty[0] & /*sbStyle*/
      64) {
        attr(
          div,
          "style",
          /*sbStyle*/
          ctx2[6]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$9($$self, $$props, $$invalidate) {
  let sbStyle;
  let scale;
  let width;
  let height;
  let { id } = $$props;
  let { props = {} } = $$props;
  let { layout = {} } = $$props;
  let { side } = $$props;
  let { scales = [] } = $$props;
  let layers = [];
  function setLayers($layers) {
    layers = $layers;
  }
  let meta = MetaHub$1.instance(props.id);
  let events = Events$1.instance(props.id);
  let S = side === "right" ? 1 : 0;
  let sbUpdId = `sb-${id}-${side}`;
  let sbId = `${props.id}-sb-${id}-${side}`;
  let canvasId = `${props.id}-sb-canvas-${id}-${side}`;
  let showSwitch = false;
  events.on(`${sbUpdId}:update-sb`, update2);
  let canvas;
  let ctx;
  let mc;
  let zoom = 1;
  let yRange;
  let drug;
  onMount(async () => {
    await setup2();
  });
  onDestroy(() => {
    events.off(`${sbUpdId}`);
    if (mc)
      mc.destroy();
  });
  async function setup2() {
    [canvas, ctx] = dpr.setup(canvasId, layout.sbMax[S], layout.height);
    update2();
    if (scale)
      await listeners();
  }
  async function listeners() {
    const Hammer = await import("./hammer-f2b9e56a.js").then((n) => n.h);
    mc = new Hammer.Manager(canvas);
    mc.add(new Hammer.Pan({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 0
    }));
    mc.add(new Hammer.Tap({
      event: "doubletap",
      taps: 2,
      posThreshold: 50
    }));
    mc.on("panstart", (event2) => {
      if (!scale)
        return;
      let yTransform = getYtransform();
      if (yTransform) {
        zoom = yTransform.zoom;
      } else {
        zoom = 1;
      }
      yRange = [scale.$hi, scale.$lo];
      drug = {
        y: event2.center.y,
        z: zoom,
        mid: math.log_mid(yRange, layout.height),
        A: scale.A,
        B: scale.B
      };
    });
    mc.on("panmove", (event2) => {
      if (drug) {
        zoom = calcZoom(event2);
        events.emit("sidebar-transform", {
          gridId: id,
          scaleId: scale.scaleSpecs.id,
          zoom,
          auto: false,
          range: calcRange(),
          drugging: true,
          updateLayout: true
        });
        update2();
      }
    });
    mc.on("panend", () => {
      drug = null;
      if (!scale)
        return;
      events.emit("sidebar-transform", {
        gridId: id,
        scaleId: scale.scaleSpecs.id,
        drugging: false,
        updateLayout: true
      });
    });
    mc.on("doubletap", () => {
      events.emit("sidebar-transform", {
        gridId: id,
        scaleId: scale.scaleSpecs.id,
        zoom: 1,
        auto: true,
        updateLayout: true
      });
      zoom = 1;
      update2();
    });
  }
  function update2($layout = layout) {
    if (!$layout)
      return;
    $$invalidate(0, layout = $layout);
    scale = getCurrentScale();
    if (!scale) {
      return sb.error(props, layout, side, ctx);
    }
    sb.body(props, layout, scale, side, ctx);
    ovDrawCalls();
    if (id)
      sb.upperBorder(props, layout, ctx);
    if (props.cursor.y && props.cursor.scales) {
      if (props.cursor.gridId === layout.id) {
        sb.panel(props, layout, scale, side, ctx);
      }
    }
  }
  function ovDrawCalls() {
    for (var l of layers) {
      let ov = l.overlay;
      if (ov.drawSidebar) {
        ov.drawSidebar(ctx, side, scale);
      }
    }
  }
  function resizeWatch() {
    if (!canvas)
      return;
    dpr.resize(canvas, ctx, layout.sbMax[S], layout.height);
    update2();
  }
  function calcZoom(event2) {
    let d = drug.y - event2.center.y;
    let speed = d > 0 ? 3 : 1;
    let k = 1 + speed * d / layout.height;
    return Utils.clamp(drug.z * k, 5e-3, 100);
  }
  function calcRange(diff1 = 1, diff2 = 1) {
    let z = zoom / drug.z;
    let zk = (1 / z - 1) / 2;
    let range = yRange.slice();
    let delta = range[0] - range[1];
    if (!scale.log) {
      range[0] = range[0] + delta * zk * diff1;
      range[1] = range[1] - delta * zk * diff2;
    } else {
      let px_mid = layout.height / 2;
      let new_hi = px_mid - px_mid * (1 / z);
      let new_lo = px_mid + px_mid * (1 / z);
      let f = (y) => math.exp((y - drug.B) / drug.A);
      range.slice();
      range[0] = f(new_hi);
      range[1] = f(new_lo);
    }
    return range;
  }
  function getCurrentScale() {
    let scales2 = layout.scales;
    let template = layout.settings.scaleTemplate[S];
    let s = scales2[layout.settings.scaleSideIdxs[S]];
    if (s && template.includes(s.scaleSpecs.id)) {
      return s;
    }
    return null;
  }
  function getYtransform() {
    if (!meta.yTransforms[id])
      return;
    let scaleId = scale.scaleSpecs.id;
    return meta.yTransforms[id][scaleId];
  }
  function onClick(e) {
    if (!scale)
      return;
    events.emitSpec("hub", "set-scale-index", {
      paneId: id,
      index: scale.scaleSpecs.id,
      sideIdxs: layout.settings.scaleSideIdxs
    });
  }
  function onMouseOver() {
    $$invalidate(5, showSwitch = true);
  }
  function onMouseLeave() {
    $$invalidate(5, showSwitch = false);
  }
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(2, props = $$props2.props);
    if ("layout" in $$props2)
      $$invalidate(0, layout = $$props2.layout);
    if ("side" in $$props2)
      $$invalidate(3, side = $$props2.side);
    if ("scales" in $$props2)
      $$invalidate(4, scales = $$props2.scales);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*layout, props*/
    5) {
      $$invalidate(6, sbStyle = `
    left: ${S * (layout.width + layout.sbMax[0])}px;
    top: ${layout.offset || 0}px;
    position: absolute;
    background: ${props.colors.back};
    height: ${layout.height}px;
`);
    }
    if ($$self.$$.dirty[0] & /*layout*/
    1) {
      scale = getCurrentScale();
    }
    if ($$self.$$.dirty[0] & /*layout*/
    1) {
      $$invalidate(14, width = layout.width);
    }
    if ($$self.$$.dirty[0] & /*layout*/
    1) {
      $$invalidate(13, height = layout.height);
    }
    if ($$self.$$.dirty[0] & /*width, height*/
    24576) {
      resizeWatch();
    }
  };
  return [
    layout,
    id,
    props,
    side,
    scales,
    showSwitch,
    sbStyle,
    sbId,
    canvasId,
    onClick,
    onMouseOver,
    onMouseLeave,
    setLayers,
    height,
    width
  ];
}
class Sidebar extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$9,
      create_fragment$9,
      safe_not_equal,
      {
        id: 1,
        props: 2,
        layout: 0,
        side: 3,
        scales: 4,
        setLayers: 12
      },
      null,
      [-1, -1]
    );
  }
  get setLayers() {
    return this.$$.ctx[12];
  }
}
function create_if_block$4(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(
        div,
        "id",
        /*stubId*/
        ctx[3]
      );
      attr(
        div,
        "style",
        /*stubStyle*/
        ctx[1]
      );
      attr(div, "class", "nvjs-sidebar-stub svelte-yr5ja6");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*stubStyle*/
      2) {
        attr(
          div,
          "style",
          /*stubStyle*/
          ctx2[1]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_fragment$8(ctx) {
  let if_block_anchor;
  let if_block = (
    /*layout*/
    ctx[0].sbMax[
      /*S*/
      ctx[2]
    ] && create_if_block$4(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (
        /*layout*/
        ctx2[0].sbMax[
          /*S*/
          ctx2[2]
        ]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$4(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$8($$self, $$props, $$invalidate) {
  let stubStyle;
  let { id } = $$props;
  let { props = {} } = $$props;
  let { layout = {} } = $$props;
  let { side } = $$props;
  let S = side === "right" ? 1 : 0;
  let stubId = `${props.id}-stub-${id}-${side}`;
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(4, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(5, props = $$props2.props);
    if ("layout" in $$props2)
      $$invalidate(0, layout = $$props2.layout);
    if ("side" in $$props2)
      $$invalidate(6, side = $$props2.side);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*layout, id, side, props*/
    113) {
      $$invalidate(1, stubStyle = `
    left: ${S * (layout.width + layout.sbMax[0])}px;
    top: ${layout.offset || 0}px;
    width: ${layout.sbMax[S] - 1}px;
    height: ${layout.height - (id ? 1 : 0)}px;
    position: absolute;
    border: 1px solid;
    border-${side}: none;
    border-bottom: none;
    /* TODO: remove to-boder, it's in the pane now */
    border-top: ${id ? "auto" : "none"};
    border-color: ${props.colors.scale};
    background: ${props.colors.back}
`);
    }
  };
  return [layout, stubStyle, S, stubId, id, props, side];
}
class SidebarStub extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, { id: 4, props: 5, layout: 0, side: 6 });
  }
}
const king = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlJQTFRFAAAA7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIoTJ5QQQAAAMZ0Uk5TAAiA1fv+35cTG9b/6jUH0+4caZ0M7Lyi/SZztQGHmAMaz/czEuU2ePqsfZ4EHfUtD+LoPCdihoRgKH+ldaMFVoltCnDkbg0i1/Le60JVzfGOFQKhmwuSX7IGd8ov4e9T84zE7fmTirgJSNkjMWE0EPRZPulDGakpmWfmQFB5w2TdKr3cP03LW3xXwERH1HZS9lrwEbP4Xfw9ZtqITIXCsY8ukaCBNzDIqItUHiuCxxa2a0Y5MpXnLGO/ciVvyachGH6wxh8ghaUgOQAAA1FJREFUeJxjYBgFo2AUjATAyMTMwsrGzkGufk4ubjDg4SVPPx8/NxQICJJlgBA3HAiTo19EFKRVTJwVSEpIkmGAFEi/tAyDLIiWkydZv4IiUJ+SMgODiiqQoapGsgHqGkB9miCWFsgJ2jok6tcFRYGePohpYAhkGhnjUy1jYmpmbmGJ7E8rFqAuawjbBuQEWzsk9YL2TA6OynARJ2cXkBI2Vze4EncPoICnCYQj4gXkePvAJe18/SSAIv4BgRB+UDArJLZZQkJhVgSAhMJgOsJBshGRUJ5OlB40eUSLgAV8JWDphSUMGlQxsUBeXCDMAB1QgHjGQw13TIAnsESwSBKIKZoMIlNcweEgkwpyQBrC0/YgfnoGWC4zDqTSXxWsCywLclBWdg7YHKXcIKBIHihMRPMRBsj7AQUKCkHMomJweJWUloFosCyIYcXAUA5SxF3gG8QgU8EKdx4UVIJExIDBzgsO76pqGYYaFANqgbRlHYjlWR8k6Q2kGxqRDQhsAjkvk8EHlCa4m1uA7mzFMIAhpg3ETG5nB1EdqKm/E5QuurqbQVKGPSB/YjFARq0XxI4DB4oJin4GjnRQGBuB5I1qwGZjMYAhqMgbFkF96NmvPwUqM2EiJK6xGcAQFD8Jooo5G00/w+QpEJmpNtAEhdUABvlpkFTiHIRuAEOrEkhCg4mRAZ8BQKdOAKXRUgz9DE62QInpHTIMBAxgsJjKzRqOqZ+BYYYet0QaImhwGsAwcxZ7PgMWEGnjNRspT+M2gEgw8AbModSA6lEDBp0Bc0k3oAduACgD85PcDmLUhhswD8SaX45ZAuADggtA5XQymN0+HWTCrNqFTsTqjpQUigaXO4vAXJnFkMKqwG/J0kCC7pCZvEyqDlrwLYda6bQCVjumxNatXLVwdT7W1oS8m+Ca1rVNDUqwgnfdepgUnzMPNwKk8DQrbghZsrFz02blLfr6Ocp5m1bN7Nga0ZZlpISkzDPAAMn01Qu2sXJjAawpKRLYxLmTrbejOVB3x85i7GoxTU1evmu3DAMG0NGt3rN4rwB+zf6K+/p69vPhDGO7A2u6TQ9WHEriqkpA1jfBKOvwFOEllT36nIw4NSNAkEjgEUl9ZSSw0PLoejfSG5t0AQDCD8LOo5GzAgAAAABJRU5ErkJggg==";
const king2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAlJQTFRFAAAA7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIo7pIoTJ5QQQAAAMZ0Uk5TAAiA1fv+35cTG9b/6jUH0+4caZ0M7Lyi/SZztQGHmAMaz/czEuU2ePqsfZ4EHfUtD+LoPCdihoRgKH+ldaMFVoltCnDkbg0i1/Le60JVzfGOFQKhmwuSX7IGd8ov4e9T84zE7fmTirgJSNkjMWE0EPRZPulDGakpmWfmQFB5w2TdKr3cP03LW3xXwERH1HZS9lrwEbP4Xfw9ZtqITIXCsY8ukaCBNzDIqItUHiuCxxa2a0Y5MpXnLGO/ciVvyachGH6wxh8ghaUgOQAAA1JJREFUeJxjYBgFo2AUDAHAyMTMwsrGzkGufk4ubjDg4SVPPx8/NxQICJJlgBA3HAiTo19EFKRVTJwVSEpIkmGAFEi/tAyDLIiWkydZv4IiUJ+SMgODiiqQoapGsgHqGkB9miCWFsgJ2jok6tcFRYGePohpYAhkGhnjUy1jYmpmbmGJ7E8rFqAuawjbBuQEWzsk9YL2TA6OynARJ2cXkBI2Vze4EncPoICnCYQj4gXkePvAJe18/SSAIv4BgRB+UDArJLZZQkJhVgSAhMJgOsJBshGRUJ5OlB40eUSLgAV8JWDphSUMGlQxsUBeXCDMAB1QgHjGQw13TIAnsESwSBKIKZoMIlNcweEgkwpyQBrC0/YgfnoGWC4zDqTSXxWsCywLclBWdg7YHKXcIKBIHihMRPMRBsj7AQUKCkHMomJweJWUloFosCyIYcXAUA5SxF3gG8QgU8EKdx4UVIJExIDBzgsO76pqGYYaFANqgbRlHYjlWR8k6Q2kGxqRDQhsAjkvk8EHlCa4m1uA7mzFMIAhpg3ETG5nB1EdqKm/E5QuurqbQVKGPSB/YjFARq0XxI4DB4oJin4GjnRQGBuB5I1qwGZjMYAhqMgbFkF96NmvPwUqM2EiJK6xGcAQFD8Jooo5G00/w+QpEJmpNtAEhdUABvlpkFTiHIRuAEOrEkhCg4mRAZ8BQKdOAKXRUgz9DE62QInpHTIMBAxgsJjKzRqOqZ+BYYYet0QaImhwGsAwcxZ7PgMWEGnjNRspT+M2gEgw8AbModSA6lEDBp0Bc0k3oAduACgD85PcDmLUhhswD8SaX45ZAuADggtA5XQymN0+HWTCrNqFTsTqjpQUigaXO4vAXJnFkMKqwG/J0kCC7pCZvEyqDlrwLYda6bQCVjumxNatXLVwdT7W1oS8m+Ca1rVNDUqwgnfdepgUnzMPNwKk8DQrbghZsrFz02blLfr6Ocp5m1bN7Nga0ZZlpISkzDPAAMn01Qu2sXJjAawpKRLYxLmTrbejOVB3x85i7GoxTU1evmu3DAMG0NGt3rN4rwB+zf6K+/p69vPhDGO7A2u6TQ9WHEriqkpA1jfBKOvwFOEllT36nIw4NSNAkEjgEUl9ZSSw0PLoejfSG5tDAwAAOwrCzjMUsXkAAAAASUVORK5CYII=";
const king3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAABVxJREFUeJztmlmoVlUUx/30XjVLnFC0bJTsWlmZQwRlYlE+FIR2jQzRBpSISooGobKi0aLoRlSEUolU0EMDRQ9JUdFgiA9NFA0oDTfLVTaZZdb/39oXD/tb55x9vnvOPUp7wQ/u/c4e1lpnT2et3a9flChRokSJEiVKlChRokSJEiVKxSJdHYPBTeBD8BfYBb4ED4FRdetXqcDAA8BH4J8UtoDpdetZicCwQeD9DON7EDC+bn1LFxh1SYDxPayqW99SBQbtB34wDH0FPOHWgeTvf4OJdetdmsCYqwzjXwQN9/wO4/nDYEDduvdaYMT+YKNn3HYwNVFmJPjaK8P/Z9SpeykCI64Df3rGPWOUu8EYBatBWx16lyJQ/kBj5f8NTDbKDgObvbLd4KS+VroBjgAXgtvBrWAx6Cg6J1F+hTvsJI1am1H+amMUrAHtBfUfD+aLHrjuApdxyuW2gwJDwDLwlaEIT2uXg6GBihwGPvba+JnOzajD3eILr873YHZgn+2gE2xwO0mynW3gXjA6rXJ/8LixJSXh23wU7JujSMN15rfVFWDEIqPf58HAnHpt4Fo3xbLOGOvpaKuBTsNraU7oylqc8OxYsMmr92Oq95sN8dcNjpx5GXUabpj/EqA/ucdq5E2jIA8vW43fd7jp0LQmOGUeMN7+yjzjE23MN+q/DPZJ6W+Oc7CvJ4e9v73+Z5fVqT90PgETwJQU53AvvwD099qZJs1rCB05vIADBojO42Qbv4LzjLIzwXeGflyzTgXjwNP+c6tTv4EViWeTDIV6lOrscYJ7G48Yb695yOU7YanRDo/O7Yky0w1nk2/ALNl90jy7FQcs955zG3zDKMf5ebHoIjpRdNVOPv8cHNmCA0aDdcaom+Oez5bmcwP5DJySHJn4+6xeO8CV4eL2nlGW68T5okEN/9n10uKZHvXOleZzxGvgNGeo3xcdcoY0T8vSHMAhPgN8YJTnImStI6n7foADRokufv4C3G303+2GurUwl+MAV45DfaYx1C2uafXtJ/qb64zO6ud3sEBStuZSHZBwwjzwU4ZSjPlN6I3xrq8R4IWMfv4QPUKnHpRKd4Arz61qoaQfPpb5c7FVcQZsN/rgVybP+4MD6pfrgES9uW4IJuvyuDmuRXutPviNssbrY6foAtsIqF+dA1zdxW4osh737kUFbQzp42TZvcjyyL4ydH2p3AGu/hLwqehWGHzqK9D+QDfX+bV4pxT7RK7eAXuyRAdEB3Sc+X93wKzogOiA6IDogOiA6IBiDritBl0rEdEoUa4D/M9axub3+js7oneSVoc44HVjFDwnGhEu5bu+r0U0R3ifNEeXt1qFGdTcaTiBX3jLwTFgSA12FBLRr0ZGp3klZ71hD7nfqsiA52MpFQhzAMwN3AxOEA1b1z4ynN4Mmx0nehOFofusUN07qS9SNPLylOTnCBmk3OQ6uxuc40bIQWC4VHCpQTQEN9QN66NEv/BuEc0dMPdghcx83gZj8jridTbG87YENOg7hXUYr+eVmJdEM8kcMZeKxvhPByeK5uqPB5MdU9xv01wZOpQBFoa8HhTNDjMfwTB7d6CxSZi8YbZ6WBGP821yAflWslPmrbLLOW1HwIhrFSZs1oKjezP0eM3lIvCqaBKyKmXLciqN5jy/EhwuAUHTUEe0OWfwVHWF6IL5rujNzroMZvqb0+1J0SQMDzyHgkGlGJ3jEF5HGSu6IDFXxztFN4pmh58VTanzXjAztaEXF5Iw1M75znn/lmhyZJXomrLUGcv1g/ePM/MCfSqiWSPe9eE2ebDonkxFpxaEuwoz0oeAMaI7wN5/cXJPk38Bz1zMtWby+i0AAAAASUVORK5CYII=";
const icons = {
  "open-eye": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAelQTFRFAAAAmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYMxdw0QAAAKN0Uk5TAB1Pq7bV/v/5xZFHCw6h6NOCOQMRbNGwTgdo7PPOlIAlJDOSoNr7w0FL1+ubRRgCIVqz/CIKkPbpexsBPOFcJ/WDCBm5mULqye/BYocVtyxQDDIFjCpyslXi8j70d17PH5cEU+54V4anWUmeUmuatBS4c6ac58cgW/1Gsc0PE+Znn+S1Ott9LfAaEmlRFi+kxiNUNEhtK7p6nUzWcWEu2aKt90TEJrgAAALFSURBVHic7VZrWxJBFF5pdbxkRWkKSolGRYmhZBkYoWSIRaFkXjIx7GIWXSktzS6opVlJZvf7L+3MLpszuzvL9jz1bd8vMO8579mZMzPnDMcZMGDgPyPPtI7PL0CosIgvLln/l+JS04aNiMIm8+YtuuVl5VuRCioqLbrkFmuV4F9t27a9xg6ordvh2ClQu3br0Dv3YNe99a4GgtznbmzCtIffn0PefOAg+LUc8iosvtZ6PI3Dfk39ERv4BNra1a3Bo3gWHc1s/bEQOHS62Q7OMDh0NbDMxwPw+ROaU4ychAiOU+pGK9jCUTnb3RMkh7HTkIlAr5r+TCFC+cokt3dW97mIsa8f5jlQq9T3DIJeLfJZhIbOxQhiGCLEu+VuvZCe0IjazDh8As4nCGIUCF6+F7B/FyKqem4Yb95FkrkExGXaaQwyc0Vdz43jAAHqaF0F5hpJmIBIMvRiAHSdpCw3IGTZ2vgmJOBWTC6UcFsIEKY4Lxy5O2vDFEJ3R1h67p54mycocvI+QqPS4AFcICtT78+Wg3GankJo+mH2vyugEWCmhRkgLgXAS3hEL+HxkxnhN+F8KhUkegl+cgmcF5KYppI4i+bmn9nt/WMFkv45pV+AJFYQ4yh4lFMeVfKK2EFaLWnYxkWSwQdpkiReyPTKg7REfZCLw1F+SRJddIBcR5l7BTsRIi/DxACpf01eJnw0lxWFTXGdI00eSa7nOmcLSoYgYkmbsAdDdEF5gwvKilKvWtIyb1eTK3pLWraoypNDI5LGRfUdy1yJy3pao/k4Hbis17AdxMZiZjTR4HuckpRGY4HWVoxbW+jDgtLU+tGTu7UBPn0WmmuKaq4+d2Of0FzTGabwDyzz4j0YXP7yFXd3+7dV83exvU8v5ZZjLKo/MKZ0PjAwSk0/FE+c2URuHYW86E8ePzZ+FfF1JZqZN2DAwL/Ab6ixeYt2jKORAAAAAElFTkSuQmCC",
  "closed-eye": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAblQTFRFAAAAmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYZNB/+AAAAJN0Uk5TAB1Pq7bV/v/5xZFHCw6h6NOCOQMRbNGwTgdo7PPOlIAlJDOSoNr7w0FL1+ubRRgCIVqz/CIKkPbpexsBPOFcJ/WDCBm5mULqye/BYocVtyxQBYwqclXiMvLkrF7PDB/9U+5XhqdZnlJrtBS4ppznW0axzQ/mtRoSURYvScYjMFQ0K7p6nUzWsn1xYS5t2aI6BK33FoqWFQAAAl5JREFUeJxjYBgFo2AU0BgwMjGzsLKxs3NwsnBx85ComZeJj58dBQgICgkTrV1EVIwdCxCXkCRKu6SUNFi9jKycvIIiECgpq6iqgYXUNYjQr6kFUqqto6uHJKhvYGgEEjZmMSGg3dTMHKjOwtIKQ8baRgfkDFs7vPrtZYFqHBydsMs6u4Bc4WqKW7+bO1CBhwFuBZqeQAVeerikvR2A1vvgdaKvH9AEVX/sklJAOc8AvPoZGAKDgCHhEIxNKoSDnZ2VUCADAzMU6M4wJUyJ8AigfgyTmSOjrNHFooEmxMSiiwYDg8c9DsPYeHZ2DAMYEoB+ZUGPC2D8JfpiugurAQxJQBOSUYVSgCGTiqkShwEMaUAT0pEFmIACGVgU4jJAMhNooQiCnwUMgOxAEgxgsAImuRwEN5edPQ8zAPEZwJAPlEmAcQqAGUgKqzLcBjAUsrMXFUPZug7kGRADMwDkhRISvWCH7AUGK2AglpIUiGXAQBRH4gcAo1GUBAMkS4HRWI4sAkpI+cQbAEpIFahCMcCkXEmsAViSMkMVMCbcMTMDVgOqgfprMAo27NkZmwHYszO0QKlFE3Suc0YTsa4HFSgNmPopL9KghSp64KAC31JQodqIS1oCVKyX4ikXNVVBxboCbgWQikUQRyXq3ASqWHLxVCzAqo0LVLW5N5dhStm0GBOu2oCgtQ1cueaiVK7WBobt4Mq1FD2asADJDkj1HlHT2QWq3RW7ewR7IdV7UQVh7SBQjr2BUUhkAwMEeJn6MJo4/ROI1g4BjAETWUCNjUmcLMrceEN+FIyCUUANAAAY0GNbcYUV2AAAAABJRU5ErkJggg==",
  king,
  king2,
  king3
};
function add_css$3(target) {
  append_styles(target, "svelte-1cdflqk", ".nvjs-eye.svelte-1cdflqk{width:20px;height:20px;float:right;margin-right:2px;margin-left:7px}.nvjs-eye.svelte-1cdflqk:hover{filter:brightness(1.25)}");
}
function create_fragment$7(ctx) {
  let div;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      attr(div, "class", "nvjs-eye svelte-1cdflqk");
      attr(
        div,
        "style",
        /*eyeStyle*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (!mounted) {
        dispose = listen(div, "click", stop_propagation(
          /*onDisplayClick*/
          ctx[1]
        ));
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*eyeStyle*/
      1) {
        attr(
          div,
          "style",
          /*eyeStyle*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
function instance$7($$self, $$props, $$invalidate) {
  let display;
  let state;
  let eyeStyle;
  let { gridId } = $$props;
  let { ov } = $$props;
  let { props } = $$props;
  let { height } = $$props;
  let events = Events$1.instance(props.id);
  function update2() {
    $$invalidate(7, display = ov.settings.display !== false);
  }
  function onDisplayClick() {
    events.emitSpec("hub", "display-overlay", {
      paneId: gridId,
      ovId: ov.id,
      flag: ov.settings.display === void 0 ? false : !ov.settings.display
    });
  }
  $$self.$$set = ($$props2) => {
    if ("gridId" in $$props2)
      $$invalidate(2, gridId = $$props2.gridId);
    if ("ov" in $$props2)
      $$invalidate(3, ov = $$props2.ov);
    if ("props" in $$props2)
      $$invalidate(4, props = $$props2.props);
    if ("height" in $$props2)
      $$invalidate(5, height = $$props2.height);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*ov*/
    8) {
      $$invalidate(7, display = ov.settings.display !== false);
    }
    if ($$self.$$.dirty & /*display*/
    128) {
      $$invalidate(8, state = display ? "open" : "closed");
    }
    if ($$self.$$.dirty & /*state, height*/
    288) {
      $$invalidate(0, eyeStyle = `
    background-image: url(${icons[state + "-eye"]});
    background-size: contain;
    background-repeat: no-repeat;
    margin-top: ${(height - 20) * 0.5 - 3}px;
    /* FIX 'overflow: hidden' changes baseline */
    margin-bottom: -2px;
`);
    }
  };
  return [eyeStyle, onDisplayClick, gridId, ov, props, height, update2, display, state];
}
class LegendControls extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$7,
      create_fragment$7,
      safe_not_equal,
      {
        gridId: 2,
        ov: 3,
        props: 4,
        height: 5,
        update: 6
      },
      add_css$3
    );
  }
  get update() {
    return this.$$.ctx[6];
  }
}
const logo = [
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAAC0CAMAAAD8fySxAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAvpQTFRFAAAA///////////////+/////////////////////////////v/////////////////////////////////////////////////////////////////////////////////+//////////7////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7////////+///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+///////////+//////////////////////////////////7////+////poUcigAAAP50Uk5TAD1AGUAtKyYkC/+5/5qTrNlmOjU5b2nMT+EDZMFjRT//7MT/aI+NGhUIM+YFusm38+0srmrkTcVMH/7Ql2yZa1RwbYwU+dcBYEODjlyKG+7dArTj3sbl6+KbWHE4MtLnB0ZHQnOGHbgKsCV0e9qi8A78nJ/7doIudWL0EksM8ngcIO/3F+p6ktbHi2Gdqzdyy/xVTsB9oX/9IanTyCemlYE2fBAPUUhSHii2pYTgz9TfRJ6qI4BJVoh39hO1U9gFW/lfSloqMMrcXaCykTQYeV69iaeUlpCYszs8r+jpBIUphyKxV6TRzTGovNvOo60b+sIwL1lQu7/VQRaEK34VtNnHAAAOsUlEQVR4nO2debxVVRWATxIqVwiNUAEzyKEgUEJTccoJUBwCsnBIRVNBFIGcQRMjE8kpzACnUFMTFedUUiMnHFIUCi0snzln2qCVTb9f77x3731nWHuvb+97zn39sb8/FPTstdfaZ9+z1jl77bWjKBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCDQCB9Zy0aXAqV9tP1fXZPXr23tvYN1/IxbV1JAoKsuyoVuFSvrOUrrbhcX0yPZ4GP69W309LNufSh+Az/xJj6udNfLSdongAG9kw02hFZv5GXcxlB6n75e4o30U/rbxEnaJ4EFmyYbfMp0Vf/0Xwd4GfdpoxKbpf62uZd0M1s4jYHGlpq0Vj6TbPBZYHIbAz1sGwS0ifncYA/hNoZkOuiftWgrF2lb6xYMTbf4PDR8mIdt20DZ23rItvIFtcvtHKT10S3YPt1iE2j4Du6mDd+RiS58oirOP2anQqWlnX8U7Zz4X8Kvvs4u7rbtmmje8YjOxydfdBdth7jr3bC0XpqoVot2TzfZAygQs6ezaXuNYJILn6iq848ZOYpK2xtIyzi+fZjlHoHqaCh5D2fJGvtWctFLnv2otP1zTdt+0alf3AHpJl2g6c6B6sAvWaQlTC5+okbrEYPGjIXSxumyhmbbDCUaeASq0nNFemj31kW58mVkUT8o7UBd1FeybbZHGjgHqqO+mmlv+D2OL36imt11SoeDWM+DwdgcnG10MGgU4xioHkJktj6XDnUTS/gatIhFHYcBSTkjDtVaVH+zjoHq4cyw8T5vagrkXT3miAlE2n5A0pHZRkdBFdwC1a/XmvVP/FPgaCepjH2hRazzY4CgA7KNjoUauAWqlvflpLcqY6JGE6FFlQGTgLTjdDk554/dv1OgOhmadbyLUApz/jEnAGlTKmrQm3P+UbQVU8ApUD2RySxlopJ39SpTp6nSBk/XxXwj3+wkpoBLoNrlZCbzFAeZmNj5q+9TVU5VpZ0GpAgRzOlQAYdZtSeTWMpEjc6w9pn+njNjpiaNhIZH5Zudmb9KvNE8UD3rm0CTVs52GiwK+VBfZ39N2qlAyKx8s3Ng/2dis05hAr/VzWWsMOBDfQezv61I66nLEJx/FMFPdPizZ99zmcDvOI0V5iDWe5XzFGlzdBHnS+02Yt3PpVZ9N9PQ4DVKmqjdtH7TjLBP1bHA+V8gNazHP7Yv/5XKhdQsbbG/aiwJEj24SB+FFLtapa0NJFwsNTyb9X4JtKru+Oz3qKSJqjj/PN+bZZM2D0gQnH8UXcp6Hw+t+j4Td5nraEHs4Zxwo39gkzYfWHKs1HBdNgowUB3EhJU1UZPOn70CLFhokXa53l50/or774iW10ZGXYgsqcx3Hy4GWKXPcLlF2hWpK8UH2pVyy51Y5yhQHb4AyRpa1kR1ePOvc5VRmrfzj6KrWd8oUP0hk7XIZ8AI17D+UxxnlHYVaG34Kntt7kJxnpNA9Tr2JjH0R35DppMNkjXaLD3NJO16IOEGuemNrH8SqBJv2cpozyHTmcsUSDPRJO2EjmuMXu/HctObWNcgUB2cXuw3RarlTdRoMbMlgykL+Ga9qcH5S49j6b6AQHVbY98pgbf4DpnOrfowZIjDG1MW8BK9uTEr8zbWvRqojro9viw/PzP/pcSJ6uP8Y+6QxQEPcadJlbtYz2qguhuTc4z/oGnYUvRs7wLyfLsbGGNcZruHDYYaqF6CxJQ4UVGKHrdtO9DwJyZV7mUda4GqcQNBmvsaGjY7c5kKecQs4PsrUj5tGoPzj6JhrGMtUAX5ca0s/WlDw2bnAWaJwIOCNLAobHL+7G2sogaqk1k6uros1Ajuzr+GlAUcf763f8C0bcl4KHGZ+XmuBKp3IuVLnag/QyrILMuL+7ne6iSzMmwfyblWg/ZKLvab7y9elfFBcv40ByCfBWxeEu3YQ2TJsbmF9WsNVO/LXy885EudqNHDzA6ZM7LSHgGNHjEr8yjr9jGLPXCxf8sChs5MPj/fgVwW8PGg0XCzMo+zbi23JToaSSh3osL4w0R2kxxwEmbnz3KwhV4T9M2mo8tsUcTQmbmd2WEgmwV8pd5kuU2bJ1CvlmjoSSRgRLkTFc4NI5nFZpBk+pRNnadRp3eZBbCd/b8oYujMPIOUiJFDggETktJmATmn29QRXLeAebLfgNqPeLaYwTPRkPOPWZGUdqT10vaYyuZloudQn+ZA9Xlr1zW0xKVGWZnoC9ToyDM1mbC+O2hwjk0d+MMxBars40HZE7VB5x+zKCGtB7DIqg58xJsC1VXV/2+fHr8savBMgM15CjMSCevmuhp1lBd39iXC8Ajpghb7S5+ojTr/mJUd4kTnn542VucvLJiJ/tEQqJ4n6peV8Kvihk9mEBi0DLlvFLPrCevPgubKpgWWpi8HqtctJW1Ln6jQ2yqsrkkjm/aVtZBqBqIwP5MTXg5U88kYEi8UOoAStbhQ+QRqp54FbCovkRwiW25bRHfJioHqYJSOfrKYcVgoLyIbTNQmT+3m72y9ug2786dru2KgugFq2kNqWixjUoOT/bOAOKWnz2qXBkr2qBv29LJDMVKgir5iNGGiFuH8Y6ouHRSXsuYLx6QLZJlusRCokiQuoc5A8QxCiui0ZwHLZdDSqDsWV8dXqUsPQqCKFvubMFHRzvy9F4GLVsXSyHq7WgOBPRnzgeqvUTtDZmyhkI9C10yaCq6Ks4BJaUnF+UfRb4AQKVAF++GbM1HR58tJie2IZi+2JkJFUDXnT91/Lj+eLfZbFnKLY4yuR58omvAS0Pc083e3BGC3/hGgs3zuAKprs6AZE5U4/8Wt1+0CrtsaDceJulLg1lQqv800YrXn1NCjCEhZnjjp4HekckUv8sO9X1eKVVLOBKovgybdF9xdyihmIM7/4fhCsi1gyQvgIlAAiVVSbkm1GYgW+8HPpABeAZq0paGPMj18XRcLfq8rJQdm2Y7S6Zi9Sd/NmajRq0CV9tWS14jWOrrzN75CZEZ1w2STXO05kdfLGMI8YJX91uqlbxC1Vd4kWsUvu+or1cpkC5Qt1KSJSpz/A9VrdyB6q6CnGqqknApUUe25qwsfP5G3gCr1V5flRPEUwvMWlYABHxDTgeodpEGTJmrN+Vs/UD9cu5i9PiqgYuGoknIyUEXFX98ufPhkSE2+Z+pX/4GoroBmC6uk3BGoosX+HVsKHz4Z4vw7ciV5gpAR4vxpJeWW+vWvk8st6VfF8o6uy4GJy1nymI0/Mr1QKcV6oIpqzzVtohLnPy5xPdl0buddphiqpFwPVFGZUlwiqFGqacs1P5Vz1nGsmAoHV2WvcGWFSZU04henrHo1zc5aWtHD2qZN1GgZGIbnkg0Wsm1OZi5liqmVlGNqgWqm8FJ/8c/vFTx0ZsiXnUGpFhcQay2syxRDlZSrgSpa7G/eREULEOmNEn/6MzHXCHP+sJJyNVBF1bTXFDtwNqbo2ozJNJEzwChLqGbI/bcHqigdvaXAUbNDnP+LmTYzZxsvBYlD+DMRqqTcEl9JNm1XXi1y2OyQPUu53dssJ98AdP6wknJbdZu/kCsfL3LY7JDvZU9mG02bQawwsDFVzVxJOeHc4wP5BpFuny502OwQ539YrtVlxAwD0PmLlZTzxL+i98iFfy1y1BTWAH3yZ6VMGkDsEKHOvzUgJuLehrXnxun9FQdw/k8IzS4mBotg588qKV8Jv7w28YmKqvFLTyOUWVEn+YJzM1fuTVXwZpWXUO25/osLGzHA+1XdbLwiNdxct0TGoaD2u+L4JP/SvTVQJZlzTZ2o0QeSqhnE8+fGgswKceX6b1w5VEn5fLLYv3VR44UgRSDeEluyjcp5JnPl6OHRNczpBxcVNFwMUq5EPiht1EhHk9sZQU8IjPjpPDHWJ9iQgkYLAl6a3zE0fdDB5A4cDrONxsKDFOpkH2K1qdvciUqcv/Gd2SuzwsH5F5W7Ufl74wPlAjmKx1hgkO2qz+B0SEHDiwztNHei1p2/QP2ntMzYenn+YhUH59/Y23AHzzc6So6MBjqZQzyfzIp1XNRrf2ynfBC/fXWaPFEbcP5tTBTMtFvt4vyjqMV9BPP8o9FBcqVeVc88FFMszbs6W/iGk3qwlKKdtRobImeI87eu7LCqfAkck+4+hGItWcfi+UxlQmbayzYBV+W+uinrKde6KQhP6bDxz0YGyIfaOXy29PJHrRLEbx4WrndTEH0ssdL0iYrO4XvfKsE1s8J8MIiIlg+vrzPu08Dw+AHWIRYoR6Tvygazipvz9/GEGZo/UVMldQ2sr4j4l1NmhZvzL8D9b+o7NN4QlbfRhOBTwWNWuaqYu+1uwX8nTFTy41LPwJjpslzt6Pw9YrY04oF35UK2RX2gSvm3g5E3uqoIKynnaXNhML24UIjzNx6OVGcaKQRQxdH553M93OoRGc9nKBFwCK/m/GNWWCXUYuD4YTjd0fnjSsoynTFRo3hBRLn1DwExE3BmxeHOKjZUM8daTrQkiPNHyce9qVP22MXEKimLdMpEJTuP0EltqBBAjMeRrw1shgEb4IsnPk1H21R+CJLUD5opHbOi4J+12SkTFX2t6IokjQVVWGJuclfSv7Yj3K9RMOC72gLhsBkJdoaEu/NP7zB0qtXQORM1mqNrNpLKQpkVV3go6e3+nVYYC4M4/55UGMrQ8drCXK+k7PbW/6FPX43zH6DaqVhashCAyfz/+qi52Gks6zh+DS8KcpTea1gaKWHg4fxpJeUsnTRRxUMfs3NsGBcHdoi0+Kh5RkoEfff3un8FYHL+iYGlzj9GLwTg4/ytlZTNI9xZE5Us/85xkacevXibl5pep+TO8+qqcYjzd9ofr37yztWQZLBKyik6baI+BpS7x0midtzxfD9Fh+QlaW8B3L8WzDwwqPc6SVxo3M/UPgi7+Sm6GiiaxpSmXD7zgXbqGdppnrJLsx10aIFVUk6iLwGVBTib3MX5xxxgfUz7OX+PhM13HNUOBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQOD/kv8BDVonljy6Jq4AAAAASUVORK5CYII="
];
function add_css$2(target) {
  append_styles(target, "svelte-5spisq", ".nvjs-legend-line.svelte-5spisq{pointer-events:all;position:relative;user-select:none;border-radius:3px;padding:2px 5px;margin-bottom:2px;width:fit-content}.nvjs-logo.svelte-5spisq{width:35px;height:20px;float:left;margin-left:-5px;margin-right:2px;opacity:0.85}.nvjs-ll-data.svelte-5spisq{font-variant-numeric:tabular-nums}.nvjs-ll-value{margin-left:3px}.nvjs-ll-x{margin-left:3px}.nvjs-eye.svelte-5spisq{width:20px;height:20px;float:right;margin-right:2px;margin-left:7px}.nvjs-eye.svelte-5spisq:hover{filter:brightness(1.25)}.king-icon.svelte-5spisq{padding-left:8px;padding-right:8px;margin-right:4px;filter:grayscale()}");
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[44] = list[i];
  child_ctx[46] = i;
  return child_ctx;
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[44] = list[i];
  child_ctx[46] = i;
  return child_ctx;
}
function create_if_block$3(ctx) {
  let div;
  let t0;
  let span;
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*ov*/
    ctx[1].main && /*props*/
    ctx[2].showLogo && create_if_block_10(ctx)
  );
  let if_block1 = (
    /*ov*/
    ctx[1].main && create_if_block_9(ctx)
  );
  let if_block2 = (
    /*display*/
    ctx[7] && !/*hover*/
    ctx[3] && create_if_block_3(ctx)
  );
  let if_block3 = !/*display*/
  ctx[7] && !/*hover*/
  ctx[3] && create_if_block_2$1(ctx);
  let if_block4 = (
    /*hover*/
    ctx[3] && create_if_block_1$1(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block0)
        if_block0.c();
      t0 = space();
      span = element("span");
      t1 = text(
        /*name*/
        ctx[19]
      );
      t2 = space();
      if (if_block1)
        if_block1.c();
      t3 = space();
      if (if_block2)
        if_block2.c();
      t4 = space();
      if (if_block3)
        if_block3.c();
      t5 = space();
      if (if_block4)
        if_block4.c();
      attr(span, "class", "nvjs-ll-name svelte-5spisq");
      attr(div, "class", "nvjs-legend-line svelte-5spisq");
      attr(
        div,
        "style",
        /*style*/
        ctx[14]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0)
        if_block0.m(div, null);
      append(div, t0);
      append(div, span);
      append(span, t1);
      append(span, t2);
      if (if_block1)
        if_block1.m(span, null);
      ctx[32](span);
      append(div, t3);
      if (if_block2)
        if_block2.m(div, null);
      append(div, t4);
      if (if_block3)
        if_block3.m(div, null);
      append(div, t5);
      if (if_block4)
        if_block4.m(div, null);
      ctx[34](div);
      current = true;
      if (!mounted) {
        dispose = [
          listen(
            div,
            "mousemove",
            /*onMouseMove*/
            ctx[20]
          ),
          listen(
            div,
            "mouseleave",
            /*onMouseLeave*/
            ctx[21]
          ),
          listen(
            div,
            "click",
            /*onClick*/
            ctx[22]
          ),
          listen(div, "keypress", null)
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*ov*/
        ctx2[1].main && /*props*/
        ctx2[2].showLogo
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_10(ctx2);
          if_block0.c();
          if_block0.m(div, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!current || dirty[0] & /*name*/
      524288)
        set_data(
          t1,
          /*name*/
          ctx2[19]
        );
      if (
        /*ov*/
        ctx2[1].main
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_9(ctx2);
          if_block1.c();
          if_block1.m(span, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*display*/
        ctx2[7] && !/*hover*/
        ctx2[3]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_3(ctx2);
          if_block2.c();
          if_block2.m(div, t4);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (!/*display*/
      ctx2[7] && !/*hover*/
      ctx2[3]) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block_2$1(ctx2);
          if_block3.c();
          if_block3.m(div, t5);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (
        /*hover*/
        ctx2[3]
      ) {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
          if (dirty[0] & /*hover*/
          8) {
            transition_in(if_block4, 1);
          }
        } else {
          if_block4 = create_if_block_1$1(ctx2);
          if_block4.c();
          transition_in(if_block4, 1);
          if_block4.m(div, null);
        }
      } else if (if_block4) {
        group_outros();
        transition_out(if_block4, 1, 1, () => {
          if_block4 = null;
        });
        check_outros();
      }
      if (!current || dirty[0] & /*style*/
      16384) {
        attr(
          div,
          "style",
          /*style*/
          ctx2[14]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block4);
      current = true;
    },
    o(local) {
      transition_out(if_block4);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      ctx[32](null);
      if (if_block2)
        if_block2.d();
      if (if_block3)
        if_block3.d();
      if (if_block4)
        if_block4.d();
      ctx[34](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_10(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "nvjs-logo svelte-5spisq");
      attr(
        div,
        "style",
        /*logoStyle*/
        ctx[17]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*logoStyle*/
      131072) {
        attr(
          div,
          "style",
          /*logoStyle*/
          ctx2[17]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block_9(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      attr(span, "class", "king-icon svelte-5spisq");
      attr(
        span,
        "style",
        /*kingStyle*/
        ctx[15]
      );
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*kingStyle*/
      32768) {
        attr(
          span,
          "style",
          /*kingStyle*/
          ctx2[15]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_if_block_3(ctx) {
  let span;
  function select_block_type(ctx2, dirty) {
    if (!/*legend*/
    ctx2[13] && !/*legendHtml*/
    ctx2[12])
      return create_if_block_4;
    if (
      /*legendHtml*/
      ctx2[12] && /*data*/
      ctx2[8].length
    )
      return create_if_block_7;
    if (
      /*data*/
      ctx2[8].length
    )
      return create_if_block_8;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type && current_block_type(ctx);
  return {
    c() {
      span = element("span");
      if (if_block)
        if_block.c();
      attr(span, "class", "nvjs-ll-data svelte-5spisq");
      attr(
        span,
        "style",
        /*dataStyle*/
        ctx[18]
      );
    },
    m(target, anchor) {
      insert(target, span, anchor);
      if (if_block)
        if_block.m(span, null);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if (if_block)
          if_block.d(1);
        if_block = current_block_type && current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(span, null);
        }
      }
      if (dirty[0] & /*dataStyle*/
      262144) {
        attr(
          span,
          "style",
          /*dataStyle*/
          ctx2[18]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(span);
      if (if_block) {
        if_block.d();
      }
    }
  };
}
function create_if_block_8(ctx) {
  let each_1_anchor;
  let each_value_1 = (
    /*legend*/
    ctx[13](
      /*data*/
      ctx[8],
      /*prec*/
      ctx[11]
    )
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*legend, data, prec, formatter*/
      8399104) {
        each_value_1 = /*legend*/
        ctx2[13](
          /*data*/
          ctx2[8],
          /*prec*/
          ctx2[11]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function create_if_block_7(ctx) {
  let html_tag;
  let raw_value = (
    /*legendHtml*/
    ctx[12](
      /*data*/
      ctx[8],
      /*prec*/
      ctx[11],
      /*formatter*/
      ctx[23]
    ) + ""
  );
  let html_anchor;
  return {
    c() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m(target, anchor) {
      html_tag.m(raw_value, target, anchor);
      insert(target, html_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*legendHtml, data, prec*/
      6400 && raw_value !== (raw_value = /*legendHtml*/
      ctx2[12](
        /*data*/
        ctx2[8],
        /*prec*/
        ctx2[11],
        /*formatter*/
        ctx2[23]
      ) + ""))
        html_tag.p(raw_value);
    },
    d(detaching) {
      if (detaching)
        detach(html_anchor);
      if (detaching)
        html_tag.d();
    }
  };
}
function create_if_block_4(ctx) {
  let each_1_anchor;
  let each_value = (
    /*data*/
    ctx[8]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*formatter, data*/
      8388864) {
        each_value = /*data*/
        ctx2[8];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
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
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function create_each_block_1(ctx) {
  let span;
  let t0_value = (
    /*formatter*/
    ctx[23](
      /*v*/
      ctx[44][0]
    ) + ""
  );
  let t0;
  let t1;
  let span_style_value;
  return {
    c() {
      span = element("span");
      t0 = text(t0_value);
      t1 = space();
      attr(span, "class", "nvjs-ll-value");
      attr(span, "style", span_style_value = `color: ${/*v*/
      ctx[44][1]}`);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*legend, data, prec*/
      10496 && t0_value !== (t0_value = /*formatter*/
      ctx2[23](
        /*v*/
        ctx2[44][0]
      ) + ""))
        set_data(t0, t0_value);
      if (dirty[0] & /*legend, data, prec*/
      10496 && span_style_value !== (span_style_value = `color: ${/*v*/
      ctx2[44][1]}`)) {
        attr(span, "style", span_style_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_if_block_5(ctx) {
  let if_block_anchor;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*v*/
      ctx2[44] != null
    )
      return create_if_block_6;
    return create_else_block$2;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    d(detaching) {
      if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_else_block$2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "x";
      attr(span, "class", "nvjs-ll-x");
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_if_block_6(ctx) {
  let span;
  let t0_value = (
    /*formatter*/
    ctx[23](
      /*v*/
      ctx[44]
    ) + ""
  );
  let t0;
  let t1;
  return {
    c() {
      span = element("span");
      t0 = text(t0_value);
      t1 = space();
      attr(span, "class", "nvjs-ll-value");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*data*/
      256 && t0_value !== (t0_value = /*formatter*/
      ctx2[23](
        /*v*/
        ctx2[44]
      ) + ""))
        set_data(t0, t0_value);
    },
    d(detaching) {
      if (detaching)
        detach(span);
    }
  };
}
function create_each_block$2(ctx) {
  let if_block_anchor;
  let if_block = (
    /*i*/
    ctx[46] > 0 && create_if_block_5(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*i*/
        ctx2[46] > 0
      )
        if_block.p(ctx2, dirty);
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_if_block_2$1(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "nvjs-eye svelte-5spisq");
      attr(
        div,
        "style",
        /*eyeStyle*/
        ctx[16]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*eyeStyle*/
      65536) {
        attr(
          div,
          "style",
          /*eyeStyle*/
          ctx2[16]
        );
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_if_block_1$1(ctx) {
  let legendcontrols;
  let current;
  let legendcontrols_props = {
    gridId: (
      /*gridId*/
      ctx[0]
    ),
    ov: (
      /*ov*/
      ctx[1]
    ),
    props: (
      /*props*/
      ctx[2]
    ),
    height: (
      /*boundary*/
      ctx[6].height
    )
  };
  legendcontrols = new LegendControls({ props: legendcontrols_props });
  ctx[33](legendcontrols);
  return {
    c() {
      create_component(legendcontrols.$$.fragment);
    },
    m(target, anchor) {
      mount_component(legendcontrols, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const legendcontrols_changes = {};
      if (dirty[0] & /*gridId*/
      1)
        legendcontrols_changes.gridId = /*gridId*/
        ctx2[0];
      if (dirty[0] & /*ov*/
      2)
        legendcontrols_changes.ov = /*ov*/
        ctx2[1];
      if (dirty[0] & /*props*/
      4)
        legendcontrols_changes.props = /*props*/
        ctx2[2];
      if (dirty[0] & /*boundary*/
      64)
        legendcontrols_changes.height = /*boundary*/
        ctx2[6].height;
      legendcontrols.$set(legendcontrols_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(legendcontrols.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(legendcontrols.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      ctx[33](null);
      destroy_component(legendcontrols, detaching);
    }
  };
}
function create_fragment$6(ctx) {
  let if_block_anchor;
  let current;
  let if_block = !/*legendFns*/
  ctx[9].noLegend && create_if_block$3(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (!/*legendFns*/
      ctx2[9].noLegend) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*legendFns*/
          512) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$3(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let updId;
  let name;
  let fontSz;
  let styleBase;
  let styleHover;
  let dataStyle;
  let logoStyle;
  let eyeStyle;
  let kingStyle;
  let boundary;
  let nBoundary;
  let style;
  let legendFns;
  let legend;
  let legendHtml;
  let values;
  let data2;
  let scale;
  let prec;
  let display;
  let state;
  let { gridId } = $$props;
  let { ov } = $$props;
  let { props } = $$props;
  let { layout } = $$props;
  let meta = MetaHub$1.instance(props.id);
  let events = Events$1.instance(props.id);
  let hover = false;
  let ref;
  let nRef;
  let ctrlRef;
  let selected = false;
  onMount(() => {
    events.on(`${updId}:update-ll`, update2);
    events.on(`${updId}:grid-mousedown`, onDeselect);
    events.on(`${updId}:select-overlay`, onDeselect);
  });
  onDestroy(() => {
    events.off(updId);
  });
  function update2() {
    $$invalidate(7, display = ov.settings.display !== false);
    if (ctrlRef)
      ctrlRef.update();
  }
  function onMouseMove(e) {
    if (e.clientX < nBoundary.x + nBoundary.width + 35 && !hover) {
      setTimeout(() => {
        updateBoundaries();
        $$invalidate(3, hover = true);
      });
    }
  }
  function onMouseLeave(e) {
    setTimeout(() => {
      updateBoundaries();
      $$invalidate(3, hover = false);
    });
  }
  function onClick() {
    events.emit("select-overlay", { index: [gridId, ov.id] });
    $$invalidate(25, selected = true);
  }
  function onDeselect(event2) {
    $$invalidate(25, selected = false);
  }
  function formatter(x, $prec = prec) {
    if (x == void 0)
      return "x";
    if (typeof x !== "number")
      return x;
    return x.toFixed($prec);
  }
  function findOverlayScale(scales) {
    return Object.values(scales).find((x) => x.scaleSpecs.ovIdxs.includes(ov.id)) || scales[layout.scaleIndex];
  }
  function updateBoundaries() {
    $$invalidate(6, boundary = ref.getBoundingClientRect());
  }
  function span_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      nRef = $$value;
      $$invalidate(5, nRef);
    });
  }
  function legendcontrols_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      ctrlRef = $$value;
      $$invalidate(10, ctrlRef);
    });
  }
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      ref = $$value;
      $$invalidate(4, ref);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("gridId" in $$props2)
      $$invalidate(0, gridId = $$props2.gridId);
    if ("ov" in $$props2)
      $$invalidate(1, ov = $$props2.ov);
    if ("props" in $$props2)
      $$invalidate(2, props = $$props2.props);
    if ("layout" in $$props2)
      $$invalidate(24, layout = $$props2.layout);
  };
  $$self.$$.update = () => {
    var _a;
    if ($$self.$$.dirty[0] & /*gridId, ov*/
    3) {
      updId = `ll-${gridId}-${ov.id}`;
    }
    if ($$self.$$.dirty[0] & /*ov*/
    2) {
      $$invalidate(19, name = (_a = ov.name) != null ? _a : `${ov.type || "Overlay"}-${ov.id}`);
    }
    if ($$self.$$.dirty[0] & /*props*/
    4) {
      $$invalidate(31, fontSz = parseInt(props.config.FONT.split("px").shift()));
    }
    if ($$self.$$.dirty[0] & /*props, ov, selected, layout*/
    50331654 | $$self.$$.dirty[1] & /*fontSz*/
    1) {
      $$invalidate(30, styleBase = `
    font: ${props.config.FONT};
    font-size: ${fontSz + (ov.main ? 5 : 3)}px;
    font-weight: 300;
    color: ${props.colors.textLG};
    background: ${selected ? props.colors.back : props.colors.llBack};
    border: 1px solid transparent;
    margin-right: 30px;
    max-width: ${layout.width - 20}px;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-color: ${selected ? props.colors.llSelect : "auto"} !important;
`);
    }
    if ($$self.$$.dirty[0] & /*props*/
    4) {
      $$invalidate(29, styleHover = `
    background: ${props.colors.back};
    border: 1px solid ${props.colors.grid};

`);
    }
    if ($$self.$$.dirty[0] & /*ov, props*/
    6 | $$self.$$.dirty[1] & /*fontSz*/
    1) {
      $$invalidate(18, dataStyle = `
    font-size: ${fontSz + (ov.main ? 3 : 2)}px;
    color: ${props.colors.llValue}
`);
    }
    if ($$self.$$.dirty[0] & /*ov*/
    2) {
      $$invalidate(7, display = ov.settings.display !== false);
    }
    if ($$self.$$.dirty[0] & /*display*/
    128) {
      $$invalidate(26, state = display ? "open" : "closed");
    }
    if ($$self.$$.dirty[0] & /*ref*/
    16) {
      $$invalidate(6, boundary = ref ? ref.getBoundingClientRect() : {});
    }
    if ($$self.$$.dirty[0] & /*state, boundary*/
    67108928) {
      $$invalidate(16, eyeStyle = `
    background-image: url(${icons[state + "-eye"]});
    background-size: contain;
    background-repeat: no-repeat;
    margin-top: ${(boundary.height - 20) * 0.5 - 3}px;
    margin-bottom: -2px;
`);
    }
    if ($$self.$$.dirty[0] & /*boundary*/
    64) {
      `
    width: ${boundary.width}px;
    height: ${boundary.height}px;
    background: #55f9;
    top: -1px;
    left: -2px;
`;
    }
    if ($$self.$$.dirty[0] & /*props*/
    4) {
      $$invalidate(28, values = props.cursor.values || []);
    }
    if ($$self.$$.dirty[0] & /*values, gridId, ov*/
    268435459) {
      $$invalidate(8, data2 = (values[gridId] || [])[ov.id] || []);
    }
    if ($$self.$$.dirty[0] & /*hover, display, data*/
    392) {
      $$invalidate(15, kingStyle = `
    background-image: url(${icons["king3"]});
    background-size: contain;
    background-repeat: no-repeat;
    margin-left: ${hover || !display || !data2.length ? 7 : 3}px;
`);
    }
    if ($$self.$$.dirty[0] & /*nRef*/
    32) {
      nBoundary = nRef ? nRef.getBoundingClientRect() : {};
    }
    if ($$self.$$.dirty[0] & /*styleBase, hover, styleHover*/
    1610612744) {
      $$invalidate(14, style = styleBase + (hover ? styleHover : ""));
    }
    if ($$self.$$.dirty[0] & /*gridId, ov*/
    3) {
      $$invalidate(9, legendFns = meta.getLegendFns(gridId, ov.id) || {});
    }
    if ($$self.$$.dirty[0] & /*legendFns*/
    512) {
      $$invalidate(13, legend = legendFns.legend);
    }
    if ($$self.$$.dirty[0] & /*legendFns*/
    512) {
      $$invalidate(12, legendHtml = legendFns.legendHtml);
    }
    if ($$self.$$.dirty[0] & /*layout*/
    16777216) {
      $$invalidate(27, scale = findOverlayScale(layout.scales));
    }
    if ($$self.$$.dirty[0] & /*scale*/
    134217728) {
      $$invalidate(11, prec = scale.prec);
    }
  };
  $$invalidate(17, logoStyle = `
    background-image: url(${logo[0]});
    background-size: contain;
    background-repeat: no-repeat;
`);
  return [
    gridId,
    ov,
    props,
    hover,
    ref,
    nRef,
    boundary,
    display,
    data2,
    legendFns,
    ctrlRef,
    prec,
    legendHtml,
    legend,
    style,
    kingStyle,
    eyeStyle,
    logoStyle,
    dataStyle,
    name,
    onMouseMove,
    onMouseLeave,
    onClick,
    formatter,
    layout,
    selected,
    state,
    scale,
    values,
    styleHover,
    styleBase,
    fontSz,
    span_binding,
    legendcontrols_binding,
    div_binding
  ];
}
class LegendLine extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, { gridId: 0, ov: 1, props: 2, layout: 24 }, add_css$2, [-1, -1]);
  }
}
function add_css$1(target) {
  append_styles(target, "svelte-16ib1si", ".nvjs-legend.svelte-16ib1si{pointer-events:none}");
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  child_ctx[11] = i;
  return child_ctx;
}
function create_if_block$2(ctx) {
  let div;
  let current;
  let each_value = (
    /*hub*/
    ctx[5].panes()[
      /*id*/
      ctx[0]
    ].overlays
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "nvjs-legend svelte-16ib1si");
      attr(
        div,
        "style",
        /*style*/
        ctx[4]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & /*id, props, layout, hub*/
      39) {
        each_value = /*hub*/
        ctx2[5].panes()[
          /*id*/
          ctx2[0]
        ].overlays;
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, null);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (!current || dirty & /*style*/
      16) {
        attr(
          div,
          "style",
          /*style*/
          ctx2[4]
        );
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block$1(ctx) {
  let legendline;
  let current;
  legendline = new LegendLine({
    props: {
      gridId: (
        /*id*/
        ctx[0]
      ),
      props: (
        /*props*/
        ctx[1]
      ),
      layout: (
        /*layout*/
        ctx[2]
      ),
      ov: (
        /*ov*/
        ctx[9]
      )
    }
  });
  return {
    c() {
      create_component(legendline.$$.fragment);
    },
    m(target, anchor) {
      mount_component(legendline, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const legendline_changes = {};
      if (dirty & /*id*/
      1)
        legendline_changes.gridId = /*id*/
        ctx2[0];
      if (dirty & /*props*/
      2)
        legendline_changes.props = /*props*/
        ctx2[1];
      if (dirty & /*layout*/
      4)
        legendline_changes.layout = /*layout*/
        ctx2[2];
      if (dirty & /*id*/
      1)
        legendline_changes.ov = /*ov*/
        ctx2[9];
      legendline.$set(legendline_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(legendline.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(legendline.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(legendline, detaching);
    }
  };
}
function create_key_block(ctx) {
  let show_if = (
    /*hub*/
    ctx[5].panes()[
      /*id*/
      ctx[0]
    ]
  );
  let if_block_anchor;
  let current;
  let if_block = show_if && create_if_block$2(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & /*id*/
      1)
        show_if = /*hub*/
        ctx2[5].panes()[
          /*id*/
          ctx2[0]
        ];
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*id*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$2(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_fragment$5(ctx) {
  let previous_key = (
    /*legendRR*/
    ctx[3]
  );
  let key_block_anchor;
  let current;
  let key_block = create_key_block(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*legendRR*/
      8 && safe_not_equal(previous_key, previous_key = /*legendRR*/
      ctx2[3])) {
        group_outros();
        transition_out(key_block, 1, 1, noop);
        check_outros();
        key_block = create_key_block(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  let style;
  let { id } = $$props;
  let { props } = $$props;
  let { main } = $$props;
  let { layout } = $$props;
  let hub = DataHub$1.instance(props.id);
  let events = Events$1.instance(props.id);
  let legendRR = 0;
  events.on(`legend-${id}:update-legend`, update2);
  onDestroy(() => {
    events.off(`legend-${id}`);
  });
  function update2() {
    $$invalidate(3, legendRR++, legendRR);
  }
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(0, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
    if ("main" in $$props2)
      $$invalidate(6, main = $$props2.main);
    if ("layout" in $$props2)
      $$invalidate(2, layout = $$props2.layout);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*layout*/
    4) {
      $$invalidate(4, style = `
    left: ${layout.sbMax[0] + 5}px;
    top: ${(layout.offset || 0) + 5}px;
    position: absolute;
`);
    }
  };
  return [id, props, layout, legendRR, style, hub, main];
}
class Legend extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, { id: 0, props: 1, main: 6, layout: 2 }, add_css$1);
  }
}
function create_if_block$1(ctx) {
  let div;
  let grid_1;
  let t0;
  let legend;
  let t1;
  let current_block_type_index;
  let if_block0;
  let t2;
  let current_block_type_index_1;
  let if_block1;
  let current;
  let grid_1_props = {
    id: (
      /*id*/
      ctx[1]
    ),
    props: (
      /*props*/
      ctx[2]
    ),
    layout: (
      /*layout*/
      ctx[0]
    ),
    main: (
      /*main*/
      ctx[3]
    )
  };
  grid_1 = new Grid_1({ props: grid_1_props });
  ctx[10](grid_1);
  legend = new Legend({
    props: {
      id: (
        /*id*/
        ctx[1]
      ),
      props: (
        /*props*/
        ctx[2]
      ),
      layout: (
        /*layout*/
        ctx[0]
      ),
      main: (
        /*main*/
        ctx[3]
      )
    }
  });
  const if_block_creators = [create_if_block_2, create_else_block_1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*leftSb*/
      ctx2[9].length
    )
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const if_block_creators_1 = [create_if_block_1, create_else_block$1];
  const if_blocks_1 = [];
  function select_block_type_1(ctx2, dirty) {
    if (
      /*rightSb*/
      ctx2[8].length
    )
      return 0;
    return 1;
  }
  current_block_type_index_1 = select_block_type_1(ctx);
  if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
  return {
    c() {
      div = element("div");
      create_component(grid_1.$$.fragment);
      t0 = space();
      create_component(legend.$$.fragment);
      t1 = space();
      if_block0.c();
      t2 = space();
      if_block1.c();
      attr(div, "class", "nvjs-pane svelte-9o7s1l");
      attr(
        div,
        "style",
        /*style*/
        ctx[7]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(grid_1, div, null);
      append(div, t0);
      mount_component(legend, div, null);
      append(div, t1);
      if_blocks[current_block_type_index].m(div, null);
      append(div, t2);
      if_blocks_1[current_block_type_index_1].m(div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const grid_1_changes = {};
      if (dirty & /*id*/
      2)
        grid_1_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*props*/
      4)
        grid_1_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*layout*/
      1)
        grid_1_changes.layout = /*layout*/
        ctx2[0];
      if (dirty & /*main*/
      8)
        grid_1_changes.main = /*main*/
        ctx2[3];
      grid_1.$set(grid_1_changes);
      const legend_changes = {};
      if (dirty & /*id*/
      2)
        legend_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*props*/
      4)
        legend_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*layout*/
      1)
        legend_changes.layout = /*layout*/
        ctx2[0];
      if (dirty & /*main*/
      8)
        legend_changes.main = /*main*/
        ctx2[3];
      legend.$set(legend_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block0 = if_blocks[current_block_type_index];
        if (!if_block0) {
          if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block0.c();
        } else {
          if_block0.p(ctx2, dirty);
        }
        transition_in(if_block0, 1);
        if_block0.m(div, t2);
      }
      let previous_block_index_1 = current_block_type_index_1;
      current_block_type_index_1 = select_block_type_1(ctx2);
      if (current_block_type_index_1 === previous_block_index_1) {
        if_blocks_1[current_block_type_index_1].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
          if_blocks_1[previous_block_index_1] = null;
        });
        check_outros();
        if_block1 = if_blocks_1[current_block_type_index_1];
        if (!if_block1) {
          if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx2);
          if_block1.c();
        } else {
          if_block1.p(ctx2, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(div, null);
      }
      if (!current || dirty & /*style*/
      128) {
        attr(
          div,
          "style",
          /*style*/
          ctx2[7]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(grid_1.$$.fragment, local);
      transition_in(legend.$$.fragment, local);
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(grid_1.$$.fragment, local);
      transition_out(legend.$$.fragment, local);
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[10](null);
      destroy_component(grid_1);
      destroy_component(legend);
      if_blocks[current_block_type_index].d();
      if_blocks_1[current_block_type_index_1].d();
    }
  };
}
function create_else_block_1(ctx) {
  let sidebarstub;
  let current;
  sidebarstub = new SidebarStub({
    props: {
      id: (
        /*id*/
        ctx[1]
      ),
      props: (
        /*props*/
        ctx[2]
      ),
      layout: (
        /*layout*/
        ctx[0]
      ),
      side: "left"
    }
  });
  return {
    c() {
      create_component(sidebarstub.$$.fragment);
    },
    m(target, anchor) {
      mount_component(sidebarstub, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const sidebarstub_changes = {};
      if (dirty & /*id*/
      2)
        sidebarstub_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*props*/
      4)
        sidebarstub_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*layout*/
      1)
        sidebarstub_changes.layout = /*layout*/
        ctx2[0];
      sidebarstub.$set(sidebarstub_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(sidebarstub.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(sidebarstub.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(sidebarstub, detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let sidebar;
  let current;
  let sidebar_props = {
    id: (
      /*id*/
      ctx[1]
    ),
    props: (
      /*props*/
      ctx[2]
    ),
    layout: (
      /*layout*/
      ctx[0]
    ),
    side: "left",
    scales: (
      /*leftSb*/
      ctx[9]
    )
  };
  sidebar = new Sidebar({ props: sidebar_props });
  ctx[11](sidebar);
  return {
    c() {
      create_component(sidebar.$$.fragment);
    },
    m(target, anchor) {
      mount_component(sidebar, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const sidebar_changes = {};
      if (dirty & /*id*/
      2)
        sidebar_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*props*/
      4)
        sidebar_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*layout*/
      1)
        sidebar_changes.layout = /*layout*/
        ctx2[0];
      if (dirty & /*leftSb*/
      512)
        sidebar_changes.scales = /*leftSb*/
        ctx2[9];
      sidebar.$set(sidebar_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(sidebar.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(sidebar.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      ctx[11](null);
      destroy_component(sidebar, detaching);
    }
  };
}
function create_else_block$1(ctx) {
  let sidebarstub;
  let current;
  sidebarstub = new SidebarStub({
    props: {
      id: (
        /*id*/
        ctx[1]
      ),
      props: (
        /*props*/
        ctx[2]
      ),
      layout: (
        /*layout*/
        ctx[0]
      ),
      side: "right"
    }
  });
  return {
    c() {
      create_component(sidebarstub.$$.fragment);
    },
    m(target, anchor) {
      mount_component(sidebarstub, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const sidebarstub_changes = {};
      if (dirty & /*id*/
      2)
        sidebarstub_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*props*/
      4)
        sidebarstub_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*layout*/
      1)
        sidebarstub_changes.layout = /*layout*/
        ctx2[0];
      sidebarstub.$set(sidebarstub_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(sidebarstub.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(sidebarstub.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(sidebarstub, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let sidebar;
  let current;
  let sidebar_props = {
    id: (
      /*id*/
      ctx[1]
    ),
    props: (
      /*props*/
      ctx[2]
    ),
    layout: (
      /*layout*/
      ctx[0]
    ),
    side: "right",
    scales: (
      /*rightSb*/
      ctx[8]
    )
  };
  sidebar = new Sidebar({ props: sidebar_props });
  ctx[12](sidebar);
  return {
    c() {
      create_component(sidebar.$$.fragment);
    },
    m(target, anchor) {
      mount_component(sidebar, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const sidebar_changes = {};
      if (dirty & /*id*/
      2)
        sidebar_changes.id = /*id*/
        ctx2[1];
      if (dirty & /*props*/
      4)
        sidebar_changes.props = /*props*/
        ctx2[2];
      if (dirty & /*layout*/
      1)
        sidebar_changes.layout = /*layout*/
        ctx2[0];
      if (dirty & /*rightSb*/
      256)
        sidebar_changes.scales = /*rightSb*/
        ctx2[8];
      sidebar.$set(sidebar_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(sidebar.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(sidebar.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      ctx[12](null);
      destroy_component(sidebar, detaching);
    }
  };
}
function create_fragment$4(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*layout*/
    ctx[0] && create_if_block$1(ctx)
  );
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*layout*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*layout*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let leftSb;
  let rightSb;
  let style;
  let { id } = $$props;
  let { props } = $$props;
  let { main } = $$props;
  let { layout } = $$props;
  let events = Events$1.instance(props.id);
  let lsb;
  let rsb;
  let grid;
  events.on(`pane-${id}:update-pane`, update2);
  onMount(() => {
  });
  onDestroy(() => {
    events.off(`pane-${id}`);
  });
  function update2($layout) {
    if (!$layout.grids)
      return;
    $$invalidate(0, layout = $layout.grids[id]);
    events.emitSpec(`grid-${id}`, "update-grid", layout);
    let layers = grid && grid.getLayers ? grid.getLayers() : [];
    if (lsb)
      lsb.setLayers(layers);
    if (rsb)
      rsb.setLayers(layers);
    events.emitSpec(`sb-${id}-left`, "update-sb", layout);
    events.emitSpec(`sb-${id}-right`, "update-sb", layout);
  }
  function grid_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      grid = $$value;
      $$invalidate(6, grid);
    });
  }
  function sidebar_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      lsb = $$value;
      $$invalidate(4, lsb);
    });
  }
  function sidebar_binding_1($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      rsb = $$value;
      $$invalidate(5, rsb);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("id" in $$props2)
      $$invalidate(1, id = $$props2.id);
    if ("props" in $$props2)
      $$invalidate(2, props = $$props2.props);
    if ("main" in $$props2)
      $$invalidate(3, main = $$props2.main);
    if ("layout" in $$props2)
      $$invalidate(0, layout = $$props2.layout);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*layout*/
    1) {
      $$invalidate(9, leftSb = Utils.getScalesBySide(0, layout));
    }
    if ($$self.$$.dirty & /*layout*/
    1) {
      $$invalidate(8, rightSb = Utils.getScalesBySide(1, layout));
    }
    if ($$self.$$.dirty & /*props, layout, id*/
    7) {
      $$invalidate(7, style = `
    width: ${props.width}px;
    height: ${(layout || {}).height}px;
    /* didn't work, coz canvas draws through the border
    border-top: ${id ? "1px solid" : "none"};
    border-color: ${props.colors.scale};
    box-sizing: border-box;*/
`);
    }
  };
  return [
    layout,
    id,
    props,
    main,
    lsb,
    rsb,
    grid,
    style,
    rightSb,
    leftSb,
    grid_1_binding,
    sidebar_binding,
    sidebar_binding_1
  ];
}
class Pane extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { id: 1, props: 2, main: 3, layout: 0 });
  }
}
const {
  MINUTE15,
  MINUTE,
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
  MONTHMAP,
  HPX
} = Const;
function body(props, layout, ctx) {
  const width = layout.botbar.width;
  const height = layout.botbar.height;
  const sb0 = layout.main.sbMax[0];
  layout.main.sbMax[1];
  ctx.font = props.config.FONT;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = props.colors.scale;
  ctx.beginPath();
  ctx.moveTo(0, 0.5);
  ctx.lineTo(Math.floor(width + 1), 0.5);
  ctx.stroke();
  ctx.fillStyle = props.colors.text;
  ctx.beginPath();
  for (var p of layout.botbar.xs) {
    let lbl = formatDate(props, p);
    let x = p[0] + sb0;
    ctx.moveTo(x + HPX, 0);
    ctx.lineTo(x + HPX, 4.5);
    if (!lblHighlight(props, p[1][0])) {
      ctx.globalAlpha = 0.85;
    }
    ctx.textAlign = "center";
    ctx.fillText(lbl, x, 18);
    ctx.globalAlpha = 1;
  }
  ctx.stroke();
}
function panel(props, layout, ctx) {
  let lbl = formatCursorX(props);
  ctx.fillStyle = props.colors.panel;
  let measure = ctx.measureText(lbl + "    ");
  let panwidth = Math.floor(measure.width + 10);
  let cursor = props.cursor.x + layout.main.sbMax[0];
  let x = Math.floor(cursor - panwidth * 0.5);
  let y = 1;
  let panheight = props.config.PANHEIGHT;
  roundRect(ctx, x, y, panwidth, panheight + 0.5, 3);
  ctx.fillStyle = props.colors.textHL;
  ctx.textAlign = "center";
  ctx.fillText(lbl, cursor, y + 16);
}
function formatDate(props, p) {
  let t = p[1];
  let tf = props.timeFrame;
  let k = tf < DAY ? 1 : 0;
  let tZ = t + k * props.timezone * HOUR;
  let d = new Date(tZ);
  if (p[2] === YEAR || Utils.yearStart(t) === t) {
    return d.getUTCFullYear();
  }
  if (p[2] === MONTH || Utils.monthStart(t) === t) {
    return MONTHMAP[d.getUTCMonth()];
  }
  if (Utils.dayStart(tZ) === tZ)
    return d.getUTCDate();
  let h = Utils.addZero(d.getUTCHours());
  let m = Utils.addZero(d.getUTCMinutes());
  return h + ":" + m;
}
function formatCursorX(props) {
  let t = props.cursor.time;
  if (t === void 0)
    return `Out of range`;
  let tf = props.timeFrame;
  let k = tf < DAY ? 1 : 0;
  let d = new Date(t + k * props.timezone * HOUR);
  if (tf === YEAR) {
    return d.getUTCFullYear();
  }
  if (tf < YEAR) {
    var yr = "`" + `${d.getUTCFullYear()}`.slice(-2);
    var mo = MONTHMAP[d.getUTCMonth()];
    var dd = "01";
  }
  if (tf <= WEEK)
    dd = d.getUTCDate();
  let date = `${dd} ${mo} ${yr}`;
  let time = "";
  if (tf < DAY) {
    let h = Utils.addZero(d.getUTCHours());
    let m = Utils.addZero(d.getUTCMinutes());
    time = h + ":" + m;
  }
  return `${date}  ${time}`;
}
function lblHighlight(props, t) {
  let tf = props.timeFrame;
  if (t === 0)
    return true;
  if (Utils.monthStart(t) === t)
    return true;
  if (Utils.dayStart(t) === t)
    return true;
  if (tf <= MINUTE15 && t % HOUR === 0)
    return true;
  return false;
}
function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r)
    r = w / 2;
  if (h < 2 * r)
    r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, 0);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, 0);
  ctx.closePath();
  ctx.fill();
}
const bb = {
  body,
  panel
};
function create_fragment$3(ctx) {
  let div;
  let canvas_1;
  return {
    c() {
      div = element("div");
      canvas_1 = element("canvas");
      attr(
        canvas_1,
        "id",
        /*canvasId*/
        ctx[2]
      );
      attr(div, "class", "nvjs-botbar svelte-8gplax");
      attr(
        div,
        "id",
        /*bbId*/
        ctx[1]
      );
      attr(
        div,
        "style",
        /*bbStyle*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, canvas_1);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*bbStyle*/
      1) {
        attr(
          div,
          "style",
          /*bbStyle*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let bbStyle;
  let width;
  let { props = {} } = $$props;
  let { layout = {} } = $$props;
  let bbUpdId = `botbar`;
  let bbId = `${props.id}-botbar`;
  let canvasId = `${props.id}-botbar-canvas`;
  let events = Events$1.instance(props.id);
  events.on(`${bbUpdId}:update-bb`, update2);
  let canvas;
  let ctx;
  onMount(() => {
    setup2();
  });
  onDestroy(() => {
    events.off(`${bbUpdId}`);
  });
  function setup2() {
    let botbar = layout.botbar;
    [canvas, ctx] = dpr.setup(canvasId, botbar.width, botbar.height);
    update2();
  }
  function update2($layout = layout) {
    $$invalidate(3, layout = $layout);
    if (!layout.botbar)
      return;
    bb.body(props, layout, ctx);
    if (props.cursor.x && props.cursor.ti !== void 0) {
      bb.panel(props, layout, ctx);
    }
  }
  function resizeWatch() {
    let botbar = layout.botbar;
    if (!canvas || !botbar)
      return;
    dpr.resize(canvas, ctx, botbar.width, botbar.height);
    update2();
  }
  $$self.$$set = ($$props2) => {
    if ("props" in $$props2)
      $$invalidate(4, props = $$props2.props);
    if ("layout" in $$props2)
      $$invalidate(3, layout = $$props2.layout);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*props, layout*/
    24) {
      $$invalidate(0, bbStyle = `
    background: ${props.colors.back};
    width: ${(layout.botbar || {}).width}px;
    height: ${(layout.botbar || {}).height}px;
`);
    }
    if ($$self.$$.dirty & /*layout*/
    8) {
      $$invalidate(5, width = (layout.botbar || {}).width);
    }
    if ($$self.$$.dirty & /*width*/
    32) {
      resizeWatch();
    }
  };
  return [bbStyle, bbId, canvasId, layout, props, width];
}
class Botbar extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, { props: 4, layout: 3 });
  }
}
function create_fragment$2(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text("No data ¯\\_( °﹏°)_/¯");
      attr(div, "class", "nvjs-no-data-stub svelte-172ri4o");
      attr(
        div,
        "style",
        /*style*/
        ctx[0]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*style*/
      1) {
        attr(
          div,
          "style",
          /*style*/
          ctx2[0]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let style;
  let { props } = $$props;
  $$self.$$set = ($$props2) => {
    if ("props" in $$props2)
      $$invalidate(1, props = $$props2.props);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*props*/
    2) {
      $$invalidate(0, style = `
    display: flex;
    width: ${props.width}px;
    height: ${props.height}px;
    background: ${props.colors.back};
    color: ${props.colors.scale};
    font: ${props.config.FONT};
    font-size: 18px;
    font-style: italic;
    user-select: none;
    align-items:center;
    justify-content:center;
`);
    }
  };
  return [style, props];
}
class NoDataStub extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { props: 1 });
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[25] = list[i];
  child_ctx[27] = i;
  return child_ctx;
}
function create_else_block(ctx) {
  let nodatastub;
  let current;
  nodatastub = new NoDataStub({ props: { props: (
    /*props*/
    ctx[0]
  ) } });
  return {
    c() {
      create_component(nodatastub.$$.fragment);
    },
    m(target, anchor) {
      mount_component(nodatastub, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const nodatastub_changes = {};
      if (dirty & /*props*/
      1)
        nodatastub_changes.props = /*props*/
        ctx2[0];
      nodatastub.$set(nodatastub_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(nodatastub.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(nodatastub.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(nodatastub, detaching);
    }
  };
}
function create_if_block(ctx) {
  let t;
  let botbar;
  let current;
  let each_value = (
    /*hub*/
    ctx[3].panes()
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  botbar = new Botbar({
    props: {
      props: (
        /*chartProps*/
        ctx[2]
      ),
      layout: (
        /*layout*/
        ctx[1]
      )
    }
  });
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t = space();
      create_component(botbar.$$.fragment);
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, t, anchor);
      mount_component(botbar, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & /*layout, chartProps, hub*/
      14) {
        each_value = /*hub*/
        ctx2[3].panes();
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(t.parentNode, t);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      const botbar_changes = {};
      if (dirty & /*chartProps*/
      4)
        botbar_changes.props = /*chartProps*/
        ctx2[2];
      if (dirty & /*layout*/
      2)
        botbar_changes.layout = /*layout*/
        ctx2[1];
      botbar.$set(botbar_changes);
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(botbar.$$.fragment, local);
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(botbar.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_each(each_blocks, detaching);
      if (detaching)
        detach(t);
      destroy_component(botbar, detaching);
    }
  };
}
function create_each_block(ctx) {
  let pane;
  let current;
  pane = new Pane({
    props: {
      id: (
        /*i*/
        ctx[27]
      ),
      layout: (
        /*layout*/
        ctx[1].grids[
          /*i*/
          ctx[27]
        ]
      ),
      props: (
        /*chartProps*/
        ctx[2]
      ),
      main: (
        /*pane*/
        ctx[25] === /*hub*/
        ctx[3].chart
      )
    }
  });
  return {
    c() {
      create_component(pane.$$.fragment);
    },
    m(target, anchor) {
      mount_component(pane, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const pane_changes = {};
      if (dirty & /*layout*/
      2)
        pane_changes.layout = /*layout*/
        ctx2[1].grids[
          /*i*/
          ctx2[27]
        ];
      if (dirty & /*chartProps*/
      4)
        pane_changes.props = /*chartProps*/
        ctx2[2];
      pane.$set(pane_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(pane.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(pane.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(pane, detaching);
    }
  };
}
function create_fragment$1(ctx) {
  let div;
  let current_block_type_index;
  let if_block;
  let current;
  const if_block_creators = [create_if_block, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*layout*/
      ctx2[1] && /*layout*/
      ctx2[1].main
    )
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", "nvjs-chart svelte-pr5wst");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_blocks[current_block_type_index].m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(div, null);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if_blocks[current_block_type_index].d();
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let chartProps;
  let { props = {} } = $$props;
  function getLayout() {
    return layout;
  }
  function getRange() {
    return range;
  }
  function getCursor() {
    return cursor;
  }
  function setRange(val) {
    var _a;
    let emit = !((_a = val.preventDefault) != null ? _a : true);
    delete val.preventDefault;
    Object.assign(range, val);
    onRangeChanged(range, emit);
  }
  function setCursor(val) {
    var _a;
    let emit = !((_a = val.preventDefault) != null ? _a : true);
    delete val.preventDefault;
    Object.assign(cursor, val);
    onCursorChanged(cursor, emit);
  }
  let hub = DataHub$1.instance(props.id);
  let meta = MetaHub$1.instance(props.id);
  let events = Events$1.instance(props.id);
  let scan = DataScan.instance(props.id);
  scan.init(props);
  let interval = scan.detectInterval();
  let timeFrame = scan.getTimeframe();
  let range = scan.defaultRange();
  let cursor = new Cursor(meta);
  let storage = {};
  let ctx = new Context(props);
  let layout = null;
  scan.calcIndexOffsets();
  events.on("chart:cursor-changed", onCursorChanged);
  events.on("chart:cursor-locked", onCursorLocked);
  events.on("chart:range-changed", onRangeChanged);
  events.on("chart:update-layout", update2);
  events.on("chart:full-update", fullUpdate);
  onMount(() => {
    hub.calcSubset(range);
    hub.detectMain();
    hub.loadScripts(range, scan.tf, true);
    meta.init(props);
    scan.updatePanesHash();
    $$invalidate(1, layout = new Layout(chartProps, hub, meta));
  });
  onDestroy(() => {
    events.off("chart");
  });
  function onCursorChanged($cursor, emit = true) {
    if (emit)
      events.emit("$cursor-update", $cursor);
    if ($cursor.mode)
      $$invalidate(12, cursor.mode = $cursor.mode, cursor);
    if (cursor.mode !== "explore") {
      cursor.xSync(hub, layout, chartProps, $cursor);
      if ($cursor.visible === false) {
        setTimeout(() => update2());
      }
    }
    update2();
  }
  function onCursorLocked(state) {
    if (cursor.scrollLock && state)
      return;
    $$invalidate(12, cursor.locked = state, cursor);
  }
  function onRangeChanged($range, emit = true) {
    if (emit)
      events.emit("$range-update", $range);
    rangeUpdate($range);
    hub.updateRange(range);
    if (cursor.locked)
      return;
    cursor.xValues(hub, layout, chartProps);
    cursor.yValues(layout);
    update2();
    let Q = props.config.QUANTIZE_AFTER;
    if (Q)
      Utils.afterAll(storage, quantizeCursor, Q);
  }
  function quantizeCursor() {
    cursor.xSync(hub, layout, chartProps, cursor);
    update2();
  }
  function update2(opt = {}, emit = true) {
    if (emit)
      events.emit("$chart-pre-update");
    if (opt.updateHash)
      scan.updatePanesHash();
    if (scan.panesChanged())
      return fullUpdate();
    $$invalidate(12, cursor = cursor);
    $$invalidate(1, layout = new Layout(chartProps, hub, meta));
    events.emit("update-pane", layout);
    events.emitSpec("botbar", "update-bb", layout);
    if (emit)
      events.emit("$chart-update");
  }
  function fullUpdate(opt = {}) {
    let prevIbMode = scan.ibMode;
    $$invalidate(9, interval = scan.detectInterval());
    $$invalidate(10, timeFrame = scan.getTimeframe());
    let ibc = scan.ibMode !== prevIbMode;
    if (!range.length || opt.resetRange || ibc) {
      rangeUpdate(scan.defaultRange());
    }
    scan.calcIndexOffsets();
    hub.calcSubset(range);
    hub.init(hub.data);
    hub.detectMain();
    hub.loadScripts();
    meta.init(props);
    meta.restore();
    scan.updatePanesHash();
    update2();
    events.emit("remake-grid");
  }
  function rangeUpdate($range) {
    $$invalidate(11, range = $range);
    $$invalidate(2, chartProps.range = range, chartProps);
  }
  $$self.$$set = ($$props2) => {
    if ("props" in $$props2)
      $$invalidate(0, props = $$props2.props);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*interval, timeFrame, range, cursor, props*/
    7681) {
      $$invalidate(2, chartProps = Object.assign({ interval, timeFrame, range, ctx, cursor }, props));
    }
  };
  return [
    props,
    layout,
    chartProps,
    hub,
    getLayout,
    getRange,
    getCursor,
    setRange,
    setCursor,
    interval,
    timeFrame,
    range,
    cursor
  ];
}
class Chart extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      props: 0,
      getLayout: 4,
      getRange: 5,
      getCursor: 6,
      setRange: 7,
      setCursor: 8
    });
  }
  get getLayout() {
    return this.$$.ctx[4];
  }
  get getRange() {
    return this.$$.ctx[5];
  }
  get getCursor() {
    return this.$$.ctx[6];
  }
  get setRange() {
    return this.$$.ctx[7];
  }
  get setCursor() {
    return this.$$.ctx[8];
  }
}
function add_css(target) {
  append_styles(target, "svelte-7z7hqo", ".svelte-7z7hqo::after,.svelte-7z7hqo::before{box-sizing:content-box}.night-vision.svelte-7z7hqo{position:relative;direction:ltr}");
}
function create_fragment(ctx) {
  let div;
  let chart_1;
  let current;
  let chart_1_props = { props: (
    /*props*/
    ctx[1]
  ) };
  chart_1 = new Chart({ props: chart_1_props });
  ctx[19](chart_1);
  return {
    c() {
      div = element("div");
      create_component(chart_1.$$.fragment);
      attr(div, "class", "night-vision svelte-7z7hqo");
      attr(
        div,
        "id",
        /*id*/
        ctx[0]
      );
      attr(
        div,
        "style",
        /*style*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(chart_1, div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const chart_1_changes = {};
      if (dirty & /*props*/
      2)
        chart_1_changes.props = /*props*/
        ctx2[1];
      chart_1.$set(chart_1_changes);
      if (!current || dirty & /*id*/
      1) {
        attr(
          div,
          "id",
          /*id*/
          ctx2[0]
        );
      }
      if (!current || dirty & /*style*/
      8) {
        attr(
          div,
          "style",
          /*style*/
          ctx2[3]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(chart_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(chart_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[19](null);
      destroy_component(chart_1);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let configMerge;
  let offset;
  let colorsUser;
  let props;
  let style;
  let chart;
  function getChart() {
    return chart;
  }
  let { showLogo = false } = $$props;
  let { id = "nvjs" } = $$props;
  let { width = 750 } = $$props;
  let { height = 420 } = $$props;
  let { colors = {} } = $$props;
  let { toolbar = false } = $$props;
  let { scripts = [] } = $$props;
  let { config = {} } = $$props;
  let { indexBased = false } = $$props;
  let { timezone = 0 } = $$props;
  let { data: data2 = {} } = $$props;
  let { autoResize = false } = $$props;
  function chart_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      chart = $$value;
      $$invalidate(2, chart);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("showLogo" in $$props2)
      $$invalidate(5, showLogo = $$props2.showLogo);
    if ("id" in $$props2)
      $$invalidate(0, id = $$props2.id);
    if ("width" in $$props2)
      $$invalidate(6, width = $$props2.width);
    if ("height" in $$props2)
      $$invalidate(7, height = $$props2.height);
    if ("colors" in $$props2)
      $$invalidate(8, colors = $$props2.colors);
    if ("toolbar" in $$props2)
      $$invalidate(9, toolbar = $$props2.toolbar);
    if ("scripts" in $$props2)
      $$invalidate(10, scripts = $$props2.scripts);
    if ("config" in $$props2)
      $$invalidate(11, config = $$props2.config);
    if ("indexBased" in $$props2)
      $$invalidate(12, indexBased = $$props2.indexBased);
    if ("timezone" in $$props2)
      $$invalidate(13, timezone = $$props2.timezone);
    if ("data" in $$props2)
      $$invalidate(14, data2 = $$props2.data);
    if ("autoResize" in $$props2)
      $$invalidate(15, autoResize = $$props2.autoResize);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*config*/
    2048) {
      $$invalidate(16, configMerge = Object.assign(Const.ChartConfig, config));
    }
    if ($$self.$$.dirty & /*toolbar, config*/
    2560) {
      $$invalidate(18, offset = toolbar ? config.TOOLBAR : 0);
    }
    if ($$self.$$.dirty & /*colors*/
    256) {
      $$invalidate(17, colorsUser = Object.assign(Const.COLORS, colors));
    }
    if ($$self.$$.dirty & /*showLogo, id, width, offset, height, colorsUser, scripts, configMerge, timezone*/
    468193) {
      $$invalidate(1, props = {
        showLogo,
        id,
        width: width - offset,
        height,
        colors: colorsUser,
        //toolbar,
        scripts,
        config: configMerge,
        //legendButtons,
        //indexBased,
        //extensions,
        //xSettings,
        //skin,
        timezone
      });
    }
    if ($$self.$$.dirty & /*props*/
    2) {
      $$invalidate(3, style = `
    width: ${props.width}px;
    height: ${props.height}px;
`);
    }
  };
  return [
    id,
    props,
    chart,
    style,
    getChart,
    showLogo,
    width,
    height,
    colors,
    toolbar,
    scripts,
    config,
    indexBased,
    timezone,
    data2,
    autoResize,
    configMerge,
    colorsUser,
    offset,
    chart_1_binding
  ];
}
let NightVision$1 = class NightVision extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance,
      create_fragment,
      safe_not_equal,
      {
        getChart: 4,
        showLogo: 5,
        id: 0,
        width: 6,
        height: 7,
        colors: 8,
        toolbar: 9,
        scripts: 10,
        config: 11,
        indexBased: 12,
        timezone: 13,
        data: 14,
        autoResize: 15
      },
      add_css
    );
  }
  get getChart() {
    return this.$$.ctx[4];
  }
  get showLogo() {
    return this.$$.ctx[5];
  }
  set showLogo(showLogo) {
    this.$$set({ showLogo });
    flush();
  }
  get id() {
    return this.$$.ctx[0];
  }
  set id(id) {
    this.$$set({ id });
    flush();
  }
  get width() {
    return this.$$.ctx[6];
  }
  set width(width) {
    this.$$set({ width });
    flush();
  }
  get height() {
    return this.$$.ctx[7];
  }
  set height(height) {
    this.$$set({ height });
    flush();
  }
  get colors() {
    return this.$$.ctx[8];
  }
  set colors(colors) {
    this.$$set({ colors });
    flush();
  }
  get toolbar() {
    return this.$$.ctx[9];
  }
  set toolbar(toolbar) {
    this.$$set({ toolbar });
    flush();
  }
  get scripts() {
    return this.$$.ctx[10];
  }
  set scripts(scripts) {
    this.$$set({ scripts });
    flush();
  }
  get config() {
    return this.$$.ctx[11];
  }
  set config(config) {
    this.$$set({ config });
    flush();
  }
  get indexBased() {
    return this.$$.ctx[12];
  }
  set indexBased(indexBased) {
    this.$$set({ indexBased });
    flush();
  }
  get timezone() {
    return this.$$.ctx[13];
  }
  set timezone(timezone) {
    this.$$set({ timezone });
    flush();
  }
  get data() {
    return this.$$.ctx[14];
  }
  set data(data2) {
    this.$$set({ data: data2 });
    flush();
  }
  get autoResize() {
    return this.$$.ctx[15];
  }
  set autoResize(autoResize) {
    this.$$set({ autoResize });
    flush();
  }
};
function resizeTracker(chart) {
  const resizeObserver = new ResizeObserver((entries) => {
    let rect = chart.root.getBoundingClientRect();
    chart.width = rect.width;
    chart.height = rect.height;
  });
  resizeObserver.observe(chart.root);
}
class NightVision2 {
  constructor(target, props = {}) {
    this._data = props.data || {};
    this._scripts = props.scripts || [];
    let id = props.id || "nvjs";
    this.ww = WebWork$1.instance(id, this);
    this.se = SeClient$1.instance(id, this);
    this.hub = DataHub$1.instance(id);
    this.meta = MetaHub$1.instance(id);
    this.scan = DataScan.instance(id);
    this.events = Events$1.instance(id);
    this.scriptHub = Scripts$1.instance(id);
    this.hub.init(this._data);
    this.scriptHub.init(this._scripts);
    this.root = document.getElementById(target);
    this.comp = new NightVision$1({
      target: this.root,
      props
    });
    if (props.autoResize) {
      resizeTracker(this);
    }
    this.se.setRefs(this.hub, this.scan);
  }
  // *** PROPS ***
  // (see the default values in NightVision.svelte)
  // Chart container id (should be unique)
  get id() {
    return this.comp.id;
  }
  set id(val) {
    this.comp.$set({ id: val });
  }
  // Width of the chart
  get width() {
    return this.comp.width;
  }
  set width(val) {
    this.comp.$set({ width: val });
    setTimeout(() => this.update());
  }
  // Height of the chart
  get height() {
    return this.comp.height;
  }
  set height(val) {
    this.comp.$set({ height: val });
    setTimeout(() => this.update());
  }
  // Colors (modify specific colors)
  // TODO: not reactive enough
  get colors() {
    return this.comp.colors;
  }
  set colors(val) {
    this.comp.$set({ colors: val });
  }
  // Show NV logo or not
  get showLogo() {
    return this.comp.showLogo;
  }
  set showLogo(val) {
    this.comp.$set({ id: val });
  }
  // User-defined scripts (overlays & indicators)
  get scripts() {
    return this._scripts;
  }
  set scripts(val) {
    this._scripts = val;
    this.scriptHub.init(this._scripts);
    this.update("full");
  }
  // The data (auto-updated on reset)
  get data() {
    return this._data;
  }
  set data(val) {
    this._data = val;
    this.update("full");
  }
  // Overwrites the default config values
  get config() {
    return this.comp.config;
  }
  set config(val) {
    this.comp.$set({ config: val });
  }
  // Index-based mode of rendering
  get indexBased() {
    return this.comp.indexBased;
  }
  set indexBased(val) {
    this.comp.$set({ indexBased: val });
  }
  // Timezone (Shift from UTC, hours)
  get timezone() {
    return this.comp.timezone;
  }
  set timezone(val) {
    this.comp.$set({ timezone: val });
    setTimeout(() => this.update());
  }
  // *** Internal variables ***
  get layout() {
    let chart = this.comp.getChart();
    if (!chart)
      return null;
    return chart.getLayout();
  }
  get range() {
    let chart = this.comp.getChart();
    if (!chart)
      return null;
    return chart.getRange();
  }
  set range(val) {
    let chart = this.comp.getChart();
    if (!chart)
      return;
    chart.setRange(val);
  }
  get cursor() {
    let chart = this.comp.getChart();
    if (!chart)
      return null;
    return chart.getCursor();
  }
  set cursor(val) {
    let chart = this.comp.getChart();
    if (!chart)
      return;
    chart.setCursor(val);
  }
  // *** METHODS ***
  // Various updates of the chart
  update(type = "layout", opt = {}) {
    var [type, id] = type.split("-");
    const ev = this.events;
    switch (type) {
      case "layout":
        ev.emitSpec("chart", "update-layout", opt);
        break;
      case "data":
        this.hub.updateRange(this.range);
        this.meta.calcOhlcMap();
        ev.emitSpec("chart", "update-layout", opt);
        break;
      case "full":
        this.hub.init(this._data);
        ev.emitSpec("chart", "full-update", opt);
        break;
      case "grid":
        if (id === void 0) {
          ev.emit("remake-grid");
        } else {
          let gridId = `grid-${id}`;
          ev.emitSpec(gridId, "remake-grid", opt);
        }
        break;
      case "legend":
        if (id === void 0) {
          ev.emit("update-legend");
        } else {
          let gridId = `legend-${id}`;
          ev.emitSpec(gridId, "update-legend", opt);
        }
        break;
    }
  }
  // Reset everything
  fullReset() {
    this.update("full", { resetRange: true });
  }
  // Go to time/index
  goto(ti) {
    let range = this.range;
    let dti = range[1] - range[0];
    this.range = [ti - dti, ti];
  }
  // Scroll on interval forward
  // TODO: keep legend updated, when the cursor is outside
  scroll() {
    if (this.cursor.locked)
      return;
    let main = this.hub.mainOv.data;
    let last = main[main.length - 1];
    let ib = this.hub.indexBased;
    if (!last)
      return;
    let tl = ib ? main.length - 1 : last[0];
    let d = this.range[1] - tl;
    let int = this.scan.interval;
    if (d > 0)
      this.goto(this.range[1] + int);
  }
}
export {
  Const as C,
  DataHub$1 as D,
  Events$1 as E,
  MetaHub$1 as M,
  NightVision2 as N,
  Scripts$1 as S,
  Utils as U,
  DataScan as a,
  getDefaultExportFromCjs as g
};
