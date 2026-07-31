# 七彩云南环线 · 旅行助手

8 天七彩云南环线旅行规划网站，包含 **路书**、**物资准备清单**、**滇味食志**、**特产文创**、**沿途天气** 与 **海拔变化** 六个模块。参考 [Qinghai_Tibet_Tourism](https://github.com/MiChuan/Qinghai_Tibet_Tourism) 项目实现。

> 📅 2026年8月 · 👥 2人 · 🚄 高铁+包车 · ⛰️ 海拔 1100–4506m

## 在线访问

部署完成后访问：**https://michuan.github.io/yunnan-travel/**

## 功能模块

### 1. 路书

- 8 天全程时间线概览
- 逐日详情：途经站点、当日说明、注意事项
- 外链：[圆周旅迹](https://www.pitravel.cn/plan/journey/7668551492992381645) · [高德地图路书](https://ditu.amap.com/plan/6a6c2c457610010f4cb11348)
- 支持 `#dayN` 锚点直达某一天

### 2. 物资准备清单

- 7 大类 43 项装备 Todo 清单（证件、衣物、防晒防雨、高原防护、药品、电子设备、日用洗漱）
- 勾选进度条与统计（总数 / 已准备 / 完成度 / 核心物品）
- 勾选状态保存在浏览器 `localStorage`，刷新不丢失
- 支持展开/收起、重置、打印

### 3. 滇味食志

- 昆明、大理、丽江、泸沽湖四个美食板块，共 19 道代表菜
- 每个板块带图片展示与地区跳转入口
- 点击可快速进入对应地区美食内容

### 4. 特产文创

- 昆明、大理、丽江、泸沽湖四地的**特色物产**与**文创好物**合集，共 27 件精选
- 每个地区分「特色物产」与「文创好物」两类，物品卡片带图片、简介与标签
- 左侧地区导航 + 地区速览卡片，支持 `#地区` 锚点直达
- 右下角浮动「返回顶部 / 返回首页」快捷按钮

### 5. 沿途天气

- 11 个途经地区实时天气与未来 7 天预报
- 展示温度、体感、湿度、风速、风向及降水概率
- 数据来自 [Open-Meteo](https://open-meteo.com/)，无需 API Key
- 左侧地区导航 + 一键刷新

### 6. 海拔变化

- 全程 14 个关键节点海拔折线图（基于 Chart.js）
- 海拔风险三级分级：安全（＜3000m）、注意（3000–4000m）、高反风险（＞4000m）
- 统计卡片展示最高/最低海拔与高反风险路段数
- 途经点详情列表，点击可高亮图表对应数据点
- 响应式布局，支持打印

## 项目结构

```
├── index.html              # 首页（模块入口）
├── routebook.html          # 路书页面
├── checklist.html          # 物资清单页面
├── food.html               # 滇味食志页面
├── specialty.html          # 特产文创页面
├── weather.html            # 沿途天气页面
├── elevation.html          # 海拔变化页面
├── serve.ps1               # Windows 本地预览脚本（无需 Node/Python）
├── css/style.css           # 统一样式
├── js/
│   ├── routebook.js        # 路书交互逻辑
│   ├── checklist.js        # 清单交互 + 本地存储
│   ├── food.js             # 食志/特产地区导航 + 浮动按钮
│   ├── floatnav.js         # 通用「返回顶部/首页」浮动按钮
│   ├── weather.js          # 天气数据加载与展示
│   └── elevation.js        # 海拔折线图（Chart.js）
├── data/
│   ├── itinerary.json      # 行程数据
│   ├── checklist.json      # 清单数据
│   ├── weather-locations.json  # 天气地区坐标配置
│   └── elevation.json      # 海拔变化节点数据
├── .github/workflows/pages.yml  # GitHub Pages 自动部署
└── .gitlab-ci.yml          # GitLab Pages 自动部署（镜像仓库用）
```

## 本地预览

无需构建步骤，但**需要通过 HTTP 访问**（天气模块需加载 JSON 与外部 API，不能直接双击 HTML 打开）。

```bash
# Node.js
npx serve . -l 3000

# Python
python -m http.server 3000

# Windows PowerShell（无需安装 Node/Python）
powershell -ExecutionPolicy Bypass -File serve.ps1
```

然后访问 `http://localhost:3000`（或 `serve.ps1` 默认的 `8080` 端口）。

## 部署

### GitHub Pages（本仓库）

1. 打开仓库 **Settings → Pages**，**Build and deployment → Source** 选择 **GitHub Actions**
2. 推送到 `main` 分支后，`.github/workflows/pages.yml` 会自动将站点发布到 GitHub Pages（默认为 https://michuan.github.io/yunnan-travel/ ）

| 问题 | 原因 | 处理 |
|------|------|------|
| 流水线未触发 | 未推送到 `main` 分支 | 合并/推送到 `main` |
| Setup Pages 报 Not Found | 仓库未启用 Pages | Settings → Pages → Source 选 GitHub Actions 后重跑 workflow |
| 页面 404 | 首次部署仍在构建 | 等 1–2 分钟后刷新 |
| 样式/数据加载失败 | 使用了绝对路径 | 本项目均为相对路径，检查是否改动 |

### GitLab Pages（镜像仓库）

推送到 `main` 分支后，`.gitlab-ci.yml` 中的 `pages` 任务会自动将站点发布到 GitLab Pages，地址见 **Deploy → Pages**。

## 数据维护

- 修改行程：编辑 `data/itinerary.json`（同时可更新 `路书.txt` 作为备份）
- 修改清单：编辑 `data/checklist.json`
- 修改天气地区：编辑 `data/weather-locations.json`（调整名称、坐标、海拔、备注）
- 修改海拔节点：编辑 `data/elevation.json`（调整名称、海拔、天数、备注）

## 路线概览

| 天数 | 路线 |
|------|------|
| Day 1 | 六枝南站 → 昆明（傣勐焕、斗南花市、云南民族大观园） |
| Day 2 | 昆明市区（云南省博物馆、官渡古镇、滇池海埂公园、海晏村日落） |
| Day 3 | 昆明 → 抚仙湖 一日游 |
| Day 4 | 昆明 → 大理（洱海公园、苍山地质公园、崇圣寺三塔、大理古城、喜洲古镇） |
| Day 5 | 双廊古镇 → 丽江（丽江古城、木府、束河古镇） |
| Day 6 | 白沙古镇 → 玉龙雪山 → 黑龙潭 → 观音峡 |
| Day 7 | 丽江 → 泸沽湖 一日游 |
| Day 8 | 丽江 → 贵阳 返程 |

## License

See [LICENSE](LICENSE).
