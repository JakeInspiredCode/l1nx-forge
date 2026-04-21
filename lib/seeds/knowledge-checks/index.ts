import type { MCQuestion } from "@/lib/types/campaign";
import { MISSION_01_QUESTIONS } from "./mission-01";
import { MISSION_02_QUESTIONS } from "./mission-02";
import { MISSION_03_QUESTIONS } from "./mission-03";
import { MISSION_04_QUESTIONS } from "./mission-04";
import { MISSION_05_QUESTIONS } from "./mission-05";
import { MISSION_06_QUESTIONS } from "./mission-06";
import { MISSION_07_QUESTIONS } from "./mission-07";
import { MISSION_08_QUESTIONS } from "./mission-08";
import { MISSION_09_QUESTIONS } from "./mission-09";
import { MISSION_10_QUESTIONS } from "./mission-10";
import { MISSION_11_QUESTIONS } from "./mission-11";
import { MISSION_12_QUESTIONS } from "./mission-12";
import { HW_M01_QUESTIONS } from "./hw-m01";
import { HW_M02_QUESTIONS } from "./hw-m02";
import { HW_M03_QUESTIONS } from "./hw-m03";
import { HW_M04_QUESTIONS } from "./hw-m04";
import { NET_M01_QUESTIONS } from "./net-m01";
import { NET_M02_QUESTIONS } from "./net-m02";
import { NET_M03_QUESTIONS } from "./net-m03";
import { NET_M04_QUESTIONS } from "./net-m04";
import { OPS_M01_QUESTIONS } from "./ops-m01";
import { OPS_M02_QUESTIONS } from "./ops-m02";
import { OPS_M03_QUESTIONS } from "./ops-m03";
import { OPS_M04_QUESTIONS } from "./ops-m04";
import { PWR_M01_QUESTIONS } from "./pwr-m01";
import { PWR_M02_QUESTIONS } from "./pwr-m02";
import { PWR_M03_QUESTIONS } from "./pwr-m03";
import { PWR_M04_QUESTIONS } from "./pwr-m04";

const QUESTION_BANK: Record<string, MCQuestion[]> = {
  "linux-m01": MISSION_01_QUESTIONS,
  "linux-m02": MISSION_02_QUESTIONS,
  "linux-m03": MISSION_03_QUESTIONS,
  "linux-m04": MISSION_04_QUESTIONS,
  "linux-m05": MISSION_05_QUESTIONS,
  "linux-m06": MISSION_06_QUESTIONS,
  "linux-m07": MISSION_07_QUESTIONS,
  "linux-m08": MISSION_08_QUESTIONS,
  "linux-m09": MISSION_09_QUESTIONS,
  "linux-m10": MISSION_10_QUESTIONS,
  "linux-m11": MISSION_11_QUESTIONS,
  "linux-m12": MISSION_12_QUESTIONS,
  "hw-m01": HW_M01_QUESTIONS,
  "hw-m02": HW_M02_QUESTIONS,
  "hw-m03": HW_M03_QUESTIONS,
  "hw-m04": HW_M04_QUESTIONS,
  "net-m01": NET_M01_QUESTIONS,
  "net-m02": NET_M02_QUESTIONS,
  "net-m03": NET_M03_QUESTIONS,
  "net-m04": NET_M04_QUESTIONS,
  "ops-m01": OPS_M01_QUESTIONS,
  "ops-m02": OPS_M02_QUESTIONS,
  "ops-m03": OPS_M03_QUESTIONS,
  "ops-m04": OPS_M04_QUESTIONS,
  "pwr-m01": PWR_M01_QUESTIONS,
  "pwr-m02": PWR_M02_QUESTIONS,
  "pwr-m03": PWR_M03_QUESTIONS,
  "pwr-m04": PWR_M04_QUESTIONS,
};

export function getMCQuestions(missionId: string): MCQuestion[] | null {
  return QUESTION_BANK[missionId] ?? null;
}

export function hasMCQuestions(missionId: string): boolean {
  return missionId in QUESTION_BANK;
}
