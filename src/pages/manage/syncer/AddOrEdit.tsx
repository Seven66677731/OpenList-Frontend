import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
  Switch as HopeSwitch,
  VStack,
} from "@hope-ui/solid"
import { MaybeLoading, FolderChooseInput } from "~/components"
import { useFetch, useRouter, useT } from "~/hooks"
import { handleResp, notify, r } from "~/utils"
import { PEmptyResp, PResp } from "~/types"
import { createStore } from "solid-js/store"
import { SyncerTaskArgs, SyncerTaskInfo } from "~/types/syncer_task"
import { For } from "solid-js"

const AddOrEdit = () => {
  const t = useT()
  const { params, back } = useRouter()
  const { id } = params
  const [syncerTask, setSyncerTask] = createStore<SyncerTaskArgs>({
    id: 0,
    task_name: "",
    src_path: "",
    dst_path: "",
    task_type: "",
    lazy_cache: true,
  })
  const [syncerTaskArgLoading, loadSyncerTaskArg] = useFetch(
    (): PResp<SyncerTaskInfo> => r.get(`/syncer/get?id=${id}`),
  )

  const initEdit = async () => {
    const resp = await loadSyncerTaskArg()
    // @ts-ignore
    handleResp(resp, setSyncerTask)
  }

  const [okLoading, ok] = useFetch((): PEmptyResp => {
    return r.post(`/syncer/${id ? "update" : "create"}`, syncerTask)
  })
  console.log(syncerTask)
  console.log(syncerTask.id)
  if (id) {
    initEdit()
  }

  return (
    <MaybeLoading loading={syncerTaskArgLoading()}>
      <VStack w="$full" alignItems="start" spacing="$2">
        <Heading>{t(`global.${id ? "edit" : "add"}`)}</Heading>
        <FormControl w="$full" display="flex" flexDirection="column" required>
          <FormLabel for="task_name" display="flex" alignItems="center">
            {t(`tasks.syncer.task_name`)}
          </FormLabel>
          <Input
            id="task_name"
            value={syncerTask.task_name}
            onInput={(e) => setSyncerTask("task_name", e.currentTarget.value)}
          />
        </FormControl>

        <FormControl w="$full" display="flex" flexDirection="column" required>
          <FormLabel for="src_path" display="flex" alignItems="center">
            {t(`tasks.syncer.src_path`)}
          </FormLabel>
          <FolderChooseInput
            id="src_path"
            value={syncerTask.src_path}
            onChange={(path) => setSyncerTask("src_path", path)}
            onlyFolder
          />
        </FormControl>

        <FormControl w="$full" display="flex" flexDirection="column" required>
          <FormLabel for="dst_path" display="flex" alignItems="center">
            {t(`tasks.syncer.dst_path`)}
          </FormLabel>
          <FolderChooseInput
            id="dst_path"
            value={syncerTask.dst_path}
            onChange={(path) => setSyncerTask("dst_path", path)}
            onlyFolder
          />
        </FormControl>

        <FormControl w="$full" display="flex" flexDirection="column" required>
          <FormLabel for="task_type" display="flex" alignItems="center">
            {t(`tasks.syncer.task_type`)}
          </FormLabel>
          <Select
            id="task_type"
            value={syncerTask.task_type}
            onChange={(v) => setSyncerTask("task_type", v)}
          >
            <SelectTrigger>
              <SelectPlaceholder>{t("global.choose")}</SelectPlaceholder>
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectListbox>
                <For
                  each={[
                    "copy",
                    "move",
                    "delete",
                    "copy_and_delete",
                    "move_and_delete",
                    "two_way_sync",
                  ]}
                >
                  {(item) => (
                    <SelectOption value={item}>
                      <SelectOptionText>
                        {t(`tasks.syncer.${item}`)}
                      </SelectOptionText>
                      <SelectOptionIndicator />
                    </SelectOption>
                  )}
                </For>
              </SelectListbox>
            </SelectContent>
          </Select>
        </FormControl>
        <FormControl w="$full" display="flex" flexDirection="column">
          <FormLabel for="dst_path" display="flex" alignItems="center">
            {t(`tasks.syncer.lazy_cache`)}
          </FormLabel>
          <HopeSwitch
            id="lazy_cache"
            defaultChecked={syncerTask.lazy_cache}
            onChange={(e: any) =>
              setSyncerTask("lazy_cache", e.currentTarget.checked)
            }
          />
        </FormControl>
        <Button
          loading={okLoading()}
          onClick={async () => {
            const resp = await ok()
            handleResp(resp, async () => {
              notify.success(t("global.save_success"))
              back()
            })
          }}
        >
          {t(`global.${id ? "save" : "add"}`)}
        </Button>
      </VStack>
    </MaybeLoading>
  )
}

export default AddOrEdit
