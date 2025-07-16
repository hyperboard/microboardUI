import { api } from "../base/base";
import { GenerateChartBody, GenerateChartResponse } from "./types";

export function generateChart(body: GenerateChartBody) {
  return api.post<GenerateChartResponse>("/ai/generate", body);
}
