const { chromium } = require('playwright');

(async () => {
  console.log('========================================');
  console.log('🧪 FeedbackLens 全面自动化测试');
  console.log('========================================\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const testResults = [];
  const timestamp = Date.now();
  
  // 辅助函数：截图并记录
  async function screenshot(name) {
    const path = `C:\\Users\\Administrator\\Desktop\\feedbacklens\\test-${name}-${timestamp}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`   📸 截图已保存: test-${name}.png`);
    return path;
  }
  
  // 辅助函数：记录测试结果
  function recordTest(name, status, details = '') {
    testResults.push({ name, status, details });
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`   ${icon} ${name}: ${status}${details ? ' - ' + details : ''}`);
  }
  
  try {
    // ========== 测试1: 首页 ==========
    console.log('\n📄 测试1: 首页访问');
    await page.goto('https://feedbacklens20260322.vercel.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    const hasLogo = await page.locator('text=FeedbackLens').count() > 0;
    const hasCTA = await page.locator('text=Get Started').count() > 0;
    
    recordTest('首页标题', title.includes('FeedbackLens') ? 'PASS' : 'FAIL', title);
    recordTest('Logo显示', hasLogo ? 'PASS' : 'FAIL');
    recordTest('CTA按钮', hasCTA ? 'PASS' : 'FAIL');
    await screenshot('01-homepage');
    
    // ========== 测试2: 注册流程 ==========
    console.log('\n📝 测试2: 注册流程');
    await page.click('a[href="/signup"]');
    await page.waitForTimeout(2000);
    
    const signupTitle = await page.locator('h1').textContent();
    recordTest('注册页标题', signupTitle?.includes('Create') ? 'PASS' : 'FAIL', signupTitle);
    await screenshot('02-signup-page');
    
    // 填写注册表单
    const testEmail = `test${timestamp}@example.com`;
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"] >> nth=0', 'Test123456');
    await page.fill('input[type="password"] >> nth=1', 'Test123456');
    recordTest('填写注册表单', 'PASS', testEmail);
    await screenshot('03-signup-filled');
    
    // 提交注册
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const successMessage = await page.locator('text=Check your email').count() > 0;
    const errorMessage = await page.locator('.text-red-700').count() > 0;
    
    if (successMessage) {
      recordTest('注册提交', 'PASS', '显示确认邮件提示');
    } else if (errorMessage) {
      const errorText = await page.locator('.text-red-700').textContent();
      recordTest('注册提交', 'FAIL', errorText);
    } else {
      recordTest('注册提交', 'FAIL', '无响应');
    }
    await screenshot('04-signup-result');
    
    // ========== 测试3: 登录流程 ==========
    console.log('\n🔐 测试3: 登录流程');
    await page.goto('https://feedbacklens20260322.vercel.app/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const loginTitle = await page.locator('h1').textContent();
    recordTest('登录页标题', loginTitle?.includes('Sign in') || loginTitle?.includes('Login') ? 'PASS' : 'FAIL', loginTitle);
    await screenshot('05-login-page');
    
    // 填写登录表单
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'Test123456');
    recordTest('填写登录表单', 'PASS');
    await screenshot('06-login-filled');
    
    // 提交登录
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/dashboard') || await page.locator('text=Dashboard').count() > 0;
    recordTest('登录跳转', isLoggedIn ? 'PASS' : 'FAIL', `当前URL: ${currentUrl}`);
    await screenshot('07-login-result');
    
    // ========== 测试4: 定价页面 ==========
    console.log('\n💰 测试4: 定价页面');
    await page.goto('https://feedbacklens20260322.vercel.app/pricing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const pricingTitle = await page.locator('h1').textContent();
    const hasPricingCards = await page.locator('.rounded-2xl').count() > 0;
    
    recordTest('定价页标题', pricingTitle?.includes('Pricing') || pricingTitle?.includes('价格') ? 'PASS' : 'FAIL', pricingTitle);
    recordTest('定价卡片', hasPricingCards ? 'PASS' : 'FAIL');
    await screenshot('08-pricing-page');
    
    // ========== 测试5: 功能页面检查 ==========
    console.log('\n🔍 测试5: 功能页面检查');
    
    // 检查分析页面
    await page.goto('https://feedbacklens20260322.vercel.app/analyze', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const analyzeAccessible = await page.locator('text=404').count() === 0;
    recordTest('分析页面', analyzeAccessible ? 'PASS' : 'FAIL');
    await screenshot('09-analyze-page');
    
    // 检查表单页面
    await page.goto('https://feedbacklens20260322.vercel.app/forms', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const formsAccessible = await page.locator('text=404').count() === 0;
    recordTest('表单页面', formsAccessible ? 'PASS' : 'FAIL');
    await screenshot('10-forms-page');
    
    // 检查设置页面
    await page.goto('https://feedbacklens20260322.vercel.app/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const settingsAccessible = await page.locator('text=404').count() === 0;
    recordTest('设置页面', settingsAccessible ? 'PASS' : 'FAIL');
    await screenshot('11-settings-page');
    
  } catch (error) {
    console.error('\n❌ 测试过程出错:', error.message);
    await screenshot('error');
  }
  
  // ========== 测试报告 ==========
  console.log('\n========================================');
  console.log('📊 测试报告');
  console.log('========================================');
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const total = testResults.length;
  
  console.log(`\n总计: ${total} 项测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${Math.round((passed/total)*100)}%`);
  
  console.log('\n详细结果:');
  testResults.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${icon} ${r.name}: ${r.status}`);
    if (r.details) console.log(`     ${r.details}`);
  });
  
  console.log('\n========================================');
  console.log('🎉 测试完成！');
  console.log('========================================');
  
  await browser.close();
})();
