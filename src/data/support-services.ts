export interface SupportService {
  id: string;
  name: string;
  href: string;
}

export const supportServices: readonly SupportService[] = [
  { id: 'network-planning', name: '网络规划服务', href: '/support/network-planning/' },
  { id: 'system-engineering', name: '系统工程建设服务', href: '/support/system-engineering/' },
  { id: 'maintenance-support', name: '维护保障服务', href: '/support/maintenance-support/' },
  { id: 'equipment-inspection', name: '设备巡检服务', href: '/support/equipment-inspection/' },
  { id: 'communication-support', name: '通讯保障服务', href: '/support/communication-support/' },
  { id: 'technical-training', name: '技术培训服务', href: '/support/technical-training/' },
];
