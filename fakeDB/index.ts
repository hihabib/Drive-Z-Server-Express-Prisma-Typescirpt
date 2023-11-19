import {FileAndDirectoryStructures, StorageDataOfAllUsers} from "../model/model";
import * as fs from "fs/promises";
import * as path from 'path'

interface IFakeDB {
    username:string;
    getFullTreeStructure: () => Promise<FileAndDirectoryStructures>
}
class FakeDB implements IFakeDB{
    private readonly storageStructureJSONPath:string;
    public username:string;
    constructor(username:string) {
        this.username = username;
        this.storageStructureJSONPath = path.join("fakeDB", "db.json")
    }

    public async getFullTreeStructure():Promise<FileAndDirectoryStructures>{
        const storageStructure:StorageDataOfAllUsers = JSON.parse(await fs.readFile(this.storageStructureJSONPath,'utf-8'))
        return storageStructure[this.username].files;
    }
}

export default FakeDB;