<script>
import StorageData from '../StorageData.vue'

export default {
  components: { StorageData },
  props: {
    isDatasetSidebarOpen: Boolean
  }
}
</script>

<template>
    <div class="offcanvas offcanvas-start" id="datasetSidebar" tabindex="-1" aria-labelledby="datasetSidebarLabel" style="left: 260px; width: 768px">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="datasetSidebarLabel">Датасеты</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Закрыть" />
      </div>
      <div class="offcanvas-body p-0">
        <StorageData :isDatasetSidebarOpen="isDatasetSidebarOpen" />
      </div>
    </div>
  </template>