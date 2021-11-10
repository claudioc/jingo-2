export type TDoc = {
  codeHighlighterTheme: string;
  content: string;
  rawContent: string;
  dirName: string;
  docName: string;
  docTitle: string;
  docVersion: string;
  isIndex: boolean;
};

export type TFolder = {
  dirName: string;
  docList: string[];
  folderList: string[];
  folderName: string;
  parentDirname: string;
};
