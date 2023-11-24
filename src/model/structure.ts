export interface DirectoryInformation {
    id: string;
    parentDirId: string | null;
    directoryName: string;
    baseSlug: string | null;
    owner: string | null;
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

export interface FileInformation {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    parentDirId: string | null;
    fileName: string;
    baseSlug: string | null;
    owner: string | null;
    fileSizeKB: number | null;
    renamedAt: Date | null;
    copiedAt: Date | null;
    editedAt: Date | null;
    changedAccessAt: Date | null;
}

export interface FileBasicInfo {
    id: string;
    baseSlug: string | null;
    fileName: string;
    fileSizeKB: number | null;
}
