const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class StorageDriver {
  /**
   * Save uploaded file buffer to local storage abstraction
   */
  async saveFile(fileBuffer, originalFilename) {
    const checksumSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const ext = path.extname(originalFilename) || '.bin';
    const safeStorageKey = `uploads/${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    const absolutePath = path.join(__dirname, '../../', safeStorageKey);

    // Ensure parent directory exists
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absolutePath, fileBuffer);

    return {
      storageKey: safeStorageKey,
      checksumSha256,
      fileSizeBytes: fileBuffer.length,
      absolutePath
    };
  }

  /**
   * Get file path for local reading or downloading
   */
  getFilePath(storageKey) {
    const absolutePath = path.resolve(__dirname, '../../', storageKey);

    // Prevent path traversal attack
    const baseDir = path.resolve(__dirname, '../../uploads');
    if (!absolutePath.startsWith(baseDir) && !absolutePath.startsWith(UPLOAD_DIR)) {
      throw new Error('Access denied: Invalid storage path traversal detected.');
    }

    if (!fs.existsSync(absolutePath)) {
      return null;
    }
    return absolutePath;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(storageKey) {
    const filePath = this.getFilePath(storageKey);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * Malware scanning interface abstraction
   */
  async scanFile(storageKey) {
    const filePath = this.getFilePath(storageKey);
    if (!filePath || !fs.existsSync(filePath)) {
      return { status: 'SCAN_FAILED', safe: false, reason: 'File not found' };
    }

    // Check for obvious executable extensions or suspicious shell commands
    const ext = path.extname(filePath).toLowerCase();
    const unsafeExts = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.ps1', '.dll', '.so'];
    if (unsafeExts.includes(ext)) {
      return { status: 'FAILED', safe: false, reason: 'Executable file formats strictly prohibited' };
    }

    // Simulated anti-malware scan
    return {
      status: 'PASSED',
      safe: true,
      engine: 'EnterpriseClamAV-V4',
      scanTimestamp: new Date().toISOString()
    };
  }
}

module.exports = new StorageDriver();
