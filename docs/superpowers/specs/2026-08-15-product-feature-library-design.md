# 产品 Feature 图标库补全设计

## 目标

补全所有已发布产品 `keyFeatures` 引用但尚未登记的 62 个名称，使内容引用校验通过，并确保产品详情页能够为每项 Feature 解析出有效图标。

## 范围

- 仅修改 `src/content/product-features/features.json`。
- 保留所有产品 JSON 中现有的 `keyFeatures` 文案和顺序。
- 不新增图标组件，不修改产品页面布局。
- 仅使用 `src/lib/product-features.ts` 已允许的 20 个图标标识。

## 映射原则

- 安全、防护、可靠性：`shield-check`
- 认证、国产化、自主可控：`badge-check`
- 管理、配置、策略、定制：`sliders`
- 网络协议、室内外连接：`globe`
- 无线信号、频率、新无线标准：`signal`
- 自组网与远距离无线覆盖：`radio-tower`
- 多模、多网、多路和兼容能力：`layers`
- 模块、网关、交换机与部署结构：`blocks`
- 显示、监控、分析和图传：`monitor`
- 语音与音质：`volume`
- 轻薄便携：`feather` 或 `backpack`
- 供电与功率：`battery` 或 `zap`

## 具体映射

- `shield-check`：安全传输、安全日志、安全上网、安全邮件、本安设计、病毒防护、防爆机型、黑白名单、坚固耐用、网络安全、性能可靠
- `badge-check`：满足军标、信创、自主可控、ATEX认证
- `sliders`：负载均衡、集中管理、可定制、配置管理、支持定制、自主策略、AC管理
- `globe`：室内室外、室外使用、IPV6
- `signal`：空中编程、频率定制、WIFI7
- `radio-tower`：机载自组网、宽带自组网、窄带自组网
- `layers`：多模终端、多网融合、公专融合、内核升级、数模兼容、支持多路
- `blocks`：部署方便、工业交换机、集成网关、模块设计、网管交换机、项目定制
- `monitor`：彩色屏幕、流量监控、数据分析、无线图传
- `volume`：音质清晰、语音清晰
- `feather`：超薄设计、机身轻薄、设备轻薄
- `backpack`：便携台、便携指挥
- `bell`：倒地报警
- `hand`：简单易用、手持自组网
- `scan-line`：故障诊断
- `zap`：功率定制、快速部署、POE供电
- `battery`：Type-C充电

## 验证

1. 修改前运行内容引用校验，确认因缺失 Feature 失败。
2. 补全配置后再次运行，必须输出 `Content references are valid.`。
3. 运行 Astro 检查，要求 0 错误。
4. 检查 Feature 库中无重复名称，且每个图标值均属于允许枚举。

## 不包含

- 不合并“语音清晰/音质清晰”等近义词。
- 不删除或重写产品 Feature 文案。
- 不解决与 Feature 引用无关的产品内容问题。
