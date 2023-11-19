import fs from "fs-extra";

(async (): Promise<void> => {
    await fs.rm("userData/zerin.png", {
        recursive: true,
    });
})().catch((error) => {
    console.log(error);
});
