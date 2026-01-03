import puppeteer from "puppeteer";
import { mkdirSync, writeFileSync } from "fs";

const HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1200px;
      height: 630px;
      background: #050505;
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
      position: relative;
    }
    
    /* Grid background */
    .grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(0, 212, 170, 0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 170, 0.07) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%);
    }
    
    /* Glow orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
    }
    
    .orb-1 {
      width: 500px;
      height: 500px;
      background: #00d4aa;
      top: -150px;
      left: -100px;
    }
    
    .orb-2 {
      width: 400px;
      height: 400px;
      background: #f5a623;
      bottom: -150px;
      right: -50px;
      opacity: 0.3;
    }
    
    .orb-3 {
      width: 300px;
      height: 300px;
      background: #6366f1;
      top: 50%;
      left: 60%;
      opacity: 0.2;
    }
    
    /* Content */
    .content {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 80px;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    .badge-dot {
      width: 8px;
      height: 8px;
      background: #00d4aa;
      border-radius: 50%;
      box-shadow: 0 0 12px #00d4aa;
    }
    
    .badge-text {
      font-family: 'Space Mono', monospace;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #00d4aa;
    }
    
    .title {
      font-family: Georgia, serif;
      font-size: 92px;
      font-style: italic;
      font-weight: 400;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 8px;
      letter-spacing: -0.03em;
    }
    
    .title span {
      color: #00d4aa;
    }
    
    .subtitle {
      font-family: Georgia, serif;
      font-size: 92px;
      font-weight: 400;
      color: #d4d4d4;
      line-height: 1;
      letter-spacing: -0.03em;
      margin-bottom: 32px;
    }
    
    .description {
      font-size: 24px;
      color: #d4d4d4;
      max-width: 600px;
      line-height: 1.4;
      margin-bottom: 48px;
    }
    
    /* Stats */
    .stats {
      display: flex;
      gap: 64px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .stat-value {
      font-family: 'Space Mono', monospace;
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
    }
    
    .stat-value.gold {
      color: #f5a623;
      text-shadow: 0 0 30px rgba(245, 166, 35, 0.4);
    }
    
    .stat-label {
      font-size: 14px;
      color: #a3a3a3;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    /* Corner accent */
    .corner {
      position: absolute;
      bottom: 40px;
      right: 60px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .corner-text {
      font-family: 'Space Mono', monospace;
      font-size: 24px;
      color: #a3a3a3;
      letter-spacing: 0.05em;
    }
    
    /* Decorative lines */
    .line-top {
      position: absolute;
      top: 0;
      left: 80px;
      right: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #252525 20%, #252525 80%, transparent);
    }
    
    .line-bottom {
      position: absolute;
      bottom: 0;
      left: 80px;
      right: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #252525 20%, #252525 80%, transparent);
    }
    
    /* Noise overlay */
    .noise {
      position: absolute;
      inset: 0;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  
  <div class="line-top"></div>
  <div class="line-bottom"></div>
  
  <div class="content">
    <div class="badge">
      <div class="badge-dot"></div>
      <span class="badge-text">December 2025</span>
    </div>
    
    <h1 class="title"><span>Z</span>ypherpunk</h1>
    <h2 class="subtitle">Hackathon Winners</h2>
    
    <p class="description">
      Privacy-focused projects building the future of Zcash
    </p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">88</div>
        <div class="stat-label">Projects</div>
      </div>
      <div class="stat">
        <div class="stat-value">140</div>
        <div class="stat-label">Awards</div>
      </div>
      <div class="stat">
        <div class="stat-value gold">$189K</div>
        <div class="stat-label">Distributed</div>
      </div>
    </div>
  </div>
  
  <div class="corner">
    <span class="corner-text">zypherpunk.d4mr.com</span>
  </div>
  
  <div class="noise"></div>
</body>
</html>
`;

async function generateOG() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  
  console.log("Setting content...");
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  
  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));

  console.log("Taking screenshot...");
  const screenshot = await page.screenshot({ type: "png" });

  await browser.close();

  writeFileSync("public/og.png", screenshot);
  console.log("✓ Generated public/og.png");
}

generateOG().catch(console.error);
