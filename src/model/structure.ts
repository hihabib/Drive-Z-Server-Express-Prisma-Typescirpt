export interface DirectoryInformation {
    id: string;
    parentDirId: string | null;
    directoryName: string;
    baseSlug: string | null;
    directorySizeKB: number | null;
    renamedAt: Date | null;
    copiedAt: Date | null;
    editedAt: Date | null;
    changedAccessAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface DirectoryBasicInfo {
    id: string;
    directoryName: string;
    baseSlug: string | null;
}

export interface RouterQuery {
    directoryName: string;
    parentDir?: RouterQuery;
}

export interface FileBasicInfo {
    id: string;
    baseSlug: string | null;
    fileName: string;
    fileSizeKB: number | null;
}
