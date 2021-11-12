export type TDoc = {
  codeHighlighterTheme: string;
  content: string;
  html: string;
  dirName: string;
  docName: string;
  docTitle: string;
  docVersion: string;
  isIndex: boolean;
};

export type TDocUpdate = {
  content: string;
  csrfToken: string;
  docName: string;
  docTitle: string;
  into: string;
  wikiIndex: string;
};

export type TDocUpdated = {
  docName: string;
  into: string;
};

export type TFolder = {
  dirName: string;
  docList: string[];
  folderList: string[];
  folderName: string;
  parentDirname: string;
};
