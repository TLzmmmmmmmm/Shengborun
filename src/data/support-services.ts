export type SupportServiceId =
  | 'solution-design'
  | 'project-implementation'
  | 'delivery-training';

export interface SupportService {
  id: SupportServiceId;
  name: string;
  href: string;
  summary: string;
  body: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

export const supportServices: readonly SupportService[] = [
  {
    id: 'solution-design',
    name: '方案设计',
    href: '/support/#solution-design',
    summary: '预约客户交流，确认客户实际需求，提供客户认可的解决方案',
    body: '方案设计是通信网络功能与投资决策的重要参考，也是确保系统成功部署的重要前提。北京盛博润在充分了解客户需求的基础上，结合新技术趋势、行业应用及专业通信实践，围绕覆盖范围、信号质量、系统容量和资源投入提供网络规划方案，满足高效、敏捷、易维护的通信网络建设需求。',
    image: '/images/support/solution-design.png',
    imageAlt: '蓝色地球图标，代表通信方案设计',
    imageWidth: 1456,
    imageHeight: 1080,
  },
  {
    id: 'project-implementation',
    name: '项目实施',
    href: '/support/#project-implementation',
    summary: '完成入场准备、现场勘测、频率备案、安装施工、系统调试工作',
    body: '项目实施阶段，北京盛博润依托多年系统工程建设风险控制经验，由专业工程人员按照施工技术规范和项目管理标准，完成通信设备及集成配套设施的现场勘测、频率备案、施工部署和系统调试，满足客户快速构筑高质量、定制化通信网络的建设需求。',
    image: '/images/support/project-implementation.png',
    imageAlt: '蓝色齿轮和扳手图标，代表通信项目施工',
    imageWidth: 1448,
    imageHeight: 1086,
  },
  {
    id: 'delivery-training',
    name: '交付培训',
    href: '/support/#delivery-training',
    summary: '完成项目整体交付、使用培训、维护培训工作',
    body: '交付培训阶段，公司将项目软硬件及图纸、设计方案、产品说明书、产品合格证等资料完整交付给客户指定人员，并根据客户要求，对使用和维护人员开展系统使用、后期维护及扩容升级注意事项培训，完成项目收尾工作。',
    image: '/images/support/delivery-training.png',
    imageAlt: '蓝色学士帽图标，代表项目交付与培训',
    imageWidth: 1441,
    imageHeight: 1091,
  },
] as const;
