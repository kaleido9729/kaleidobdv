import axios from "axios";
import { getApiUrl } from "@/config/env";

/**
 * 设备实时数据结构
 */
export interface MachineRealTimeData {
    id: number;
    label: string; // 设备编号
    type: string;  // 设备型号
    dj: number;    // 当前刀具
    yxcx: string;  // 运行程序
    runTime: number;              // 运行时长(毫秒)
    failureShutdownTime: number;  // 故障停机时长(毫秒)
    planShutdownTime: number;     // 计划停机时长(毫秒)
    offlineTime: number;          // 离线时长(毫秒)
    alarmTime: number;            // 告警时长(毫秒)
    cncStatusRecords: any[];      // CNC状态记录
}

export interface MachineRealTimeResponse {
    data: MachineRealTimeData;
    meta: {
        code: number;
        message: string;
    };
}

/**
 * 设备时间记录结构
 */
export interface MachineTimeRecord {
    deviceKey: {
        integerId: number;
    };
    endDate: number;
    key: {
        longId: number;
    };
    remark: string;
    runType: number;
    shutdownDescription: string;
    shutdownType: number; // 0: 计划停机, 1: 故障停机
    startDate: number;
    status: number; // 0: 停机, 2: 运行
}

/**
 * 设备查询数据结构
 */
export interface MachineDetailData {
    id: number;
    label: string;
    type: string;
    zgjs: number;
    pjsbsyl: number;
    sbsjkdl: number;
    cxjgsjzb: number;
    pjwgzsj: number;
    gzpjxfsj: number;
    sbxnkdl: number;
    zdjgsjzb: number;
    alarm: any[];
    tjsj: MachineTimeRecord[];
}

export interface MachineDetailResponse {
    data: MachineDetailData;
    meta: {
        code: number;
        message: string;
    };
}

/**
 * 获取设备实时数据
 * @param label 设备编号
 */
export function machineRealTimeValue(label: string) {
    return axios.post<MachineRealTimeResponse>(
        getApiUrl(`/data-by-device/${label}/real-time`)
    );
}

/**
 * 获取设备区间查询数据
 * @param device_label 设备编号，
 * @param start_date 开始时间
 * @param end_date 结束时间
 */
export function machineDetailValue(device_label: string, start_date: number, end_date: number) {
    return axios.post<MachineDetailResponse>(getApiUrl("/data-by-device"), {
        device_label,
        start_date,
        end_date
    });
}


