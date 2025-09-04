<script setup>
import GenericListPage from '@/modules/bi/MainPage/Sidebar/GenericListPage.vue'
import { getListConfig } from '@/modules/bi/MainPage/Sidebar/components/js/listConfigs.js'

const config = getListConfig('datasets')
</script>

<template>
  <GenericListPage :config="config" />
</template>