export interface FolderInformation {
    id: string | undefined;
}

export interface DirectoryBasicInfo {
    id: string;
    directoryName: string;
}

export interface RouterQuery {
    directoryName: string;
    parentDir?: RouterQuery;
}
