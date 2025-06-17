<script setup>
import PricingModal from '@/pages/modals/PricingModal.vue'
import AddCardModal from '@/pages/modals/AddCardModal.vue'
import AddAddressModal from '@/pages/modals/AddAddressModal.vue'
import EnableOTPModal from '@/pages/modals/EnableOTPModal.vue'
import PasswordModal from '@/pages/modals/PasswordModal.vue'
import TransactionsModal from '@/pages/modals/TransactionsModal.vue'
import OrdersModal from '@/pages/modals/OrdersModal.vue'
import FinanceModal from '@/pages/modals/FinanceModal.vue'
import CalendarModal from '@/pages/modals/CalendarModal.vue'
</script>

<template>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><PricingModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><AddCardModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><AddAddressModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><EnableOTPModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><PasswordModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><TransactionsModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><OrdersModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><FinanceModal /></div>
    </div>
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card"><CalendarModal /></div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
