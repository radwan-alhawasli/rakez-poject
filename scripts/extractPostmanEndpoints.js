/**
 * Extract all endpoints from Postman collection JSON
 * Generates api-endpoints-inventory.json with all endpoint details
 */

const fs = require('fs')
const path = require('path')

// Path to Postman collection
const POSTMAN_COLLECTION_PATH = path.join(
  __dirname,
  '..',
  'postman',
  'collections',
  'RAKEZ ERP - Complete API Collection _249 Endpoints_.postman_collection.json'
)

// Output path
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'api-endpoints-inventory.json')

/**
 * Recursively extract endpoints from Postman collection items
 */
function extractEndpoints(items, parentPath = [], moduleName = '') {
  const endpoints = []

  if (!Array.isArray(items)) {
    return endpoints
  }

  for (const item of items) {
    // If item has a request, it's an endpoint
    if (item.request) {
      const url = item.request.url
      let path = ''
      let queryParams = []

      if (typeof url === 'string') {
        // Handle raw URL string
        path = url.replace('{{base_url}}', '').split('?')[0]
      } else if (url && url.path) {
        // Handle URL object
        if (Array.isArray(url.path)) {
          path = '/' + url.path
            .filter(p => !p.startsWith('{{') && !p.endsWith('}}'))
            .join('/')
            .replace(/\/+/g, '/')
        } else {
          path = url.path
        }

        // Extract query parameters
        if (url.query && Array.isArray(url.query)) {
          queryParams = url.query.map(q => ({
            key: q.key,
            value: q.value,
            description: q.description || ''
          }))
        }
      }

      // Extract request body
      let requestBody = null
      if (item.request.body) {
        if (item.request.body.mode === 'raw' && item.request.body.raw) {
          try {
            requestBody = JSON.parse(item.request.body.raw)
          } catch (e) {
            requestBody = item.request.body.raw
          }
        } else if (item.request.body.formdata) {
          requestBody = {
            mode: 'formdata',
            fields: item.request.body.formdata
          }
        }
      }

      // Extract response examples
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

      const endpoint = {
        id: item.id || '',
        name: item.name || '',
        method: item.request.method || 'GET',
        path: path,
        fullPath: path,
        queryParams: queryParams,
        description: item.request.description || item.description || '',
        requestBody: requestBody,
        headers: (item.request.header || []).map(h => ({
          key: h.key,
          value: h.value
        })),
        responses: responses,
        testScripts: testScripts,
        module: moduleName,
        modulePath: parentPath.join(' > ')
      }

      endpoints.push(endpoint)
    }

    // If item has nested items, recurse
    if (item.item && Array.isArray(item.item)) {
      const newPath = [...parentPath, item.name]
      const newModule = moduleName || item.name
      const nestedEndpoints = extractEndpoints(item.item, newPath, newModule)
      endpoints.push(...nestedEndpoints)
    }
  }

  return endpoints
}

/**
 * Main extraction function
 */
function extractAllEndpoints() {
  console.log('Reading Postman collection...')
  
  if (!fs.existsSync(POSTMAN_COLLECTION_PATH)) {
    console.error(`Error: Postman collection not found at ${POSTMAN_COLLECTION_PATH}`)
    process.exit(1)
  }

  const collectionData = JSON.parse(fs.readFileSync(POSTMAN_COLLECTION_PATH, 'utf8'))
  
  console.log(`Collection: ${collectionData.info.name}`)
  console.log(`Description: ${collectionData.info.description.substring(0, 100)}...`)

  // Extract all endpoints
  const endpoints = extractEndpoints(collectionData.item || [])

  // Group by module
  const modules = {}
  endpoints.forEach(endpoint => {
    const module = endpoint.module || 'Unknown'
    if (!modules[module]) {
      modules[module] = []
    }
    modules[module].push(endpoint)
  })

  // Create output structure
  const output = {
    collectionInfo: {
      name: collectionData.info.name,
      description: collectionData.info.description,
      version: collectionData.info.schema,
      extractedAt: new Date().toISOString()
    },
    summary: {
      totalEndpoints: endpoints.length,
      modules: Object.keys(modules).length,
      endpointsByModule: Object.keys(modules).reduce((acc, key) => {
        acc[key] = modules[key].length
        return acc
      }, {})
    },
    modules: modules,
    endpoints: endpoints.map(e => ({
      id: e.id,
      name: e.name,
      method: e.method,
      path: e.path,
      module: e.module,
      description: e.description.substring(0, 200) // Truncate for summary
    })),
    detailedEndpoints: endpoints
  }

  // Ensure docs directory exists
  const docsDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8')

  console.log(`\n✅ Extraction complete!`)
  console.log(`   Total endpoints: ${endpoints.length}`)
  console.log(`   Modules: ${Object.keys(modules).length}`)
  console.log(`   Output: ${OUTPUT_PATH}`)
  console.log(`\nModules breakdown:`)
  Object.keys(modules).forEach(module => {
    console.log(`   - ${module}: ${modules[module].length} endpoints`)
  })
}

// Run extraction
try {
  extractAllEndpoints()
} catch (error) {
  console.error('Error extracting endpoints:', error)
  process.exit(1)
}
