export type DirectoryStructure<T> = Record<string, T>;

export type FileAndDirectoryStructures = Array<
    string | DirectoryStructure<FileAndDirectoryStructures>
>;

export type StorageDataOfAllUsers = Record<
    string,
    {
        username: string;
        files: FileAndDirectoryStructures;
    }
>;

export interface HandleError extends Error {
    status?: number;
}
