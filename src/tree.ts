import { v4 as uuidv4 } from 'uuid'

export interface ExplorerItem {
  meta: ExplorerItemMetaData
  children: ExplorerItem[]
}
export interface ExplorerItemMetaData {
  id: string
  is_folder: boolean
  name: string
  file_extension: string
  full_name: string
}

export const tree: ExplorerItem[] = [
  {
    meta: {
      id: uuidv4(),
      is_folder: true,
      name: 'Pictures',
      file_extension: "folder",
      full_name: "Pictures.folder"
    },
    children: [
      {
        meta: {
          id: uuidv4(),
          is_folder: true,
          name: 'January',
          file_extension: "folder",
          full_name: "January.folder"
        },
        children: []
      },
      {
        meta: {
          id: uuidv4(),
          is_folder: true,
          name: 'Test',
          file_extension: "folder",
          full_name: "Test.folder"
        },
        children: []
      }
    ]
  },
  {
    meta: {
      id: uuidv4(),
      is_folder: true,
      name: 'Documents',
      file_extension: "folder",
      full_name: "Documents.folder"
    },
    children: []
  },
  {
    meta: {
      id: uuidv4(),
      is_folder: true,
      name: 'Music',
      file_extension: "folder",
      full_name: "Music.folder"
    },
    children: []
  },
  {
    meta: {
      id: uuidv4(),
      is_folder: false,
      name: 'notes',
      file_extension: "txt",
      full_name: "notes.txt"
    },
    children: []
  }
]