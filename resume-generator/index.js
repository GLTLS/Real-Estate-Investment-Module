/**
 * 简历生成插件 - 简化版本
 */

const path = require('path');
const fs = require('fs');

// 配置文件
const CONFIG = {
  masterProfile: 'C:\\Users\\78724\\Documents\\AI简历\\DAVID_ZHANG_MASTER_PROFILE.md',
  baseOutputDir: 'C:\\Users\\78724\\Documents\\AI简历'
};

/**
 * 插件注册函数
 */
function register(api) {
  console.log('简历生成插件正在注册...');
  
  // 检查API对象
  console.log('API对象:', Object.keys(api));
  
  // 尝试不同的注册方式
  if (api.registerCommand) {
    // 方式1: 注册命令
    api.registerCommand({
      name: 'resume-generator',
      description: '根据母版文件生成简历',
      handler: resumeGeneratorHandler
    });
    console.log('已通过registerCommand注册');
  } else if (api.registerTool) {
    // 方式2: 注册工具
    api.registerTool({
      name: 'resume-generator',
      description: '简历生成器',
      handler: resumeGeneratorHandler
    });
    console.log('已通过registerTool注册');
  } else {
    console.log('未找到合适的注册方法，使用默认方式');
    // 返回插件信息
    return {
      name: 'resume-generator',
      description: '简历生成插件',
      commands: {
        'resume-generator': {
          description: '生成简历',
          handler: resumeGeneratorHandler
        }
      }
    };
  }
}

/**
 * 简历生成处理函数
 */
async function resumeGeneratorHandler(context, params) {
  const { tools } = context;
  const { jobDescription } = params || {};

  try {
    // 检查母版文件
    if (!fs.existsSync(CONFIG.masterProfile)) {
      await tools.sessions_send({
        message: `❌ 母版文件不存在: ${CONFIG.masterProfile}`
      });
      return;
    }

    // 读取母版内容
    const masterContent = fs.readFileSync(CONFIG.masterProfile, 'utf8');

    // 创建输出文件夹
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const outputDir = path.join(CONFIG.baseOutputDir, `RESUME_${timestamp}`);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成简单简历
    const simpleResume = `DAVID ZHANG - Resume
生成时间: ${new Date().toLocaleString()}
职位描述: ${jobDescription || '未指定'}

${masterContent}`;

    // 保存简历
    const outputPath = path.join(outputDir, 'resume.txt');
    fs.writeFileSync(outputPath, simpleResume);

    // 返回结果
    await tools.sessions_send({
      message: `✅ 简历已成功生成！\n\n📁 保存位置: ${outputPath}\n\n📄 文件内容已根据您的母版文件生成。`
    });

  } catch (error) {
    await tools.sessions_send({
      message: `❌ 生成简历时出错: ${error.message}`
    });
  }
}

/**
 * 插件激活函数（可选）
 */
function activate(api) {
  console.log('简历生成插件已激活');
  return {
    name: 'resume-generator',
    version: '1.0.0'
  };
}

// 导出插件
module.exports = {
  register,
  activate
};