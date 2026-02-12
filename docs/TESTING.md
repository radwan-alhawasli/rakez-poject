# Testing Guide

This document provides comprehensive information about testing in the Rakez ERP project.

## Overview

The project uses **Vitest** as the test runner with **axios-mock-adapter** for API mocking. All API service files have corresponding test files that verify endpoint integration.

## Test Structure

```
tests/
├── setup.js                    # Test environment setup
├── fixtures/                   # Test data fixtures
│   ├── authFixtures.js
│   ├── userFixtures.js
│   └── contractFixtures.js
├── utils/                      # Test utilities
│   ├── apiMockFactory.js      # API mocking utilities
│   └── testHelpers.js         # Common test helpers
├── services/                   # Service tests
│   ├── authService.test.js
│   ├── userService.test.js
│   ├── contractService.test.js
│   └── ...
└── integration/                # Integration tests
    └── api-integration.test.js
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests and generate coverage
```bash
npm run test:coverage
```

### Run tests once (CI mode)
```bash
npm run test:run
```

## Writing Tests

### Service Test Example

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApiMock, createSuccessResponse, resetMocks, restoreMocks } from '../utils/apiMockFactory'
import myService from '../../src/services/myService'

describe('myService', () => {
  let mock

  beforeEach(() => {
    mock = createApiMock()
  })

  afterEach(() => {
    resetMocks(mock)
    restoreMocks(mock)
  })

  it('should fetch data', async () => {
    mock.onGet('/api/endpoint').reply(createSuccessResponse({ data: 'test' }))
    
    const result = await myService.getData()
    
    expect(result).toBeDefined()
    expect(mock.history.get.length).toBe(1)
  })
})
```

### Test Patterns

1. **Happy Path Tests**: Test successful API calls
2. **Error Handling**: Test error scenarios (4xx, 5xx)
3. **Request Validation**: Verify correct method, URL, headers, body
4. **Response Transformation**: Test data mapping and normalization
5. **Edge Cases**: Empty responses, null values, malformed data

## Test Utilities

### API Mock Factory

```javascript
import { createApiMock, createSuccessResponse, createErrorResponse } from '../utils/apiMockFactory'

const mock = createApiMock()

// Mock successful response
mock.onGet('/api/data').reply(createSuccessResponse({ data: 'test' }))

// Mock error response
mock.onPost('/api/data').reply(createErrorResponse('Error message', 400))
```

### Test Helpers

```javascript
import { createMockUser, createApiResponse, waitForUpdate } from '../utils/testHelpers'

const user = createMockUser({ email: 'test@example.com' })
const response = createApiResponse({ data: 'test' })
await waitForUpdate()
```

## Test Fixtures

Test fixtures are located in `tests/fixtures/` and provide reusable test data:

- `authFixtures.js` - Authentication test data
- `userFixtures.js` - User/Employee test data
- `contractFixtures.js` - Contract test data

## Coverage Requirements

- **Minimum Coverage**: 80% for all service files
- **Target Coverage**: 90%+
- **Critical Services**: 100% coverage (auth, payments, etc.)

## Integration Tests

Integration tests are located in `tests/integration/` and test against actual API endpoints.

**Note**: Integration tests require:
- Running API server
- Environment variables configured
- Test credentials set up

Set these environment variables:
```bash
VITE_API_BASE_URL=https://api.test.example.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword
```

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Troubleshooting

### Tests not running
- Ensure dependencies are installed: `npm install`
- Check Vitest configuration in `vitest.config.js`

### Mock not working
- Verify mock adapter is created in `beforeEach`
- Check that mocks are reset in `afterEach`
- Ensure correct API endpoint paths

### Coverage not generating
- Run `npm run test:coverage`
- Check `vitest.config.js` coverage configuration
- Verify files are not excluded in coverage config

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Dependencies**: Mock API calls, not internal logic
3. **Use Fixtures**: Reuse test data from fixtures
4. **Test Edge Cases**: Include error scenarios and edge cases
5. **Keep Tests Fast**: Mock slow operations
6. **Clear Test Names**: Use descriptive test names
7. **Arrange-Act-Assert**: Follow AAA pattern

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Axios Mock Adapter](https://github.com/ctimmerm/axios-mock-adapter)
- [Vue Test Utils](https://test-utils.vuejs.org/)
