const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('开始测试 FeedbackLens...');
  
  // 测试1: 访问首页
  console.log('1. 访问首页...');
  await page.goto('https://feedbacklens20260322.vercel.app/');
  await page.waitForTimeout(3000);
  const title = await page.title();
  console.log('   页面标题:', title);
  
  // 截图
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\feedbacklens\\test-homepage.png' });
  console.log('   首页截图已保存');
  
  // 测试2: 点击注册按钮
  console.log('2. 点击注册按钮...');
  try {
    await page.click('a[href="/signup"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\feedbacklens\\test-signup.png' });
    console.log('   注册页截图已保存');
  } catch (e) {
    console.log('   注册按钮点击失败:', e.message);
  }
  
  // 测试3: 填写注册表单
  console.log('3. 测试注册表单...');
  try {
    await page.fill('input[type="email"]', 'test' + Date.now() + '@example.com');
    await page.fill('input[type="password"]', 'Test123456');
    await page.fill('input[type="password"]', 'Test123456');
    console.log('   表单填写完成');
    await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\feedbacklens\\test-signup-filled.png' });
  } catch (e) {
    console.log('   表单填写失败:', e.message);
  }
  
  console.log('测试完成！');
  
  await browser.close();
})();
