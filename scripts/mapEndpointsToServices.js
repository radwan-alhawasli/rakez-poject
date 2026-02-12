/**
 * Map Postman endpoints to existing service files
 * Identifies which endpoints are implemented and which are missing
 */

const fs = require('fs')
const path = require('path')

// Paths
const INVENTORY_PATH = path.join(__dirname, '..', 'docs', 'api-endpoints-inventory.json')
const SERVICES_DIR = path.join(__dirname, '..', 'src', 'services')
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'endpoint-coverage-report.json')

/**
 * Service file to module mapping patterns
 */
const SERVICE_PATTERNS = {
  'authService.js': {
    patterns: ['/login', '/logout', '/user'],
    module: 'Authentication & Users'
  },
  'userService.js': {
    patterns: ['/admin/employees', '/admin/employees/roles'],
    module: 'Authentication & Users'
  },
  'contractService.js': {
    patterns: ['/contracts', '/admin/contracts', '/second-party-data', '/contracts/units', '/photography-department', '/montage-department', '/boards-department', '/editor/contracts'],
    module: 'Contracts Management'
  },
  'salesService.js': {
    patterns: ['/sales'],
    module: 'Sales Department'
  },
  'hrService.js': {
    patterns: ['/hr', '/admin/employees/performance', '/admin/reports', '/teams'],
    module: 'HR Department'
  },
  'marketingService.js': {
    patterns: ['/marketing'],
    module: 'Marketing Department'
  },
  'aiService.js': {
    patterns: ['/ai'],
    module: 'AI Assistant'
  },
  'notificationService.js': {
    patterns: ['/notifications', '/user/notifications', '/admin/notifications'],
    module: 'Notifications'
  },
  'teamService.js': {
    patterns: ['/project_management/teams', '/project_teams'],
    module: 'Teams Management'
  }
}

/**
 * Read service file and extract API calls
 */
function extractServiceEndpoints(serviceFile) {
  const filePath = path.join(SERVICES_DIR, serviceFile)
  if (!fs.existsSync(filePath)) {
    return []
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const endpoints = []

  // Match apiClient.get/post/put/patch/delete calls
  const apiCallRegex = /apiClient\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g
  let match

  while ((match = apiCallRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase()
    const path = match[2]
    endpoints.push({ method, path })
  }

  return endpoints
}

/**
 * Normalize path for comparison
 */
function normalizePath(path) {
  // Remove leading/trailing slashes
  let normalized = path.replace(/^\/+|\/+$/g, '')
  // Replace variable placeholders
  normalized = normalized.replace(/\{\{(\w+)\}\}/g, ':$1')
  normalized = normalized.replace(/:(\w+)/g, ':id')
  return normalized
}

/**
 * Check if endpoint path matches service pattern
 */
function matchesPattern(endpointPath, patterns) {
  const normalizedEndpoint = normalizePath(endpointPath)
  
  return patterns.some(pattern => {
    const normalizedPattern = normalizePath(pattern)
    
    // Exact match
    if (normalizedEndpoint === normalizedPattern) {
      return true
    }
    
    // Starts with pattern
    if (normalizedEndpoint.startsWith(normalizedPattern)) {
      return true
    }
    
    // Pattern contains endpoint (for partial matches)
    if (normalizedPattern.includes(normalizedEndpoint.split('/')[0])) {
      return true
    }
    
    return false
  })
}

/**
 * Find matching service for an endpoint
 */
function findMatchingService(endpoint, serviceEndpoints, servicePatterns) {
  const endpointPath = endpoint.path
  const endpointMethod = endpoint.method

  // First, check if service file has exact endpoint
  for (const [serviceFile, data] of Object.entries(serviceEndpoints)) {
    const hasExactMatch = data.some(se => {
      const seNormalized = normalizePath(se.path)
      const epNormalized = normalizePath(endpointPath)
      
      // Exact match
      if (seNormalized === epNormalized && se.method === endpointMethod) {
        return true
      }
      
      // Match paths where endpoint path (without variable) matches service path (with variable)
      // e.g., /commissions/distributions matches /commissions/:id/distributions
      // or /exclusive-projects/approve matches /exclusive-projects/:id/approve
      if (epNormalized && se.method === endpointMethod) {
        const seParts = seNormalized.split('/').filter(p => p)
        const epParts = epNormalized.split('/').filter(p => p)
        
        // Try to match by removing variable segments from service path
        let seIndex = 0
        let epIndex = 0
        let match = true
        
        while (epIndex < epParts.length && seIndex < seParts.length) {
          if (epParts[epIndex] === seParts[seIndex]) {
            epIndex++
            seIndex++
          } else if (seParts[seIndex].startsWith(':')) {
            // Skip variable segment in service path
            seIndex++
          } else {
            match = false
            break
          }
        }
        
        // If we've matched all endpoint parts and service has no more non-variable parts
        if (match && epIndex === epParts.length) {
          // Check if remaining service parts are all variables
          while (seIndex < seParts.length) {
            if (!seParts[seIndex].startsWith(':')) {
              match = false
              break
            }
            seIndex++
          }
          if (match) {
            return true
          }
        }
      }
      
      return false
    })
    
    if (hasExactMatch) {
      return {
        serviceFile,
        matchType: 'exact',
        confidence: 'high'
      }
    }
  }

  // Then check pattern matching
  for (const [serviceFile, patterns] of Object.entries(servicePatterns)) {
    if (matchesPattern(endpointPath, patterns.patterns)) {
      return {
        serviceFile,
        matchType: 'pattern',
        confidence: 'medium'
      }
    }
  }

  // Check by module name
  const moduleName = endpoint.module || ''
  for (const [serviceFile, patterns] of Object.entries(servicePatterns)) {
    if (patterns.module && moduleName.includes(patterns.module.split(' ').pop())) {
      return {
        serviceFile,
        matchType: 'module',
        confidence: 'low'
      }
    }
  }

  return null
}

/**
 * Main mapping function
 */
function mapEndpointsToServices() {
  console.log('Reading endpoint inventory...')
  
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`Error: Inventory file not found at ${INVENTORY_PATH}`)
    console.error('Please run extractPostmanEndpoints.js first')
    process.exit(1)
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'))
  const endpoints = inventory.detailedEndpoints || []

  console.log(`Found ${endpoints.length} endpoints to map`)

  // Extract endpoints from service files
  console.log('\nReading service files...')
  const serviceFiles = fs.readdirSync(SERVICES_DIR).filter(f => f.endsWith('.js') && f !== 'pdfService.js')
  const serviceEndpoints = {}
  const servicePatterns = {}

  serviceFiles.forEach(serviceFile => {
    const endpoints = extractServiceEndpoints(serviceFile)
    serviceEndpoints[serviceFile] = endpoints
    
    if (SERVICE_PATTERNS[serviceFile]) {
      servicePatterns[serviceFile] = SERVICE_PATTERNS[serviceFile]
    }
    
    console.log(`  ${serviceFile}: ${endpoints.length} API calls found`)
  })

  // Map each endpoint
  console.log('\nMapping endpoints to services...')
  const mapped = []
  const unmapped = []
  const partial = []

  endpoints.forEach(endpoint => {
    const match = findMatchingService(endpoint, serviceEndpoints, servicePatterns)
    
    if (match) {
      mapped.push({
        endpoint: {
          id: endpoint.id,
          name: endpoint.name,
          method: endpoint.method,
          path: endpoint.path,
          module: endpoint.module
        },
        service: match.serviceFile,
        matchType: match.matchType,
        confidence: match.confidence
      })
    } else {
      unmapped.push({
        id: endpoint.id,
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        module: endpoint.module,
        description: endpoint.description
      })
    }
  })

  // Group by service
  const byService = {}
  mapped.forEach(item => {
    if (!byService[item.service]) {
      byService[item.service] = []
    }
    byService[item.service].push(item.endpoint)
  })

  // Group unmapped by module
  const unmappedByModule = {}
  unmapped.forEach(endpoint => {
    const module = endpoint.module || 'Unknown'
    if (!unmappedByModule[module]) {
      unmappedByModule[module] = []
    }
    unmappedByModule[module].push(endpoint)
  })

  // Calculate statistics
  const totalEndpoints = endpoints.length
  const mappedCount = mapped.length
  const unmappedCount = unmapped.length
  const coveragePercent = ((mappedCount / totalEndpoints) * 100).toFixed(2)

  // Create output
  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalEndpoints,
      mappedEndpoints: mappedCount,
      unmappedEndpoints: unmappedCount,
      coveragePercent: parseFloat(coveragePercent),
      servicesAnalyzed: serviceFiles.length
    },
    services: Object.keys(byService).map(serviceFile => ({
      serviceFile,
      endpointCount: byService[serviceFile].length,
      endpoints: byService[serviceFile]
    })),
    unmappedEndpoints: {
      total: unmappedCount,
      byModule: unmappedByModule,
      all: unmapped
    },
    recommendations: {
      missingServices: Object.keys(unmappedByModule).filter(module => {
        // Identify modules that likely need new service files
        const moduleEndpoints = unmappedByModule[module]
        return moduleEndpoints.length >= 5 // Modules with 5+ unmapped endpoints
      }),
      suggestedServiceFiles: [
        'creditService.js',
        'accountingService.js',
        'editorService.js',
        'exclusiveProjectService.js',
        'commissionService.js'
      ]
    }
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8')

  console.log(`\n✅ Mapping complete!`)
  console.log(`   Total endpoints: ${totalEndpoints}`)
  console.log(`   Mapped: ${mappedCount} (${coveragePercent}%)`)
  console.log(`   Unmapped: ${unmappedCount}`)
  console.log(`   Output: ${OUTPUT_PATH}`)
  
  console.log(`\n📊 Coverage by service:`)
  Object.keys(byService).forEach(service => {
    console.log(`   ${service}: ${byService[service].length} endpoints`)
  })
  
  console.log(`\n⚠️  Unmapped by module:`)
  Object.keys(unmappedByModule).forEach(module => {
    console.log(`   ${module}: ${unmappedByModule[module].length} endpoints`)
  })

  return output
}

// Run mapping
try {
  mapEndpointsToServices()
} catch (error) {
  console.error('Error mapping endpoints:', error)
  process.exit(1)
}
