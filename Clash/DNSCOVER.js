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
   * 3. 占位符转 emoji
   ***********************/
  const emojiMap = {
    "recycle": "♻️",
    "auto": "♻️",
    "urltest": "♻️",
    "url-test": "♻️",

    "select": "🚀",
    "rocket": "🚀",
    "manual": "👆",

    "direct": "🎯",
    "target": "🎯",

    "global": "🌍",
    "globe": "🌍",
    "earth": "🌍",
    "world": "🌍",

    "fish": "🐟",
    "final": "🐟",

    "reject": "🛑",
    "block": "🛑",
    "ban": "🛑",
    "ad": "🛑",
    "ads": "🛑",
    "bug": "🛑",

    "youtube": "📹",
    "yt": "📹",
    "netflix": "🎥",
    "nf": "🎥",
    "disney": "🦄",
    "disneyplus": "🦄",
    "hbo": "📼",
    "spotify": "🎶",
    "music": "🎶",
    "netease": "🎶",
    "tiktok": "🎵",
    "telegram": "📲",
    "tg": "📲",
    "google": "📢",
    "github": "🐱",
    "openai": "🤖",
    "chatgpt": "🤖",
    "ai": "🤖",
    "apple": "🍎",
    "microsoft": "Ⓜ️",
    "onedrive": "Ⓜ️",
    "game": "🎮",
    "steam": "🎮",
    "xbox": "🎮",
    "nintendo": "🎮",
    "sony": "🎮",
    "bilibili": "📺",
    "bahamut": "📺",
    "tvb": "📻",

    "penguin": "🐧",
    "self": "🐧",
    "private": "🐧",

    "book": "📖",
    "scholar": "📖",
    "study": "📖",
    "academic": "📖",
    "cloud": "☁️",
    "download": "⬇️"
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

  function fixPlaceholderEmoji(text) {
    if (typeof text !== "string") return text;

    let result = text;

    // /flag-hk/ -> 🇭🇰
    result = result.replace(/\/flag[-_]?([a-zA-Z]{2})\//g, function(match, code) {
      return countryCodeToFlag(code) || match;
    });

    // /recycle/ -> ♻️
    result = result.replace(/\/([a-zA-Z0-9_-]+)\//g, function(match, key) {
      const normalized = key.toLowerCase();
      return emojiMap[normalized] || match;
    });

    return result.replace(/\s+/g, " ").trim();
  }

  // 只处理“专用节点”这个策略组，不做模糊关键词全局替换
  function fixDedicatedGroupName(name) {
    if (typeof name !== "string") return name;

    let result = fixPlaceholderEmoji(name);

    const clean = result
      .replace(/^🐧\s*/, "")
      .replace(/^\/penguin\/\s*/, "")
      .trim();

    if (
      clean === "专用节点" ||
      clean === "專用節點" ||
      clean === "self" ||
      clean === "Self" ||
      clean === "SELF"
    ) {
      return "🐧 " + clean;
    }

    return result;
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
