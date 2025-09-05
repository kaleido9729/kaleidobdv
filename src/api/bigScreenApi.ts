import axios from "axios";
import { getApiUrl } from "@/config/env";

/**
 * 车间数据接口返回的数据结构
 */
export interface WorkshopData {
    offline: number;
    alarm: number;
    run: number;
    id: string;
    label: string;
    shutdown: number;
  }
  
  /**
   * 车间数据API响应结构
   */
  export interface WorkshopResponse {
    data: WorkshopData[];
    meta: {
      code: number;
      message: string;
    };
  }
  
  /**
   * 获取车间实时数据
   * @returns 车间数据响应
   */
  export function bigScreenRealTimeValue() {
    return axios.post<WorkshopResponse>(getApiUrl("/workshop"));
  }