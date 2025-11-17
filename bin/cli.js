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

  fs.mkdirSync(projectName, { recursive: true });

  console.log('📦 Downloading template...');
  
  // Install the package temporarily to get the files
  const tempDir = path.join(process.cwd(), '.temp-template');
  fs.mkdirSync(tempDir, { recursive: true });
  
  execSync(`npm pack domain-for-sale-boilerplate`, { 
    cwd: tempDir,
    stdio: 'ignore'
  });
  
  // Extract the tarball
  const tarball = fs.readdirSync(tempDir).find(f => f.endsWith('.tgz'));
  execSync(`tar -xzf ${tarball}`, { cwd: tempDir, stdio: 'ignore' });
  
  // Copy files from package to project directory
  const packageDir = path.join(tempDir, 'package');
  const filesToCopy = ['app', 'config', 'public', 'next.config.js', 'tailwind.config.js', 
                       'postcss.config.js', 'tsconfig.json', 'package.json', 'README.md',
                       'netlify.toml', '.gitignore'];
  
  filesToCopy.forEach(file => {
    const src = path.join(packageDir, file);
    const dest = path.join(projectName, file);
    if (fs.existsSync(src)) {
      if (fs.lstatSync(src).isDirectory()) {
        fs.cpSync(src, dest, { recursive: true });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  });
  
  // Cleanup temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log('\n📥 Installing dependencies...');
  execSync(`npm install`, { cwd: projectName, stdio: 'inherit' });

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
