/**
 * Comprehensive API Gap Analysis
 * Analyzes Postman collection vs service implementations and test coverage
 * Identifies missing endpoints, services, test scenarios, and response scenarios
 */

const fs = require('fs')
const path = require('path')

// Paths
const POSTMAN_COLLECTION_PATH = path.join(
  __dirname,
  '..',
  'postman',
  'collections',
  'RAKEZ ERP - Complete API Collection _249 Endpoints_.postman_collection.json'
)
const SERVICES_DIR = path.join(__dirname, '..', 'src', 'services')
const TESTS_DIR = path.join(__dirname, '..', 'tests', 'services')
const INVENTORY_PATH = path.join(__dirname, '..', 'docs', 'api-endpoints-inventory.json')
const OUTPUT_REPORT = path.join(__dirname, '..', 'docs', 'API_GAP_ANALYSIS_REPORT.md')
const OUTPUT_JSON = path.join(__dirname, '..', 'docs', 'api-gaps-detailed.json')

/**
 * Extract endpoints from Postman collection
 */
function extractPostmanEndpoints(collection) {
  const endpoints = []
  
  function traverse(items, parentPath = [], moduleName = '') {
    if (!Array.isArray(items)) return
    
    for (const item of items) {
      if (item.request) {
        // This is an endpoint
        const url = item.request.url
        let path = ''
        let queryParams = []
        
        if (typeof url === 'string') {
          path = url.replace('{{base_url}}', '').split('?')[0]
        } else if (url && url.path) {
          if (Array.isArray(url.path)) {
            path = '/' + url.path
              .filter(p => !p.startsWith('{{') && !p.endsWith('}}'))
              .join('/')
              .replace(/\/+/g, '/')
          } else {
            path = url.path
          }
          
          if (url.query && Array.isArray(url.query)) {
            queryParams = url.query.map(q => ({
              key: q.key,
              value: q.value
            }))
          }
        }
        
        // Extract responses
        const responses = []
        if (item.response && Array.isArray(item.response)) {
          item.response.forEach(resp => {
            let responseBody = null
            if (resp.body) {
              try {
                responseBody = JSON.parse(resp.body)
              } catch (e) {
                responseBody = resp.body
              }
            }
            responses.push({
              name: resp.name || 'Response',
              status: resp.status || '',
              code: resp.code || 200,
              body: responseBody
            })
          })
        }
        
        // Extract test scripts
        const testScripts = []
        if (item.event && Array.isArray(item.event)) {
          item.event.forEach(event => {
            if (event.listen === 'test' && event.script && event.script.exec) {
              testScripts.push(event.script.exec.join('\n'))
            }
          })
        }
        
        endpoints.push({
          id: item.id || '',
          name: item.name || '',
          method: item.request.method || 'GET',
          path: path,
          queryParams: queryParams,
          description: item.request.description || item.description || '',
          responses: responses,
          testScripts: testScripts,
          module: moduleName,
          modulePath: parentPath.join(' > ')
        })
      }
      
      // Recurse into nested items
      if (item.item && Array.isArray(item.item)) {
        const newPath = [...parentPath, item.name]
        const newModule = moduleName || item.name
        traverse(item.item, newPath, newModule)
      }
    }
  }
  
  traverse(collection.item || [])
  return endpoints
}

/**
 * Extract API calls from service files
 */
function extractServiceCalls(serviceFiles) {
  const serviceCalls = {}
  
  serviceFiles.forEach(serviceFile => {
    const filePath = path.join(SERVICES_DIR, serviceFile)
    if (!fs.existsSync(filePath)) {
      return
    }
    
    const content = fs.readFileSync(filePath, 'utf8')
    const calls = []
    
    // Match apiClient.get/post/put/patch/delete calls
    const apiCallRegex = /apiClient\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g
    let match
    
    while ((match = apiCallRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase()
      const path = match[2]
      calls.push({ method, path })
    }
    
    serviceCalls[serviceFile] = calls
  })
  
  return serviceCalls
}

/**
 * Extract test scenarios from test files
 */
function extractTestScenarios(testFiles) {
  const testScenarios = {}
  
  testFiles.forEach(testFile => {
    const filePath = path.join(TESTS_DIR, testFile)
    if (!fs.existsSync(filePath)) {
      return
    }
    
    const content = fs.readFileSync(filePath, 'utf8')
    const scenarios = {
      successTests: [],
      errorTests: [],
      edgeCaseTests: [],
      validationTests: [],
      authTests: []
    }
    
    // Extract test descriptions
    const testRegex = /(it|test)\(['"`]([^'"`]+)['"`]/g
    let match
    
    while ((match = testRegex.exec(content)) !== null) {
      const testName = match[2].toLowerCase()
      
      if (testName.includes('error') || testName.includes('fail') || testName.includes('invalid')) {
        scenarios.errorTests.push(testName)
      } else if (testName.includes('edge') || testName.includes('empty') || testName.includes('null')) {
        scenarios.edgeCaseTests.push(testName)
      } else if (testName.includes('valid') || testName.includes('should return')) {
        scenarios.validationTests.push(testName)
      } else if (testName.includes('auth') || testName.includes('login') || testName.includes('permission')) {
        scenarios.authTests.push(testName)
      } else {
        scenarios.successTests.push(testName)
      }
    }
    
    // Extract mock responses
    const mockResponses = []
    const mockRegex = /\.reply\((\d+)[,\s]*([^)]+)\)/g
    let mockMatch
    
    while ((mockMatch = mockRegex.exec(content)) !== null) {
      const statusCode = parseInt(mockMatch[1])
      mockResponses.push({ statusCode })
    }
    
    scenarios.mockResponses = mockResponses
    testScenarios[testFile] = scenarios
  })
  
  return testScenarios
}

/**
 * Normalize path for comparison
 */
function normalizePath(pathStr) {
  if (!pathStr) return ''
  let normalized = pathStr.replace(/^\/+|\/+$/g, '')
  // Replace Postman variables {{variable}} with :id
  normalized = normalized.replace(/\{\{(\w+)\}\}/g, ':id')
  // Replace all dynamic segments with :id for comparison
  normalized = normalized.replace(/:(\w+)/g, ':id')
  // Normalize multiple slashes
  normalized = normalized.replace(/\/+/g, '/')
  return normalized
}

/**
 * Check if endpoint matches service call
 */
function matchesEndpoint(endpoint, serviceCall) {
  const epPath = normalizePath(endpoint.path)
  const scPath = normalizePath(serviceCall.path)
  
  // Exact match
  if (epPath === scPath && endpoint.method === serviceCall.method) {
    return { match: true, type: 'exact', confidence: 1.0 }
  }
  
  // Path pattern match (ignoring IDs)
  const epParts = epPath.split('/').filter(p => p)
  const scParts = scPath.split('/').filter(p => p)
  
  if (epParts.length === scParts.length) {
    let matches = true
    let dynamicCount = 0
    for (let i = 0; i < epParts.length; i++) {
      const epPart = epParts[i]
      const scPart = scParts[i]
      
      if (epPart === scPart) {
        continue
      } else if (epPart.startsWith(':') || scPart.startsWith(':')) {
        dynamicCount++
        continue
      } else {
        matches = false
        break
      }
    }
    if (matches && endpoint.method === serviceCall.method) {
      const confidence = dynamicCount > 0 ? 0.8 : 0.9
      return { match: true, type: 'pattern', confidence }
    }
  }
  
  // Flexible match - check if paths are similar enough
  // Remove all dynamic segments and compare
  const epStatic = epParts.filter(p => !p.startsWith(':')).join('/')
  const scStatic = scParts.filter(p => !p.startsWith(':')).join('/')
  
  if (epStatic === scStatic && endpoint.method === serviceCall.method) {
    return { match: true, type: 'flexible', confidence: 0.7 }
  }
  
  // Check if one path contains the other (for nested routes)
  if (epPath.includes(scPath) || scPath.includes(epPath)) {
    if (endpoint.method === serviceCall.method) {
      return { match: true, type: 'nested', confidence: 0.6 }
    }
  }
  
  return { match: false, confidence: 0 }
}

/**
 * Identify gaps
 */
function identifyGaps(postmanEndpoints, serviceCalls, testScenarios) {
  const gaps = {
    endpointCount: {
      claimed: 249,
      actual: postmanEndpoints.length,
      discrepancy: 249 - postmanEndpoints.length
    },
    missingServices: [],
    missingEndpoints: [],
    missingTestScenarios: [],
    missingResponseScenarios: []
  }
  
  // Analyze endpoint count by module
  const moduleCounts = {}
  postmanEndpoints.forEach(ep => {
    const module = ep.module || 'Unknown'
    moduleCounts[module] = (moduleCounts[module] || 0) + 1
  })
  
  gaps.moduleCounts = moduleCounts
  
  // Check for missing services
  const expectedServices = {
    'creditService.js': { patterns: ['/credit'], module: 'Credit Department' },
    'accountingService.js': { patterns: ['/accounting'], module: 'Accounting Department' },
    'editorService.js': { patterns: ['/editor'], module: 'Editor Department' }
  }
  
  Object.keys(expectedServices).forEach(serviceFile => {
    if (!serviceCalls[serviceFile]) {
      gaps.missingServices.push({
        serviceFile,
        module: expectedServices[serviceFile].module,
        reason: 'Service file does not exist'
      })
    }
  })
  
  // Map endpoints to services
  const endpointMapping = []
  const unmappedEndpoints = []
  
  postmanEndpoints.forEach(endpoint => {
    let mapped = false
    
    for (const [serviceFile, calls] of Object.entries(serviceCalls)) {
      for (const call of calls) {
        const match = matchesEndpoint(endpoint, call)
        if (match.match) {
          endpointMapping.push({
            endpoint: {
              id: endpoint.id,
              name: endpoint.name,
              method: endpoint.method,
              path: endpoint.path,
              module: endpoint.module
            },
            service: serviceFile,
            matchType: match.type
          })
          mapped = true
          break
        }
      }
      if (mapped) break
    }
    
    if (!mapped) {
      unmappedEndpoints.push(endpoint)
    }
  })
  
  gaps.endpointMapping = endpointMapping
  gaps.unmappedEndpoints = unmappedEndpoints
  
  // Group unmapped by module
  const unmappedByModule = {}
  unmappedEndpoints.forEach(ep => {
    const module = ep.module || 'Unknown'
    if (!unmappedByModule[module]) {
      unmappedByModule[module] = []
    }
    unmappedByModule[module].push(ep)
  })
  gaps.unmappedByModule = unmappedByModule
  
  // Analyze test scenarios
  postmanEndpoints.forEach(endpoint => {
    const endpointPath = normalizePath(endpoint.path)
    const endpointModule = endpoint.module || ''
    
    // Find corresponding test file
    let testFile = null
    for (const [file, scenarios] of Object.entries(testScenarios)) {
      // Simple matching - could be improved
      if (file.includes(endpointModule.toLowerCase().split(' ')[0]) ||
          file.includes(endpointPath.split('/')[1])) {
        testFile = file
        break
      }
    }
    
    if (!testFile) {
      gaps.missingTestScenarios.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        module: endpoint.module,
        reason: 'No test file found'
      })
    } else {
      const scenarios = testScenarios[testFile]
      
      // Check for error test scenarios
      const hasErrorResponse = endpoint.responses.some(r => r.code >= 400)
      const hasErrorTest = scenarios.errorTests.length > 0
      
      if (hasErrorResponse && !hasErrorTest) {
        gaps.missingTestScenarios.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          module: endpoint.module,
          reason: 'Missing error test scenarios',
          missingTypes: ['error']
        })
      }
      
      // Check for response validation
      if (endpoint.responses.length > 0 && scenarios.validationTests.length === 0) {
        gaps.missingTestScenarios.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          module: endpoint.module,
          reason: 'Missing response validation tests'
        })
      }
    }
    
    // Analyze response scenarios
    const responseCodes = endpoint.responses.map(r => r.code)
    const uniqueCodes = [...new Set(responseCodes)]
    
    uniqueCodes.forEach(code => {
      const response = endpoint.responses.find(r => r.code === code)
      if (response) {
        // Check if this response is tested
        if (testFile && testScenarios[testFile]) {
          const mockCodes = testScenarios[testFile].mockResponses.map(m => m.statusCode)
          if (!mockCodes.includes(code)) {
            gaps.missingResponseScenarios.push({
              endpoint: endpoint.name,
              path: endpoint.path,
              module: endpoint.module,
              responseCode: code,
              responseName: response.name,
              reason: 'Response scenario not tested'
            })
          }
        }
      }
    })
  })
  
  return gaps
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(gaps) {
  let report = `# API Gap Analysis Report

**Generated:** ${new Date().toISOString()}

## Executive Summary

This report provides a comprehensive analysis of gaps between the Postman collection and the full API implementation, including missing endpoints, services, test scenarios, and response scenarios.

### Key Findings

- **Endpoint Count Discrepancy:** ${gaps.endpointCount.claimed} claimed vs ${gaps.endpointCount.actual} actual (${gaps.endpointCount.discrepancy} missing)
- **Missing Services:** ${gaps.missingServices.length} service files
- **Unmapped Endpoints:** ${gaps.unmappedEndpoints.length} endpoints
- **Missing Test Scenarios:** ${gaps.missingTestScenarios.length} scenarios
- **Missing Response Scenarios:** ${gaps.missingResponseScenarios.length} scenarios

---

## 1. Endpoint Count Analysis

### Discrepancy Details

| Metric | Value |
|--------|-------|
| Claimed Count | ${gaps.endpointCount.claimed} |
| Actual Count | ${gaps.endpointCount.actual} |
| Discrepancy | ${gaps.endpointCount.discrepancy} |

**Note:** The Postman collection claims ${gaps.endpointCount.claimed} endpoints, but the actual count is ${gaps.endpointCount.actual}. This suggests ${gaps.endpointCount.discrepancy} endpoint(s) may be missing or miscounted.

### Module Breakdown

| Module | Endpoint Count |
|--------|----------------|
${Object.entries(gaps.moduleCounts).map(([module, count]) => `| ${module} | ${count} |`).join('\n')}

---

## 2. Missing Service Files

The following service files are expected but do not exist:

${gaps.missingServices.map(service => `
### ${service.serviceFile}

- **Module:** ${service.module}
- **Reason:** ${service.reason}
- **Impact:** Endpoints in this module are not implemented in service layer
`).join('\n')}

---

## 3. Unmapped Endpoints

Total unmapped endpoints: **${gaps.unmappedEndpoints.length}**

These endpoints exist in the Postman collection but are not found in any service file:

### By Module

${Object.entries(gaps.unmappedByModule).map(([module, endpoints]) => `
#### ${module} (${endpoints.length} endpoints)

${endpoints.map(ep => `- **${ep.method}** \`${ep.path}\` - ${ep.name}`).join('\n')}
`).join('\n')}

---

## 4. Missing Test Scenarios

Total missing test scenarios: **${gaps.missingTestScenarios.length}**

### Issues Identified

${gaps.missingTestScenarios.slice(0, 20).map(test => `
- **${test.endpoint}** (\`${test.path}\`)
  - Module: ${test.module}
  - Reason: ${test.reason}
  ${test.missingTypes ? `- Missing Types: ${test.missingTypes.join(', ')}` : ''}
`).join('\n')}

${gaps.missingTestScenarios.length > 20 ? `\n*... and ${gaps.missingTestScenarios.length - 20} more*` : ''}

### Test Scenario Categories

- **Error Tests:** Missing error handling tests for endpoints with error responses
- **Edge Cases:** Missing tests for empty data, null values, invalid inputs
- **Response Validation:** Missing tests that validate response structure
- **Authentication:** Missing tests for auth/authorization scenarios

---

## 5. Missing Response Scenarios

Total missing response scenarios: **${gaps.missingResponseScenarios.length}**

These response scenarios are documented in Postman but not tested:

${gaps.missingResponseScenarios.slice(0, 20).map(resp => `
- **${resp.endpoint}** (\`${resp.path}\`)
  - Response Code: ${resp.responseCode}
  - Response Name: ${resp.responseName}
  - Module: ${resp.module}
`).join('\n')}

${gaps.missingResponseScenarios.length > 20 ? `\n*... and ${gaps.missingResponseScenarios.length - 20} more*` : ''}

---

## Recommendations

### High Priority

1. **Create Missing Service Files**
   ${gaps.missingServices.map(s => `- Create \`${s.serviceFile}\` for ${s.module}`).join('\n   ')}

2. **Implement Unmapped Endpoints**
   - Review unmapped endpoints and implement in appropriate service files
   - Priority: Modules with most unmapped endpoints

3. **Add Missing Test Scenarios**
   - Add error handling tests for all endpoints with error responses
   - Add edge case tests (empty data, null values, invalid inputs)
   - Add response validation tests

### Medium Priority

4. **Add Missing Response Scenarios**
   - Test all response codes documented in Postman
   - Validate response structure matches documentation

5. **Resolve Endpoint Count Discrepancy**
   - Verify the 2 missing endpoints
   - Update Postman collection description if needed

### Low Priority

6. **Improve Test Coverage**
   - Add integration tests
   - Add performance tests
   - Add security tests

---

## Next Steps

1. Review this report and prioritize gaps
2. Create missing service files
3. Implement unmapped endpoints
4. Add missing test scenarios
5. Validate response scenarios
6. Update documentation

---

**Report Generated:** ${new Date().toISOString()}
`

  return report
}

/**
 * Main analysis function
 */
function analyzeApiGaps() {
  console.log('🔍 Starting API Gap Analysis...\n')
  
  // Read Postman collection
  console.log('📖 Reading Postman collection...')
  if (!fs.existsSync(POSTMAN_COLLECTION_PATH)) {
    console.error(`❌ Error: Postman collection not found at ${POSTMAN_COLLECTION_PATH}`)
    process.exit(1)
  }
  
  const collection = JSON.parse(fs.readFileSync(POSTMAN_COLLECTION_PATH, 'utf8'))
  console.log(`   Collection: ${collection.info.name}`)
  
  // Extract endpoints
  console.log('\n📊 Extracting endpoints from Postman collection...')
  const postmanEndpoints = extractPostmanEndpoints(collection)
  console.log(`   Found ${postmanEndpoints.length} endpoints`)
  
  // Extract service calls
  console.log('\n🔧 Extracting API calls from service files...')
  const serviceFiles = fs.existsSync(SERVICES_DIR) 
    ? fs.readdirSync(SERVICES_DIR).filter(f => f.endsWith('.js') && f !== 'pdfService.js')
    : []
  const serviceCalls = extractServiceCalls(serviceFiles)
  console.log(`   Analyzed ${serviceFiles.length} service files`)
  serviceFiles.forEach(file => {
    console.log(`   - ${file}: ${serviceCalls[file]?.length || 0} API calls`)
  })
  
  // Extract test scenarios
  console.log('\n🧪 Extracting test scenarios from test files...')
  const testFiles = fs.existsSync(TESTS_DIR)
    ? fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.test.js'))
    : []
  const testScenarios = extractTestScenarios(testFiles)
  console.log(`   Analyzed ${testFiles.length} test files`)
  
  // Identify gaps
  console.log('\n🔎 Identifying gaps...')
  const gaps = identifyGaps(postmanEndpoints, serviceCalls, testScenarios)
  
  // Generate reports
  console.log('\n📝 Generating reports...')
  
  // Ensure docs directory exists
  const docsDir = path.dirname(OUTPUT_REPORT)
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(gaps)
  fs.writeFileSync(OUTPUT_REPORT, markdownReport, 'utf8')
  console.log(`   ✅ Markdown report: ${OUTPUT_REPORT}`)
  
  // Generate JSON report
  const jsonReport = {
    generatedAt: new Date().toISOString(),
    gaps: gaps
  }
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonReport, null, 2), 'utf8')
  console.log(`   ✅ JSON report: ${OUTPUT_JSON}`)
  
  // Summary
  console.log('\n✅ Analysis Complete!\n')
  console.log('Summary:')
  console.log(`   - Endpoint Count: ${gaps.endpointCount.actual} (claimed: ${gaps.endpointCount.claimed})`)
  console.log(`   - Missing Services: ${gaps.missingServices.length}`)
  console.log(`   - Unmapped Endpoints: ${gaps.unmappedEndpoints.length}`)
  console.log(`   - Missing Test Scenarios: ${gaps.missingTestScenarios.length}`)
  console.log(`   - Missing Response Scenarios: ${gaps.missingResponseScenarios.length}`)
  console.log(`\n📄 Full report: ${OUTPUT_REPORT}`)
}

// Run analysis
try {
  analyzeApiGaps()
} catch (error) {
  console.error('❌ Error during analysis:', error)
  process.exit(1)
}
