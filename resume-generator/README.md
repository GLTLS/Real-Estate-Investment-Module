# 简历生成技能 (Resume Generator Skill)

## 简介
这是一个OpenClaw技能，用于根据母版文件(`DAVID_ZHANG_MASTER_PROFILE.md`)和职位要求自动生成优化的中英文简历。

## 功能特点
- 📝 根据母版文件自动生成简历
- 🎯 针对特定职位要求进行优化
- 🌐 生成中英文双语版本
- 🎨 专业设计的HTML格式
- 📄 同时生成文本格式
- 📁 自动组织输出文件
- 🚀 一键打开所有生成文件

## 文件结构
```
resume-generator/
├── SKILL.md              # 技能描述文件
├── index.js              # 主入口文件
├── README.md             # 使用说明
├── scripts/
│   └── generate_resume.js # 简历生成逻辑
├── templates/
│   ├── english_template.html  # 英文简历模板
│   └── chinese_template.html  # 中文简历模板
└── references/
    └── example_output/   # 示例输出
```

## 使用方法

### 1. 基本使用
```
/resume-generator "职位描述和要求文本"
```

### 2. 指定输出文件夹
```
/resume-generator "职位描述" --output-folder "我的简历"
```

### 3. 更新母版后生成
```
/resume-generator "职位描述" --update-master
```

### 4. 完整参数
```
/resume-generator "职位描述" --output-folder "自定义文件夹" --update-master
```

## 工作流程

### 步骤1: 检查母版文件
技能首先检查母版文件是否存在：
- 位置: `C:\Users\78724\Documents\AI简历\DAVID_ZHANG_MASTER_PROFILE.md`
- 如果不存在，会创建空白模板

### 步骤2: 询问母版更新
如果指定`--update-master`参数，会：
1. 打开母版文件供编辑
2. 等待用户完成编辑
3. 用户回复"继续"后继续生成

### 步骤3: 分析职位要求
技能分析提供的职位描述，提取：
- 关键要求
- 所需技能
- 经验年限
- 优先认证
- 行业和职位级别

### 步骤4: 生成简历文件
生成以下文件：
1. **DAVID_ZHANG_RESUME_EN.html** - 英文HTML简历
2. **DAVID_ZHANG_RESUME_CN.html** - 中文HTML简历
3. **DAVID_ZHANG_RESUME_EN.txt** - 英文文本简历
4. **DAVID_ZHANG_RESUME_CN.txt** - 中文文本简历
5. **open_resumes.bat** - 一键打开批处理文件

### 步骤5: 保存和打开
- 保存到: `C:\Users\78724\Documents\AI简历\[输出文件夹]\`
- 自动打开所有生成的文件

## 母版文件格式
母版文件应为Markdown格式，包含以下部分：

```markdown
# DAVID ZHANG 个人信息母版

## 基本信息
- **姓名**: DAVID ZHANG
- **电话**: 18665720891
- **邮箱**: 787248611@qq.com
- **现居地**: 广州

## 教育背景
- 金融学硕士，巴黎第一大学，2015年

## 工作经历
### HSBC | 集团职能技术部门
**顾问专家/分析主管** | 2025年5月 - 至今
- 负责人事系统和财务系统报表开发
- 管理DISCOVER、PIONEER、CLARITY平台

## 项目经历
### HSBC DISCOVER HR分析平台升级
**分析负责人** | 2025年6月 - 至今
- 领导平台全面升级，使用QlikSense和Power BI
- 实现实时数据管道，响应时间缩短50%

## 专业技能
### 技术技能
- Python (Pandas, NumPy, Scikit-learn)
- SQL (MySQL, MSSQL, BigQuery)
- QlikSense/QlikView

### 业务技能
- 投资与财富管理
- 风险管理与合规
- 金融建模与分析

## 证书与资质
- CFA持证人 (2025年)
- GCP专业云架构师 (2025年)
- 国际金融理财师 (2022年)
```

## 输出文件说明

### HTML简历特点
- HSBC品牌风格设计（红色主题）
- 响应式布局，适合打印
- 清晰的视觉层次
- 重点内容突出显示
- 量化成就展示
- 技术栈标签
- 职位匹配说明

### 文本简历特点
- 简洁格式，适合复制粘贴
- 纯文本，无格式
- 关键信息突出
- 适合申请系统直接粘贴

### 批处理文件
- 一键打开所有生成文件
- 显示文件位置信息
- 方便快速查看

## 示例

### 输入职位描述
```
We are currently seeking a Data & Analytics professional with:
- 6+ years experience in data analytics
- Proficiency in Python, SQL, and Power BI
- Experience in investment and wealth management
- CFA or related certifications preferred
- English communication skills for global teams
```

### 生成的简历会
1. 突出显示6年以上数据分析经验
2. 强调Python、SQL、Power BI技能
3. 展示投资和财富管理经验
4. 突出CFA认证
5. 强调英语沟通能力
6. 针对金融科技行业优化内容

## 配置

### 文件路径配置
在`index.js`中可配置：
```javascript
const CONFIG = {
  masterProfile: 'C:\\Users\\78724\\Documents\\AI简历\\DAVID_ZHANG_MASTER_PROFILE.md',
  photoPath: 'C:\\Users\\78724\\Pictures\\Mypic.jpg',
  baseOutputDir: 'C:\\Users\\78724\\Documents\\AI简历'
};
```

### 模板定制
可修改`templates/`目录下的HTML模板：
- `english_template.html` - 英文模板
- `chinese_template.html` - 中文模板

## 故障排除

### 常见问题
1. **母版文件不存在**
   - 技能会自动创建空白模板
   - 需要用户编辑后重新生成

2. **头像文件不存在**
   - 会显示警告但继续生成
   - 简历中头像位置会显示占位符

3. **职位描述不明确**
   - 技能会使用通用优化
   - 建议提供详细的职位描述

4. **文件无法打开**
   - 检查文件路径权限
   - 手动打开输出文件夹

### 调试
查看OpenClaw日志获取详细错误信息。

## 更新日志

### v1.0.0 (2026-04-08)
- 初始版本发布
- 基本简历生成功能
- 中英文双语支持
- HTML和文本格式
- 职位要求分析
- 一键打开功能

## 技术支持
如有问题，请检查：
1. 文件路径是否正确
2. 母版文件格式是否正确
3. 职位描述是否明确
4. 系统权限是否足够

## 未来计划
- [ ] 支持更多模板样式
- [ ] 添加PDF导出功能
- [ ] 支持自定义技能关键词
- [ ] 添加简历评分功能
- [ ] 支持批量生成
- [ ] 添加AI优化建议