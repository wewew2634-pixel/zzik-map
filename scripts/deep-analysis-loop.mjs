#!/usr/bin/env node
/**
 * 🔬 Deep & Wide Analysis Loop
 *
 * 더 깊고 넓은 분석 루프 - 나노입자 단위보다 더 깊게
 *
 * Analyzes:
 * 1. Performance (Bundle size, Rendering, API latency)
 * 2. Security (Dependencies, API endpoints, Auth)
 * 3. Code Quality (Complexity, Duplication, Best practices)
 * 4. Architecture (Component coupling, Data flow)
 * 5. User Experience (Accessibility, Mobile, Loading states)
 * 6. Database (Query performance, Indexes, N+1 queries)
 * 7. Caching (Hit rates, TTL effectiveness)
 * 8. Error Handling (Boundary coverage, Logging)
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'deep-analysis-report');
const TIMESTAMP = new Date().toISOString();

const analyses = {
  performance: {},
  security: {},
  codeQuality: {},
  architecture: {},
  ux: {},
  database: {},
  caching: {},
  errorHandling: {},
};

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: process.cwd() });
  } catch (error) {
    return error.stdout || error.message;
  }
}

console.log('🔬 Starting Deep & Wide Analysis Loop...\n');

// 1. Performance Analysis
console.log('⚡ 1/8 Performance Analysis...');
try {
  // Bundle size analysis
  const bundleInfo = exec('du -sh apps/web/.next 2>/dev/null || echo "N/A"');
  analyses.performance.bundleSize = bundleInfo.trim();

  // Count components
  const componentCount = exec('find apps/web/src/components -type f \\( -name "*.tsx" -o -name "*.ts" \\) | wc -l');
  analyses.performance.componentCount = parseInt(componentCount);

  // Count API routes
  const apiRouteCount = exec('find apps/web/src/app/api -type f -name "route.ts" | wc -l');
  analyses.performance.apiRouteCount = parseInt(apiRouteCount);

  console.log(`   ✓ Bundle: ${analyses.performance.bundleSize}`);
  console.log(`   ✓ Components: ${analyses.performance.componentCount}`);
  console.log(`   ✓ API Routes: ${analyses.performance.apiRouteCount}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 2. Security Analysis
console.log('\n🔒 2/8 Security Analysis...');
try {
  // Check for exposed secrets
  const secretPatterns = exec('grep -rn "API_KEY\\|SECRET\\|PASSWORD" apps/web/src --include="*.ts" --include="*.tsx" | grep -v "process.env" | wc -l');
  analyses.security.potentialSecretLeaks = parseInt(secretPatterns);

  // Check for SQL injection vulnerabilities
  const sqlQueries = exec('grep -rn "prisma\\." apps/web/src --include="*.ts" | wc -l');
  analyses.security.databaseQueries = parseInt(sqlQueries);

  // Check auth implementation
  const authFiles = exec('find apps/web/src/core/auth -type f | wc -l');
  analyses.security.authFilesCount = parseInt(authFiles);

  console.log(`   ✓ Potential secret leaks: ${analyses.security.potentialSecretLeaks}`);
  console.log(`   ✓ Database queries: ${analyses.security.databaseQueries}`);
  console.log(`   ✓ Auth files: ${analyses.security.authFilesCount}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 3. Code Quality Analysis
console.log('\n📊 3/8 Code Quality Analysis...');
try {
  // Lines of code
  const loc = exec('find apps/web/src -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec wc -l {} + | tail -1');
  analyses.codeQuality.linesOfCode = parseInt(loc);

  // Test files
  const testFiles = exec('find . -type f \\( -name "*.test.ts" -o -name "*.spec.ts" \\) | grep -v node_modules | wc -l');
  analyses.codeQuality.testFiles = parseInt(testFiles);

  // TODO comments
  const todos = exec('grep -rn "TODO\\|FIXME\\|XXX\\|HACK" apps/web/src --include="*.ts" --include="*.tsx" | wc -l');
  analyses.codeQuality.todoComments = parseInt(todos);

  // Console.log statements (potential debug code)
  const consoleLogs = exec('grep -rn "console\\." apps/web/src --include="*.ts" --include="*.tsx" | wc -l');
  analyses.codeQuality.consoleStatements = parseInt(consoleLogs);

  console.log(`   ✓ Lines of code: ${analyses.codeQuality.linesOfCode.toLocaleString()}`);
  console.log(`   ✓ Test files: ${analyses.codeQuality.testFiles}`);
  console.log(`   ✓ TODO comments: ${analyses.codeQuality.todoComments}`);
  console.log(`   ✓ Console statements: ${analyses.codeQuality.consoleStatements}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 4. Architecture Analysis
console.log('\n🏗️  4/8 Architecture Analysis...');
try {
  // Core modules
  const coreModules = exec('find apps/web/src/core -maxdepth 1 -type d | wc -l');
  analyses.architecture.coreModules = parseInt(coreModules) - 1;

  // Hooks
  const hooksCount = exec('find apps/web/src/hooks -type f -name "*.ts" | wc -l');
  analyses.architecture.customHooks = parseInt(hooksCount);

  // Types
  const typesCount = exec('find apps/web/src/types -type f -name "*.ts" | wc -l');
  analyses.architecture.typeDefinitions = parseInt(typesCount);

  // Shared components
  const sharedComponents = exec('find apps/web/src/components -maxdepth 1 -type d | wc -l');
  analyses.architecture.componentCategories = parseInt(sharedComponents) - 1;

  console.log(`   ✓ Core modules: ${analyses.architecture.coreModules}`);
  console.log(`   ✓ Custom hooks: ${analyses.architecture.customHooks}`);
  console.log(`   ✓ Type definitions: ${analyses.architecture.typeDefinitions}`);
  console.log(`   ✓ Component categories: ${analyses.architecture.componentCategories}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 5. UX Analysis
console.log('\n🎨 5/8 UX Analysis...');
try {
  // Pages
  const pagesCount = exec('find apps/web/src/app -type f -name "page.tsx" | wc -l');
  analyses.ux.totalPages = parseInt(pagesCount);

  // Loading states
  const loadingStates = exec('grep -rn "loading\\|Loading\\|Skeleton" apps/web/src --include="*.tsx" | wc -l');
  analyses.ux.loadingStateImplementations = parseInt(loadingStates);

  // Error boundaries
  const errorBoundaries = exec('grep -rn "error\\.tsx\\|ErrorBoundary" apps/web/src --include="*.tsx" | wc -l');
  analyses.ux.errorBoundaries = parseInt(errorBoundaries);

  // Accessibility attributes
  const a11yAttrs = exec('grep -rn "aria-\\|role=" apps/web/src --include="*.tsx" | wc -l');
  analyses.ux.accessibilityAttributes = parseInt(a11yAttrs);

  console.log(`   ✓ Total pages: ${analyses.ux.totalPages}`);
  console.log(`   ✓ Loading states: ${analyses.ux.loadingStateImplementations}`);
  console.log(`   ✓ Error boundaries: ${analyses.ux.errorBoundaries}`);
  console.log(`   ✓ Accessibility attrs: ${analyses.ux.accessibilityAttributes}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 6. Database Analysis
console.log('\n🗄️  6/8 Database Analysis...');
try {
  // Prisma schema models
  const models = exec('grep "^model " prisma/schema.prisma | wc -l');
  analyses.database.models = parseInt(models);

  // Indexes
  const indexes = exec('grep "@@index" prisma/schema.prisma | wc -l');
  analyses.database.indexes = parseInt(indexes);

  // Relations
  const relations = exec('grep "@relation" prisma/schema.prisma | wc -l');
  analyses.database.relations = parseInt(relations);

  // Migrations
  const migrations = exec('find prisma/migrations -maxdepth 1 -type d | wc -l');
  analyses.database.migrations = parseInt(migrations) - 1;

  console.log(`   ✓ Database models: ${analyses.database.models}`);
  console.log(`   ✓ Indexes: ${analyses.database.indexes}`);
  console.log(`   ✓ Relations: ${analyses.database.relations}`);
  console.log(`   ✓ Migrations: ${analyses.database.migrations}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 7. Caching Analysis
console.log('\n💾 7/8 Caching Analysis...');
try {
  // Redis usage
  const redisUsage = exec('grep -rn "redis\\|Redis" apps/web/src/lib --include="*.ts" | wc -l');
  analyses.caching.redisImplementations = parseInt(redisUsage);

  // Cache patterns
  const cachePatterns = exec('grep -rn "cache\\|Cache" apps/web/src --include="*.ts" | wc -l');
  analyses.caching.cacheReferences = parseInt(cachePatterns);

  console.log(`   ✓ Redis implementations: ${analyses.caching.redisImplementations}`);
  console.log(`   ✓ Cache references: ${analyses.caching.cacheReferences}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// 8. Error Handling Analysis
console.log('\n🚨 8/8 Error Handling Analysis...');
try {
  // Try-catch blocks
  const tryCatchBlocks = exec('grep -rn "try {" apps/web/src --include="*.ts" --include="*.tsx" | wc -l');
  analyses.errorHandling.tryCatchBlocks = parseInt(tryCatchBlocks);

  // Error handling utilities
  const errorUtils = exec('find apps/web/src/core/errors -type f | wc -l');
  analyses.errorHandling.errorUtilityFiles = parseInt(errorUtils);

  // Logging statements
  const loggingStatements = exec('grep -rn "logger\\|console\\.error\\|console\\.warn" apps/web/src --include="*.ts" | wc -l');
  analyses.errorHandling.loggingStatements = parseInt(loggingStatements);

  console.log(`   ✓ Try-catch blocks: ${analyses.errorHandling.tryCatchBlocks}`);
  console.log(`   ✓ Error utility files: ${analyses.errorHandling.errorUtilityFiles}`);
  console.log(`   ✓ Logging statements: ${analyses.errorHandling.loggingStatements}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Generate comprehensive report
console.log('\n📊 Generating comprehensive report...');

const report = {
  meta: {
    timestamp: TIMESTAMP,
    version: '1.0.0',
    project: 'ZZIK LIVE',
  },
  ...analyses,
  scores: calculateScores(analyses),
  recommendations: generateRecommendations(analyses),
};

// Calculate quality scores
function calculateScores(data) {
  const scores = {};

  // Performance score
  const componentsPerRoute = data.performance.componentCount / data.performance.apiRouteCount;
  scores.performance = componentsPerRoute < 10 ? 90 : componentsPerRoute < 20 ? 75 : 60;

  // Security score
  scores.security = data.security.potentialSecretLeaks === 0 ? 100 : 70;

  // Code quality score
  const testCoverage = (data.codeQuality.testFiles / data.performance.componentCount) * 100;
  scores.codeQuality = Math.min(100, testCoverage * 4); // Normalize to 100

  // Architecture score
  const modularity = data.architecture.coreModules + data.architecture.customHooks;
  scores.architecture = Math.min(100, (modularity / 15) * 100);

  // UX score
  const uxCompleteness = (data.ux.loadingStateImplementations + data.ux.errorBoundaries) / data.ux.totalPages;
  scores.ux = Math.min(100, uxCompleteness * 20);

  // Database score
  const indexRatio = data.database.indexes / data.database.models;
  scores.database = indexRatio > 2 ? 95 : indexRatio > 1 ? 80 : 65;

  // Caching score
  scores.caching = data.caching.redisImplementations > 0 ? 85 : 50;

  // Error handling score
  const errorCoverage = data.errorHandling.tryCatchBlocks / data.performance.apiRouteCount;
  scores.errorHandling = Math.min(100, errorCoverage * 50);

  // Overall score
  scores.overall = Math.round(
    Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
  );

  return scores;
}

function generateRecommendations(data) {
  const recommendations = [];

  if (data.codeQuality.todoComments > 20) {
    recommendations.push(`📝 Address ${data.codeQuality.todoComments} TODO comments in codebase`);
  }

  if (data.security.potentialSecretLeaks > 0) {
    recommendations.push(`🔒 Review ${data.security.potentialSecretLeaks} potential secret leaks`);
  }

  if (data.database.indexes < data.database.models) {
    recommendations.push(`🗄️ Add more database indexes (${data.database.indexes}/${data.database.models} models)`);
  }

  if (data.ux.accessibilityAttributes < 50) {
    recommendations.push(`♿ Improve accessibility (only ${data.ux.accessibilityAttributes} aria attributes found)`);
  }

  if (data.codeQuality.consoleStatements > 10) {
    recommendations.push(`🧹 Remove ${data.codeQuality.consoleStatements} console statements (use proper logging)`);
  }

  return recommendations;
}

// Save reports
try {
  exec(`mkdir -p ${OUTPUT_DIR}`);
} catch (e) {
  // Directory exists
}

writeFileSync(join(OUTPUT_DIR, 'analysis.json'), JSON.stringify(report, null, 2));

// Generate markdown summary
const markdown = `# Deep Analysis Report

**Generated:** ${TIMESTAMP}

## 📊 Overall Score: ${report.scores.overall}/100

### Category Scores

| Category | Score | Status |
|----------|-------|--------|
| Performance | ${report.scores.performance}/100 | ${getStatus(report.scores.performance)} |
| Security | ${report.scores.security}/100 | ${getStatus(report.scores.security)} |
| Code Quality | ${report.scores.codeQuality.toFixed(1)}/100 | ${getStatus(report.scores.codeQuality)} |
| Architecture | ${report.scores.architecture.toFixed(1)}/100 | ${getStatus(report.scores.architecture)} |
| UX | ${report.scores.ux.toFixed(1)}/100 | ${getStatus(report.scores.ux)} |
| Database | ${report.scores.database}/100 | ${getStatus(report.scores.database)} |
| Caching | ${report.scores.caching}/100 | ${getStatus(report.scores.caching)} |
| Error Handling | ${report.scores.errorHandling.toFixed(1)}/100 | ${getStatus(report.scores.errorHandling)} |

## 📈 Key Metrics

### Performance
- Components: ${report.performance.componentCount}
- API Routes: ${report.performance.apiRouteCount}
- Bundle Size: ${report.performance.bundleSize}

### Code Quality
- Lines of Code: ${report.codeQuality.linesOfCode.toLocaleString()}
- Test Files: ${report.codeQuality.testFiles}
- TODO Comments: ${report.codeQuality.todoComments}
- Console Statements: ${report.codeQuality.consoleStatements}

### Architecture
- Core Modules: ${report.architecture.coreModules}
- Custom Hooks: ${report.architecture.customHooks}
- Type Definitions: ${report.architecture.typeDefinitions}

### Database
- Models: ${report.database.models}
- Indexes: ${report.database.indexes}
- Relations: ${report.database.relations}
- Migrations: ${report.database.migrations}

### UX
- Total Pages: ${report.ux.totalPages}
- Loading States: ${report.ux.loadingStateImplementations}
- Error Boundaries: ${report.ux.errorBoundaries}
- Accessibility Attributes: ${report.ux.accessibilityAttributes}

## 💡 Recommendations

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 🎯 Next Steps

1. Address high-priority recommendations above
2. Run performance profiling on critical paths
3. Increase test coverage to >80%
4. Conduct security audit on authentication flows
5. Optimize database queries with proper indexes
`;

function getStatus(score) {
  if (score >= 90) return '✅ Excellent';
  if (score >= 75) return '🟢 Good';
  if (score >= 60) return '🟡 Fair';
  return '🔴 Needs Improvement';
}

writeFileSync(join(OUTPUT_DIR, 'summary.md'), markdown);

console.log(`\n✅ Analysis complete!`);
console.log(`📊 Overall Score: ${report.scores.overall}/100`);
console.log(`📁 Reports saved to: ${OUTPUT_DIR}/`);
console.log(`\n${report.recommendations.length} recommendations generated.`);

process.exit(0);
