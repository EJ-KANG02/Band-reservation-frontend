/**
 * PWA 아이콘 생성 스크립트
 * 실행: npm run generate-icons
 *
 * public/logo.svg 를 소스로 PWA에 필요한 모든 PNG 아이콘을 생성합니다.
 */

import { Resvg } from '@resvg/resvg-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const svgPath = path.join(root, 'public', 'logo.svg')
const publicDir = path.join(root, 'public')

if (!fs.existsSync(svgPath)) {
  console.error('❌ public/logo.svg 파일을 찾을 수 없습니다.')
  process.exit(1)
}

const svgData = fs.readFileSync(svgPath, 'utf8')

const icons = [
  { size: 64,  name: 'pwa-64x64.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 512, name: 'maskable-icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
]

console.log('🎨 PWA 아이콘 생성 중...\n')

for (const { size, name } of icons) {
  const resvg = new Resvg(svgData, {
    fitTo: { mode: 'width', value: size },
  })
  const rendered = resvg.render()
  const buffer = rendered.asPng()
  const outPath = path.join(publicDir, name)
  fs.writeFileSync(outPath, buffer)
  console.log(`  ✓ ${name} (${size}×${size})`)
}

console.log('\n✅ 모든 아이콘이 public/ 폴더에 생성되었습니다!')
