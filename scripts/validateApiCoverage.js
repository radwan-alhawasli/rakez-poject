/**
 * Validate API Coverage
 * Compares Postman collection endpoints with test coverage
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const INVENTORY_PATH = path.join(__dirname, '..', 'docs', 'api-endpoints-inventory.json')
const COVERAGE_REPORT_PATH = path.join(__dirname, '..', 'docs', 'endpoint-coverage-report.json')
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'test-coverage-validation.json')

/**
 * Get test files
 */
function getTestFiles() {
  const testsDir = path.join(__dirname, '..', 'tests', 'services')
  if (!fs.existsSync(testsDir)) {
    return []
  }

  return fs.readdirSync(testsDir)
    .filter(file => file.endsWith('.test.js'))
    .map(file => ({
      name: file,
      path: path.join(testsDir, file),
      service: file.replace('.test.js', '')
    }))
}

/**
 * Extract tested endpoints from test file
 */
function extractTestedEndpoints(testFilePath) {
  if (!fs.existsSync(testFilePath)) {
    return []
  }

  const content = fs.readFileSync(testFilePath, 'utf8')
  const endpoints = []

  // Match API call patterns in tests
  const patterns = [
    /mock\.on(GET|POST|PUT|PATCH|DELETE)\(['"`]([^'"`]+)['"`]\)/g,
    /apiClient\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g
  ]

  patterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      const method = match[1]?.toUpperCase() || match[1]
      const path = match[2]
      endpoints.push({ method, path })
    }
  })

  return endpoints
}

/**
 * Normalize path for comparison
 */
function normalizePath(path) {
  return path
    .replace(/^\/+|\/+$/g, '')
    .replace(/\{\{(\w+)\}\}/g, ':id')
    .replace(/:(\w+)/g, ':id')
}

/**
 * Match endpoint to test
 */
function endpointMatchesTest(endpoint, testedEndpoints) {
  const normalizedEndpoint = normalizePath(endpoint.path)
  const normalizedMethod = endpoint.method.toUpperCase()

  return testedEndpoints.some(test => {
    const normalizedTest = normalizePath(test.path)
    return normalizedEndpoint === normalizedTest && 
           normalizedMethod === test.method.toUpperCase()
  })
}

/**
 * Main validation function
 */
function validateCoverage() {
  console.log('Reading endpoint inventory...')
  
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error('Error: Inventory file not found. Run extractPostmanEndpoints.js first.')
    process.exit(1)
  }

  if (!fs.existsSync(COVERAGE_REPORT_PATH)) {
    console.error('Error: Coverage report not found. Run mapEndpointsToServices.js first.')
    process.exit(1)
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'))
  const coverage = JSON.parse(fs.readFileSync(COVERAGE_REPORT_PATH, 'utf8'))
  const endpoints = inventory.detailedEndpoints || []

  console.log('Reading test files...')
  const testFiles = getTestFiles()
  console.log(`Found ${testFiles.length} test files`)

  // Extract tested endpoints from each test file
  const testedEndpointsByService = {}
  testFiles.forEach(testFile => {
    const testedEndpoints = extractTestedEndpoints(testFile.path)
    testedEndpointsByService[testFile.service] = testedEndpoints
    console.log(`  ${testFile.name}: ${testedEndpoints.length} endpoints tested`)
  })

  // Match endpoints to tests
  const endpointsWithTests = []
  const endpointsWithoutTests = []

  endpoints.forEach(endpoint => {
    const serviceMatch = coverage.services.find(s => 
      s.endpoints.some(e => e.id === endpoint.id)
    )

    if (serviceMatch) {
      const serviceName = serviceMatch.serviceFile.replace('.js', '')
      const testedEndpoints = testedEndpointsByService[serviceName] || []
      
      if (endpointMatchesTest(endpoint, testedEndpoints)) {
        endpointsWithTests.push({
          ...endpoint,
          service: serviceName,
          testFile: `${serviceName}.test.js`
        })
      } else {
        endpointsWithoutTests.push({
          ...endpoint,
          service: serviceName,
          testFile: `${serviceName}.test.js`,
          reason: 'No matching test found'
        })
      }
    } else {
      endpointsWithoutTests.push({
        ...endpoint,
        reason: 'No service file found'
      })
    }
  })

  // Calculate statistics
  const totalEndpoints = endpoints.length
  const testedCount = endpointsWithTests.length
  const untestedCount = endpointsWithoutTests.length
  const testCoveragePercent = ((testedCount / totalEndpoints) * 100).toFixed(2)

  // Group by service
  const coverageByService = {}
  endpointsWithTests.forEach(endpoint => {
    const service = endpoint.service || 'unknown'
    if (!coverageByService[service]) {
      coverageByService[service] = { tested: 0, total: 0 }
    }
    coverageByService[service].tested++
  })

  coverage.services.forEach(service => {
    const serviceName = service.serviceFile.replace('.js', '')
    if (!coverageByService[serviceName]) {
      coverageByService[serviceName] = { tested: 0, total: 0 }
    }
    coverageByService[serviceName].total = service.endpointCount
  })

  // Create output
  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalEndpoints,
      testedEndpoints: testedCount,
      untestedEndpoints: untestedCount,
      testCoveragePercent: parseFloat(testCoveragePercent),
      testFiles: testFiles.length
    },
    coverageByService,
    endpointsWithTests: endpointsWithTests.map(e => ({
      id: e.id,
      name: e.name,
      method: e.method,
      path: e.path,
      service: e.service,
      testFile: e.testFile
    })),
    endpointsWithoutTests: endpointsWithoutTests.map(e => ({
      id: e.id,
      name: e.name,
      method: e.method,
      path: e.path,
      service: e.service,
      testFile: e.testFile,
      reason: e.reason
    }))
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8')

  console.log(`\n✅ Validation complete!`)
  console.log(`   Total endpoints: ${totalEndpoints}`)
  console.log(`   Tested: ${testedCount} (${testCoveragePercent}%)`)
  console.log(`   Untested: ${untestedCount}`)
  console.log(`   Output: ${OUTPUT_PATH}`)

  console.log(`\n📊 Test Coverage by Service:`)
  Object.keys(coverageByService).forEach(service => {
    const { tested, total } = coverageByService[service]
    const percent = total > 0 ? ((tested / total) * 100).toFixed(1) : 0
    console.log(`   ${service}: ${tested}/${total} (${percent}%)`)
  })

  return output
}

// Run validation
try {
  validateCoverage()
} catch (error) {
  console.error('Error validating coverage:', error)
  process.exit(1)
}
