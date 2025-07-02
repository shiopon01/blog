import core from "@actions/core";
import { main } from "./google-docs-to-article.js";

main({
    googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    outputDirectoryPath: "src/content/blog"
}).catch(core.setFailed);
