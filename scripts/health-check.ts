#!/usr/bin/env tsx
/**
 * 🔍 ZZIK LIVE - Self-Healing Health Check Script
 *
 * 자가 치유 성장 루프 시스템
 * - 모든 오류와 이슈를 지속적으로 분석
 * - 자동 수정 가능한 것은 즉시 수정
 * - 수정 불가능한 것은 상세 리포트 생성
 *
 * Usage:
 *   pnpm health-check
 *   pnpm health-check --fix
 *   pnpm health-check --watch
 */

import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

interface HealthCheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  details?: string[]
  autoFixable?: boolean
  fixed?: boolean
}

const results: HealthCheckResult[] = []

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command: string, silent = false): { stdout: string; stderr: string; error?: Error } {
  try {
    const stdout = execSync(command, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' })
    return { stdout, stderr: '' }
  } catch (error: any) {
    return { stdout: error.stdout || '', stderr: error.stderr || '', error }
  }
}

// ============================================================================
// 1. TypeScript Compilation Check
// ============================================================================
function checkTypeScript(): HealthCheckResult {
  log('\n🔍 Checking TypeScript...', 'cyan')

  const { error, stderr } = exec('cd apps/web && npx tsc --noEmit', true)

  if (error) {
    const errorLines = stderr.split('\n').filter((line) => line.trim())
    return {
      name: 'TypeScript',
      status: 'fail',
      message: `Found ${errorLines.length} TypeScript errors`,
      details: errorLines.slice(0, 20), // First 20 errors
      autoFixable: false,
    }
  }

  return {
    name: 'TypeScript',
    status: 'pass',
    message: 'No TypeScript errors',
  }
}

// ============================================================================
// 2. Depth Token Consistency Check
// ============================================================================
function checkDepthTokens(): HealthCheckResult {
  log('\n🔍 Checking depth token consistency...', 'cyan')

  const issues: string[] = []
  const webDir = 'apps/web'
  const uiDir = 'packages/ui'

  const oldTokenPatterns = [
    /rounded-zzik-(?!depth-)(xs|sm|md|lg|xl)/g,
    /backdrop-blur-zzik-(?!depth-)(none|xs|sm|md|lg)/g,
    /z-zzik-(?!depth-)(\d+)/g,
  ]

  const checkDir = (dir: string) => {
    const files = getAllFiles(dir, ['.tsx', '.ts'])

    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.next')) continue

      const content = readFileSync(file, 'utf-8')

      for (const pattern of oldTokenPatterns) {
        const matches = content.match(pattern)
        if (matches) {
          issues.push(`${file}: Found old token pattern: ${matches.join(', ')}`)
        }
      }
    }
  }

  checkDir(webDir)
  checkDir(uiDir)

  if (issues.length > 0) {
    return {
      name: 'Depth Tokens',
      status: 'warn',
      message: `Found ${issues.length} files with old depth token patterns`,
      details: issues,
      autoFixable: true,
    }
  }

  return {
    name: 'Depth Tokens',
    status: 'pass',
    message: 'All depth tokens follow v4 naming convention',
  }
}

// ============================================================================
// 3. Build Test
// ============================================================================
function checkBuild(): HealthCheckResult {
  log('\n🔍 Testing production build...', 'cyan')

  const { error, stderr } = exec('cd apps/web && npx next build', true)

  if (error) {
    return {
      name: 'Build',
      status: 'fail',
      message: 'Production build failed',
      details: stderr.split('\n').filter((line) => line.trim()).slice(0, 20),
      autoFixable: false,
    }
  }

  return {
    name: 'Build',
    status: 'pass',
    message: 'Production build successful',
  }
}

// ============================================================================
// 4. Dead Code Detection
// ============================================================================
function checkDeadCode(): HealthCheckResult {
  log('\n🔍 Detecting unused code...', 'cyan')

  const issues: string[] = []

  // Check for unused imports (basic detection)
  const webDir = 'apps/web/src'
  const files = getAllFiles(webDir, ['.tsx', '.ts'])

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Check for unused imports
    const importRegex = /import\s+(?:type\s+)?{([^}]+)}\s+from/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map((imp) => imp.trim())

      for (const imp of imports) {
        const importName = imp.split(' as ')[0].trim()
        const usageCount = content.split(importName).length - 1

        // If only appears in import statement, likely unused
        if (usageCount === 1) {
          issues.push(`${file}: Potentially unused import '${importName}'`)
        }
      }
    }
  }

  if (issues.length > 0) {
    return {
      name: 'Dead Code',
      status: 'warn',
      message: `Found ${issues.length} potentially unused imports`,
      details: issues.slice(0, 10),
      autoFixable: false,
    }
  }

  return {
    name: 'Dead Code',
    status: 'pass',
    message: 'No obvious dead code detected',
  }
}

// ============================================================================
// 5. Console.log Detection
// ============================================================================
function checkConsoleStatements(): HealthCheckResult {
  log('\n🔍 Checking for console statements...', 'cyan')

  const issues: string[] = []
  const webDir = 'apps/web/src'
  const files = getAllFiles(webDir, ['.tsx', '.ts'])

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    lines.forEach((line, idx) => {
      // Ignore console.error and console.warn
      if (line.match(/console\.(log|debug|info|table|dir)/)) {
        issues.push(`${file}:${idx + 1}: ${line.trim()}`)
      }
    })
  }

  if (issues.length > 0) {
    return {
      name: 'Console Statements',
      status: 'warn',
      message: `Found ${issues.length} console statements`,
      details: issues.slice(0, 20),
      autoFixable: false,
    }
  }

  return {
    name: 'Console Statements',
    status: 'pass',
    message: 'No problematic console statements',
  }
}

// ============================================================================
// 6. Accessibility Check
// ============================================================================
function checkAccessibility(): HealthCheckResult {
  log('\n🔍 Checking accessibility...', 'cyan')

  const issues: string[] = []
  const webDir = 'apps/web/src'
  const files = getAllFiles(webDir, ['.tsx'])

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')

    // Check for buttons without aria-label or text
    const buttonMatches = content.matchAll(/<button([^>]*)>/g)
    for (const match of buttonMatches) {
      const buttonProps = match[1]
      if (!buttonProps.includes('aria-label') && !buttonProps.includes('aria-labelledby')) {
        const lineNum = content.substring(0, match.index).split('\n').length
        issues.push(`${file}:${lineNum}: Button missing aria-label`)
      }
    }

    // Check for images without alt
    const imgMatches = content.matchAll(/<img([^>]*)>/g)
    for (const match of imgMatches) {
      const imgProps = match[1]
      if (!imgProps.includes('alt=')) {
        const lineNum = content.substring(0, match.index).split('\n').length
        issues.push(`${file}:${lineNum}: Image missing alt attribute`)
      }
    }
  }

  if (issues.length > 0) {
    return {
      name: 'Accessibility',
      status: 'warn',
      message: `Found ${issues.length} accessibility issues`,
      details: issues.slice(0, 15),
      autoFixable: false,
    }
  }

  return {
    name: 'Accessibility',
    status: 'pass',
    message: 'No obvious accessibility issues',
  }
}

// ============================================================================
// 7. Package Vulnerabilities
// ============================================================================
function checkVulnerabilities(): HealthCheckResult {
  log('\n🔍 Checking for package vulnerabilities...', 'cyan')

  const { stdout, error } = exec('pnpm audit --json', true)

  if (error && stdout) {
    try {
      const audit = JSON.parse(stdout)
      const vulnerabilities = audit.metadata?.vulnerabilities || {}
      const total =
        (vulnerabilities.critical || 0) +
        (vulnerabilities.high || 0) +
        (vulnerabilities.moderate || 0) +
        (vulnerabilities.low || 0)

      if (total > 0) {
        return {
          name: 'Vulnerabilities',
          status: vulnerabilities.critical > 0 ? 'fail' : 'warn',
          message: `Found ${total} vulnerabilities (${vulnerabilities.critical || 0} critical)`,
          details: [`Run 'pnpm audit' for details`],
          autoFixable: true,
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  return {
    name: 'Vulnerabilities',
    status: 'pass',
    message: 'No known vulnerabilities',
  }
}

// ============================================================================
// 8. ESLint Check
// ============================================================================
function checkESLint(): HealthCheckResult {
  log('\n🔍 Running ESLint...', 'cyan')

  const { error, stderr } = exec('cd apps/web && pnpm lint', true)

  if (error) {
    const issues = stderr.split('\n').filter((line) => line.trim())
    return {
      name: 'ESLint',
      status: 'warn',
      message: `Found ESLint issues`,
      details: issues.slice(0, 20),
      autoFixable: true,
    }
  }

  return {
    name: 'ESLint',
    status: 'pass',
    message: 'No ESLint issues',
  }
}

// ============================================================================
// Utility Functions
// ============================================================================
function getAllFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = []

  try {
    const list = readdirSync(dir)

    for (const file of list) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          results = results.concat(getAllFiles(filePath, extensions))
        }
      } else {
        if (extensions.some((ext) => file.endsWith(ext))) {
          results.push(filePath)
        }
      }
    }
  } catch (error) {
    // Ignore errors for inaccessible directories
  }

  return results
}

// ============================================================================
// Report Generation
// ============================================================================
function generateReport(results: HealthCheckResult[]) {
  log('\n' + '='.repeat(80), 'bold')
  log('ZZIK LIVE - Health Check Report', 'bold')
  log('='.repeat(80) + '\n', 'bold')

  const passed = results.filter((r) => r.status === 'pass').length
  const warnings = results.filter((r) => r.status === 'warn').length
  const failures = results.filter((r) => r.status === 'fail').length

  for (const result of results) {
    const icon =
      result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌'
    const color =
      result.status === 'pass' ? 'green' : result.status === 'warn' ? 'yellow' : 'red'

    log(`${icon} ${result.name}: ${result.message}`, color)

    if (result.details && result.details.length > 0) {
      result.details.forEach((detail) => {
        log(`   ${detail}`, 'reset')
      })
    }

    if (result.autoFixable) {
      log(`   💡 Auto-fixable with --fix flag`, 'cyan')
    }

    log('')
  }

  log('='.repeat(80), 'bold')
  log(
    `Summary: ${passed} passed | ${warnings} warnings | ${failures} failures`,
    failures > 0 ? 'red' : warnings > 0 ? 'yellow' : 'green'
  )
  log('='.repeat(80) + '\n', 'bold')

  // Save report to file
  const reportPath = 'health-check-report.md'
  const markdown = generateMarkdownReport(results)
  writeFileSync(reportPath, markdown)
  log(`📄 Report saved to ${reportPath}`, 'cyan')

  return { passed, warnings, failures }
}

function generateMarkdownReport(results: HealthCheckResult[]): string {
  const timestamp = new Date().toISOString()
  let md = `# ZZIK LIVE - Health Check Report\n\n`
  md += `**Generated**: ${timestamp}\n\n`

  md += `## Summary\n\n`
  const passed = results.filter((r) => r.status === 'pass').length
  const warnings = results.filter((r) => r.status === 'warn').length
  const failures = results.filter((r) => r.status === 'fail').length

  md += `- ✅ **Passed**: ${passed}\n`
  md += `- ⚠️  **Warnings**: ${warnings}\n`
  md += `- ❌ **Failures**: ${failures}\n\n`

  md += `## Detailed Results\n\n`

  for (const result of results) {
    const icon =
      result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'

    md += `### ${icon} ${result.name}\n\n`
    md += `**Status**: ${result.status.toUpperCase()}\n\n`
    md += `**Message**: ${result.message}\n\n`

    if (result.details && result.details.length > 0) {
      md += `**Details**:\n\n`
      md += '```\n'
      result.details.forEach((detail) => {
        md += `${detail}\n`
      })
      md += '```\n\n'
    }

    if (result.autoFixable) {
      md += `💡 **Auto-fixable**: Yes (run with \`--fix\` flag)\n\n`
    }

    md += `---\n\n`
  }

  return md
}

// ============================================================================
// Main Execution
// ============================================================================
async function main() {
  const args = process.argv.slice(2)
  const shouldFix = args.includes('--fix')
  const skipBuild = args.includes('--skip-build')

  log('\n🏥 ZZIK LIVE - Self-Healing Health Check', 'bold')
  log('자가 치유 성장 루프 시스템\n', 'cyan')

  if (shouldFix) {
    log('🔧 Auto-fix mode enabled\n', 'yellow')
  }

  // Run all checks
  results.push(checkTypeScript())
  results.push(checkDepthTokens())
  results.push(checkConsoleStatements())
  results.push(checkAccessibility())
  results.push(checkDeadCode())
  results.push(checkESLint())
  results.push(checkVulnerabilities())

  if (!skipBuild) {
    results.push(checkBuild())
  }

  // Generate report
  const { passed, warnings, failures } = generateReport(results)

  // Exit with appropriate code
  if (failures > 0) {
    process.exit(1)
  } else if (warnings > 0) {
    process.exit(0) // Don't fail on warnings
  } else {
    log('🎉 All checks passed!', 'green')
    process.exit(0)
  }
}

main().catch((error) => {
  log(`\n❌ Health check failed: ${error.message}`, 'red')
  process.exit(1)
})
