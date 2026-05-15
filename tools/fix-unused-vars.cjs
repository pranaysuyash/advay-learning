const fs = require('fs');
const path = require('path');

const files = [
  'src/frontend/src/pages/BodyParts.tsx',
  'src/frontend/src/pages/BridgeBuilder.tsx',
  'src/frontend/src/pages/DiscoveryLab.tsx',
  'src/frontend/src/pages/FarmFriends.tsx',
  'src/frontend/src/pages/LanguagePuppet.tsx',
  'src/frontend/src/pages/LogicBoxPush.tsx',
  'src/frontend/src/pages/NasaSkyHunt.tsx',
  'src/frontend/src/pages/PhonicsTracing.tsx',
  'src/frontend/src/pages/PlantGarden.tsx',
  'src/frontend/src/pages/SetTheTable.tsx',
  'src/frontend/src/pages/ShadowPuppetTheater.tsx',
  'src/frontend/src/pages/SightWordFlash.tsx',
  'src/frontend/src/pages/WeatherLab.tsx',
  'src/frontend/src/pages/WeatherMatch.tsx',
];

files.forEach(file => {
  const fullPath = path.join('/Users/pranay/Projects/learning_for_kids', file);
  if (!fs.existsSync(fullPath)) {
    console.log(`Not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Prefix unused variables
  content = content.replace(/const \[cursor, setCursor\]/g, 'const [_cursor, _setCursor]');
  content = content.replace(/const cursor,/g, 'const _cursor,');
  content = content.replace(/const \[cursor\]/g, 'const [_cursor]');
  content = content.replace(/webcamRef,/g, '_webcamRef,');
  content = content.replace(/const webcamRef = /g, 'const _webcamRef = ');
  content = content.replace(/gameAreaRef,/g, '_gameAreaRef,');
  content = content.replace(/const gameAreaRef = /g, 'const _gameAreaRef = ');
  content = content.replace(/canvasRef,/g, '_canvasRef,');
  content = content.replace(/const canvasRef = /g, 'const _canvasRef = ');
  content = content.replace(/handVisible,/g, '_handVisible,');
  content = content.replace(/const indexPIP = /g, 'const _indexPIP = ');
  content = content.replace(/indexPIP,/g, '_indexPIP,');

  fs.writeFileSync(fullPath, content);
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
