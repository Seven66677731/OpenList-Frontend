import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Progress,
  ProgressIndicator,
  Text,
  useColorModeValue,
  VStack,
} from "@hope-ui/solid"
import { createSignal, For } from "solid-js"

import { useT } from "~/hooks"

import { ChildTaskInfo } from "~/types/syncer_task"
import { TaskState } from "~/pages/manage/tasks/Task"
import { getMainColor } from "~/store"
import { getPath } from "~/pages/manage/tasks/helper"

interface TaskInfoProps {
  opened: boolean
  taskId: number | null
  childTasks: ChildTaskInfo[] | []
  onClose: () => void
}

const SyncerChildTaskInfo = (props: TaskInfoProps) => {
  const t = useT()

  const taskTypes = () => {
    const set = new Set<string>()
    props.childTasks.forEach((task) => set.add(task.task_type))
    return ["all", ...Array.from(set)]
  }

  const [selectedType, setSelectedType] = createSignal<string>("all")
  const filteredTasks = () => {
    if (selectedType() === "all") return props.childTasks
    return props.childTasks.filter((task) => task.task_type === selectedType())
  }

  return (
    <Drawer
      opened={props.opened}
      onClose={props.onClose}
      placement="right"
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          {t("tasks.syncer.child_task_info")} - ID: {props.taskId}
        </DrawerHeader>

        <DrawerBody>
          <HStack spacing="$2" mb="$4" wrap="wrap">
            <For each={taskTypes()}>
              {(type) => (
                <Button
                  size="sm"
                  variant={selectedType() === type ? "solid" : "ghost"}
                  colorScheme={selectedType() === type ? "info" : undefined}
                  onClick={() => setSelectedType(type)}
                >
                  {t(`tasks.syncer.${type}`)}
                </Button>
              )}
            </For>
          </HStack>
          <VStack spacing="$4" alignItems="start" w="$full">
            <For each={filteredTasks()}>
              {(child) => (
                <Box
                  w="$full"
                  p="$3"
                  borderRadius="$lg"
                  border="1px solid $neutral7"
                  background={useColorModeValue("$neutral2", "$neutral3")()}
                  _hover={{
                    border: `1px solid ${getMainColor()}`,
                  }}
                >
                  <VStack alignItems="start" spacing="$2">
                    {child.task_type === "delete" ? (
                      <Text fontSize="$sm">
                        <Text as="span" fontWeight="bold">
                          {t("tasks.syncer.delete_path")}:{" "}
                        </Text>{" "}
                        {child.delete_path}
                      </Text>
                    ) : (
                      <>
                        <Text fontSize="$sm">
                          <Text as="span" fontWeight="bold">
                            {t("tasks.syncer.src_path")}:
                          </Text>{" "}
                          {getPath("", child.src_path)}
                        </Text>
                        <Text fontSize="$sm">
                          <Text as="span" fontWeight="bold">
                            {t("tasks.syncer.dst_path")}:
                          </Text>{" "}
                          {getPath("", child.dst_path)}
                        </Text>
                      </>
                    )}

                    <HStack spacing="$4" w="$full" alignItems="center">
                      <Progress
                        flex="1"
                        trackColor="$info3"
                        rounded="$full"
                        value={child.Progress}
                      >
                        <ProgressIndicator color="$info8" rounded="$md" />
                      </Progress>
                      <TaskState state={child.State} />
                    </HStack>
                  </VStack>
                </Box>
              )}
            </For>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default SyncerChildTaskInfo
