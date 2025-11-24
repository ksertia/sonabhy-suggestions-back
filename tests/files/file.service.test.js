/**
 * File Service Tests with FS Mocks
 */

const mockPrisma = require('../mocks/prisma.mock');
const mockFs = require('../mocks/fs.mock');

// Mock dependencies
jest.mock('../../src/config/database', () => mockPrisma);
jest.mock('fs', () => mockFs);

const fileService = require('../../src/modules/files/file.service');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../src/utils/errors');

describe('File Service', () => {
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    role: 'USER',
  };

  const mockAdmin = {
    id: 'admin-id',
    email: 'admin@example.com',
    firstname: 'Admin',
    lastname: 'User',
    role: 'ADMIN',
  };

  const mockFile = {
    originalname: 'test-file.pdf',
    filename: 'test-file-123456.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    path: '/uploads/test-file-123456.pdf',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.resetMocks();
    mockFs.resetMocks();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        originalName: mockFile.originalname,
        storageName: mockFile.filename,
        mimeType: mockFile.mimetype,
        size: mockFile.size,
        path: mockFile.path,
        uploadedById: mockUser.id,
        createdAt: new Date(),
      };

      mockPrisma.fileMetadata.create.mockResolvedValue(mockFileMetadata);

      const result = await fileService.uploadFile(mockFile, mockUser.id);

      expect(mockPrisma.fileMetadata.create).toHaveBeenCalledWith({
        data: {
          originalName: mockFile.originalname,
          storageName: mockFile.filename,
          mimeType: mockFile.mimetype,
          size: mockFile.size,
          path: mockFile.path,
          uploadedById: mockUser.id,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockFileMetadata);
    });

    it('should throw error if no file provided', async () => {
      await expect(fileService.uploadFile(null, mockUser.id)).rejects.toThrow(BadRequestError);
    });
  });

  describe('uploadMultipleFiles', () => {
    it('should upload multiple files successfully', async () => {
      const files = [
        { ...mockFile, filename: 'file-1.pdf' },
        { ...mockFile, filename: 'file-2.pdf' },
      ];

      const mockMetadata = files.map((f, i) => ({
        id: `file-${i}`,
        originalName: f.originalname,
        storageName: f.filename,
        uploadedById: mockUser.id,
      }));

      mockPrisma.fileMetadata.create
        .mockResolvedValueOnce(mockMetadata[0])
        .mockResolvedValueOnce(mockMetadata[1]);

      const result = await fileService.uploadMultipleFiles(files, mockUser.id);

      expect(mockPrisma.fileMetadata.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should throw error if no files provided', async () => {
      await expect(fileService.uploadMultipleFiles([], mockUser.id)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getFiles', () => {
    it('should get files with pagination', async () => {
      const mockFiles = [
        { id: 'file-1', originalName: 'file1.pdf', uploadedById: mockUser.id },
        { id: 'file-2', originalName: 'file2.pdf', uploadedById: mockUser.id },
      ];

      mockPrisma.fileMetadata.findMany.mockResolvedValue(mockFiles);
      mockPrisma.fileMetadata.count.mockResolvedValue(2);

      const result = await fileService.getFiles({}, { page: 1, limit: 10 }, mockUser);

      expect(mockPrisma.fileMetadata.findMany).toHaveBeenCalled();
      expect(mockPrisma.fileMetadata.count).toHaveBeenCalled();
      expect(result.files).toEqual(mockFiles);
      expect(result.pagination.total).toBe(2);
    });

    it('should restrict USER to see only their files', async () => {
      mockPrisma.fileMetadata.findMany.mockResolvedValue([]);
      mockPrisma.fileMetadata.count.mockResolvedValue(0);

      const filters = {};
      await fileService.getFiles(filters, { page: 1, limit: 10 }, mockUser);

      expect(filters.uploadedById).toBe(mockUser.id);
    });

    it('should allow ADMIN to see all files', async () => {
      mockPrisma.fileMetadata.findMany.mockResolvedValue([]);
      mockPrisma.fileMetadata.count.mockResolvedValue(0);

      const filters = {};
      await fileService.getFiles(filters, { page: 1, limit: 10 }, mockAdmin);

      expect(filters.uploadedById).toBeUndefined();
    });
  });

  describe('getFileById', () => {
    it('should get file by id successfully', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        originalName: 'test.pdf',
        uploadedById: mockUser.id,
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);

      const result = await fileService.getFileById('file-id', mockUser);

      expect(mockPrisma.fileMetadata.findUnique).toHaveBeenCalledWith({
        where: { id: 'file-id' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockFileMetadata);
    });

    it('should throw error if file not found', async () => {
      mockPrisma.fileMetadata.findUnique.mockResolvedValue(null);

      await expect(fileService.getFileById('non-existent-id', mockUser)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if USER tries to access others file', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        uploadedById: 'other-user-id',
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);

      await expect(fileService.getFileById('file-id', mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should allow ADMIN to access any file', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        uploadedById: 'other-user-id',
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);

      const result = await fileService.getFileById('file-id', mockAdmin);

      expect(result).toEqual(mockFileMetadata);
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        originalName: 'test.pdf',
        path: '/uploads/test.pdf',
        uploadedById: mockUser.id,
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);
      mockFs.promises.access.mockResolvedValue(undefined);

      const result = await fileService.downloadFile('file-id', mockUser);

      expect(mockFs.promises.access).toHaveBeenCalledWith(mockFileMetadata.path);
      expect(result).toEqual(mockFileMetadata);
    });

    it('should throw error if file not found on disk', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        path: '/uploads/test.pdf',
        uploadedById: mockUser.id,
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);
      mockFs.promises.access.mockRejectedValue(new Error('File not found'));

      await expect(fileService.downloadFile('file-id', mockUser)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        path: '/uploads/test.pdf',
        uploadedById: mockUser.id,
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);
      mockFs.promises.unlink.mockResolvedValue(undefined);
      mockPrisma.fileMetadata.delete.mockResolvedValue(mockFileMetadata);

      const result = await fileService.deleteFile('file-id', mockUser);

      expect(mockFs.promises.unlink).toHaveBeenCalledWith(mockFileMetadata.path);
      expect(mockPrisma.fileMetadata.delete).toHaveBeenCalledWith({
        where: { id: 'file-id' },
      });
      expect(result.message).toBe('File deleted successfully');
    });

    it('should delete from database even if physical file deletion fails', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        path: '/uploads/test.pdf',
        uploadedById: mockUser.id,
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);
      mockFs.promises.unlink.mockRejectedValue(new Error('File not found'));
      mockPrisma.fileMetadata.delete.mockResolvedValue(mockFileMetadata);

      const result = await fileService.deleteFile('file-id', mockUser);

      expect(mockPrisma.fileMetadata.delete).toHaveBeenCalled();
      expect(result.message).toBe('File deleted successfully');
    });

    it('should throw error if USER tries to delete others file', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        uploadedById: 'other-user-id',
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);

      await expect(fileService.deleteFile('file-id', mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should allow ADMIN to delete any file', async () => {
      const mockFileMetadata = {
        id: 'file-id',
        path: '/uploads/test.pdf',
        uploadedById: 'other-user-id',
      };

      mockPrisma.fileMetadata.findUnique.mockResolvedValue(mockFileMetadata);
      mockFs.promises.unlink.mockResolvedValue(undefined);
      mockPrisma.fileMetadata.delete.mockResolvedValue(mockFileMetadata);

      const result = await fileService.deleteFile('file-id', mockAdmin);

      expect(result.message).toBe('File deleted successfully');
    });
  });

  describe('getStats', () => {
    it('should get file statistics', async () => {
      const mockStats = {
        total: 10,
        byMimeType: [
          { mimeType: 'application/pdf', _count: 5 },
          { mimeType: 'image/jpeg', _count: 5 },
        ],
        totalSize: 10240,
      };

      mockPrisma.fileMetadata.count.mockResolvedValue(mockStats.total);
      mockPrisma.fileMetadata.groupBy.mockResolvedValue(mockStats.byMimeType);
      mockPrisma.fileMetadata.aggregate.mockResolvedValue({
        _sum: { size: mockStats.totalSize },
      });

      const result = await fileService.getStats(mockUser);

      expect(mockPrisma.fileMetadata.count).toHaveBeenCalled();
      expect(mockPrisma.fileMetadata.groupBy).toHaveBeenCalled();
      expect(mockPrisma.fileMetadata.aggregate).toHaveBeenCalled();
      expect(result.total).toBe(mockStats.total);
      expect(result.totalSize).toBe(mockStats.totalSize);
    });

    it('should get stats for USER (only their files)', async () => {
      mockPrisma.fileMetadata.count.mockResolvedValue(5);
      mockPrisma.fileMetadata.groupBy.mockResolvedValue([]);
      mockPrisma.fileMetadata.aggregate.mockResolvedValue({ _sum: { size: 5120 } });

      await fileService.getStats(mockUser);

      expect(mockPrisma.fileMetadata.count).toHaveBeenCalledWith({
        where: { uploadedById: mockUser.id },
      });
    });

    it('should get stats for ADMIN (all files)', async () => {
      mockPrisma.fileMetadata.count.mockResolvedValue(10);
      mockPrisma.fileMetadata.groupBy.mockResolvedValue([]);
      mockPrisma.fileMetadata.aggregate.mockResolvedValue({ _sum: { size: 10240 } });

      await fileService.getStats(mockAdmin);

      expect(mockPrisma.fileMetadata.count).toHaveBeenCalledWith({
        where: {},
      });
    });
  });
});
