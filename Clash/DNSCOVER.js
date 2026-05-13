function main(config) {
  // 先保存原代理组图标
  const groupIcons = {};

  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (group.name && group.icon) {
        groupIcons[group.name] = group.icon;
      }
    });
  }

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

  // 只覆写 DNS
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:53",
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

  // 把原来的图标补回去
  if (Array.isArray(config["proxy-groups"])) {
    config["proxy-groups"].forEach(group => {
      if (group.name && groupIcons[group.name]) {
        group.icon = groupIcons[group.name];
      }
    });
  }
  if (Array.isArray(config.proxies)) {
    config.proxies.forEach(proxy => {
      if (proxy.type === "anytls") {
        // 订阅转换器有时会输出 fingerprint，mihomo 更标准的是 client-fingerprint
        if (proxy.fingerprint && !proxy["client-fingerprint"]) {
          proxy["client-fingerprint"] = proxy.fingerprint;
        }

        // 删除非标准/兼容性较差的字段，避免 mihomo 解析歧义
        delete proxy.fingerprint;

        // 补充 AnyTLS 空闲会话默认参数；不写一般也行，写上更接近官方示例
        if (proxy["idle-session-check-interval"] === undefined) {
          proxy["idle-session-check-interval"] = 30;
        }
        if (proxy["idle-session-timeout"] === undefined) {
          proxy["idle-session-timeout"] = 30;
        }
        if (proxy["min-idle-session"] === undefined) {
          proxy["min-idle-session"] = 0;
        }

        // UDP 开启
        proxy.udp = true;
      }
    });
  }
  return config;
}
