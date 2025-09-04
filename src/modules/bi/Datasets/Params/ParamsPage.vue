<template>
    <div class="main-content">
        <div class="main-content-header">
            <h6>Параметры</h6>
            <span>Параметр — это переменная датасета или чарта, которая может заменять константные значения в вычисляемых полях. Параметр может быть числом, строкой, датой или логическим значением. Параметры датасета доступны во всех чартах, созданных на основе этого датасета. Значение по умолчанию для параметра может быть переопределено на уровне чарта.</span>
        </div>
        <div class="main-content-body">

        </div>
        <div class="main-content-footer">
            <button type="button" class="btn btn-add" data-bs-toggle="modal" data-bs-target="#paramsAddModal">Добавить</button>
        </div>
        <ParamsAddModal modal-id="paramsAddModal" @submit="handleAdd" />
    </div>
</template>

<script setup>
    import ParamsAddModal from './components/ParamsAddModal.vue'

    function handleAdd(payload){
        // Здесь позже добавим сохранение параметра
        console.log('Добавление параметра', payload)
    }
</script>

<style scoped lang="scss">
    .main-content{
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 10rem 0 10rem;
        height: 100%;
        gap: 15px;
    }

    .btn-add{
        background-color: var(--color-primary-background);
        color: var(--color-primary-text);
    }

    .btn-add:hover{
        background-color: var(--color-hover-background);
    }
</style>