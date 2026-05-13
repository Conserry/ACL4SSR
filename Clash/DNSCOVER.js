function main(config) {
  /***********************
   * 0. DNS 参数
   ***********************/
  const DNS_LISTEN = "0.0.0.0:53";

  const domesticNameservers = [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
  ];

  const foreignNameservers = [
    "https://208.67.222.222/dns-query",
    "https://77.88.8.8/dns-query",
    "https://1.1.1.1/dns-query",
    "https://8.8.4.4/dns-query"
  ];

  /***********************
   * 1. 只覆写 DNS
   ***********************/
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
      "223.5.5.5",
      "1.2.4.8"
    ],

    "nameserver": foreignNameservers,

    "proxy-server-nameserver": domesticNameservers,

    "direct-nameserver": domesticNameservers,

    "nameserver-policy": {
      "geosite:private,cn": domesticNameservers
    },

    "fallback": []
  };

  /***********************
   * 2. 修复 AnyTLS
   ***********************/
  if (Array.isArray(config["proxies"])) {
    config["proxies"].forEach(proxy => {
      if (!proxy || proxy.type !== "anytls") return;

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

  /***********************
/***********************
 * 3. 占位符转 emoji：支持 /robot_face/、/globe_with_meridians/ 等 shortcode
 ***********************/

// 常见 emoji shortcode 映射表
const emojiMap = {
  // 策略组/代理
  "recycle": "♻️",
  "arrows_counterclockwise": "🔄",
  "repeat": "🔁",
  "auto": "♻️",
  "urltest": "♻️",
  "url_test": "♻️",
  "loadbalance": "⚖️",
  "load_balance": "⚖️",
  "balance_scale": "⚖️",
  "select": "🚀",
  "rocket": "🚀",
  "manual": "👆",
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

  // 拦截/广告
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

  // 厂商/服务
  "google": "📢",
  "loudspeaker": "📢",
  "mega": "📣",
  "apple": "🍎",
  "green_apple": "🍏",
  "microsoft": "Ⓜ️",
  "m": "Ⓜ️",
  "onedrive": "☁️",
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

  // 学术/下载/安全
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

  // 地区文字类，有些订阅不用 /flag-hk/，而用 /hong_kong/
  "hong_kong": "🇭🇰",
  "taiwan": "🇹🇼",
  "singapore": "🇸🇬",
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
  "france": "🇫🇷",
  "canada": "🇨🇦",
  "australia": "🇦🇺",
  "netherlands": "🇳🇱",
  "india": "🇮🇳",
  "turkey": "🇹🇷",
  "russia": "🇷🇺"
};

// 两位地区代码转旗帜 emoji，例如 hk -> 🇭🇰
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

function lookupEmoji(rawKey) {
  if (typeof rawKey !== "string") return null;

  const k = rawKey.toLowerCase().replace(/-/g, "_");

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

  return null;
}

function fixPlaceholderEmoji(text) {
  if (typeof text !== "string") return text;

  let result = text;

  // /flag-hk/、/flag_hk/、/flagHK/ 这类
  result = result.replace(/\/flag[-_]?([a-zA-Z]{2})\//g, function(match, code) {
    return countryCodeToFlag(code) || match;
  });

  // /hk/、/jp/、/us/ 这种如果单独出现，也按国旗处理
  result = result.replace(/\/([a-zA-Z]{2})\//g, function(match, code) {
    return countryCodeToFlag(code) || match;
  });

  // /robot_face/、/globe_with_meridians/、/recycle/ 等
  result = result.replace(/\/([a-zA-Z0-9_-]+)\//g, function(match, key) {
    return lookupEmoji(key) || match;
  });

  return result.replace(/\s+/g, " ").trim();
}

  /***********************
   * 4. 建立重命名映射
   ***********************/
  const renameMap = {};

  // 节点名：只修 /flag-hk/ 这种占位符，不做“专用节点”兜底
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

  // 策略组名：修占位符；只有“专用节点”单独补 🐧
  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (!group || !group.name) return;

      const oldName = group.name;
      const newName = fixDedicatedGroupName(oldName);

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

    // 引用里只处理占位符，不做专用节点兜底，避免误改
    return fixPlaceholderEmoji(name);
  }

  /***********************
   * 5. 同步策略组引用
   ***********************/
  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (!group) return;

      if (Array.isArray(group.proxies)) {
        group.proxies = group.proxies.map(item => fixRef(item));
      }
    });
  }

  /***********************
   * 6. 同步 rules 里的策略组名
   ***********************/
  if (Array.isArray(config["rules"])) {
    config["rules"] = config["rules"].map(rule => {
      if (typeof rule !== "string") return rule;

      const parts = rule.split(",");
      if (parts.length < 2) return rule;

      let policyIndex = parts.length - 1;

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
