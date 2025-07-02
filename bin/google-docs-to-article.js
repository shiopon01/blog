import fsPromises from 'fs/promises';
import { google } from 'googleapis';
import matter from 'gray-matter';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;

async function main({ googleDriveFolderId, outputDirectoryPath }) {
    // 認証設定
    const drive = google.drive({
        auth: new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        }),
        version: 'v3',
    });

    // Google Docsファイルを検索
    const response = await drive.files.list({
        q: `'${googleDriveFolderId}' in parents and mimeType = 'application/vnd.google-apps.document'`,
        fields: 'nextPageToken, files(id, name, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 1000,
    });

    // ファイル情報抽出
    const exportedFiles = await exportFiles({
        drive,
        files: response.data.files
    });

    // ファイルに書き込み
    writeExportedFiles({
        exportedFiles,
        outputDirectoryPath,
    });
}

async function exportFiles({ drive, files }) {
    return Promise.all(
        files.map(async (file) => {
            const data = await exportFile({
                drive,
                fileId: file.id,
            });
            return {
                ...file,
                data,
            };
        })
    );
}

async function exportFile({ drive, fileId }) {
    const response = await drive.files.export({
        fileId,
        mimeType: 'text/markdown',
    });
    return response.data;
}

async function writeExportedFiles({ exportedFiles, outputDirectoryPath }) {
    exportedFiles.forEach(async (exportedFile) => {
        if (!regex.exec(exportedFile.name)) {
            return;
        }

        const { body, meta, isDraft, isFuture } = convertMetadata(exportedFile);
        if (isDraft || isFuture) {
            return;
        }

        const cleanedBody = body
            .replaceAll('\\`', '`')
            .replaceAll('\\=', '=')
            .replaceAll('\\*', '*')
            .replaceAll('\\#', '#')
            .replaceAll('\\_', '_')
            .replaceAll('\\-', '-')
            .replaceAll('\\+', '+')
            .replaceAll('\\[', '[')
            .replaceAll('\\]', ']')
            .replaceAll('\\(', '(')
            .replaceAll('\\)', ')');

        await fsPromises.writeFile(
            `${outputDirectoryPath}/${exportedFile.name}.md`,
            matter.stringify(
                cleanedBody,
                meta
            )
        );
    });
}

function convertMetadata(exportedFile) {
    const pubDateFromFilename = regex.exec(exportedFile.name)[0];
    const pubDateObj = dayjs(pubDateFromFilename).tz('Asia/Tokyo');
    const today = dayjs().tz('Asia/Tokyo');

    const meta = {
        author: 'shiopon01',
        pubDate: pubDateObj.format('YYYY-MM-DD'),
        title: '',
        postSlug: exportedFile.name,
        tags: [],
        ogImage: '',
        description: ''
    };

    let isDraft = false;
    const isFuture = pubDateObj.isAfter(today, 'day');

    let bodyArr = exportedFile.data.split('\n');
    while (true) {
        if (bodyArr[0] === '') {
            break;
        }
        const property = bodyArr[0].split(':');
        const key = property[0].trim();
        let value = property[1].trim();
        switch (key) {
            case 'title':
            case 'ogImage':
            case 'description':
                meta[key] = value;
                break;
            case 'draft':
                isDraft = (value === 'true');
                break;
            case 'tags':
                meta[key] = value.split(',');
        }
        bodyArr.shift();
    }
    return {
        body: bodyArr.join('\n'),
        meta,
        isDraft,
        isFuture
    };
}

export { main };
