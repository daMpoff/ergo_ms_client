import ContainerBlock from '../components/ContainerBlock.vue'
import ButtonBlock from '../components/ButtonBlock.vue'
import UnknownShortcode from '../components/UnknownShortcode.vue'
import HeaderBlock from '../components/HeaderBlock.vue'
import FooterBlock from '../components/FooterBlock.vue'
import CategoryMenuBlock from '../components/CategoryMenuBlock.vue'
import ImageBlock from '../components/ImageBlock.vue'
import GridSectionBlock from '../components/GridSectionBlock.vue'
import PageCardBlock from '../components/PageCardBlock.vue'

export const componentMap = {
  Container: ContainerBlock,
  Button: ButtonBlock,
  Header: HeaderBlock,
  Footer: FooterBlock,
  CategoryMenu: CategoryMenuBlock,
  Image: ImageBlock,
  Grid: GridSectionBlock,
  PageCard: PageCardBlock
}

export const defaultRenderer = UnknownShortcode
