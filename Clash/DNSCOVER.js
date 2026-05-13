function main(config) {
  /***********************
   * 0. 基础参数
   ***********************/
  const DNS_LISTEN = "0.0.0.0:53";
  // 如果 53 端口报错，改成：
  // const DNS_LISTEN = "0.0.0.0:1053";

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
   * 2. 修复 AnyTLS 字段
   ***********************/
  if (Array.isArray(config["proxies"])) {
    config["proxies"].forEach(proxy => {
      if (!proxy || proxy.type !== "anytls") return;

      // 订阅转换器有时输出 fingerprint，mihomo 更标准的是 client-fingerprint
      if (proxy.fingerprint && !proxy["client-fingerprint"]) {
        proxy["client-fingerprint"] = proxy.fingerprint;
      }

      // 删除 fingerprint，避免 mihomo 解析歧义
      delete proxy.fingerprint;

      // 补充 AnyTLS 默认空闲会话参数
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

  // 普通图标占位符映射
  const emojiMap = {
    // 策略组/功能
    "recycle": "♻️",
    "auto": "♻️",
    "urltest": "♻️",
    "url-test": "♻️",
    "loadbalance": "⚖️",
    "load-balance": "⚖️",
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

    // 常用服务
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

    // 其他
    "book": "📖",
    "scholar": "📖",
    "study": "📖",
    "academic": "📖",
    "cloud": "☁️",
    "download": "⬇️",
    "lock": "🔒",
    "unlock": "🔓"
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

  function fixEmojiText(text) {
    if (typeof text !== "string") return text;
  
    let result = text;
  
    // 处理 /flag-hk/、/flag-jp/、/flag-us/、/flag-gb/ 等
    result = result.replace(/\/flag[-_]?([a-zA-Z]{2})\//g, function(match, code) {
      return countryCodeToFlag(code) || match;
    });
  
    // 处理 /recycle/、/youtube/、/openai/、/penguin/ 等
    result = result.replace(/\/([a-zA-Z0-9_-]+)\//g, function(match, key) {
      const normalized = key.toLowerCase();
      return emojiMap[normalized] || match;
    });
  
    // 清理多余空格
    result = result.replace(/\s+/g, " ").trim();
  
    // 关键词兜底：原始名字里没有占位符，但含有“专用节点”时，主动加 🐧
    if (
      /专用节点|專用節點|self|SELF|Self|dedicated|exclusive|private/i.test(result) &&
      !result.includes("🐧")
    ) {
      result = "🐧 " + result;
    }
  
    return result;
  }

  /***********************
   * 4. 重命名节点和策略组，并同步引用
   ***********************/

  const renameMap = {};

  // 修复节点名称
  if (Array.isArray(config["proxies"])) {
    config["proxies"].forEach(proxy => {
      if (!proxy || !proxy.name) return;

      const oldName = proxy.name;
      const newName = fixEmojiText(oldName);

      if (oldName !== newName) {
        renameMap[oldName] = newName;
        proxy.name = newName;
      }
    });
  }

  // 修复策略组名称
  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (!group || !group.name) return;

      const oldName = group.name;
      const newName = fixEmojiText(oldName);

      if (oldName !== newName) {
        renameMap[oldName] = newName;
        group.name = newName;
      }
    });
  }

  function fixRef(name) {
    if (typeof name !== "string") return name;
    return renameMap[name] || fixEmojiText(name);
  }

  // 修复策略组里的 proxies 引用
  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (Array.isArray(group.proxies)) {
        group.proxies = group.proxies.map(item => fixRef(item));
      }
    });
  }

  // 修复规则里的策略组引用
  if (Array.isArray(config["rules"])) {
    config["rules"] = config["rules"].map(rule => {
      if (typeof rule !== "string") return rule;

      const parts = rule.split(",");
      if (parts.length < 2) return rule;

      let policyIndex = parts.length - 1;

      // 处理 no-resolve，例如 GEOIP,CN,DIRECT,no-resolve
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
