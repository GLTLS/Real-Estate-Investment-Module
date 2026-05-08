/**
 * 简历生成技能测试脚本
 */

const path = require('path');
const fs = require('fs');

// 模拟OpenClaw工具
const mockTools = {
  write: async ({ path: filePath, content }) => {
    console.log(`Writing to: ${filePath}`);
    fs.writeFileSync(filePath, content);
    return { success: true };
  },
  
  sessions_send: async ({ message }) => {
    console.log(`Message: ${message}`);
    return { success: true };
  },
  
  exec: async ({ command }) => {
    console.log(`Executing: ${command}`);
    return { success: true };
  }
};

// 测试职位描述
const testJobDescription = `We are currently seeking an experienced Data & Analytics professional to join our IWPB team.

Requirements:
- Minimum 6 years experience in data analytics
- Proficiency in Python, SQL, and data visualization tools (Qlik, Power BI)
- Experience in investment and wealth management solutions
- CFA, CFP, or related certifications preferred
- Strong English communication skills for global collaboration
- Ability to develop predictive models and interactive dashboards
- Knowledge of cloud platforms (GCP, Azure)`;

// 导入主函数
const { main } = require('./index.js');

async function runTest() {
  console.log('=== 开始测试简历生成技能 ===\n');
  
  try {
    // 测试1: 基本生成
    console.log('测试1: 基本简历生成');
    const result1 = await main(
      { tools: mockTools, message: testJobDescription },
      { 
        jobDescription: testJobDescription,
        outputFolder: 'TEST_OUTPUT',
        updateMaster: false
      }
    );
    
    console.log('结果:', JSON.stringify(result1, null, 2));
    
    // 测试2: 检查生成的文件
    console.log('\n测试2: 检查生成的文件');
    const outputDir = path.join('C:\\Users\\78724\\Documents\\AI简历', 'TEST_OUTPUT');
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      console.log(`生成的文件 (${files.length}个):`);
      files.forEach(file => {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${stats.size} bytes)`);
      });
    } else {
      console.log('输出文件夹不存在');
    }
    
    // 测试3: 检查文件内容
    console.log('\n测试3: 检查HTML文件内容');
    const htmlPath = path.join(outputDir, 'DAVID_ZHANG_RESUME_EN.html');
    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, 'utf8');
      console.log(`HTML文件大小: ${content.length} 字符`);
      console.log('包含关键词:');
      ['DAVID ZHANG', 'Data & Analytics', 'Python', 'SQL', 'HSBC'].forEach(keyword => {
        if (content.includes(keyword)) {
          console.log(`  ✓ ${keyword}`);
        }
      });
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
runTest();