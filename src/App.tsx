import './App.css'
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { ExplorerItem, ExplorerItemMetaData, tree } from './tree'
import Button from '@mui/material/Button'
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Box, Breadcrumbs, Container, Icon, Typography } from '@mui/material'


type TreeStore = {
  currentPath: Path
  selectedItems: string[]
  setCurrentPath: (newPath: Path | string) => void
  addNodePath: (newPath: Path | string) => void
  backPath: () => void
  addItemToSelect: (item: string) => void
  selectOneItem: (item: string) => void
  clearSelected: () => void
  data: ExplorerItem[]
  addExplorerItem: (item: ExplorerItem) => void
}


class Path {
  private _path: string;

  public get path(): string {
    return this._path
  }

  constructor(path?: string) {
    this._path = path ?? '/'
  }

  concat(path: Path | string) {
    if (typeof path === 'string') this._path += path + '/'
    else this._path += path.path + '/'
    return this
  }

  toString() {
    return this._path
  }

  getLevels() {
    const levels = this._path.split('/')
    return levels.filter(Boolean)
  }

  back() {
    if (this.getLevels().length === 1) this._path = '/'
    else {
      const segments = this.getLevels()
      segments.pop()
      this._path = '/' + segments.join('/') + '/'
    }
    return this
  }
}

const treeStore = create<TreeStore>()((set) => ({
  currentPath: new Path(),
  selectedItems: [],
  setCurrentPath: (newPath: Path | string) => set(() => {
    return { currentPath: typeof newPath === 'string' ? new Path(newPath) : newPath }
  }),
  addNodePath: (newPath: Path | string) => set((state) => ({ currentPath: state.currentPath.concat(newPath) })),
  backPath: () => set((state) => ({ currentPath: state.currentPath.back() })),
  addItemToSelect: (item: string) => set((state) => ({ selectedItems: [...state.selectedItems, item] })),
  selectOneItem: (item: string) => set(() => ({ selectedItems: [item] })),
  clearSelected: () => set(() => ({ selectedItems: [] })),



  data: tree,
  addExplorerItem: (item: ExplorerItem) => {
    set((state) => {
      const pathLevels = state.currentPath.getLevels()
      const dataCopy = [...state.data]

      const addItemToData = (data: ExplorerItem[], levels: string[], item: ExplorerItem): ExplorerItem[] => {
        if (levels.length === 0) {
          return [...data, item]
        }

        const [currentLevel, ...restLevels] = levels

        const folderIndex = data.findIndex((el) => el.meta.id === currentLevel && el.meta.is_folder)
        if (folderIndex === -1) {
          return data
        }

        const folder = data[folderIndex]

        if (folder.children) {
          folder.children = addItemToData(folder.children, restLevels, item)
        }

        const updatedData = [...data]
        updatedData[folderIndex] = folder
        return updatedData
      }

      const updatedData = addItemToData(dataCopy, pathLevels, item)

      return { data: updatedData }
    })
  }
}))

interface ExplorerItemProps {
  children: string
  isSelected?: boolean
  metaData: ExplorerItemMetaData
}

function ExplorerItemComponent(props: ExplorerItemProps) {
  const { selectOneItem, addItemToSelect, addNodePath } = treeStore()

  const handleClick = (event: React.MouseEvent) => {
    if (event.ctrlKey) addItemToSelect(props.metaData.id)
    else selectOneItem(props.metaData.id)
  }

  const handleDobleClick = () => {
    if (props.metaData.is_folder) addNodePath(props.metaData.id)
  }

  return <Box textAlign={'center'}
    minWidth={100}
    minHeight={100}
    sx={{
      margin: '3rem'
    }}
    onClick={handleClick}
    onDoubleClick={handleDobleClick}>
    <Icon>
      {props.metaData.is_folder ? <FolderIcon width={4000} /> : <InsertDriveFileIcon />}

    </Icon>
    <Typography variant="body2"
      align="center"
      sx={{
        color: 'text.secondary',
      }}>

      {props.children}
    </Typography>
  </Box>
}


function getRootOfTree(tree: ExplorerItem[], newPath: Path) {
  if (newPath.getLevels().length === 0) return tree

  let currentPath: ExplorerItem[] = tree
  const segments = newPath.getLevels()

  for (const segment of segments) {
    const currentNode = currentPath.find(child => child.meta.id === segment)
    if (!currentNode) return []
    currentPath = currentNode.children
  }

  return currentPath;
}

interface RenderExplorerItemsProps {
  data: ExplorerItem[]
  selectedItems: string[]
  currentPath: Path
} 

function RenderExplorerItems(props:RenderExplorerItemsProps) {
  const realTree = getRootOfTree(props.data, props.currentPath)
  if (realTree.length === 0) return <p>empty</p>
  return realTree.map(item => (<ExplorerItemComponent key={item.meta.id} isSelected={props.selectedItems.includes(item.meta.id)} metaData={item.meta}>{item.meta.name}</ExplorerItemComponent>))
}

function verifyIfExists(name: string, extension: string, structure: ExplorerItem[]) {
  for (const item of structure) {
    if (item.meta.name === name && item.meta.file_extension === extension) {
      return true
    }
  }
  return false;
}

function BreadcrumbItemComponent() {
  const { setCurrentPath, currentPath } = treeStore()
  return <Button onClick={() => {
    setCurrentPath(new Path())
  }} variant='text' size='small' color='info'>{currentPath.toString()}</Button>
}

function BreadcrumbComponent() {

  const { setCurrentPath, currentPath } = treeStore()

  return <Breadcrumbs aria-label="breadcrumb">
    <Button onClick={() => {setCurrentPath(new Path())}} variant='text' size='small' color='info'>Home</Button>
    {currentPath.getLevels().map(() => (<BreadcrumbItemComponent />))}
  </Breadcrumbs>
}

function Explorer() {

  const { currentPath, selectedItems, backPath, data, addExplorerItem } = treeStore()

  const handleBackClick = () => {
    backPath()
  }

  const hanbleCreate = () => {
    const name = prompt('name')
    if (name && name.length > 0) {

      const item = {
        meta: {
          id: uuidv4(),
          is_folder: true,
          name: name,
          file_extension: "folder",
          full_name: `${name}.folder`
        },
        children: []
      }
      if (verifyIfExists(item.meta.name, item.meta.file_extension, tree))
        return alert(`File named: ${item.meta.full_name} already exists.`)
      addExplorerItem(item)
    }
  }

  return (
    <Container maxWidth={false}>
      <BreadcrumbComponent />
      <Button onClick={handleBackClick} variant="text">Back</Button>
      <Button onClick={hanbleCreate} variant="contained">Create</Button>
      <Container sx={{ display: 'flex' }}>
        <RenderExplorerItems data={data} selectedItems={selectedItems} currentPath={currentPath} />
      </Container>
    </Container>
  )
}

function App() {
  return <Explorer />
}

export default App
