"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLoader = void 0;
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const text_1 = require("langchain/document_loaders/fs/text");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const docx_1 = require("@langchain/community/document_loaders/fs/docx");
const pptx_1 = require("@langchain/community/document_loaders/fs/pptx");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const utils_1 = require("../utils");
class DocumentLoader {
    constructor(path) {
        this._path = path;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = [];
            const files = yield this._walk(this._path);
            for (const file of files) {
                const fileExtension = (0, path_1.extname)(file).replace('.', '');
                tasks.push(this._loadDocument(file, fileExtension));
            }
            const docs = [];
            const pagesArray = yield Promise.all(tasks);
            for (const pages of pagesArray) {
                for (const page of pages) {
                    if (page.pageContent) {
                        docs.push({
                            rawContent: page.pageContent,
                            url: (0, path_1.basename)(page.metadata.source)
                        });
                    }
                }
            }
            if (!docs.length) {
                throw new utils_1.CustomError("Failed to load any documents!");
            }
            return docs;
        });
    }
    _walk(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let results = [];
            const list = yield (0, promises_1.readdir)(dir);
            for (const file of list) {
                const filePath = (0, path_1.join)(dir, file);
                const stats = yield (0, promises_1.stat)(filePath);
                if (stats && stats.isDirectory()) {
                    const res = yield this._walk(filePath);
                    results = results.concat(res);
                }
                else {
                    results.push(filePath);
                }
            }
            return results;
        });
    }
    _loadDocument(filePath, fileExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            let retData = [];
            try {
                const loaderDict = {
                    "pdf": new pdf_1.PDFLoader(filePath),
                    "txt": new text_1.TextLoader(filePath),
                    "docx": new docx_1.DocxLoader(filePath),
                    "pptx": new pptx_1.PPTXLoader(filePath),
                    "csv": new csv_1.CSVLoader(filePath),
                };
                const loader = loaderDict[fileExtension];
                if (loader) {
                    retData = yield loader.load();
                }
            }
            catch (e) {
                console.error(`Failed to load document: ${filePath}`);
                console.error(e);
            }
            return retData;
        });
    }
}
exports.DocumentLoader = DocumentLoader;
