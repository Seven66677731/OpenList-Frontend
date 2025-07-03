import {
  Box,
  Button,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@hope-ui/solid"
import { createSignal, For, onCleanup, Show } from "solid-js"
import {
  useFetch,
  useListFetch,
  useManageTitle,
  useRouter,
  useT,
} from "~/hooks"
import { handleResp, notify, r } from "~/utils"
import { PPageResp, PEmptyResp, PResp } from "~/types"
import { SyncerTaskArgs, SyncerTaskInfo } from "~/types/syncer_task"
import { DeletePopover } from "~/pages/manage/common/DeletePopover"
import { CompletedStates, TaskState } from "~/pages/manage/tasks/Task"
import SyncerChildTaskInfo from "~/pages/manage/syncer/TaskInfo"

const Syncer = () => {
  const t = useT()
  useManageTitle("manage.sidemenu.syncer")
  const { to } = useRouter()

  const [showInfoDrawer, setShowInfoDrawer] = createSignal(false)
  const [currentTaskId, setCurrentTaskId] = createSignal<number | null>(null)

  const [listing, getSyncerTasks] = useFetch(
    (): PPageResp<SyncerTaskArgs> => r.get("/syncer/list"),
  )
  const [deleting, deleteSyncerTask] = useListFetch(
    (id: number): PEmptyResp => r.post(`/syncer/delete?id=${id}`),
  )
  const [running, runSyncerTask] = useListFetch(
    (id: number): PEmptyResp => r.post(`/syncer/run?id=${id}`),
  )

  const [canceling, cancelSyncerTask] = useListFetch(
    (id: number): PEmptyResp => r.post(`/syncer/cancel?id=${id}`),
  )
  const [, SyncerTaskInfoList] = useFetch(
    (): PResp<SyncerTaskInfo[]> => r.get(`/syncer/taskInfo`),
  )

  const [syncerTaskArgs, setSyncerTaskArgs] = createSignal<SyncerTaskArgs[]>([])
  const refresh = async () => {
    const resp = await getSyncerTasks()
    handleResp(resp, (data) => setSyncerTaskArgs(data.content))
  }

  const [syncerTaskInfoList, setSyncerTaskInfoList] = createSignal<
    SyncerTaskInfo[]
  >([])
  const GetSyncerTaskInfoList = async () => {
    const resp = await SyncerTaskInfoList()
    handleResp(resp, (data) => {
      if (data === null) {
        setSyncerTaskInfoList([])
      } else {
        setSyncerTaskInfoList(data)
      }
    })
  }

  refresh()
  GetSyncerTaskInfoList()
  const interval = setInterval(GetSyncerTaskInfoList, 2000)
  onCleanup(() => clearInterval(interval))
  return (
    <>
      <VStack spacing="$2" alignItems="start" w="$full">
        <HStack spacing="$2">
          <Button colorScheme="accent" loading={listing()} onClick={refresh}>
            {t("global.refresh")}
          </Button>
          <Button
            onClick={() => {
              to("/@manage/syncer/add")
            }}
          >
            {t("global.add")}
          </Button>
        </HStack>
        <Box w="$full" overflowX="auto">
          <Table highlightOnHover dense>
            <Thead>
              <Tr>
                <For
                  each={[
                    "task_name",
                    "src_path",
                    "dst_path",
                    "task_type",
                    "state",
                  ]}
                >
                  {(title) => <Th>{t(`tasks.syncer.${title}`)}</Th>}
                </For>
                <Th>{t("global.operations")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <For each={syncerTaskArgs()}>
                {(syncerTask) => (
                  <Tr>
                    <Td>{syncerTask.task_name}</Td>
                    <Td>{syncerTask.src_path}</Td>
                    <Td>{syncerTask.dst_path}</Td>
                    <Td>{t(`tasks.syncer.${syncerTask.task_type}`)}</Td>
                    <Td>
                      {" "}
                      <TaskState
                        state={
                          (syncerTaskInfoList() ?? []).find(
                            (task) => Number(task.id) === syncerTask.id,
                          )?.state ?? 0
                        }
                      />
                    </Td>
                    <Td>
                      <HStack spacing="$2">
                        <Button
                          onClick={() => {
                            to(`/@manage/syncer/edit/${syncerTask.id}`)
                          }}
                        >
                          {t("global.edit")}
                        </Button>
                        <Button
                          colorScheme="accent"
                          loading={
                            running() === syncerTask.id ||
                            syncerTaskInfoList().some((task) => {
                              return (
                                Number(task.id) === syncerTask.id &&
                                !CompletedStates.includes(task.state)
                              )
                            })
                          }
                          onClick={async () => {
                            const resp = await runSyncerTask(syncerTask.id)
                            handleResp(resp, () => {
                              notify.success(t("global.ok"))
                              refresh()
                            })
                          }}
                        >
                          {t("tasks.syncer.run")}
                        </Button>

                        <Button
                          colorScheme="primary"
                          onClick={() => {
                            setCurrentTaskId(syncerTask.id)
                            setShowInfoDrawer(true)
                          }}
                        >
                          {t("tasks.syncer.task_info")}
                        </Button>

                        <Show
                          when={
                            running() === syncerTask.id ||
                            syncerTaskInfoList().some((task) => {
                              return (
                                Number(task.id) === syncerTask.id &&
                                !CompletedStates.includes(task.state)
                              )
                            })
                          }
                        >
                          <Button
                            colorScheme="neutral"
                            loading={canceling() === syncerTask.id}
                            onClick={async () => {
                              const resp = await cancelSyncerTask(syncerTask.id)
                              handleResp(resp, () => {
                                notify.success(t("global.ok"))
                                refresh()
                              })
                            }}
                          >
                            {t("global.cancel")}
                          </Button>
                        </Show>

                        <Show
                          when={
                            running() === syncerTask.id ||
                            !syncerTaskInfoList().some((task) => {
                              return (
                                Number(task.id) === syncerTask.id &&
                                !CompletedStates.includes(task.state)
                              )
                            })
                          }
                        >
                          <DeletePopover
                            name={syncerTask.task_name}
                            loading={deleting() === syncerTask.id}
                            onClick={async () => {
                              const resp = await deleteSyncerTask(syncerTask.id)
                              handleResp(resp, () => {
                                notify.success(t("global.delete_success"))
                                refresh()
                              })
                            }}
                          />
                        </Show>
                      </HStack>
                    </Td>
                  </Tr>
                )}
              </For>
            </Tbody>
          </Table>
        </Box>
      </VStack>
      <SyncerChildTaskInfo
        opened={showInfoDrawer()}
        taskId={currentTaskId()}
        childTasks={
          syncerTaskInfoList().find((t) => Number(t.id) === currentTaskId())
            ?.ChildTaskInfos ?? []
        }
        onClose={() => setShowInfoDrawer(false)}
      />
    </>
  )
}

export default Syncer
