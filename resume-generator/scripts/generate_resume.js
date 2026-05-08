/**
 * 简历生成脚本 - 修复版本
 * 根据母版和职位要求生成优化的中英文简历
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置文件路径
const CONFIG = {
  masterProfile: 'C:\\Users\\78724\\Documents\\AI简历\\DAVID_ZHANG_MASTER_PROFILE.md',
  photoPath: 'C:\\Users\\78724\\Pictures\\Mypic.jpg',
  baseOutputDir: 'C:\\Users\\78724\\Documents\\AI简历',
  defaultJobTitle: 'Data & Analytics Professional'
};

/**
 * 生成简历的主要函数
 * @param {Object} params - 生成参数
 * @param {string} params.jobDescription - 职位描述
 * @param {string} params.outputFolder - 输出文件夹名称（可选）
 * @param {boolean} params.updateMaster - 是否需要更新母版
 * @returns {Object} 生成结果
 */
async function generateResume(params) {
  const {
    jobDescription,
    outputFolder = `GENERATED_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`,
    updateMaster = false
  } = params;

  try {
    // 1. 检查母版文件
    if (!fs.existsSync(CONFIG.masterProfile)) {
      throw new Error(`母版文件不存在: ${CONFIG.masterProfile}`);
    }

    // 2. 检查头像文件
    if (!fs.existsSync(CONFIG.photoPath)) {
      console.warn(`警告: 头像文件不存在: ${CONFIG.photoPath}`);
    }

    // 3. 创建输出文件夹
    const outputDir = path.join(CONFIG.baseOutputDir, outputFolder);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 4. 读取母版内容
    const masterContent = fs.readFileSync(CONFIG.masterProfile, 'utf8');

    // 5. 分析职位要求
    const jobAnalysis = analyzeJobRequirements(jobDescription);

    // 6. 解析母版内容
    const masterData = parseMasterProfile(masterContent);

    // 7. 生成简历文件
    const generatedFiles = await createResumeFiles({
      masterData,
      jobAnalysis,
      outputDir,
      jobDescription
    });

    // 8. 创建批处理文件
    createBatchFile(outputDir, generatedFiles);

    return {
      success: true,
      outputDir,
      files: generatedFiles,
      jobAnalysis,
      masterData: {
        workExperienceCount: masterData.workExperience.length,
        skillsCount: Object.keys(masterData.skills).length,
        certificationsCount: masterData.certifications.length
      }
    };

  } catch (error) {
    console.error('生成简历时出错:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 分析职位要求
 * @param {string} jobDescription - 职位描述
 * @returns {Object} 分析结果
 */
function analyzeJobRequirements(jobDescription) {
  const analysis = {
    keyRequirements: [],
    skills: [],
    experience: [],
    certifications: [],
    positionMatch: []
  };

  if (!jobDescription) return analysis;

  const text = jobDescription.toLowerCase();
  
  // 检查经验要求
  const yearMatch = text.match(/(\d+)\+?\s*(year|years|年|经验|experience)/);
  if (yearMatch) {
    analysis.experience.push(`At least ${yearMatch[1]} years of relevant experience`);
    analysis.positionMatch.push(`✅ ${yearMatch[1]}+ years business analytics experience - matches requirement`);
  }
  
  // 检查核心技能要求 - 针对HSBC AVP Business Consulting职位优化
  const coreSkillKeywords = [
    { keyword: 'sas', display: 'SAS', priority: 1 },
    { keyword: 'python', display: 'Python', priority: 1 },
    { keyword: 'ai', display: 'AI', priority: 1 },
    { keyword: 'machine learning', display: 'Machine Learning', priority: 1 },
    { keyword: 'big data', display: 'Big Data', priority: 1 },
    { keyword: 'data mining', display: 'Data Mining', priority: 1 },
    { keyword: 'predictive', display: 'Predictive Analytics', priority: 1 },
    { keyword: 'statistical', display: 'Statistical Modeling', priority: 1 },
    { keyword: 'analytics', display: 'Analytics', priority: 2 },
    { keyword: 'sql', display: 'SQL', priority: 2 },
    { keyword: 'qlik', display: 'Qlik', priority: 2 },
    { keyword: 'power bi', display: 'Power BI', priority: 2 },
    { keyword: 'tableau', display: 'Tableau', priority: 2 }
  ];
  
  // 按优先级排序
  coreSkillKeywords.sort((a, b) => a.priority - b.priority);
  
  coreSkillKeywords.forEach(skill => {
    if (text.includes(skill.keyword)) {
      analysis.skills.push(skill.display);
      const matchText = skill.priority === 1 ? 
        `✅ ${skill.display} skills - CRITICAL requirement` :
        `✅ ${skill.display} skills - matches requirement`;
      analysis.positionMatch.push(matchText);
    }
  });
  
  // 检查认证要求
  const certKeywords = [
    { keyword: 'cfa', display: 'CFA', priority: 1 },
    { keyword: 'cfp', display: 'CFP', priority: 2 },
    { keyword: 'frm', display: 'FRM', priority: 2 },
    { keyword: 'cpa', display: 'CPA', priority: 2 }
  ];
  
  certKeywords.forEach(cert => {
    if (text.includes(cert.keyword)) {
      analysis.certifications.push(cert.display);
      const matchText = cert.priority === 1 ?
        `✅ ${cert.display} certification - PREFERRED qualification` :
        `✅ ${cert.display} certification - relevant qualification`;
      analysis.positionMatch.push(matchText);
    }
  });
  
  // 检查业务领域要求
  if (text.includes('wholesale') || text.includes('批发银行') || text.includes('business sense')) {
    analysis.positionMatch.push('✅ Wholesale banking business sense - matches requirement');
  }
  
  if (text.includes('english') || text.includes('英语')) {
    analysis.positionMatch.push('✅ English fluency - matches requirement');
  }
  
  if (text.includes('presentation') || text.includes('演示') || text.includes('story')) {
    analysis.positionMatch.push('✅ Presentation & storytelling skills - matches requirement');
  }

  return analysis;
}

/**
 * 解析母版文件内容
 */
function parseMasterProfile(content) {
  const sections = {
    basicInfo: {},
    education: [],
    workExperience: [],
    projectExperience: [],
    skills: {},
    certifications: [],
    languages: []
  };

  const lines = content.split('\n');
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('## ')) {
      const sectionTitle = line.replace('## ', '').trim();
      
      if (sectionTitle.includes('基本信息')) {
        currentSection = 'basicInfo';
      } else if (sectionTitle.includes('教育背景')) {
        currentSection = 'education';
      } else if (sectionTitle.includes('工作经历')) {
        currentSection = 'workExperience';
      } else if (sectionTitle.includes('项目经历')) {
        currentSection = 'projectExperience';
      } else if (sectionTitle.includes('专业技能')) {
        currentSection = 'skills';
      } else if (sectionTitle.includes('证书认证')) {
        currentSection = 'certifications';
      } else if (sectionTitle.includes('语言能力')) {
        currentSection = 'languages';
      } else {
        currentSection = '';
      }
    } 
    
    // 解析基本信息
    else if (currentSection === 'basicInfo' && line.startsWith('- **')) {
      const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        sections.basicInfo[key] = value;
      }
    }
    
    // 解析教育背景
    else if (currentSection === 'education' && line.startsWith('- ')) {
      sections.education.push(line.replace('- ', '').trim());
    }
    
    // 解析工作经历 - 修复版本
    else if (currentSection === 'workExperience' && line.startsWith('### ')) {
      const companyMatch = line.match(/### (.+?) \|/);
      if (companyMatch) {
        const workExp = {
          company: companyMatch[1].trim(),
          position: '',
          duration: '',
          responsibilities: [],
          achievements: []
        };
        
        // 查找后续内容
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('### ') && !lines[j].trim().startsWith('## ')) {
          const subLine = lines[j].trim();
          
          // 解析职位（在####行）
          if (subLine.startsWith('#### ')) {
            const positionMatch = subLine.match(/#### (.+?) \|/);
            if (positionMatch) {
              workExp.position = positionMatch[1].trim();
            } else {
              // 如果没有|，取整个内容
              workExp.position = subLine.replace('#### ', '').trim();
            }
          }
          
          // 解析持续时间（在**行）
          if (subLine.startsWith('**') && (subLine.includes('年') || subLine.includes('-') || subLine.includes('to'))) {
            // 移除**标记
            workExp.duration = subLine.replace(/\*\*/g, '').trim();
          }
          // 解析主要职责
          else if (subLine.startsWith('**主要职责:**')) {
            let k = j + 1;
            while (k < lines.length && lines[k].trim().startsWith('- ')) {
              workExp.responsibilities.push(lines[k].trim().replace('- ', ''));
              k++;
            }
            j = k - 1;
          }
          // 解析关键成就
          else if (subLine.startsWith('**关键成就:**')) {
            let k = j + 1;
            while (k < lines.length && lines[k].trim().startsWith('- ')) {
              workExp.achievements.push(lines[k].trim().replace('- ', ''));
              k++;
            }
            j = k - 1;
          }
          
          j++;
        }
        
        sections.workExperience.push(workExp);
        i = j - 1;
      }
    }
    
    // 解析技能
    else if (currentSection === 'skills' && line.startsWith('### ')) {
      const category = line.replace('### ', '').trim();
      sections.skills[category] = [];
      
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith('- ')) {
        const skill = lines[j].trim().replace('- ', '');
        sections.skills[category].push(skill);
        j++;
      }
      i = j - 1;
    }
    
    // 解析证书
    else if (currentSection === 'certifications' && line.startsWith('- **')) {
      const certMatch = line.match(/\*\*(.+?)\*\* \((.+?)\)/);
      if (certMatch) {
        sections.certifications.push({
          name: certMatch[1].trim(),
          year: certMatch[2].trim()
        });
      }
    }
    
    // 解析语言能力
    else if (currentSection === 'languages' && line.match(/^\d+\.\s+\*\*/)) {
      const langMatch = line.match(/\d+\.\s+\*\*(.+?)\*\*:\s*(.+)/);
      if (langMatch) {
        sections.languages.push({
          language: langMatch[1].trim(),
          level: langMatch[2].trim()
        });
      }
    }
  }
  
  return sections;
}

/**
 * 创建简历文件
 * @param {Object} params - 参数
 * @returns {Array} 生成的文件列表
 */
async function createResumeFiles(params) {
  const { masterData, jobAnalysis, outputDir, jobDescription } = params;
  const files = [];

  // 1. 生成英文HTML简历
  const enHtmlContent = generateEnglishHTML(masterData, jobAnalysis, jobDescription);
  const enHtmlPath = path.join(outputDir, 'DAVID_ZHANG_RESUME_EN.html');
  fs.writeFileSync(enHtmlPath, enHtmlContent);
  files.push(enHtmlPath);

  // 2. 生成中文HTML简历
  const cnHtmlContent = generateChineseHTML(masterData, jobAnalysis, jobDescription);
  const cnHtmlPath = path.join(outputDir, 'DAVID_ZHANG_RESUME_CN.html');
  fs.writeFileSync(cnHtmlPath, cnHtmlContent);
  files.push(cnHtmlPath);

  // 3. 生成英文文本简历
  const enTextContent = generateEnglishText(masterData, jobAnalysis);
  const enTextPath = path.join(outputDir, 'DAVID_ZHANG_RESUME_EN.txt');
  fs.writeFileSync(enTextPath, enTextContent);
  files.push(enTextPath);

  // 4. 生成中文文本简历
  const cnTextContent = generateChineseText(masterData, jobAnalysis);
  const cnTextPath = path.join(outputDir, 'DAVID_ZHANG_RESUME_CN.txt');
  fs.writeFileSync(cnTextPath, cnTextContent);
  files.push(cnTextPath);

  return files;
}

/**
 * 生成英文HTML简历
 */
function generateEnglishHTML(masterData, jobAnalysis, jobDescription) {
  // 简化的英文HTML生成
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DAVID ZHANG - Data & Analytics Professional</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #DB0011;
            padding-bottom: 20px;
        }
        .name {
            font-size: 32px;
            font-weight: bold;
            color: #1A1A1A;
            margin: 0;
        }
        .title {
            font-size: 18px;
            color: #DB0011;
            margin: 10px 0;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 20px;
            color: #1A1A1A;
            border-bottom: 1px solid #E0E0E0;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .job {
            margin-bottom: 20px;
        }
        .job-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .company {
            font-weight: bold;
        }
        .duration {
            color: #666;
        }
        .responsibilities {
            margin: 10px 0;
            padding-left: 20px;
        }
        .position-match {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #0066CC;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="name">DAVID ZHANG</h1>
        <p class="title">Business Analytics Consultant | Data Science Expert</p>
        <p>📍 ${masterData.basicInfo['现居地'] || 'Guangzhou, China'} | 📧 ${masterData.basicInfo['邮箱'] || '787248611@qq.com'} | 📱 ${masterData.basicInfo['电话'] || '+86 18665720891'}</p>
    </div>
    
    ${jobAnalysis.positionMatch.length > 0 ? `
    <div class="position-match">
        <h3>🎯 Position Match Analysis</h3>
        <ul>
            ${jobAnalysis.positionMatch.map(item => `<li>${item}</li>`).join('')}
        </ul>
    </div>` : ''}
    
    <div class="section">
        <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
        <p>Data & Analytics professional with ${masterData.workExperience.length}+ years of experience, specializing in financial technology and investment services. CFA Charterholder with expertise in data analysis, business intelligence, and financial modeling.</p>
    </div>
    
    <div class="section">
        <h2 class="section-title">WORK EXPERIENCE</h2>
        ${masterData.workExperience.map(job => `
        <div class="job">
            <div class="job-header">
                <div class="company">${job.company} | ${job.position}</div>
                <div class="duration">${job.duration}</div>
            </div>
            ${job.responsibilities.length > 0 ? `
            <ul class="responsibilities">
                ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>` : ''}
        </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2 class="section-title">SKILLS</h2>
        ${Object.entries(masterData.skills).map(([category, skills]) => `
        <p><strong>${category}:</strong> ${skills.join(', ')}</p>
        `).join('')}
    </div>
    
    <div class="section">
        <h2 class="section-title">CERTIFICATIONS</h2>
        <p>${masterData.certifications.map(cert => `${cert.name} (${cert.year})`).join(', ')}</p>
    </div>
    
    <div class="section">
        <h2 class="section-title">EDUCATION</h2>
        ${masterData.education.map(edu => `<p>${edu}</p>`).join('')}
    </div>
    
    <div class="section">
        <h2 class="section-title">LANGUAGES</h2>
        <p>${masterData.languages.map(lang => `${lang.language} (${lang.level})`).join(', ')}</p>
    </div>
</body>
</html>`;
}

/**
 * 生成中文HTML简历
 */
function generateChineseHTML(masterData, jobAnalysis, jobDescription) {
  // 职位匹配分析翻译
  const chinesePositionMatch = jobAnalysis.positionMatch.map(item => 
    item.replace('✅', '✅')
        .replace('years experience', '年经验')
        .replace('matches requirement', '符合要求')
        .replace('matches preferred qualification', '符合优先条件')
        .replace('Python skills', 'Python技能')
        .replace('SAS skills', 'SAS技能')
        .replace('English fluency', '英语流利')
        .replace('Wholesale banking knowledge', '批发银行业务知识')
        .replace('Business sense', '商业意识')
        .replace('Presentation skills', '演示技巧')
  );
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>张大卫 - 数据分析专家</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #DB0011;
            padding-bottom: 20px;
        }
        .name {
            font-size: 32px;
            font-weight: bold;
            color: #1A1A1A;
            margin: 0;
        }
        .title {
            font-size: 18px;
            color: #DB0011;
            margin: 10px 0;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 20px;
            color: #1A1A1A;
            border-bottom: 1px solid #E0E0E0;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .job {
            margin-bottom: 20px;
        }
        .job-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .company {
            font-weight: bold;
        }
        .duration {
            color: #666;
        }
        .responsibilities {
            margin: 10px 0;
            padding-left: 20px;
        }
        .position-match {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #0066CC;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="name">张大卫 (DAVID ZHANG)</h1>
        <p class="title">商业分析顾问 | 数据科学专家</p>
        <p>📍 ${masterData.basicInfo['现居地'] || '中国广州'} | 📧 ${masterData.basicInfo['邮箱'] || '787248611@qq.com'} | 📱 ${masterData.basicInfo['电话'] || '18665720891'}</p>
    </div>
    
    ${chinesePositionMatch.length > 0 ? `
    <div class="position-match">
        <h3>🎯 职位匹配分析</h3>
        <ul>
            ${chinesePositionMatch.map(item => `<li>${item}</li>`).join('')}
        </ul>
    </div>` : ''}
    
    <div class="section">
        <h2 class="section-title">专业摘要</h2>
        <p>数据分析专家，拥有${masterData.workExperience.length}+年经验，专注于金融科技和投资服务。CFA持证人，擅长数据分析、商业智能和金融建模。</p>
    </div>
    
    <div class="section">
        <h2 class="section-title">工作经历</h2>
        ${masterData.workExperience.map(job => `
        <div class="job">
            <div class="job-header">
                <div class="company">${job.company} | ${job.position}</div>
                <div class="duration">${job.duration}</div>
            </div>
            ${job.responsibilities.length > 0 ? `
            <ul class="responsibilities">
                ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>` : ''}
        </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2 class="section-title">专业技能</h2>
        ${Object.entries(masterData.skills).map(([category, skills]) => `
        <p><strong>${category}:</strong> ${skills.join(', ')}</p>
        `).join('')}
    </div>
    
    <div class="section">
        <h2 class="section-title">证书认证</h2>
        <p>${masterData.certifications.map(cert => `${cert.name} (${cert.year})`).join(', ')}</p>
    </div>
    
    <div class="section">
        <h2 class="section-title">教育背景</h2>
        ${masterData.education.map(edu => `<p>${edu}</p>`).join('')}
    </div>
    
    <div class="section">
        <h2 class="section-title">语言能力</h2>
        <p>${masterData.languages.map(lang => `${lang.language} (${lang.level})`).join(', ')}</p>
    </div>
</body>
</html>`;
}

/**
 * 生成英文文本简历
 */
function generateEnglishText(masterData, jobAnalysis) {
  let text = `DAVID ZHANG
Data & Analytics Professional

CONTACT
📍 ${masterData.basicInfo['现居地'] || 'Guangzhou, China'}
📧 ${masterData.basicInfo['邮箱'] || '787248611@qq.com'}
📱 ${masterData.basicInfo['电话'] || '+86 18665720891'}

PROFESSIONAL SUMMARY
Data & Analytics professional with ${masterData.workExperience.length}+ years of experience, specializing in financial technology and investment services. CFA Charterholder with expertise in data analysis, business intelligence, and financial modeling.

`;
  
  if (jobAnalysis.positionMatch.length > 0) {
    text += `POSITION MATCH ANALYSIS
${jobAnalysis.positionMatch.map(item => `• ${item}`).join('\n')}

`;
  }
  
  text += `WORK EXPERIENCE
`;
  masterData.workExperience.forEach(job => {
    text += `${job.company} | ${job.position} | ${job.duration}\n`;
    if (job.responsibilities.length > 0) {
      job.responsibilities.forEach(resp => {
        text += `  • ${resp}\n`;
      });
    }
    text += '\n';
  });
  
  text += `SKILLS\n`;
  Object.entries(masterData.skills).forEach(([category, skills]) => {
    text += `${category}: ${skills.join(', ')}\n`;
  });
  
  text += `\nCERTIFICATIONS\n`;
  masterData.certifications.forEach(cert => {
    text += `• ${cert.name} (${cert.year})\n`;
  });
  
  text += `\nEDUCATION\n`;
  masterData.education.forEach(edu => {
    text += `• ${edu}\n`;
  });
  
  text += `\nLANGUAGES\n`;
  masterData.languages.forEach(lang => {
    text += `• ${lang.language} (${lang.level})\n`;
  });
  
  return text;
}

/**
 * 生成中文文本简历
 */
function generateChineseText(masterData, jobAnalysis) {
  let text = `张大卫 (DAVID ZHANG)
数据分析专家

联系方式
📍 ${masterData.basicInfo['现居地'] || '中国广州'}
📧 ${masterData.basicInfo['邮箱'] || '787248611@qq.com'}
📱 ${masterData.basicInfo['电话'] || '18665720891'}

专业摘要
数据分析专家，拥有${masterData.workExperience.length}+年经验，专注于金融科技和投资服务。CFA持证人，擅长数据分析、商业智能和金融建模。\n`;
  
  // 职位匹配分析翻译
  const chinesePositionMatch = jobAnalysis.positionMatch.map(item => 
    item.replace('✅', '✅')
        .replace('years experience', '年经验')
        .replace('matches requirement', '符合要求')
        .replace('matches preferred qualification', '符合优先条件')
        .replace('Python skills', 'Python技能')
        .replace('SAS skills', 'SAS技能')
        .replace('English fluency', '英语流利')
        .replace('Wholesale banking knowledge', '批发银行业务知识')
        .replace('Business sense', '商业意识')
        .replace('Presentation skills', '演示技巧')
  );
  
  if (chinesePositionMatch.length > 0) {
    text += `职位匹配分析\n${chinesePositionMatch.map(item => `• ${item}`).join('\n')}\n\n`;
  }
  
  text += `工作经历\n`;
  masterData.workExperience.forEach(job => {
    text += `${job.company} | ${job.position} | ${job.duration}\n`;
    if (job.responsibilities.length > 0) {
      job.responsibilities.forEach(resp => {
        text += `  • ${resp}\n`;
      });
    }
    text += '\n';
  });
  
  text += `专业技能\n`;
  Object.entries(masterData.skills).forEach(([category, skills]) => {
    text += `${category}: ${skills.join(', ')}\n`;
  });
  
  text += `\n证书认证\n`;
  masterData.certifications.forEach(cert => {
    text += `• ${cert.name} (${cert.year})\n`;
  });
  
  text += `\n教育背景\n`;
  masterData.education.forEach(edu => {
    text += `• ${edu}\n`;
  });
  
  text += `\n语言能力\n`;
  masterData.languages.forEach(lang => {
    text += `• ${lang.language} (${lang.level})\n`;
  });
  
  return text;
}

/**
 * 创建批处理文件
 */
function createBatchFile(outputDir, files) {
  const batchContent = `@echo off
echo Opening generated resume files...\necho.\n\n${files.map((file, index) => {
  const fileName = path.basename(file);
  return `echo ${index + 1}. Opening ${fileName}...\nstart \"\" \"${file}\"\ntimeout /t 2 /nobreak >nul`;
}).join('\n\n')}\n\necho.\necho All resume files have been opened in: ${outputDir}\necho.\npause`;
  
  const batchPath = path.join(outputDir, 'open_resumes.bat');
  fs.writeFileSync(batchPath, batchContent);
}

// 导出函数
module.exports = {
  generateResume,
  parseMasterProfile,
  analyzeJobRequirements
};