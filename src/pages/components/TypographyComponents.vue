<script setup></script>

<template>
  <div class="row row-gap-4">
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Заголовки</h4>
        <h1>h1. Заголовок Bootstrap</h1>
        <h2>h2. Заголовок Bootstrap</h2>
        <h3>h3. Заголовок Bootstrap</h3>
        <h4>h4. Заголовок Bootstrap</h4>
        <h5>h5. Заголовок Bootstrap</h5>
        <h6>h6. Заголовок Bootstrap</h6>
      </div>
    </div>
    <div class="col-12 col-md-6">
      <div class="card">
        <h4 class="mb-3">Отображение заголовков</h4>
        <h1 class="display-1">Отображение 1</h1>
        <h1 class="display-2">Отображение 2</h1>
        <h1 class="display-3">Отображение 3</h1>
        <h1 class="display-4">Отображение 4</h1>
        <h1 class="display-5">Отображение 5</h1>
        <h1 class="display-6">Отображение 6</h1>
      </div>
    </div>
  </div>
  <div class="card mt-4">
    <h4 class="mb-3">Строчные текстовые элементы</h4>
    <p>Вы можете использовать тег mark для <mark>выделения</mark> текста.</p>
    <p><del>Эта строка текста должна рассматриваться как удаленный текст.</del></p>
    <p><s>Эта строка текста считается неточной.</s></p>
    <p><ins>Эта строка текста должна рассматриваться как дополнение к документу..</ins></p>
    <p><u>Эта строка текста будет отображаться как подчеркнутая.</u></p>
    <p><small>Эту строку текста следует рассматривать как мелкий шрифт.</small></p>
    <p><strong>Эта строка выделена жирным шрифтом.</strong></p>
    <p><em>Эта строка выделена курсивом.</em></p>
  </div>
  <div class="card mt-4">
    <h4 class="mb-3">Цитаты</h4>
    <figure>
      <blockquote class="blockquote">
        <p>Известная цитата, содержащаяся в элементе цитаты.</p>
      </blockquote>
      <figcaption class="blockquote-footer">
        Кто-то, известный в <cite title="Source Title">названии источника</cite>
      </figcaption>
    </figure>
    <figure class="text-center">
      <blockquote class="blockquote">
        <p>Известная цитата, содержащаяся в элементе цитаты.</p>
      </blockquote>
      <figcaption class="blockquote-footer">
        Кто-то, известный в <cite title="Source Title">названии источника</cite>
      </figcaption>
    </figure>
    <figure class="text-end">
      <blockquote class="blockquote">
        <p>Известная цитата, содержащаяся в элементе цитаты.</p>
      </blockquote>
      <figcaption class="blockquote-footer">
        Кто-то, известный в <cite title="Source Title">названии источника</cite>
      </figcaption>
    </figure>
  </div>
  <div class="card mt-4">
    <h4 class="mb-3">Выравнивание списка описаний</h4>
    <dl class="row">
      <dt class="col-sm-3">Списки описаний</dt>
      <dd class="col-sm-9">Список описаний идеально подходит для определения терминов.</dd>

      <dt class="col-sm-3">Термин</dt>
      <dd class="col-sm-9">
        <p>Определение термина.</p>
        <p>И еще немного текста определения заполнителя.</p>
      </dd>

      <dt class="col-sm-3">Другой термин</dt>
      <dd class="col-sm-9">
        Это определение короткое, поэтому никаких лишних абзацев или чего-либо еще.
      </dd>

      <dt class="col-sm-3 text-truncate">Усеченный термин усечен</dt>
      <dd class="col-sm-9">
        Это может быть полезно, когда места мало. Добавляет многоточие в конце.
      </dd>

      <dt class="col-sm-3">Вложенность</dt>
      <dd class="col-sm-9">
        <dl class="row">
          <dt class="col-sm-4">Список вложенных определений</dt>
          <dd class="col-sm-8">
            Я слышал, Вам нравятся списки определений. Позвольте мне поместить список определений в
            Ваш список определений.
          </dd>
        </dl>
      </dd>
    </dl>
  </div>
</template>

<style scoped lang="scss"></style>
