import axios from "axios";
import { getApiUrl } from "@/config/env";

/**
 * 车间数据接口返回的数据结构 (实时数据)
 */
export interface WorkshopData {
        id: number;
        label: string;
        run: number;
        alarm: number;
        shutdown: number;
        offline: number;
        devices: [
            {
                id: number;
                label: string;
                type: number;
                status: number;
                runTime: number;
            }
        ];
  }

/**
 * 时间记录数据结构
 */
export interface TimeRecord {
    startDate: number;
    endDate: number;
    status: number; // 0: 停机, 2: 运行
    runType: number;
    shutdownType: number; // 0: 计划停机, 1: 故障停机
    shutdownDescription: string;
}

/**
 * 设备详细信息结构
 */
export interface DeviceDetail {
    id: number;
    label: string;
    type: string; // 设备型号，如 "XH751OH2"
    zgjs: number; // 总工作时间
    pjsbsyl: number; // 平均设备利用率
    sbsjkdl: number; // 设备实际开动率
    cxjgsjzb: number; // 持续加工时间占比
    pjwgzsj: number; // 平均无故障时间
    gzpjxfsj: number; // 故障平均修复时间
    sbxnkdl: number; // 设备性能开动率
    zdjgsjzb: number; // 最大加工时间占比
    tjsj: TimeRecord[]; // 时间记录数组
    alarm: any[]; // 报警信息数组
}

/**
 * 车间详细数据接口返回的数据结构 (查询数据)
 */
export interface WorkshopDetailData {
    id: string; // 19位字符串ID
    label: string; // 车间标签，如 "C1"
    devices: DeviceDetail[];
}

/**
 * 车间数据API响应结构 (实时数据)
 */
export interface WorkshopRealTimeResponse {
    data: WorkshopData[];
    meta: {
      code: number;
      message: string;
    };
}

/**
 * 车间详细数据API响应结构 (查询数据)
 */
export interface WorkshopDetailResponse {
    data: WorkshopDetailData;
    meta: {
        code: number;
        message: string;
    };
}


/**
 * 获取车间实时数据d
 * @returns 车间数据响应d
 */
export function workshopRealTimeValue(label: string) {
    return axios.post<WorkshopRealTimeResponse>(
        getApiUrl("/data-by-workshop/" + label + "/real-time"),

    );
}


/**
 * 获取车间查询数据
 * @returns 车间详细数据响应
 */
export function workshopDetailValue(label: string, start_date: number, end_date: number) {
    return axios.post<WorkshopDetailResponse>(getApiUrl("/data-by-workshop"),{
        workshop_label: label,
        start_date: start_date,
        end_date: end_date
    });
}