export type CompressType = 'tar' | 'gzip' | 'tgz' | 'zip';

export declare function compressFolder(
    compressType: CompressType,
    sourceFolder: string,
    destPath: string,
    onSuccess?: () => void,
    onFail?: (error: Error) => void
): void;