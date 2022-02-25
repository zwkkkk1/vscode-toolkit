import axios from "axios";
import { I18N_URL } from 'utils/constants';

// 分页加载项目列表
export async function getProjectPaging(): Promise<{ data: any[], total: number }> {
  const data = await axios.get(`${I18N_URL}/api/project/paging`);
  return data.data.data;
}

// 分页加载项目列表
export async function getProjectByPid(pid: string) {
  const data = await axios.get(`${I18N_URL}/api/project/${pid}`);
  return data.data.data;
}

export async function getMessagesByPid(pid: string) {
  const data = await axios.get(`${I18N_URL}/api/translation/paging/${pid}?pageSize=100000`);

  return data.data.data;
}