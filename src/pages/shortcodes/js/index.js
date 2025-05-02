import ContainerBlock   from '../components/ContainerBlock.vue'
import ButtonBlock      from '../components/ButtonBlock.vue'
import UnknownShortcode from '../components/UnknownShortcode.vue'

export const componentMap = {
  container: ContainerBlock,
  button:    ButtonBlock,
}

export const defaultRenderer = UnknownShortcode
