# 简历生成技能 (Resume Generator Skill)

## 描述
根据DAVID_ZHANG_MASTER_PROFILE.md母版文件，针对特定职位要求生成优化的中英文简历。自动处理格式设计、内容优化和文件保存。

## 使用场景
当用户需要针对特定职位（特别是HSBC IWPB Data & Analytics等金融科技职位）生成定制化简历时使用此技能。

## 技能参数
- **职位要求**: 用户提供的职位描述和要求
- **母版更新**: 可选，如果需要更新母版信息
- **输出格式**: HTML（中英文）+ 文本版本
- **保存位置**: `C:\Users\78724\Documents\AI简历\` 下的子文件夹

## 工作流程
1. 检查母版文件是否存在
2. 询问是否需要更新母版（如需更新则打开文件让用户手动编辑）
3. 读取职位要求
4. 分析职位关键要求
5. 根据母版和职位要求生成优化的简历
6. 创建输出文件夹并保存所有文件
7. 打开生成的简历供用户查看

## 生成的文件
1. **HTML简历**（中英文各一份）:
   - 专业设计，HSBC品牌风格
   - 包含完整工作经历和项目经历
   - 响应式布局，适合打印
2. **文本简历**（中英文各一份）:
   - 纯文本格式，适合复制粘贴
   - 简洁版内容
3. **批处理文件**:
   - 一键打开所有简历文件

## 技术特点
- 自动分析职位要求并匹配技能
- 使用量化成就展示实际成果
- 针对金融科技职位优化内容
- 保持中英文版本一致性
- 合理的视觉层次和章节划分

## 示例调用
```
/resume-generator "We are currently seeking an experienced professional to join our team. In this role, you will focus on using Data & Analytics to drive business activities..."
```

## 依赖
- 母版文件: `C:\Users\78724\Documents\AI简历\DAVID_ZHANG_MASTER_PROFILE.md`
- 头像文件: `C:\Users\78724\Pictures\Mypic.jpg`

## 输出位置
`C:\Users\78724\Documents\AI简历\GENERATED_[日期时间]_\` 或用户指定的文件夹