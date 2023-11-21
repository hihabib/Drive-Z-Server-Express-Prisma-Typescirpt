export type CompressType = "tar" | "gzip" | "tgz" | "zip";

export declare function compressDirectory(
    compressType: CompressType,
    sourceDirectory: string,
    destPath: string,
    onSuccess?: () => void,
    onFail?: (error: Error) => void,
): void;
