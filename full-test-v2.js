const { chromium } = require('playwright');

(async () => {
  console.log('========================================');
  console.log('🧪 FeedbackLens 全面自动化测试 - 优化版');
  console.log('========================================\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const testResults = [];
  const timestamp = Date.now();
  
  async function screenshot(name) {
    const path = `C:\\Users\\Administrator\\Desktop\\feedbacklens\\test-${name}-${timestamp}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`   📸 截图: test-${name}.png`);
  }
  
  function recordTest(name, status, details = '') {
    testResults.push({ name, status, details });
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`   ${icon} ${name}: ${status}${details ? ' - ' + details : ''}`);
  }
  
  try {
    // ========== 测试1: 首页 ==========
    console.log('\n📄 测试1: 首页访问');
    await page.goto('https://feedbacklens20260322.vercel.app/', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    recordTest('首页标题', title.includes('FeedbackLens') ? 'PASS' : 'FAIL', title);
    
    const getStarted = await page.locator('text=Get Started').first();
    recordTest('CTA按钮存在', await getStarted.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
    await screenshot('01-homepage');
    
    // ========== 测试2: 注册页面 ==========
    console.log('\n📝 测试2: 注册页面');
    await getStarted.click();
    await page.waitForTimeout(2000);
    
    const url = page.url();
    recordTest('跳转到注册页', url.includes('/signup') ? 'PASS' : 'FAIL', url);
    
    // 检查表单元素
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInputs = await page.locator('input[type="password"]').count();
    recordTest('邮箱输入框', await emailInput.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
    recordTest('密码输入框', passwordInputs >= 2 ? 'PASS' : 'FAIL', `找到${passwordInputs}个`);
    await screenshot('02-signup');
    
    // ========== 测试3: 登录页面 ==========
    console.log('\n🔐 测试3: 登录页面');
    await page.goto('https://feedbacklens20260322.vercel.app/login', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const loginUrl = page.url();
    recordTest('登录页访问', loginUrl.includes('/login') ? 'PASS' : 'FAIL', loginUrl);
    
    const loginEmail = await page.locator('input[type="email"]').first();
    const loginPassword = await page.locator('input[type="password"]').first();
    recordTest('登录邮箱框', await loginEmail.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
    recordTest('登录密码框', await loginPassword.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
    await screenshot('03-login');
    
    // ========== 测试4: 定价页面 ==========
    console.log('\n💰 测试4: 定价页面');
    await page.goto('https://feedbacklens20260322.vercel.app/pricing', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const pricingUrl = page.url();
    recordTest('定价页访问', pricingUrl.includes('/pricing') ? 'PASS' : 'FAIL', pricingUrl);
    
    const pageContent = await page.content();
    const hasPricing = pageContent.includes('$') || pageContent.includes('价格') || pageContent.includes('Pricing');
    recordTest('定价信息', hasPricing ? 'PASS' : 'FAIL');
    await screenshot('04-pricing');
    
    // ========== 测试5: 功能页面 ==========
    console.log('\n🔍 测试5: 功能页面检查');
    
    const pages = [
      { name: '分析页', url: '/analyze' },
      { name: '表单页', url: '/forms' },
      { name: '设置页', url: '/settings' },
      { name: '仪表板', url: '/dashboard' },
    ];
    
    for (const p of pages) {
      await page.goto(`https://feedbacklens20260322.vercel.app${p.url}`, { timeout: 20000 });
      await page.waitForTimeout(1500);
      
      const content = await page.content();
      const notFound = content.includes('404') || content.includes('This page could not be found');
      recordTest(p.name, notFound ? 'FAIL' : 'PASS', notFound ? '404错误' : '正常访问');
    }
    await screenshot('05-features');
    
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    await screenshot('error');
  }
  
  // ========== 报告 ==========
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
    console.log(`  ${icon} ${r.name}`);
    if (r.details) console.log(`     ${r.details}`);
  });
  
  console.log('\n========================================');
  console.log('🎉 测试完成！');
  console.log('========================================');
  
  await browser.close();
})();
