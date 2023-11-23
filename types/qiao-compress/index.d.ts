export type CompressType = "zip" | "gzip" | "tar" | "tgz";

export declare function compressFolder(
    compressType: CompressType,
    sourceDirectory: string,
    destPath: string,
    onSuccess?: () => void,
    onFail?: (error: Error) => void,
): void;
