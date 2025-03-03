<script setup>
import DefaultInput from '@/pages/inputs/DefaultInput.vue'
import FloatInput from '@/pages/inputs/FloatInput.vue'
import FormControlsInput from '@/pages/inputs/FormControlsInput.vue'
import SizingShapeInput from '@/pages/inputs/SizingShapeInput.vue'
import SwitchersInput from '@/pages/inputs/SwitchersInput.vue'
import HTML5Input from '@/pages/inputs/HTML5Input.vue'
import RangeInput from '@/pages/inputs/RangeInput.vue'
import FileInput from '@/pages/inputs/FileInput.vue'
</script>

<template>
  <div class="row row-gap-4">
    <div class="col-12 col-sm-6">
      <div class="card"><DefaultInput /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><FloatInput /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><FormControlsInput /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><SizingShapeInput /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><SwitchersInput /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><RangeInput /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><HTML5Input /></div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="card"><FileInput /></div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
