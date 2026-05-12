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

  return config;
}
