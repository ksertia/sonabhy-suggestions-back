/**
 * File System Mock
 * Provides mock implementations for fs operations
 */

const mockFs = {
  promises: {
    unlink: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('mock file content')),
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    rmdir: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false,
      size: 1024,
    }),
  },
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock file content')),
  writeFileSync: jest.fn(),
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn(),
    on: jest.fn(),
  }),
  createWriteStream: jest.fn().mockReturnValue({
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  }),
};

// Helper to reset all mocks
mockFs.resetMocks = () => {
  Object.keys(mockFs.promises).forEach((method) => {
    if (typeof mockFs.promises[method].mockReset === 'function') {
      mockFs.promises[method].mockReset();
      // Re-apply default implementations
      if (method === 'unlink') mockFs.promises[method].mockResolvedValue(undefined);
      if (method === 'access') mockFs.promises[method].mockResolvedValue(undefined);
      if (method === 'readFile') mockFs.promises[method].mockResolvedValue(Buffer.from('mock file content'));
    }
  });
  
  Object.keys(mockFs).forEach((method) => {
    if (method !== 'promises' && method !== 'resetMocks' && typeof mockFs[method].mockReset === 'function') {
      mockFs[method].mockReset();
      // Re-apply default implementations
      if (method === 'existsSync') mockFs[method].mockReturnValue(true);
      if (method === 'readFileSync') mockFs[method].mockReturnValue(Buffer.from('mock file content'));
    }
  });
};

module.exports = mockFs;
