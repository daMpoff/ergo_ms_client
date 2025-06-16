import ContainerBlock from '../components/ContainerBlock.vue'
import ButtonBlock from '../components/ButtonBlock.vue'
import UnknownShortcode from '../components/UnknownShortcode.vue'
import HeaderBlock from '../components/HeaderBlock.vue'
import FooterBlock from '../components/FooterBlock.vue'
import CategoryMenuBlock from '../components/CategoryMenuBlock.vue'

export const componentMap = {
  Container: ContainerBlock,
  Button: ButtonBlock,
  Header: HeaderBlock,
  Footer: FooterBlock,
  CategoryMenu: CategoryMenuBlock,
}

export const defaultRenderer = UnknownShortcode
