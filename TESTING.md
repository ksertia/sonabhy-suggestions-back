# Testing Documentation

## Overview

This project uses **Jest** as the testing framework with comprehensive test coverage for all major modules.

## Test Structure

```
tests/
├── setup.js                          # Global test setup
├── mocks/
│   ├── prisma.mock.js               # Prisma client mock
│   └── fs.mock.js                   # File system mock
├── auth/
│   └── auth.service.test.js         # Auth module tests
├── ideas/
│   └── idea.service.test.js         # Idea module tests
├── forms/
│   └── form.service.test.js         # Dynamic form tests
├── files/
│   └── file.service.test.js         # File upload tests
└── dashboard/
    └── dashboard.service.test.js    # Dashboard stats tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- tests/auth/auth.service.test.js
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should create idea"
```

## Test Coverage

Current coverage targets:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## Mocks

### Prisma Mock

The Prisma client is mocked to avoid database connections during tests.

**Location**: `tests/mocks/prisma.mock.js`

**Usage**:
```javascript
const mockPrisma = require('../mocks/prisma.mock');

// Mock a Prisma operation
mockPrisma.user.findUnique.mockResolvedValue({
  id: 'user-id',
  email: 'test@example.com',
});

// Reset mocks between tests
beforeEach(() => {
  mockPrisma.resetMocks();
});
```

**Available Methods**:
- `create`, `findUnique`, `findMany`, `update`, `delete`
- `count`, `groupBy`, `aggregate`
- `$transaction`

### File System Mock

The `fs` module is mocked to avoid actual file operations.

**Location**: `tests/mocks/fs.mock.js`

**Usage**:
```javascript
const mockFs = require('../mocks/fs.mock');

// Mock file operations
mockFs.promises.unlink.mockResolvedValue(undefined);
mockFs.promises.access.mockResolvedValue(undefined);

// Reset mocks between tests
beforeEach(() => {
  mockFs.resetMocks();
});
```

**Available Methods**:
- `promises.unlink`, `promises.access`, `promises.readFile`
- `existsSync`, `mkdirSync`, `unlinkSync`
- `createReadStream`, `createWriteStream`

## Test Modules

### 1. Auth Module Tests

**File**: `tests/auth/auth.service.test.js`

**Coverage**:
- ✅ User registration
- ✅ User login
- ✅ Token refresh
- ✅ User logout
- ✅ Get user profile
- ✅ Error handling (duplicate email, invalid credentials, expired tokens)

**Example**:
```javascript
describe('register', () => {
  it('should register a new user successfully', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(mockUser);

    const result = await authService.register(registerData);

    expect(result.user).toEqual(mockUser);
    expect(result.accessToken).toBeDefined();
  });
});
```

### 2. Idea Module Tests

**File**: `tests/ideas/idea.service.test.js`

**Coverage**:
- ✅ Create idea
- ✅ Get all ideas (with pagination & filtering)
- ✅ Get idea by ID
- ✅ Update idea
- ✅ Delete idea
- ✅ Change idea status
- ✅ Role-based permissions (USER, MANAGER, ADMIN)

**Example**:
```javascript
describe('createIdea', () => {
  it('should create idea successfully', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-id' });
    mockPrisma.status.findUnique.mockResolvedValue({ id: 'status-id' });
    mockPrisma.idea.create.mockResolvedValue(mockIdea);

    const result = await ideaService.createIdea(ideaData, mockUser);

    expect(result).toEqual(mockIdea);
  });
});
```

### 3. Dynamic Form Module Tests

**File**: `tests/forms/form.service.test.js`

**Coverage**:
- ✅ Create form model
- ✅ Create form variant
- ✅ Create form field
- ✅ Get form structure
- ✅ Validate form submission
- ✅ Reorder fields
- ✅ Bulk create fields
- ✅ Field type validation (TEXT, EMAIL, NUMBER, SELECT, etc.)
- ✅ Dynamic validation logic

**Example**:
```javascript
describe('validateFormSubmission', () => {
  it('should validate submission successfully', async () => {
    mockPrisma.formVariant.findUnique.mockResolvedValue(mockVariant);

    const result = await formService.validateFormSubmission('variant-id', submission);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### 4. File Upload Module Tests

**File**: `tests/files/file.service.test.js`

**Coverage**:
- ✅ Upload single file
- ✅ Upload multiple files
- ✅ Get files (with pagination & filtering)
- ✅ Get file by ID
- ✅ Download file
- ✅ Delete file (with FS cleanup)
- ✅ Get file statistics
- ✅ File system operations (mocked)

**Example**:
```javascript
describe('deleteFile', () => {
  it('should delete file successfully', async () => {
    mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFile);
    mockFs.promises.unlink.mockResolvedValue(undefined);
    mockPrisma.fileMetadata.delete.mockResolvedValue(mockFile);

    const result = await fileService.deleteFile('file-id', mockUser);

    expect(mockFs.promises.unlink).toHaveBeenCalled();
    expect(result.message).toBe('File deleted successfully');
  });
});
```

### 5. Dashboard Stats Module Tests

**File**: `tests/dashboard/dashboard.service.test.js`

**Coverage**:
- ✅ Get overview statistics
- ✅ Get monthly trends
- ✅ Get top categories
- ✅ Get status distribution
- ✅ Get plan actions progress
- ✅ Get ideas transformed percentage
- ✅ Get user dashboard
- ✅ Get admin dashboard
- ✅ Role-based access control

**Example**:
```javascript
describe('getOverviewStats', () => {
  it('should get overview stats successfully', async () => {
    mockPrisma.idea.count.mockResolvedValue(15);
    mockPrisma.idea.groupBy.mockResolvedValue(mockCategories);

    const result = await dashboardService.getOverviewStats(mockAdmin, {});

    expect(result.totalIdeas).toBe(15);
    expect(result.ideasByCategory).toHaveLength(2);
  });
});
```

## Best Practices

### 1. Test Isolation
Each test should be independent and not rely on other tests.

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.resetMocks();
  mockFs.resetMocks();
});
```

### 2. Descriptive Test Names
Use clear, descriptive test names that explain what is being tested.

```javascript
it('should throw error if USER tries to access others idea', async () => {
  // Test implementation
});
```

### 3. Arrange-Act-Assert Pattern
Structure tests with clear sections:

```javascript
it('should create idea successfully', async () => {
  // Arrange
  const ideaData = { title: 'Test', categoryId: 'cat-id' };
  mockPrisma.idea.create.mockResolvedValue(mockIdea);

  // Act
  const result = await ideaService.createIdea(ideaData, mockUser);

  // Assert
  expect(result).toEqual(mockIdea);
  expect(mockPrisma.idea.create).toHaveBeenCalled();
});
```

### 4. Test Both Success and Error Cases
Always test both happy paths and error scenarios.

```javascript
it('should create user successfully', async () => {
  // Success case
});

it('should throw error if email already exists', async () => {
  // Error case
});
```

### 5. Mock External Dependencies
Always mock external dependencies (database, file system, APIs).

```javascript
jest.mock('../../src/config/database', () => mockPrisma);
jest.mock('fs', () => mockFs);
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
```

## Troubleshooting

### Tests Failing

1. **Clear Jest cache**:
   ```bash
   npm test -- --clearCache
   ```

2. **Run tests in band (sequentially)**:
   ```bash
   npm test -- --runInBand
   ```

3. **Enable verbose output**:
   ```bash
   npm test -- --verbose
   ```

### Mock Issues

1. **Reset mocks between tests**:
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

2. **Check mock implementations**:
   ```javascript
   console.log(mockPrisma.user.findUnique.mock.calls);
   ```

## Adding New Tests

### 1. Create Test File
```bash
touch tests/module-name/module.service.test.js
```

### 2. Basic Test Template
```javascript
const mockPrisma = require('../mocks/prisma.mock');
jest.mock('../../src/config/database', () => mockPrisma);

const moduleService = require('../../src/modules/module-name/module.service');

describe('Module Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.resetMocks();
  });

  describe('methodName', () => {
    it('should do something successfully', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 3. Run New Tests
```bash
npm test -- tests/module-name/module.service.test.js
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Mocking with Jest](https://jestjs.io/docs/mock-functions)

## Summary

✅ **5 Test Suites** covering all major modules
✅ **Prisma Mock** for database operations
✅ **FS Mock** for file system operations
✅ **70%+ Coverage** target for all metrics
✅ **Role-Based Testing** for permissions
✅ **Error Scenario Testing** for robustness

Run `npm test` to execute all tests! 🚀
