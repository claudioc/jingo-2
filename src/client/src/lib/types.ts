// What returns back from creating and updating a doc
export interface IDocLocation {
  docName: string;
  wikiPath: string;
  docTitle: string;
  into: string;
}

// What is fetched from the server before creating a doc
export interface IDocForCreate extends IDocLocation {
  csrfToken: string;
  wikiIndex: string;
}

// What is fetched from the server before updating a doc
export interface IDocForUpdate extends IDocForCreate {
  content: string;
}

// What is fetched from the server before showing a doc
export interface IDoc {
  codeHighlighterTheme: string;
  content: string;
  html: string;
  dirName: string;
  docName: string;
  docTitle: string;
  docVersion: string;
  isIndex: boolean;
}

export type TFolder = {
  dirName: string;
  docList: string[];
  folderList: string[];
  folderName: string;
  parentDirname: string;
};

export interface IFolderLocation {
  folderName: string;
  folderPath: string;
  into: string;
}

export interface IFolderForCreate extends IFolderLocation {
  csrfToken: string;
}
