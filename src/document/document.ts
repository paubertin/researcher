import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { basename, extname, join } from 'path';
import { Document } from '@langchain/core/documents';
import { BaseDocumentLoader } from '@langchain/core/document_loaders/base';
import { readdir, stat } from 'fs/promises';
import { CustomError } from '../utils';

export class DocumentLoader {
  private _path: string;

  public constructor(path: string) {
    this._path = path;
  }

  public async load() {
    const tasks: Promise<Document<Record<string, any>>[]>[] = [];
    const files = await this._walk(this._path);

    for (const file of files) {
      const fileExtension = extname(file).replace('.', '');
      tasks.push(this._loadDocument(file, fileExtension));
    }

    const docs: { rawContent: string; url: string }[] = [];
    const pagesArray = await Promise.all(tasks);
    for (const pages of pagesArray) {
      for (const page of pages) {
        if (page.pageContent) {
          docs.push({
            rawContent: page.pageContent,
            url: basename(page.metadata.source)
          });
        }
      }
    }

    if (!docs.length) {
      throw new CustomError("Failed to load any documents!");
    }

    return docs;
  }

  private async _walk(dir: string) {
    let results: string[] = [];
    const list = await readdir(dir);
    for (const file of list) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      if (stats && stats.isDirectory()) {
        const res = await this._walk(filePath);
        results = results.concat(res);
      }
      else {
        results.push(filePath);
      }
    }
    return results;
  }

  private async _loadDocument(filePath: string, fileExtension: string) {
    let retData: Document[] = [];
    try {
      const loaderDict: { [key: string]: BaseDocumentLoader } = {
        "pdf": new PDFLoader(filePath),
        "txt": new TextLoader(filePath),
        "docx": new DocxLoader(filePath),
        "pptx": new PPTXLoader(filePath),
        "csv": new CSVLoader(filePath),
      };

      const loader = loaderDict[fileExtension];
      if (loader) {
        retData = await loader.load();
      }
    } catch (e) {
      console.error(`Failed to load document: ${filePath}`);
      console.error(e);
    }

    return retData;
  }
}