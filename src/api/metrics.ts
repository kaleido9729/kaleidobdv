import axios from "axios";
import { getApiUrl } from "@/config/env";

/**
 * 请求设备运行指标
 * @param device - 设备编号，例如 "C1"
 * @param start - 开始时间，格式 YYYY-MM-DD HH:mm:ss
 * @param end - 结束时间，格式 YYYY-MM-DD HH:mm:ss
 * @returns 响应数据
 */
export function fetchMetrics(integer_id: number, start_date: number, end_date: number) {
  return axios.post(getApiUrl("/cnc-status"), {
    key: { 
      integer_id
    },
    start_date,
    end_date
  });
}


