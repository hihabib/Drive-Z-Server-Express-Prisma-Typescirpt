export interface DirectoryInformation {
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

export interface IFileAndDirectory {
    id: string;
    fileName: string;
}
