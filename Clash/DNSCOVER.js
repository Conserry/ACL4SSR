function main(config) {
  /************************************************************
   * 0. 用户可改区域
   ************************************************************/

  // DNS 监听端口。Clash Mi 一般用 53；如果端口冲突，改成 "0.0.0.0:1053"
  const DNS_LISTEN = "0.0.0.0:53";

  // 国内 DNS：用于代理节点域名、直连域名、国内域名
  const domesticNameservers = [
    //"system"
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
    //"https://hydrogen1693.com:44443/dns-query/48417728-40aa-48cf-8a06-c308d0256139",
    //"https://subprime7404.com:44443/dns-query/48417728-40aa-48cf-8a06-c308d0256139",
    //"https://tribunal2944.com/dns-query/48417728-40aa-48cf-8a06-c308d0256139"
  ];

  const cnNameservers = [
    "system"
  ];
  
  const proxyNameservers = [
    "https://hydrogen1693.com:44443/dns-query/48417728-40aa-48cf-8a06-c308d0256139",
    "https://subprime7404.com:44443/dns-query/48417728-40aa-48cf-8a06-c308d0256139",
    "https://tribunal2944.com/dns-query/48417728-40aa-48cf-8a06-c308d0256139"
  ];
  // 国外 DNS：不指定代理组版本，依赖 respect-rules
  const foreignNameservers = [
    "https://208.67.222.222/dns-query",
    "https://77.88.8.8/dns-query",
    "https://1.1.1.1/dns-query",
    "https://8.8.4.4/dns-query"
    //"system"
  ];

  // 未来如果又出现新的 /xxx/ 占位符，在这里加一行即可
  // 例如： "kuromi": "🖤",
  const EXTRA_EMOJI_MAP = {
    "kuromi": "🖤",
    "lastwar": "🎮",
    "mihomo": "🐱",
    "clash": "🐱",
    "quanx": "🔧",
    "stash": "📦"
  };

  /************************************************************
   * 1. 只覆写 DNS
   ************************************************************/

  config["dns"] = {
    "enable": true,
    "listen": DNS_LISTEN,
    "ipv6": false,
    "prefer-h3": false,
    "respect-rules": true,
    "use-hosts": false,
    "use-system-hosts": false,
    "cache-algorithm": "arc",

    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter-mode": "blacklist",

    "fake-ip-filter": [
      "+.lan",
      "+.local",
      "+.msftconnecttest.com",
      "+.msftncsi.com",
      "localhost.ptlogin2.qq.com",
      "localhost.sec.qq.com",
      "+.in-addr.arpa",
      "+.ip6.arpa",
      "time.*.com",
      "time.*.gov",
      "pool.ntp.org",
      "localhost.work.weixin.qq.com"
    ],

    "default-nameserver": [
      "https://223.5.5.5/dns-query",
      "https://1.1.1.1/dns-query"
      //"system",
      //"119.29.29.29",
      //'2402:4e00::'
    ],

    "nameserver": foreignNameservers,

    "proxy-server-nameserver": proxyNameservers,

    "direct-nameserver": domesticNameservers,
    "direct-nameserver-follow-policy": true,
    "nameserver-policy": {
      "geosite:private,cn": cnNameservers
    },

    "fallback": []
  };

  /************************************************************
   * 2. 修复 AnyTLS 字段
   ************************************************************/

  if (Array.isArray(config["proxies"])) {
    config["proxies"].forEach(proxy => {
      if (!proxy || proxy.type !== "anytls") return;

      // 普通 clash 订阅转换有时会输出 fingerprint；
      // mihomo / Clash Mi 对 AnyTLS 更标准的是 client-fingerprint
      if (proxy.fingerprint && !proxy["client-fingerprint"]) {
        proxy["client-fingerprint"] = proxy.fingerprint;
      }

      delete proxy.fingerprint;

      if (proxy["idle-session-check-interval"] === undefined) {
        proxy["idle-session-check-interval"] = 30;
      }

      if (proxy["idle-session-timeout"] === undefined) {
        proxy["idle-session-timeout"] = 30;
      }

      if (proxy["min-idle-session"] === undefined) {
        proxy["min-idle-session"] = 0;
      }

      proxy.udp = true;
    });
  }

  /************************************************************
   * 3. 占位符转 emoji
   ************************************************************/

  const emojiMap = {
    // 策略组 / 代理功能
    "recycle": "♻️",
    "arrows_counterclockwise": "🔄",
    "repeat": "🔁",
    "auto": "♻️",
    "urltest": "♻️",
    "url_test": "♻️",
    "url-test": "♻️",
    "loadbalance": "⚖️",
    "load_balance": "⚖️",
    "load-balance": "⚖️",
    "balance_scale": "⚖️",

    "select": "🚀",
    "rocket": "🚀",
    "manual": "🚀",
    "point_up": "☝️",
    "point_up_2": "👆",

    "direct": "🎯",
    "target": "🎯",
    "dart": "🎯",

    "global": "🌍",
    "globe": "🌍",
    "globe_with_meridians": "🌐",
    "earth": "🌍",
    "earth_asia": "🌏",
    "earth_africa": "🌍",
    "earth_americas": "🌎",
    "world": "🌍",

    "fish": "🐟",
    "tropical_fish": "🐠",
    "final": "🐟",

    "penguin": "🐧",
    "self": "🐧",
    "private": "🐧",
    "dedicated": "🐧",
    "exclusive": "🐧",
    "special": "🐧",
    "vip": "🐧",

    // 拦截 / 广告
    "reject": "🛑",
    "block": "🛑",
    "stop_sign": "🛑",
    "no_entry": "⛔",
    "prohibited": "🚫",
    "ban": "🛑",
    "ad": "🛑",
    "ads": "🛑",
    "bug": "🛑",
    "beetle": "🪲",
    "leaves": "🍃",
    "leaf": "🍃",

    // AI / 开发
    "robot": "🤖",
    "robot_face": "🤖",
    "openai": "🤖",
    "chatgpt": "🤖",
    "ai": "🤖",
    "brain": "🧠",

    "github": "🐱",
    "octocat": "🐱",
    "cat": "🐱",
    "computer": "💻",
    "desktop_computer": "🖥️",
    "keyboard": "⌨️",

    // 常见服务
    "youtube": "📹",
    "yt": "📹",
    "video_camera": "📹",
    "movie_camera": "🎥",
    "cinema": "🎦",
    "netflix": "🎥",
    "nf": "🎥",
    "clapper": "🎬",
    "film_projector": "📽️",

    "tv": "📺",
    "television": "📺",
    "bilibili": "📺",
    "bahamut": "📺",

    "disney": "🦄",
    "disneyplus": "🦄",
    "unicorn": "🦄",
    "unicorn_face": "🦄",

    "hbo": "📼",
    "vhs": "📼",

    "spotify": "🎶",
    "music": "🎶",
    "musical_note": "🎵",
    "notes": "🎶",
    "netease": "🎶",
    "tiktok": "🎵",

    "telegram": "📲",
    "tg": "📲",
    "iphone": "📱",
    "mobile_phone": "📱",
    "calling": "📲",

    // 厂商 / 服务
    "google": "📢",
    "loudspeaker": "📢",
    "mega": "📣",

    "apple": "🍎",
    "green_apple": "🍏",

    "microsoft": "Ⓜ️",
    "m": "Ⓜ️",
    "onedrive": "Ⓜ️",

    "cloud": "☁️",

    // 游戏
    "game": "🎮",
    "video_game": "🎮",
    "steam": "🎮",
    "xbox": "🎮",
    "nintendo": "🎮",
    "sony": "🎮",
    "joystick": "🕹️",
    "space_invader": "👾",

    // 学术 / 下载 / 安全
    "book": "📖",
    "open_book": "📖",
    "books": "📚",
    "scholar": "📖",
    "study": "📖",
    "academic": "📖",

    "download": "⬇️",
    "arrow_down": "⬇️",
    "inbox_tray": "📥",

    "lock": "🔒",
    "closed_lock_with_key": "🔐",
    "unlock": "🔓",
    "key": "🔑",

    // 地区文字类
    "hong_kong": "🇭🇰",
    "hk": "🇭🇰",
    "taiwan": "🇨🇳",
    "tw": "🇨🇳",
    "singapore": "🇸🇬",
    "sg": "🇸🇬",
    "japan": "🇯🇵",
    "jp": "🇯🇵",
    "korea": "🇰🇷",
    "kr": "🇰🇷",
    "us": "🇺🇸",
    "usa": "🇺🇸",
    "america": "🇺🇸",
    "united_states": "🇺🇸",
    "china": "🇨🇳",
    "cn": "🇨🇳",
    "uk": "🇬🇧",
    "gb": "🇬🇧",
    "united_kingdom": "🇬🇧",
    "germany": "🇩🇪",
    "de": "🇩🇪",
    "france": "🇫🇷",
    "fr": "🇫🇷",
    "canada": "🇨🇦",
    "ca": "🇨🇦",
    "australia": "🇦🇺",
    "au": "🇦🇺",
    "netherlands": "🇳🇱",
    "nl": "🇳🇱",
    "india": "🇮🇳",
    "in": "🇮🇳",
    "turkey": "🇹🇷",
    "tr": "🇹🇷",
    "russia": "🇷🇺",
    "ru": "🇷🇺",

    // 用户额外补充
    ...EXTRA_EMOJI_MAP
  };

  // kuromis.ini / ACL4SSR 常见纯文字策略组名精确补 emoji
  // 只对策略组名生效，不对节点名做模糊替换，避免误伤。
  const exactGroupPrefixMap = {
    "节点选择": "🚀",
    "手动切换": "🚀",
    "自动选择": "♻️",
    "专用节点": "🐧",
    "專用節點": "🐧",

    "全球直连": "🎯",
    "全局直连": "🎯",
    "漏网之鱼": "🐟",

    "学术研究": "📖",
    "Open AI": "🤖",
    "OpenAI": "🤖",
    "Apple AI": "🤖",
    "lastwar": "🎮",

    "广告拦截": "🛑",
    "应用净化": "🍃",

    "谷歌FCM": "📢",
    "谷歌其他": "📢",

    "微软云盘": "Ⓜ️",
    "微软服务": "Ⓜ️",
    "苹果服务": "🍎",

    "电报消息": "📲",
    "Github": "🐱",
    "网易音乐": "🎶",

    "游戏平台": "🎮",
    "瓦洛兰特": "🎮",

    "油管视频": "📹",
    "YouTube": "📹",
    "奈飞视频": "🎥",
    "Netflix": "🎥",
    "巴哈姆特": "📺",
    "哔哩哔哩": "📺",
    "HBO MAX": "📼",
    "迪士尼+": "🦄",
    "TVB": "📻",
    "Tiktok": "🎵",
    "TikTok": "🎵",

    "国内媒体": "🌏",
    "国外媒体": "🌍",

    "香港节点": "🇭🇰",
    "台湾节点": "🇨🇳",
    "狮城节点": "🇸🇬",
    "日本节点": "🇯🇵",
    "美国节点": "🇺🇸",
    "韩国节点": "🇰🇷"
  };

  function countryCodeToFlag(code) {
    if (typeof code !== "string") return "";

    let cc = code.trim().toUpperCase();

    const alias = {
      "UK": "GB",
      "EN": "GB",
      "JA": "JP",
      "KO": "KR"
    };

    cc = alias[cc] || cc;

    if (!/^[A-Z]{2}$/.test(cc)) return "";

    const base = 0x1F1E6;

    return String.fromCodePoint(
      base + cc.charCodeAt(0) - 65,
      base + cc.charCodeAt(1) - 65
    );
  }

  function normalizeEmojiKey(key) {
    return String(key || "")
      .trim()
      .toLowerCase()
      .replace(/-/g, "_");
  }

  function lookupEmoji(rawKey) {
    if (typeof rawKey !== "string") return null;

    const k = normalizeEmojiKey(rawKey);

    const candidates = [
      k,
      k.replace(/_/g, ""),
      k.replace(/_face$/, ""),
      k.replace(/^icon_/, ""),
      k.replace(/^emoji_/, "")
    ];

    for (const key of candidates) {
      if (emojiMap[key]) return emojiMap[key];
    }

    // 如果是 /flag-xx/ 以外的 /hk/、/jp/、/us/ 这类，也尽量转旗帜。
    // 但 ai/ad/nf/tg/yt 等已在 emojiMap 中优先处理，不会误转。
    if (/^[a-z]{2}$/.test(k)) {
      return countryCodeToFlag(k);
    }

    return null;
  }

  function fixPlaceholderEmoji(text) {
    if (typeof text !== "string") return text;

    let result = text;

    // /flag-hk/、/flag_hk/ -> 🇭🇰
    result = result.replace(/\/flag[-_]?([a-zA-Z]{2})\//g, function(match, code) {
      return countryCodeToFlag(code) || match;
    });

    // :robot_face: -> 🤖
    result = result.replace(/:([a-zA-Z0-9_-]+):/g, function(match, key) {
      return lookupEmoji(key) || match;
    });

    // /robot_face/ -> 🤖
    result = result.replace(/\/([a-zA-Z0-9_-]+)\//g, function(match, key) {
      return lookupEmoji(key) || match;
    });

    return result.replace(/\s+/g, " ").trim();
  }

  function startsWithKnownEmoji(text) {
    if (typeof text !== "string") return false;

    const s = text.trim();
    if (!s) return false;

    // 先用已知前缀判断，覆盖 ♻️、Ⓜ️、旗帜等
    const knownPrefixes = new Set([
      ...Object.values(emojiMap),
      ...Object.values(exactGroupPrefixMap)
    ]);

    for (const e of knownPrefixes) {
      if (e && s.startsWith(e)) return true;
    }

    const cp = s.codePointAt(0);

    // emoji 常见区段、旗帜区域指示符、杂项符号
    return (
      (cp >= 0x1F000 && cp <= 0x1FAFF) ||
      (cp >= 0x1F1E6 && cp <= 0x1F1FF) ||
      (cp >= 0x2600 && cp <= 0x27BF) ||
      cp === 0x24C2
    );
  }

  function stripKnownLeadingEmoji(text) {
    if (typeof text !== "string") return text;

    let s = text.trim();

    const prefixes = [
      ...new Set([
        ...Object.values(emojiMap),
        ...Object.values(exactGroupPrefixMap)
      ])
    ].filter(Boolean);

    for (const p of prefixes) {
      if (s.startsWith(p)) {
        return s.slice(p.length).trim();
      }
    }

    return s;
  }

  function fixGroupName(name) {
    if (typeof name !== "string") return name;

    let result = fixPlaceholderEmoji(name);

    // 已经有 emoji 的策略组不再强行改
    if (startsWithKnownEmoji(result)) {
      return result;
    }

    const clean = stripKnownLeadingEmoji(result);

    if (exactGroupPrefixMap[clean]) {
      return exactGroupPrefixMap[clean] + " " + clean;
    }

    return result;
  }

  /************************************************************
   * 4. 建立重命名映射
   ************************************************************/

  const renameMap = {};

  // 节点名：只修占位符，不做纯文字语义补前缀
  if (Array.isArray(config["proxies"])) {
    config["proxies"].forEach(proxy => {
      if (!proxy || !proxy.name) return;

      const oldName = proxy.name;
      const newName = fixPlaceholderEmoji(oldName);

      if (oldName !== newName) {
        renameMap[oldName] = newName;
        proxy.name = newName;
      }
    });
  }

  // 策略组名：修占位符，并对 kuromis.ini 里的纯文字组名精确补 emoji
  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (!group || !group.name) return;

      const oldName = group.name;
      const newName = fixGroupName(oldName);

      if (oldName !== newName) {
        renameMap[oldName] = newName;
        group.name = newName;
      }
    });
  }

  function fixRef(name) {
    if (typeof name !== "string") return name;

    if (renameMap[name]) {
      return renameMap[name];
    }

    // 引用里只处理占位符，不对纯文字补 emoji，避免误改不存在的组名
    return fixPlaceholderEmoji(name);
  }

  /************************************************************
   * 5. 同步策略组里的 proxies 引用
   ************************************************************/

  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (!group) return;

      if (Array.isArray(group.proxies)) {
        group.proxies = group.proxies.map(item => fixRef(item));
      }
    });
  }

  /************************************************************
   * 6. 同步 rules 里的策略组名
   ************************************************************/

  if (Array.isArray(config["rules"])) {
    config["rules"] = config["rules"].map(rule => {
      if (typeof rule !== "string") return rule;

      const parts = rule.split(",");
      if (parts.length < 2) return rule;

      let policyIndex = parts.length - 1;

      // GEOIP,CN,策略组,no-resolve
      if (parts[policyIndex].trim().toLowerCase() === "no-resolve") {
        policyIndex = parts.length - 2;
      }

      if (policyIndex >= 1) {
        parts[policyIndex] = fixRef(parts[policyIndex]);
      }

      return parts.join(",");
    });
  }

  return config;
}
