<script setup>
import { Bell, CircleAlert, CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-vue-next'
</script>

<template>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Уведомления по умолчанию</h4>
        <div class="alert alert-primary" role="alert">Уведомление primary</div>
        <div class="alert alert-secondary" role="alert">Уведомление secondary</div>
        <div class="alert alert-success" role="alert">Уведомление success</div>
        <div class="alert alert-danger" role="alert">Уведомление danger</div>
        <div class="alert alert-warning" role="alert">Уведомление warning</div>
        <div class="alert alert-info" role="alert">Уведомление info</div>
        <div class="alert alert-dark" role="alert">Уведомление dark</div>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Контурные уведомления</h4>
        <div class="alert border border-primary text-primary">Уведомление primary</div>
        <div class="alert border border-secondary text-secondary">Уведомление secondary</div>
        <div class="alert border border-success text-success">Уведомление success</div>
        <div class="alert border border-danger text-danger">Уведомление danger</div>
        <div class="alert border border-warning text-warning">Уведомление warning</div>
        <div class="alert border border-info text-info">Уведомление info</div>
        <div class="alert border border-dark text-dark">Уведомление dark</div>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Уведомления с заливкой</h4>
        <div class="alert bg-primary text-white">Уведомление primary</div>
        <div class="alert bg-secondary text-white">Уведомление secondary</div>
        <div class="alert bg-success text-white">Уведомление success</div>
        <div class="alert bg-danger text-white">Уведомление danger</div>
        <div class="alert bg-warning text-white">Уведомление warning</div>
        <div class="alert bg-info text-white">Уведомление info</div>
        <div class="alert bg-dark text-white">Уведомление dark</div>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Уведомления с иконками</h4>
        <div class="alert alert-primary" role="alert">
          <Bell :size="20" class="me-1" /> Уведомление primary
        </div>
        <div class="alert alert-secondary" role="alert">
          <Bell :size="20" class="me-1" /> Уведомление secondary
        </div>
        <div class="alert alert-success" role="alert">
          <CircleCheck :size="20" class="me-1" /> Уведомление success
        </div>
        <div class="alert alert-danger" role="alert">
          <OctagonAlert :size="20" class="me-1" /> Уведомление danger
        </div>
        <div class="alert alert-warning" role="alert">
          <TriangleAlert :size="20" class="me-1" /> Уведомление warning
        </div>
        <div class="alert alert-info" role="alert">
          <CircleAlert :size="20" class="me-1" /> Уведомление info
        </div>
        <div class="alert alert-dark" role="alert">
          <Bell :size="20" class="me-1" /> Уведомление dark
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="card">
        <h4 class="mb-3">Уведомление с контентом</h4>
        <div class="row row-gap-4">
          <div class="col-12 col-md-6">
            <div class="alert alert-success" role="alert">
              <h4 class="alert-heading">Отлично сработано!</h4>
              <p>
                О да, Вы успешно прочитали это важное уведомляющее сообщение. Этот пример текста
                будет работать немного дольше, чтобы Вы могли увидеть, как интервалы в уведомлении
                работают с этим типом контента.
              </p>
              <hr />
              <p class="mb-0">
                Когда Вам нужно, обязательно используйте утилиты полей, чтобы все было в хорошо и
                аккуратно.
              </p>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="alert alert-info" role="alert">
              <h4 class="alert-heading">Отлично сработано!</h4>
              <p>
                О да, Вы успешно прочитали это важное уведомляющее сообщение. Этот пример текста
                будет работать немного дольше, чтобы Вы могли увидеть, как интервалы в уведомлении
                работают с этим типом контента.
              </p>
              <hr />
              <p class="mb-0">
                Когда Вам нужно, обязательно используйте утилиты полей, чтобы все было в хорошо и
                аккуратно.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
