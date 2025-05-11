import { app as X, BrowserWindow as ne, ipcMain as xn } from "electron";
import $ from "path";
import Ue from "fs";
import Un from "constants";
import Gn from "stream";
import Vn from "util";
import In from "assert";
import Yn from "os";
import { fileURLToPath as Hn } from "url";
import { exec as Kn } from "child_process";
var oe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Qn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ue = { exports: {} }, ce = {}, b = {}, Ve;
function V() {
  return Ve || (Ve = 1, b.fromCallback = function(e) {
    return Object.defineProperty(function() {
      if (typeof arguments[arguments.length - 1] == "function") e.apply(this, arguments);
      else
        return new Promise((c, u) => {
          arguments[arguments.length] = (N, F) => {
            if (N) return u(N);
            c(F);
          }, arguments.length++, e.apply(this, arguments);
        });
    }, "name", { value: e.name });
  }, b.fromPromise = function(e) {
    return Object.defineProperty(function() {
      const c = arguments[arguments.length - 1];
      if (typeof c != "function") return e.apply(this, arguments);
      e.apply(this, arguments).then((u) => c(null, u), c);
    }, "name", { value: e.name });
  }), b;
}
var fe, Ye;
function Xn() {
  if (Ye) return fe;
  Ye = 1;
  var e = Un, c = process.cwd, u = null, N = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return u || (u = c.call(process)), u;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var F = process.chdir;
    process.chdir = function(r) {
      u = null, F.call(process, r);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, F);
  }
  fe = f;
  function f(r) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && h(r), r.lutimes || o(r), r.chown = g(r.chown), r.fchown = g(r.fchown), r.lchown = g(r.lchown), r.chmod = i(r.chmod), r.fchmod = i(r.fchmod), r.lchmod = i(r.lchmod), r.chownSync = k(r.chownSync), r.fchownSync = k(r.fchownSync), r.lchownSync = k(r.lchownSync), r.chmodSync = E(r.chmodSync), r.fchmodSync = E(r.fchmodSync), r.lchmodSync = E(r.lchmodSync), r.stat = O(r.stat), r.fstat = O(r.fstat), r.lstat = O(r.lstat), r.statSync = l(r.statSync), r.fstatSync = l(r.fstatSync), r.lstatSync = l(r.lstatSync), r.chmod && !r.lchmod && (r.lchmod = function(n, s, d) {
      d && process.nextTick(d);
    }, r.lchmodSync = function() {
    }), r.chown && !r.lchown && (r.lchown = function(n, s, d, t) {
      t && process.nextTick(t);
    }, r.lchownSync = function() {
    }), N === "win32" && (r.rename = typeof r.rename != "function" ? r.rename : function(n) {
      function s(d, t, a) {
        var y = Date.now(), w = 0;
        n(d, t, function S(v) {
          if (v && (v.code === "EACCES" || v.code === "EPERM" || v.code === "EBUSY") && Date.now() - y < 6e4) {
            setTimeout(function() {
              r.stat(t, function(p, P) {
                p && p.code === "ENOENT" ? n(d, t, S) : a(v);
              });
            }, w), w < 100 && (w += 10);
            return;
          }
          a && a(v);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(s, n), s;
    }(r.rename)), r.read = typeof r.read != "function" ? r.read : function(n) {
      function s(d, t, a, y, w, S) {
        var v;
        if (S && typeof S == "function") {
          var p = 0;
          v = function(P, R, T) {
            if (P && P.code === "EAGAIN" && p < 10)
              return p++, n.call(r, d, t, a, y, w, v);
            S.apply(this, arguments);
          };
        }
        return n.call(r, d, t, a, y, w, v);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(s, n), s;
    }(r.read), r.readSync = typeof r.readSync != "function" ? r.readSync : /* @__PURE__ */ function(n) {
      return function(s, d, t, a, y) {
        for (var w = 0; ; )
          try {
            return n.call(r, s, d, t, a, y);
          } catch (S) {
            if (S.code === "EAGAIN" && w < 10) {
              w++;
              continue;
            }
            throw S;
          }
      };
    }(r.readSync);
    function h(n) {
      n.lchmod = function(s, d, t) {
        n.open(
          s,
          e.O_WRONLY | e.O_SYMLINK,
          d,
          function(a, y) {
            if (a) {
              t && t(a);
              return;
            }
            n.fchmod(y, d, function(w) {
              n.close(y, function(S) {
                t && t(w || S);
              });
            });
          }
        );
      }, n.lchmodSync = function(s, d) {
        var t = n.openSync(s, e.O_WRONLY | e.O_SYMLINK, d), a = !0, y;
        try {
          y = n.fchmodSync(t, d), a = !1;
        } finally {
          if (a)
            try {
              n.closeSync(t);
            } catch {
            }
          else
            n.closeSync(t);
        }
        return y;
      };
    }
    function o(n) {
      e.hasOwnProperty("O_SYMLINK") && n.futimes ? (n.lutimes = function(s, d, t, a) {
        n.open(s, e.O_SYMLINK, function(y, w) {
          if (y) {
            a && a(y);
            return;
          }
          n.futimes(w, d, t, function(S) {
            n.close(w, function(v) {
              a && a(S || v);
            });
          });
        });
      }, n.lutimesSync = function(s, d, t) {
        var a = n.openSync(s, e.O_SYMLINK), y, w = !0;
        try {
          y = n.futimesSync(a, d, t), w = !1;
        } finally {
          if (w)
            try {
              n.closeSync(a);
            } catch {
            }
          else
            n.closeSync(a);
        }
        return y;
      }) : n.futimes && (n.lutimes = function(s, d, t, a) {
        a && process.nextTick(a);
      }, n.lutimesSync = function() {
      });
    }
    function i(n) {
      return n && function(s, d, t) {
        return n.call(r, s, d, function(a) {
          m(a) && (a = null), t && t.apply(this, arguments);
        });
      };
    }
    function E(n) {
      return n && function(s, d) {
        try {
          return n.call(r, s, d);
        } catch (t) {
          if (!m(t)) throw t;
        }
      };
    }
    function g(n) {
      return n && function(s, d, t, a) {
        return n.call(r, s, d, t, function(y) {
          m(y) && (y = null), a && a.apply(this, arguments);
        });
      };
    }
    function k(n) {
      return n && function(s, d, t) {
        try {
          return n.call(r, s, d, t);
        } catch (a) {
          if (!m(a)) throw a;
        }
      };
    }
    function O(n) {
      return n && function(s, d, t) {
        typeof d == "function" && (t = d, d = null);
        function a(y, w) {
          w && (w.uid < 0 && (w.uid += 4294967296), w.gid < 0 && (w.gid += 4294967296)), t && t.apply(this, arguments);
        }
        return d ? n.call(r, s, d, a) : n.call(r, s, a);
      };
    }
    function l(n) {
      return n && function(s, d) {
        var t = d ? n.call(r, s, d) : n.call(r, s);
        return t && (t.uid < 0 && (t.uid += 4294967296), t.gid < 0 && (t.gid += 4294967296)), t;
      };
    }
    function m(n) {
      if (!n || n.code === "ENOSYS")
        return !0;
      var s = !process.getuid || process.getuid() !== 0;
      return !!(s && (n.code === "EINVAL" || n.code === "EPERM"));
    }
  }
  return fe;
}
var se, He;
function zn() {
  if (He) return se;
  He = 1;
  var e = Gn.Stream;
  se = c;
  function c(u) {
    return {
      ReadStream: N,
      WriteStream: F
    };
    function N(f, r) {
      if (!(this instanceof N)) return new N(f, r);
      e.call(this);
      var h = this;
      this.path = f, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, r = r || {};
      for (var o = Object.keys(r), i = 0, E = o.length; i < E; i++) {
        var g = o[i];
        this[g] = r[g];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          h._read();
        });
        return;
      }
      u.open(this.path, this.flags, this.mode, function(k, O) {
        if (k) {
          h.emit("error", k), h.readable = !1;
          return;
        }
        h.fd = O, h.emit("open", O), h._read();
      });
    }
    function F(f, r) {
      if (!(this instanceof F)) return new F(f, r);
      e.call(this), this.path = f, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, r = r || {};
      for (var h = Object.keys(r), o = 0, i = h.length; o < i; o++) {
        var E = h[o];
        this[E] = r[E];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = u.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return se;
}
var ae, Ke;
function Zn() {
  if (Ke) return ae;
  Ke = 1, ae = c;
  var e = Object.getPrototypeOf || function(u) {
    return u.__proto__;
  };
  function c(u) {
    if (u === null || typeof u != "object")
      return u;
    if (u instanceof Object)
      var N = { __proto__: e(u) };
    else
      var N = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(u).forEach(function(F) {
      Object.defineProperty(N, F, Object.getOwnPropertyDescriptor(u, F));
    }), N;
  }
  return ae;
}
var ee, Qe;
function W() {
  if (Qe) return ee;
  Qe = 1;
  var e = Ue, c = Xn(), u = zn(), N = Zn(), F = Vn, f, r;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (f = Symbol.for("graceful-fs.queue"), r = Symbol.for("graceful-fs.previous")) : (f = "___graceful-fs.queue", r = "___graceful-fs.previous");
  function h() {
  }
  function o(n, s) {
    Object.defineProperty(n, f, {
      get: function() {
        return s;
      }
    });
  }
  var i = h;
  if (F.debuglog ? i = F.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (i = function() {
    var n = F.format.apply(F, arguments);
    n = "GFS4: " + n.split(/\n/).join(`
GFS4: `), console.error(n);
  }), !e[f]) {
    var E = oe[f] || [];
    o(e, E), e.close = function(n) {
      function s(d, t) {
        return n.call(e, d, function(a) {
          a || l(), typeof t == "function" && t.apply(this, arguments);
        });
      }
      return Object.defineProperty(s, r, {
        value: n
      }), s;
    }(e.close), e.closeSync = function(n) {
      function s(d) {
        n.apply(e, arguments), l();
      }
      return Object.defineProperty(s, r, {
        value: n
      }), s;
    }(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      i(e[f]), In.equal(e[f].length, 0);
    });
  }
  oe[f] || o(oe, e[f]), ee = g(N(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (ee = g(e), e.__patched = !0);
  function g(n) {
    c(n), n.gracefulify = g, n.createReadStream = Jn, n.createWriteStream = An;
    var s = n.readFile;
    n.readFile = d;
    function d(q, x, D) {
      return typeof x == "function" && (D = x, x = null), B(q, x, D);
      function B(U, A, M, C) {
        return s(U, A, function(j) {
          j && (j.code === "EMFILE" || j.code === "ENFILE") ? k([B, [U, A, M], j, C || Date.now(), Date.now()]) : typeof M == "function" && M.apply(this, arguments);
        });
      }
    }
    var t = n.writeFile;
    n.writeFile = a;
    function a(q, x, D, B) {
      return typeof D == "function" && (B = D, D = null), U(q, x, D, B);
      function U(A, M, C, j, G) {
        return t(A, M, C, function(L) {
          L && (L.code === "EMFILE" || L.code === "ENFILE") ? k([U, [A, M, C, j], L, G || Date.now(), Date.now()]) : typeof j == "function" && j.apply(this, arguments);
        });
      }
    }
    var y = n.appendFile;
    y && (n.appendFile = w);
    function w(q, x, D, B) {
      return typeof D == "function" && (B = D, D = null), U(q, x, D, B);
      function U(A, M, C, j, G) {
        return y(A, M, C, function(L) {
          L && (L.code === "EMFILE" || L.code === "ENFILE") ? k([U, [A, M, C, j], L, G || Date.now(), Date.now()]) : typeof j == "function" && j.apply(this, arguments);
        });
      }
    }
    var S = n.copyFile;
    S && (n.copyFile = v);
    function v(q, x, D, B) {
      return typeof D == "function" && (B = D, D = 0), U(q, x, D, B);
      function U(A, M, C, j, G) {
        return S(A, M, C, function(L) {
          L && (L.code === "EMFILE" || L.code === "ENFILE") ? k([U, [A, M, C, j], L, G || Date.now(), Date.now()]) : typeof j == "function" && j.apply(this, arguments);
        });
      }
    }
    var p = n.readdir;
    n.readdir = R;
    var P = /^v[0-5]\./;
    function R(q, x, D) {
      typeof x == "function" && (D = x, x = null);
      var B = P.test(process.version) ? function(M, C, j, G) {
        return p(M, U(
          M,
          C,
          j,
          G
        ));
      } : function(M, C, j, G) {
        return p(M, C, U(
          M,
          C,
          j,
          G
        ));
      };
      return B(q, x, D);
      function U(A, M, C, j) {
        return function(G, L) {
          G && (G.code === "EMFILE" || G.code === "ENFILE") ? k([
            B,
            [A, M, C],
            G,
            j || Date.now(),
            Date.now()
          ]) : (L && L.sort && L.sort(), typeof C == "function" && C.call(this, G, L));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var T = u(n);
      H = T.ReadStream, K = T.WriteStream;
    }
    var _ = n.ReadStream;
    _ && (H.prototype = Object.create(_.prototype), H.prototype.open = Z);
    var I = n.WriteStream;
    I && (K.prototype = Object.create(I.prototype), K.prototype.open = Wn), Object.defineProperty(n, "ReadStream", {
      get: function() {
        return H;
      },
      set: function(q) {
        H = q;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(n, "WriteStream", {
      get: function() {
        return K;
      },
      set: function(q) {
        K = q;
      },
      enumerable: !0,
      configurable: !0
    });
    var J = H;
    Object.defineProperty(n, "FileReadStream", {
      get: function() {
        return J;
      },
      set: function(q) {
        J = q;
      },
      enumerable: !0,
      configurable: !0
    });
    var z = K;
    Object.defineProperty(n, "FileWriteStream", {
      get: function() {
        return z;
      },
      set: function(q) {
        z = q;
      },
      enumerable: !0,
      configurable: !0
    });
    function H(q, x) {
      return this instanceof H ? (_.apply(this, arguments), this) : H.apply(Object.create(H.prototype), arguments);
    }
    function Z() {
      var q = this;
      ie(q.path, q.flags, q.mode, function(x, D) {
        x ? (q.autoClose && q.destroy(), q.emit("error", x)) : (q.fd = D, q.emit("open", D), q.read());
      });
    }
    function K(q, x) {
      return this instanceof K ? (I.apply(this, arguments), this) : K.apply(Object.create(K.prototype), arguments);
    }
    function Wn() {
      var q = this;
      ie(q.path, q.flags, q.mode, function(x, D) {
        x ? (q.destroy(), q.emit("error", x)) : (q.fd = D, q.emit("open", D));
      });
    }
    function Jn(q, x) {
      return new n.ReadStream(q, x);
    }
    function An(q, x) {
      return new n.WriteStream(q, x);
    }
    var Bn = n.open;
    n.open = ie;
    function ie(q, x, D, B) {
      return typeof D == "function" && (B = D, D = null), U(q, x, D, B);
      function U(A, M, C, j, G) {
        return Bn(A, M, C, function(L, Pr) {
          L && (L.code === "EMFILE" || L.code === "ENFILE") ? k([U, [A, M, C, j], L, G || Date.now(), Date.now()]) : typeof j == "function" && j.apply(this, arguments);
        });
      }
    }
    return n;
  }
  function k(n) {
    i("ENQUEUE", n[0].name, n[1]), e[f].push(n), m();
  }
  var O;
  function l() {
    for (var n = Date.now(), s = 0; s < e[f].length; ++s)
      e[f][s].length > 2 && (e[f][s][3] = n, e[f][s][4] = n);
    m();
  }
  function m() {
    if (clearTimeout(O), O = void 0, e[f].length !== 0) {
      var n = e[f].shift(), s = n[0], d = n[1], t = n[2], a = n[3], y = n[4];
      if (a === void 0)
        i("RETRY", s.name, d), s.apply(null, d);
      else if (Date.now() - a >= 6e4) {
        i("TIMEOUT", s.name, d);
        var w = d.pop();
        typeof w == "function" && w.call(null, t);
      } else {
        var S = Date.now() - y, v = Math.max(y - a, 1), p = Math.min(v * 1.2, 100);
        S >= p ? (i("RETRY", s.name, d), s.apply(null, d.concat([a]))) : e[f].push(n);
      }
      O === void 0 && (O = setTimeout(m, 0));
    }
  }
  return ee;
}
var Xe;
function jn() {
  return Xe || (Xe = 1, function(e) {
    const c = V().fromCallback, u = W(), N = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchown",
      "lchmod",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "readFile",
      "readdir",
      "readlink",
      "realpath",
      "rename",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((F) => typeof u[F] == "function");
    Object.keys(u).forEach((F) => {
      F !== "promises" && (e[F] = u[F]);
    }), N.forEach((F) => {
      e[F] = c(u[F]);
    }), e.exists = function(F, f) {
      return typeof f == "function" ? u.exists(F, f) : new Promise((r) => u.exists(F, r));
    }, e.read = function(F, f, r, h, o, i) {
      return typeof i == "function" ? u.read(F, f, r, h, o, i) : new Promise((E, g) => {
        u.read(F, f, r, h, o, (k, O, l) => {
          if (k) return g(k);
          E({ bytesRead: O, buffer: l });
        });
      });
    }, e.write = function(F, f, ...r) {
      return typeof r[r.length - 1] == "function" ? u.write(F, f, ...r) : new Promise((h, o) => {
        u.write(F, f, ...r, (i, E, g) => {
          if (i) return o(i);
          h({ bytesWritten: E, buffer: g });
        });
      });
    }, typeof u.realpath.native == "function" && (e.realpath.native = c(u.realpath.native));
  }(ce)), ce;
}
var le, ze;
function Ln() {
  if (ze) return le;
  ze = 1;
  const e = $;
  function c(F) {
    return F = e.normalize(e.resolve(F)).split(e.sep), F.length > 0 ? F[0] : null;
  }
  const u = /[<>:"|?*]/;
  function N(F) {
    const f = c(F);
    return F = F.replace(f, ""), u.test(F);
  }
  return le = {
    getRootPath: c,
    invalidWin32Path: N
  }, le;
}
var ye, Ze;
function bn() {
  if (Ze) return ye;
  Ze = 1;
  const e = W(), c = $, u = Ln().invalidWin32Path, N = parseInt("0777", 8);
  function F(f, r, h, o) {
    if (typeof r == "function" ? (h = r, r = {}) : (!r || typeof r != "object") && (r = { mode: r }), process.platform === "win32" && u(f)) {
      const g = new Error(f + " contains invalid WIN32 path characters.");
      return g.code = "EINVAL", h(g);
    }
    let i = r.mode;
    const E = r.fs || e;
    i === void 0 && (i = N & ~process.umask()), o || (o = null), h = h || function() {
    }, f = c.resolve(f), E.mkdir(f, i, (g) => {
      if (!g)
        return o = o || f, h(null, o);
      switch (g.code) {
        case "ENOENT":
          if (c.dirname(f) === f) return h(g);
          F(c.dirname(f), r, (k, O) => {
            k ? h(k, O) : F(f, r, h, O);
          });
          break;
        // In the case of any other error, just see if there's a dir
        // there already.  If so, then hooray!  If not, then something
        // is borked.
        default:
          E.stat(f, (k, O) => {
            k || !O.isDirectory() ? h(g, o) : h(null, o);
          });
          break;
      }
    });
  }
  return ye = F, ye;
}
var me, be;
function er() {
  if (be) return me;
  be = 1;
  const e = W(), c = $, u = Ln().invalidWin32Path, N = parseInt("0777", 8);
  function F(f, r, h) {
    (!r || typeof r != "object") && (r = { mode: r });
    let o = r.mode;
    const i = r.fs || e;
    if (process.platform === "win32" && u(f)) {
      const E = new Error(f + " contains invalid WIN32 path characters.");
      throw E.code = "EINVAL", E;
    }
    o === void 0 && (o = N & ~process.umask()), h || (h = null), f = c.resolve(f);
    try {
      i.mkdirSync(f, o), h = h || f;
    } catch (E) {
      if (E.code === "ENOENT") {
        if (c.dirname(f) === f) throw E;
        h = F(c.dirname(f), r, h), F(f, r, h);
      } else {
        let g;
        try {
          g = i.statSync(f);
        } catch {
          throw E;
        }
        if (!g.isDirectory()) throw E;
      }
    }
    return h;
  }
  return me = F, me;
}
var de, en;
function Y() {
  if (en) return de;
  en = 1;
  const e = V().fromCallback, c = e(bn()), u = er();
  return de = {
    mkdirs: c,
    mkdirsSync: u,
    // alias
    mkdirp: c,
    mkdirpSync: u,
    ensureDir: c,
    ensureDirSync: u
  }, de;
}
var he, nn;
function Mn() {
  if (nn) return he;
  nn = 1;
  const e = W(), c = Yn, u = $;
  function N() {
    let o = u.join("millis-test-sync" + Date.now().toString() + Math.random().toString().slice(2));
    o = u.join(c.tmpdir(), o);
    const i = /* @__PURE__ */ new Date(1435410243862);
    e.writeFileSync(o, "https://github.com/jprichardson/node-fs-extra/pull/141");
    const E = e.openSync(o, "r+");
    return e.futimesSync(E, i, i), e.closeSync(E), e.statSync(o).mtime > 1435410243e3;
  }
  function F(o) {
    let i = u.join("millis-test" + Date.now().toString() + Math.random().toString().slice(2));
    i = u.join(c.tmpdir(), i);
    const E = /* @__PURE__ */ new Date(1435410243862);
    e.writeFile(i, "https://github.com/jprichardson/node-fs-extra/pull/141", (g) => {
      if (g) return o(g);
      e.open(i, "r+", (k, O) => {
        if (k) return o(k);
        e.futimes(O, E, E, (l) => {
          if (l) return o(l);
          e.close(O, (m) => {
            if (m) return o(m);
            e.stat(i, (n, s) => {
              if (n) return o(n);
              o(null, s.mtime > 1435410243e3);
            });
          });
        });
      });
    });
  }
  function f(o) {
    if (typeof o == "number")
      return Math.floor(o / 1e3) * 1e3;
    if (o instanceof Date)
      return new Date(Math.floor(o.getTime() / 1e3) * 1e3);
    throw new Error("fs-extra: timeRemoveMillis() unknown parameter type");
  }
  function r(o, i, E, g) {
    e.open(o, "r+", (k, O) => {
      if (k) return g(k);
      e.futimes(O, i, E, (l) => {
        e.close(O, (m) => {
          g && g(l || m);
        });
      });
    });
  }
  function h(o, i, E) {
    const g = e.openSync(o, "r+");
    return e.futimesSync(g, i, E), e.closeSync(g);
  }
  return he = {
    hasMillisRes: F,
    hasMillisResSync: N,
    timeRemoveMillis: f,
    utimesMillis: r,
    utimesMillisSync: h
  }, he;
}
var Se, rn;
function re() {
  if (rn) return Se;
  rn = 1;
  const e = W(), c = $, u = 10, N = 5, F = 0, f = process.versions.node.split("."), r = Number.parseInt(f[0], 10), h = Number.parseInt(f[1], 10), o = Number.parseInt(f[2], 10);
  function i() {
    if (r > u)
      return !0;
    if (r === u) {
      if (h > N)
        return !0;
      if (h === N && o >= F)
        return !0;
    }
    return !1;
  }
  function E(d, t, a) {
    i() ? e.stat(d, { bigint: !0 }, (y, w) => {
      if (y) return a(y);
      e.stat(t, { bigint: !0 }, (S, v) => S ? S.code === "ENOENT" ? a(null, { srcStat: w, destStat: null }) : a(S) : a(null, { srcStat: w, destStat: v }));
    }) : e.stat(d, (y, w) => {
      if (y) return a(y);
      e.stat(t, (S, v) => S ? S.code === "ENOENT" ? a(null, { srcStat: w, destStat: null }) : a(S) : a(null, { srcStat: w, destStat: v }));
    });
  }
  function g(d, t) {
    let a, y;
    i() ? a = e.statSync(d, { bigint: !0 }) : a = e.statSync(d);
    try {
      i() ? y = e.statSync(t, { bigint: !0 }) : y = e.statSync(t);
    } catch (w) {
      if (w.code === "ENOENT") return { srcStat: a, destStat: null };
      throw w;
    }
    return { srcStat: a, destStat: y };
  }
  function k(d, t, a, y) {
    E(d, t, (w, S) => {
      if (w) return y(w);
      const { srcStat: v, destStat: p } = S;
      return p && p.ino && p.dev && p.ino === v.ino && p.dev === v.dev ? y(new Error("Source and destination must not be the same.")) : v.isDirectory() && n(d, t) ? y(new Error(s(d, t, a))) : y(null, { srcStat: v, destStat: p });
    });
  }
  function O(d, t, a) {
    const { srcStat: y, destStat: w } = g(d, t);
    if (w && w.ino && w.dev && w.ino === y.ino && w.dev === y.dev)
      throw new Error("Source and destination must not be the same.");
    if (y.isDirectory() && n(d, t))
      throw new Error(s(d, t, a));
    return { srcStat: y, destStat: w };
  }
  function l(d, t, a, y, w) {
    const S = c.resolve(c.dirname(d)), v = c.resolve(c.dirname(a));
    if (v === S || v === c.parse(v).root) return w();
    i() ? e.stat(v, { bigint: !0 }, (p, P) => p ? p.code === "ENOENT" ? w() : w(p) : P.ino && P.dev && P.ino === t.ino && P.dev === t.dev ? w(new Error(s(d, a, y))) : l(d, t, v, y, w)) : e.stat(v, (p, P) => p ? p.code === "ENOENT" ? w() : w(p) : P.ino && P.dev && P.ino === t.ino && P.dev === t.dev ? w(new Error(s(d, a, y))) : l(d, t, v, y, w));
  }
  function m(d, t, a, y) {
    const w = c.resolve(c.dirname(d)), S = c.resolve(c.dirname(a));
    if (S === w || S === c.parse(S).root) return;
    let v;
    try {
      i() ? v = e.statSync(S, { bigint: !0 }) : v = e.statSync(S);
    } catch (p) {
      if (p.code === "ENOENT") return;
      throw p;
    }
    if (v.ino && v.dev && v.ino === t.ino && v.dev === t.dev)
      throw new Error(s(d, a, y));
    return m(d, t, S, y);
  }
  function n(d, t) {
    const a = c.resolve(d).split(c.sep).filter((w) => w), y = c.resolve(t).split(c.sep).filter((w) => w);
    return a.reduce((w, S, v) => w && y[v] === S, !0);
  }
  function s(d, t, a) {
    return `Cannot ${a} '${d}' to a subdirectory of itself, '${t}'.`;
  }
  return Se = {
    checkPaths: k,
    checkPathsSync: O,
    checkParentPaths: l,
    checkParentPathsSync: m,
    isSrcSubdir: n
  }, Se;
}
var ve, tn;
function nr() {
  return tn || (tn = 1, ve = function(e) {
    if (typeof Buffer.allocUnsafe == "function")
      try {
        return Buffer.allocUnsafe(e);
      } catch {
        return new Buffer(e);
      }
    return new Buffer(e);
  }), ve;
}
var we, on;
function rr() {
  if (on) return we;
  on = 1;
  const e = W(), c = $, u = Y().mkdirsSync, N = Mn().utimesMillisSync, F = re();
  function f(t, a, y) {
    typeof y == "function" && (y = { filter: y }), y = y || {}, y.clobber = "clobber" in y ? !!y.clobber : !0, y.overwrite = "overwrite" in y ? !!y.overwrite : y.clobber, y.preserveTimestamps && process.arch === "ia32" && console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`);
    const { srcStat: w, destStat: S } = F.checkPathsSync(t, a, "copy");
    return F.checkParentPathsSync(t, w, a, "copy"), r(S, t, a, y);
  }
  function r(t, a, y, w) {
    if (w.filter && !w.filter(a, y)) return;
    const S = c.dirname(y);
    return e.existsSync(S) || u(S), h(t, a, y, w);
  }
  function h(t, a, y, w) {
    if (!(w.filter && !w.filter(a, y)))
      return o(t, a, y, w);
  }
  function o(t, a, y, w) {
    const v = (w.dereference ? e.statSync : e.lstatSync)(a);
    if (v.isDirectory()) return O(v, t, a, y, w);
    if (v.isFile() || v.isCharacterDevice() || v.isBlockDevice()) return i(v, t, a, y, w);
    if (v.isSymbolicLink()) return s(t, a, y, w);
  }
  function i(t, a, y, w, S) {
    return a ? E(t, y, w, S) : g(t, y, w, S);
  }
  function E(t, a, y, w) {
    if (w.overwrite)
      return e.unlinkSync(y), g(t, a, y, w);
    if (w.errorOnExist)
      throw new Error(`'${y}' already exists`);
  }
  function g(t, a, y, w) {
    return typeof e.copyFileSync == "function" ? (e.copyFileSync(a, y), e.chmodSync(y, t.mode), w.preserveTimestamps ? N(y, t.atime, t.mtime) : void 0) : k(t, a, y, w);
  }
  function k(t, a, y, w) {
    const v = nr()(65536), p = e.openSync(a, "r"), P = e.openSync(y, "w", t.mode);
    let R = 0;
    for (; R < t.size; ) {
      const T = e.readSync(p, v, 0, 65536, R);
      e.writeSync(P, v, 0, T), R += T;
    }
    w.preserveTimestamps && e.futimesSync(P, t.atime, t.mtime), e.closeSync(p), e.closeSync(P);
  }
  function O(t, a, y, w, S) {
    if (!a) return l(t, y, w, S);
    if (a && !a.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${w}' with directory '${y}'.`);
    return m(y, w, S);
  }
  function l(t, a, y, w) {
    return e.mkdirSync(y), m(a, y, w), e.chmodSync(y, t.mode);
  }
  function m(t, a, y) {
    e.readdirSync(t).forEach((w) => n(w, t, a, y));
  }
  function n(t, a, y, w) {
    const S = c.join(a, t), v = c.join(y, t), { destStat: p } = F.checkPathsSync(S, v, "copy");
    return h(p, S, v, w);
  }
  function s(t, a, y, w) {
    let S = e.readlinkSync(a);
    if (w.dereference && (S = c.resolve(process.cwd(), S)), t) {
      let v;
      try {
        v = e.readlinkSync(y);
      } catch (p) {
        if (p.code === "EINVAL" || p.code === "UNKNOWN") return e.symlinkSync(S, y);
        throw p;
      }
      if (w.dereference && (v = c.resolve(process.cwd(), v)), F.isSrcSubdir(S, v))
        throw new Error(`Cannot copy '${S}' to a subdirectory of itself, '${v}'.`);
      if (e.statSync(y).isDirectory() && F.isSrcSubdir(v, S))
        throw new Error(`Cannot overwrite '${v}' with '${S}'.`);
      return d(S, y);
    } else
      return e.symlinkSync(S, y);
  }
  function d(t, a) {
    return e.unlinkSync(a), e.symlinkSync(t, a);
  }
  return we = f, we;
}
var Ee, un;
function $n() {
  return un || (un = 1, Ee = {
    copySync: rr()
  }), Ee;
}
var pe, cn;
function Q() {
  if (cn) return pe;
  cn = 1;
  const e = V().fromPromise, c = jn();
  function u(N) {
    return c.access(N).then(() => !0).catch(() => !1);
  }
  return pe = {
    pathExists: e(u),
    pathExistsSync: c.existsSync
  }, pe;
}
var ge, fn;
function tr() {
  if (fn) return ge;
  fn = 1;
  const e = W(), c = $, u = Y().mkdirs, N = Q().pathExists, F = Mn().utimesMillis, f = re();
  function r(S, v, p, P) {
    typeof p == "function" && !P ? (P = p, p = {}) : typeof p == "function" && (p = { filter: p }), P = P || function() {
    }, p = p || {}, p.clobber = "clobber" in p ? !!p.clobber : !0, p.overwrite = "overwrite" in p ? !!p.overwrite : p.clobber, p.preserveTimestamps && process.arch === "ia32" && console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`), f.checkPaths(S, v, "copy", (R, T) => {
      if (R) return P(R);
      const { srcStat: _, destStat: I } = T;
      f.checkParentPaths(S, _, v, "copy", (J) => J ? P(J) : p.filter ? o(h, I, S, v, p, P) : h(I, S, v, p, P));
    });
  }
  function h(S, v, p, P, R) {
    const T = c.dirname(p);
    N(T, (_, I) => {
      if (_) return R(_);
      if (I) return i(S, v, p, P, R);
      u(T, (J) => J ? R(J) : i(S, v, p, P, R));
    });
  }
  function o(S, v, p, P, R, T) {
    Promise.resolve(R.filter(p, P)).then((_) => _ ? S(v, p, P, R, T) : T(), (_) => T(_));
  }
  function i(S, v, p, P, R) {
    return P.filter ? o(E, S, v, p, P, R) : E(S, v, p, P, R);
  }
  function E(S, v, p, P, R) {
    (P.dereference ? e.stat : e.lstat)(v, (_, I) => {
      if (_) return R(_);
      if (I.isDirectory()) return n(I, S, v, p, P, R);
      if (I.isFile() || I.isCharacterDevice() || I.isBlockDevice()) return g(I, S, v, p, P, R);
      if (I.isSymbolicLink()) return y(S, v, p, P, R);
    });
  }
  function g(S, v, p, P, R, T) {
    return v ? k(S, p, P, R, T) : O(S, p, P, R, T);
  }
  function k(S, v, p, P, R) {
    if (P.overwrite)
      e.unlink(p, (T) => T ? R(T) : O(S, v, p, P, R));
    else return P.errorOnExist ? R(new Error(`'${p}' already exists`)) : R();
  }
  function O(S, v, p, P, R) {
    return typeof e.copyFile == "function" ? e.copyFile(v, p, (T) => T ? R(T) : m(S, p, P, R)) : l(S, v, p, P, R);
  }
  function l(S, v, p, P, R) {
    const T = e.createReadStream(v);
    T.on("error", (_) => R(_)).once("open", () => {
      const _ = e.createWriteStream(p, { mode: S.mode });
      _.on("error", (I) => R(I)).on("open", () => T.pipe(_)).once("close", () => m(S, p, P, R));
    });
  }
  function m(S, v, p, P) {
    e.chmod(v, S.mode, (R) => R ? P(R) : p.preserveTimestamps ? F(v, S.atime, S.mtime, P) : P());
  }
  function n(S, v, p, P, R, T) {
    return v ? v && !v.isDirectory() ? T(new Error(`Cannot overwrite non-directory '${P}' with directory '${p}'.`)) : d(p, P, R, T) : s(S, p, P, R, T);
  }
  function s(S, v, p, P, R) {
    e.mkdir(p, (T) => {
      if (T) return R(T);
      d(v, p, P, (_) => _ ? R(_) : e.chmod(p, S.mode, R));
    });
  }
  function d(S, v, p, P) {
    e.readdir(S, (R, T) => R ? P(R) : t(T, S, v, p, P));
  }
  function t(S, v, p, P, R) {
    const T = S.pop();
    return T ? a(S, T, v, p, P, R) : R();
  }
  function a(S, v, p, P, R, T) {
    const _ = c.join(p, v), I = c.join(P, v);
    f.checkPaths(_, I, "copy", (J, z) => {
      if (J) return T(J);
      const { destStat: H } = z;
      i(H, _, I, R, (Z) => Z ? T(Z) : t(S, p, P, R, T));
    });
  }
  function y(S, v, p, P, R) {
    e.readlink(v, (T, _) => {
      if (T) return R(T);
      if (P.dereference && (_ = c.resolve(process.cwd(), _)), S)
        e.readlink(p, (I, J) => I ? I.code === "EINVAL" || I.code === "UNKNOWN" ? e.symlink(_, p, R) : R(I) : (P.dereference && (J = c.resolve(process.cwd(), J)), f.isSrcSubdir(_, J) ? R(new Error(`Cannot copy '${_}' to a subdirectory of itself, '${J}'.`)) : S.isDirectory() && f.isSrcSubdir(J, _) ? R(new Error(`Cannot overwrite '${J}' with '${_}'.`)) : w(_, p, R)));
      else
        return e.symlink(_, p, R);
    });
  }
  function w(S, v, p) {
    e.unlink(v, (P) => P ? p(P) : e.symlink(S, v, p));
  }
  return ge = r, ge;
}
var Fe, sn;
function Cn() {
  if (sn) return Fe;
  sn = 1;
  const e = V().fromCallback;
  return Fe = {
    copy: e(tr())
  }, Fe;
}
var ke, an;
function ir() {
  if (an) return ke;
  an = 1;
  const e = W(), c = $, u = In, N = process.platform === "win32";
  function F(l) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((n) => {
      l[n] = l[n] || e[n], n = n + "Sync", l[n] = l[n] || e[n];
    }), l.maxBusyTries = l.maxBusyTries || 3;
  }
  function f(l, m, n) {
    let s = 0;
    typeof m == "function" && (n = m, m = {}), u(l, "rimraf: missing path"), u.strictEqual(typeof l, "string", "rimraf: path should be a string"), u.strictEqual(typeof n, "function", "rimraf: callback function required"), u(m, "rimraf: invalid options argument provided"), u.strictEqual(typeof m, "object", "rimraf: options should be object"), F(m), r(l, m, function d(t) {
      if (t) {
        if ((t.code === "EBUSY" || t.code === "ENOTEMPTY" || t.code === "EPERM") && s < m.maxBusyTries) {
          s++;
          const a = s * 100;
          return setTimeout(() => r(l, m, d), a);
        }
        t.code === "ENOENT" && (t = null);
      }
      n(t);
    });
  }
  function r(l, m, n) {
    u(l), u(m), u(typeof n == "function"), m.lstat(l, (s, d) => {
      if (s && s.code === "ENOENT")
        return n(null);
      if (s && s.code === "EPERM" && N)
        return h(l, m, s, n);
      if (d && d.isDirectory())
        return i(l, m, s, n);
      m.unlink(l, (t) => {
        if (t) {
          if (t.code === "ENOENT")
            return n(null);
          if (t.code === "EPERM")
            return N ? h(l, m, t, n) : i(l, m, t, n);
          if (t.code === "EISDIR")
            return i(l, m, t, n);
        }
        return n(t);
      });
    });
  }
  function h(l, m, n, s) {
    u(l), u(m), u(typeof s == "function"), n && u(n instanceof Error), m.chmod(l, 438, (d) => {
      d ? s(d.code === "ENOENT" ? null : n) : m.stat(l, (t, a) => {
        t ? s(t.code === "ENOENT" ? null : n) : a.isDirectory() ? i(l, m, n, s) : m.unlink(l, s);
      });
    });
  }
  function o(l, m, n) {
    let s;
    u(l), u(m), n && u(n instanceof Error);
    try {
      m.chmodSync(l, 438);
    } catch (d) {
      if (d.code === "ENOENT")
        return;
      throw n;
    }
    try {
      s = m.statSync(l);
    } catch (d) {
      if (d.code === "ENOENT")
        return;
      throw n;
    }
    s.isDirectory() ? k(l, m, n) : m.unlinkSync(l);
  }
  function i(l, m, n, s) {
    u(l), u(m), n && u(n instanceof Error), u(typeof s == "function"), m.rmdir(l, (d) => {
      d && (d.code === "ENOTEMPTY" || d.code === "EEXIST" || d.code === "EPERM") ? E(l, m, s) : d && d.code === "ENOTDIR" ? s(n) : s(d);
    });
  }
  function E(l, m, n) {
    u(l), u(m), u(typeof n == "function"), m.readdir(l, (s, d) => {
      if (s) return n(s);
      let t = d.length, a;
      if (t === 0) return m.rmdir(l, n);
      d.forEach((y) => {
        f(c.join(l, y), m, (w) => {
          if (!a) {
            if (w) return n(a = w);
            --t === 0 && m.rmdir(l, n);
          }
        });
      });
    });
  }
  function g(l, m) {
    let n;
    m = m || {}, F(m), u(l, "rimraf: missing path"), u.strictEqual(typeof l, "string", "rimraf: path should be a string"), u(m, "rimraf: missing options"), u.strictEqual(typeof m, "object", "rimraf: options should be object");
    try {
      n = m.lstatSync(l);
    } catch (s) {
      if (s.code === "ENOENT")
        return;
      s.code === "EPERM" && N && o(l, m, s);
    }
    try {
      n && n.isDirectory() ? k(l, m, null) : m.unlinkSync(l);
    } catch (s) {
      if (s.code === "ENOENT")
        return;
      if (s.code === "EPERM")
        return N ? o(l, m, s) : k(l, m, s);
      if (s.code !== "EISDIR")
        throw s;
      k(l, m, s);
    }
  }
  function k(l, m, n) {
    u(l), u(m), n && u(n instanceof Error);
    try {
      m.rmdirSync(l);
    } catch (s) {
      if (s.code === "ENOTDIR")
        throw n;
      if (s.code === "ENOTEMPTY" || s.code === "EEXIST" || s.code === "EPERM")
        O(l, m);
      else if (s.code !== "ENOENT")
        throw s;
    }
  }
  function O(l, m) {
    if (u(l), u(m), m.readdirSync(l).forEach((n) => g(c.join(l, n), m)), N) {
      const n = Date.now();
      do
        try {
          return m.rmdirSync(l, m);
        } catch {
        }
      while (Date.now() - n < 500);
    } else
      return m.rmdirSync(l, m);
  }
  return ke = f, f.sync = g, ke;
}
var Oe, ln;
function te() {
  if (ln) return Oe;
  ln = 1;
  const e = V().fromCallback, c = ir();
  return Oe = {
    remove: e(c),
    removeSync: c.sync
  }, Oe;
}
var Pe, yn;
function or() {
  if (yn) return Pe;
  yn = 1;
  const e = V().fromCallback, c = W(), u = $, N = Y(), F = te(), f = e(function(o, i) {
    i = i || function() {
    }, c.readdir(o, (E, g) => {
      if (E) return N.mkdirs(o, i);
      g = g.map((O) => u.join(o, O)), k();
      function k() {
        const O = g.pop();
        if (!O) return i();
        F.remove(O, (l) => {
          if (l) return i(l);
          k();
        });
      }
    });
  });
  function r(h) {
    let o;
    try {
      o = c.readdirSync(h);
    } catch {
      return N.mkdirsSync(h);
    }
    o.forEach((i) => {
      i = u.join(h, i), F.removeSync(i);
    });
  }
  return Pe = {
    emptyDirSync: r,
    emptydirSync: r,
    emptyDir: f,
    emptydir: f
  }, Pe;
}
var Ne, mn;
function ur() {
  if (mn) return Ne;
  mn = 1;
  const e = V().fromCallback, c = $, u = W(), N = Y(), F = Q().pathExists;
  function f(h, o) {
    function i() {
      u.writeFile(h, "", (E) => {
        if (E) return o(E);
        o();
      });
    }
    u.stat(h, (E, g) => {
      if (!E && g.isFile()) return o();
      const k = c.dirname(h);
      F(k, (O, l) => {
        if (O) return o(O);
        if (l) return i();
        N.mkdirs(k, (m) => {
          if (m) return o(m);
          i();
        });
      });
    });
  }
  function r(h) {
    let o;
    try {
      o = u.statSync(h);
    } catch {
    }
    if (o && o.isFile()) return;
    const i = c.dirname(h);
    u.existsSync(i) || N.mkdirsSync(i), u.writeFileSync(h, "");
  }
  return Ne = {
    createFile: e(f),
    createFileSync: r
  }, Ne;
}
var Re, dn;
function cr() {
  if (dn) return Re;
  dn = 1;
  const e = V().fromCallback, c = $, u = W(), N = Y(), F = Q().pathExists;
  function f(h, o, i) {
    function E(g, k) {
      u.link(g, k, (O) => {
        if (O) return i(O);
        i(null);
      });
    }
    F(o, (g, k) => {
      if (g) return i(g);
      if (k) return i(null);
      u.lstat(h, (O) => {
        if (O)
          return O.message = O.message.replace("lstat", "ensureLink"), i(O);
        const l = c.dirname(o);
        F(l, (m, n) => {
          if (m) return i(m);
          if (n) return E(h, o);
          N.mkdirs(l, (s) => {
            if (s) return i(s);
            E(h, o);
          });
        });
      });
    });
  }
  function r(h, o) {
    if (u.existsSync(o)) return;
    try {
      u.lstatSync(h);
    } catch (k) {
      throw k.message = k.message.replace("lstat", "ensureLink"), k;
    }
    const E = c.dirname(o);
    return u.existsSync(E) || N.mkdirsSync(E), u.linkSync(h, o);
  }
  return Re = {
    createLink: e(f),
    createLinkSync: r
  }, Re;
}
var Te, hn;
function fr() {
  if (hn) return Te;
  hn = 1;
  const e = $, c = W(), u = Q().pathExists;
  function N(f, r, h) {
    if (e.isAbsolute(f))
      return c.lstat(f, (o) => o ? (o.message = o.message.replace("lstat", "ensureSymlink"), h(o)) : h(null, {
        toCwd: f,
        toDst: f
      }));
    {
      const o = e.dirname(r), i = e.join(o, f);
      return u(i, (E, g) => E ? h(E) : g ? h(null, {
        toCwd: i,
        toDst: f
      }) : c.lstat(f, (k) => k ? (k.message = k.message.replace("lstat", "ensureSymlink"), h(k)) : h(null, {
        toCwd: f,
        toDst: e.relative(o, f)
      })));
    }
  }
  function F(f, r) {
    let h;
    if (e.isAbsolute(f)) {
      if (h = c.existsSync(f), !h) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: f,
        toDst: f
      };
    } else {
      const o = e.dirname(r), i = e.join(o, f);
      if (h = c.existsSync(i), h)
        return {
          toCwd: i,
          toDst: f
        };
      if (h = c.existsSync(f), !h) throw new Error("relative srcpath does not exist");
      return {
        toCwd: f,
        toDst: e.relative(o, f)
      };
    }
  }
  return Te = {
    symlinkPaths: N,
    symlinkPathsSync: F
  }, Te;
}
var qe, Sn;
function sr() {
  if (Sn) return qe;
  Sn = 1;
  const e = W();
  function c(N, F, f) {
    if (f = typeof F == "function" ? F : f, F = typeof F == "function" ? !1 : F, F) return f(null, F);
    e.lstat(N, (r, h) => {
      if (r) return f(null, "file");
      F = h && h.isDirectory() ? "dir" : "file", f(null, F);
    });
  }
  function u(N, F) {
    let f;
    if (F) return F;
    try {
      f = e.lstatSync(N);
    } catch {
      return "file";
    }
    return f && f.isDirectory() ? "dir" : "file";
  }
  return qe = {
    symlinkType: c,
    symlinkTypeSync: u
  }, qe;
}
var _e, vn;
function ar() {
  if (vn) return _e;
  vn = 1;
  const e = V().fromCallback, c = $, u = W(), N = Y(), F = N.mkdirs, f = N.mkdirsSync, r = fr(), h = r.symlinkPaths, o = r.symlinkPathsSync, i = sr(), E = i.symlinkType, g = i.symlinkTypeSync, k = Q().pathExists;
  function O(m, n, s, d) {
    d = typeof s == "function" ? s : d, s = typeof s == "function" ? !1 : s, k(n, (t, a) => {
      if (t) return d(t);
      if (a) return d(null);
      h(m, n, (y, w) => {
        if (y) return d(y);
        m = w.toDst, E(w.toCwd, s, (S, v) => {
          if (S) return d(S);
          const p = c.dirname(n);
          k(p, (P, R) => {
            if (P) return d(P);
            if (R) return u.symlink(m, n, v, d);
            F(p, (T) => {
              if (T) return d(T);
              u.symlink(m, n, v, d);
            });
          });
        });
      });
    });
  }
  function l(m, n, s) {
    if (u.existsSync(n)) return;
    const t = o(m, n);
    m = t.toDst, s = g(t.toCwd, s);
    const a = c.dirname(n);
    return u.existsSync(a) || f(a), u.symlinkSync(m, n, s);
  }
  return _e = {
    createSymlink: e(O),
    createSymlinkSync: l
  }, _e;
}
var De, wn;
function lr() {
  if (wn) return De;
  wn = 1;
  const e = ur(), c = cr(), u = ar();
  return De = {
    // file
    createFile: e.createFile,
    createFileSync: e.createFileSync,
    ensureFile: e.createFile,
    ensureFileSync: e.createFileSync,
    // link
    createLink: c.createLink,
    createLinkSync: c.createLinkSync,
    ensureLink: c.createLink,
    ensureLinkSync: c.createLinkSync,
    // symlink
    createSymlink: u.createSymlink,
    createSymlinkSync: u.createSymlinkSync,
    ensureSymlink: u.createSymlink,
    ensureSymlinkSync: u.createSymlinkSync
  }, De;
}
var xe, En;
function yr() {
  if (En) return xe;
  En = 1;
  var e;
  try {
    e = W();
  } catch {
    e = Ue;
  }
  function c(o, i, E) {
    E == null && (E = i, i = {}), typeof i == "string" && (i = { encoding: i }), i = i || {};
    var g = i.fs || e, k = !0;
    "throws" in i && (k = i.throws), g.readFile(o, i, function(O, l) {
      if (O) return E(O);
      l = r(l);
      var m;
      try {
        m = JSON.parse(l, i ? i.reviver : null);
      } catch (n) {
        return k ? (n.message = o + ": " + n.message, E(n)) : E(null, null);
      }
      E(null, m);
    });
  }
  function u(o, i) {
    i = i || {}, typeof i == "string" && (i = { encoding: i });
    var E = i.fs || e, g = !0;
    "throws" in i && (g = i.throws);
    try {
      var k = E.readFileSync(o, i);
      return k = r(k), JSON.parse(k, i.reviver);
    } catch (O) {
      if (g)
        throw O.message = o + ": " + O.message, O;
      return null;
    }
  }
  function N(o, i) {
    var E, g = `
`;
    typeof i == "object" && i !== null && (i.spaces && (E = i.spaces), i.EOL && (g = i.EOL));
    var k = JSON.stringify(o, i ? i.replacer : null, E);
    return k.replace(/\n/g, g) + g;
  }
  function F(o, i, E, g) {
    g == null && (g = E, E = {}), E = E || {};
    var k = E.fs || e, O = "";
    try {
      O = N(i, E);
    } catch (l) {
      g && g(l, null);
      return;
    }
    k.writeFile(o, O, E, g);
  }
  function f(o, i, E) {
    E = E || {};
    var g = E.fs || e, k = N(i, E);
    return g.writeFileSync(o, k, E);
  }
  function r(o) {
    return Buffer.isBuffer(o) && (o = o.toString("utf8")), o = o.replace(/^\uFEFF/, ""), o;
  }
  var h = {
    readFile: c,
    readFileSync: u,
    writeFile: F,
    writeFileSync: f
  };
  return xe = h, xe;
}
var Ie, pn;
function Ge() {
  if (pn) return Ie;
  pn = 1;
  const e = V().fromCallback, c = yr();
  return Ie = {
    // jsonfile exports
    readJson: e(c.readFile),
    readJsonSync: c.readFileSync,
    writeJson: e(c.writeFile),
    writeJsonSync: c.writeFileSync
  }, Ie;
}
var je, gn;
function mr() {
  if (gn) return je;
  gn = 1;
  const e = $, c = Y(), u = Q().pathExists, N = Ge();
  function F(f, r, h, o) {
    typeof h == "function" && (o = h, h = {});
    const i = e.dirname(f);
    u(i, (E, g) => {
      if (E) return o(E);
      if (g) return N.writeJson(f, r, h, o);
      c.mkdirs(i, (k) => {
        if (k) return o(k);
        N.writeJson(f, r, h, o);
      });
    });
  }
  return je = F, je;
}
var Le, Fn;
function dr() {
  if (Fn) return Le;
  Fn = 1;
  const e = W(), c = $, u = Y(), N = Ge();
  function F(f, r, h) {
    const o = c.dirname(f);
    e.existsSync(o) || u.mkdirsSync(o), N.writeJsonSync(f, r, h);
  }
  return Le = F, Le;
}
var Me, kn;
function hr() {
  if (kn) return Me;
  kn = 1;
  const e = V().fromCallback, c = Ge();
  return c.outputJson = e(mr()), c.outputJsonSync = dr(), c.outputJSON = c.outputJson, c.outputJSONSync = c.outputJsonSync, c.writeJSON = c.writeJson, c.writeJSONSync = c.writeJsonSync, c.readJSON = c.readJson, c.readJSONSync = c.readJsonSync, Me = c, Me;
}
var $e, On;
function Sr() {
  if (On) return $e;
  On = 1;
  const e = W(), c = $, u = $n().copySync, N = te().removeSync, F = Y().mkdirpSync, f = re();
  function r(E, g, k) {
    k = k || {};
    const O = k.overwrite || k.clobber || !1, { srcStat: l } = f.checkPathsSync(E, g, "move");
    return f.checkParentPathsSync(E, l, g, "move"), F(c.dirname(g)), h(E, g, O);
  }
  function h(E, g, k) {
    if (k)
      return N(g), o(E, g, k);
    if (e.existsSync(g)) throw new Error("dest already exists.");
    return o(E, g, k);
  }
  function o(E, g, k) {
    try {
      e.renameSync(E, g);
    } catch (O) {
      if (O.code !== "EXDEV") throw O;
      return i(E, g, k);
    }
  }
  function i(E, g, k) {
    return u(E, g, {
      overwrite: k,
      errorOnExist: !0
    }), N(E);
  }
  return $e = r, $e;
}
var Ce, Pn;
function vr() {
  return Pn || (Pn = 1, Ce = {
    moveSync: Sr()
  }), Ce;
}
var We, Nn;
function wr() {
  if (Nn) return We;
  Nn = 1;
  const e = W(), c = $, u = Cn().copy, N = te().remove, F = Y().mkdirp, f = Q().pathExists, r = re();
  function h(g, k, O, l) {
    typeof O == "function" && (l = O, O = {});
    const m = O.overwrite || O.clobber || !1;
    r.checkPaths(g, k, "move", (n, s) => {
      if (n) return l(n);
      const { srcStat: d } = s;
      r.checkParentPaths(g, d, k, "move", (t) => {
        if (t) return l(t);
        F(c.dirname(k), (a) => a ? l(a) : o(g, k, m, l));
      });
    });
  }
  function o(g, k, O, l) {
    if (O)
      return N(k, (m) => m ? l(m) : i(g, k, O, l));
    f(k, (m, n) => m ? l(m) : n ? l(new Error("dest already exists.")) : i(g, k, O, l));
  }
  function i(g, k, O, l) {
    e.rename(g, k, (m) => m ? m.code !== "EXDEV" ? l(m) : E(g, k, O, l) : l());
  }
  function E(g, k, O, l) {
    u(g, k, {
      overwrite: O,
      errorOnExist: !0
    }, (n) => n ? l(n) : N(g, l));
  }
  return We = h, We;
}
var Je, Rn;
function Er() {
  if (Rn) return Je;
  Rn = 1;
  const e = V().fromCallback;
  return Je = {
    move: e(wr())
  }, Je;
}
var Ae, Tn;
function pr() {
  if (Tn) return Ae;
  Tn = 1;
  const e = V().fromCallback, c = W(), u = $, N = Y(), F = Q().pathExists;
  function f(h, o, i, E) {
    typeof i == "function" && (E = i, i = "utf8");
    const g = u.dirname(h);
    F(g, (k, O) => {
      if (k) return E(k);
      if (O) return c.writeFile(h, o, i, E);
      N.mkdirs(g, (l) => {
        if (l) return E(l);
        c.writeFile(h, o, i, E);
      });
    });
  }
  function r(h, ...o) {
    const i = u.dirname(h);
    if (c.existsSync(i))
      return c.writeFileSync(h, ...o);
    N.mkdirsSync(i), c.writeFileSync(h, ...o);
  }
  return Ae = {
    outputFile: e(f),
    outputFileSync: r
  }, Ae;
}
var qn;
function gr() {
  return qn || (qn = 1, function(e) {
    e.exports = Object.assign(
      {},
      // Export promiseified graceful-fs:
      jn(),
      // Export extra methods:
      $n(),
      Cn(),
      or(),
      lr(),
      hr(),
      Y(),
      vr(),
      Er(),
      pr(),
      Q(),
      te()
    );
    const c = Ue;
    Object.getOwnPropertyDescriptor(c, "promises") && Object.defineProperty(e.exports, "promises", {
      get() {
        return c.promises;
      }
    });
  }(ue)), ue.exports;
}
var Fr = gr();
const Be = /* @__PURE__ */ Qn(Fr), kr = Hn(import.meta.url), _n = $.dirname(kr);
function Dn() {
  const e = new ne(
    {
      // fullscreen: true,
      // 移动端友好配置
      frame: !1,
      // 隐藏窗口边框
      kiosk: !0,
      // 真正的全屏模式（类似信息亭模式）
      width: 1920,
      height: 1080,
      webPreferences: {
        preload: $.join(_n, "./preload.mjs"),
        // 预加载脚本
        contextIsolation: !0,
        // 上下文隔离
        nodeIntegration: !1,
        // 禁用 Node.js 集成
        // 启用触控特性
        enablePreferredSizeMode: !0,
        enableBlinkFeatures: "TouchEvent"
        // webSecurity: false
      }
    }
  );
  X.isPackaged ? e.loadFile($.join(_n, "../dist/index.html")) : (e.loadURL("http://localhost:5173"), e.webContents.openDevTools());
}
X.commandLine.appendSwitch("--enable-features", "TouchableApp");
X.commandLine.appendSwitch("--force-app-mode");
X.whenReady().then(() => {
  Dn(), X.on("activate", () => {
    ne.getAllWindows().length === 0 && Dn();
  });
});
X.on("window-all-closed", () => {
  process.platform !== "darwin" && X.quit();
});
xn.handle("get-printers", (e) => ne.getAllWindows()[0].webContents.getPrintersAsync());
const Or = async (e, c, u) => {
  for (let N = 0; N < u; N++)
    await new Promise((F, f) => {
      const r = `rundll32 C:\\Windows\\System32\\shimgvw.dll,ImageView_PrintTo /pt "${e}" "${c}"`;
      Kn(r, (h, o, i) => {
        h ? f(`打印失败: ${i}`) : F(o);
      });
    });
};
xn.handle("silent-print-image", async (e, {
  buffer: c,
  printerName: u,
  copies: N = 1
}) => {
  const F = $.join(X.getPath("temp"), "instapic-print");
  await Be.ensureDir(F);
  const f = $.join(F, `${Date.now()}.png`);
  try {
    await Be.writeFile(f, Buffer.from(c));
    const r = await ne.getAllWindows()[0].webContents.getPrintersAsync(), h = r.find((o) => o.name === u) || r[0];
    return await Or(f, h.name, N), { success: !0 };
  } catch (r) {
    return console.error("打印失败:", r), { success: !1, error: r };
  } finally {
    await Be.remove(f).catch(console.error);
  }
});
process.on("uncaughtException", (e) => {
  console.error("Electron Main Process Error:", e);
});
