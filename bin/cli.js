#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-domain-site';

console.log(`\n🚀 Creating your domain-for-sale site: ${projectName}\n`);

try {
  // Create project directory
  if (fs.existsSync(projectName)) {
    console.error(`❌ Directory "${projectName}" already exists!`);
    process.exit(1);
  }

  console.log('📦 Cloning template...');
  execSync(
    `git clone --depth 1 https://github.com/vireshshah/domain-for-sale-boilerplate.git ${projectName}`,
    { stdio: 'inherit' }
  );

  // Remove .git directory
  const gitDir = path.join(projectName, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  console.log('\n📥 Installing dependencies...');
  execSync(`cd ${projectName} && npm install`, { stdio: 'inherit' });

  console.log(`\n✅ Success! Your domain site is ready.\n`);
  console.log(`Next steps:\n`);
  console.log(`  cd ${projectName}`);
  console.log(`  Edit config/domain-config.json with your domain info`);
  console.log(`  npm run dev\n`);
  console.log(`📖 Documentation: https://github.com/vireshshah/domain-for-sale-boilerplate\n`);
} catch (error) {
  console.error('❌ Error creating project:', error.message);
  process.exit(1);
}
