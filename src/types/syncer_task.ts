export interface SyncerTaskArgs {
  id: number
  task_name: string
  src_path: string
  dst_path: string
  task_type: string
  lazy_cache: boolean
}

export interface SyncerTaskInfo {
  id: string
  state: number
  task_name: string
  ChildTaskInfos: ChildTaskInfo[]
}

export interface ChildTaskInfo {
  task_id: string
  task_type: "copy" | "move" | string
  src_path: string
  dst_path: string
  delete_path: string
  State: number
  Progress: number
}
