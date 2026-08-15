export interface SupportService {
  id: string;
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
    summary: '预约客户交流，确认客户实际需求，提供客户认可的解决方案。',
    body: '方案设计是客户对通信网络功能及投资决策的重要参考，也是确保系统成功部署的重要前提。北京盛博润通信设备有限公司基于对新技术趋势发展的分析和对行业应用的理解，运用多方面专业通信理论及实践，在充分了解客户实际需求的基础上，为客户提供其网络建设所需的覆盖范围、信号质量、系统容量、资源投入等在内的网络规划方案。以满足客户通信网络的高效、敏捷、易维护的设计和建设需求。',
    image: '/images/support/solution-design.png',
    imageAlt: '蓝色地球图标，代表通信方案设计',
    imageWidth: 1456,
    imageHeight: 1080,
  },
  {
    id: 'delivery-training',
    name: '交付培训',
    href: '/support/#delivery-training',
    summary: '完成项目整体交付、使用培训、维护培训工作。',
    body: '交付培训阶段我公司要将包括该项目的软件和硬件以及相关的图纸、设计方案、产品说明书、产品合格证等完整交付给客户指定的人员。并针对客户的使用人员和后期维护人员，进行包括通信系统的使用、后期维护以及将来可能的扩容和升级注意事项按照客户要求组织统一培训。完成通信系统整个项目的收尾工作。',
    image: '/images/support/delivery-training.png',
    imageAlt: '蓝色学士帽图标，代表项目交付与培训',
    imageWidth: 1441,
    imageHeight: 1091,
  },
  {
    id: 'project-implementation',
    name: '项目施工',
    href: '/support/#project-implementation',
    summary: '完成入场准备、现场勘测、频率备案、安装施工、系统调试工作。',
    body: '项目施工建设阶段，是北京盛博润通信设备有限公司基于多年来的系统工程建设风险控制经验，数百个工程建设风险控制案例积累基础上，由专业工程建设人员按照施工技术规范要求及项目管理标准，将提供的通信设备及集成配套设施，完成从现场勘测、频率备案、施工部署、系统调试的一体化工程作业。满足客户快速构筑高质量通信网络及定制化的建设要求。',
    image: '/images/support/project-implementation.png',
    imageAlt: '蓝色齿轮和扳手图标，代表通信项目施工',
    imageWidth: 1448,
    imageHeight: 1086,
  },
] as const;
