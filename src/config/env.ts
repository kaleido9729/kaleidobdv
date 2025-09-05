// 环境配置
export const API_CONFIG = {
  // 测试环境
  test: {
    baseURL: 'http://localhost:8443',
    // baseURL: 'https://10.10.101.184:8443/jiermw-webapi',
    // baseURL: 'http://10.31.7.112:8443/jiermw-webapi',
    // baseURL: 'http://10.31.7.126:8080/jiermw_webapi_node_war_exploded',
    apiPrefix: '/api/v1/dataease'
  },
  // 正式环境
  prod: {
    baseURL: 'https://192.9.102.156:8443/jiermw-webapi',
    apiPrefix: '/api/v1/dataease'
  }
};


export const CURRENT_ENV: 'test' | 'prod' = 'test';

// 获取当前配置
export const getCurrentConfig = () => {
  return API_CONFIG[CURRENT_ENV];
};

// 构建API URL
export const getApiUrl = (endpoint: string) => {
  const config = getCurrentConfig();
  return `${config.baseURL}${config.apiPrefix}${endpoint}`;
};