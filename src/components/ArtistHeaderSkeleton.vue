<template>
  <div class="artist-header-skeleton">
    <div class="avatar-skeleton"></div>
    <div class="info-skeleton">
      <div class="line-skeleton title"></div>
      <div class="line-skeleton text"></div>
      <div class="line-skeleton text short"></div>
    </div>
  </div>
</template>

<style scoped>
.artist-header-skeleton {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}
.avatar-skeleton {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: var(--bg-elevation);
  flex-shrink: 0;
}
.info-skeleton {
  flex-grow: 1;
}
.line-skeleton {
  height: 1em;
  border-radius: 4px;
  background-color: var(--bg-elevation);
  margin-bottom: 1rem;
}
.line-skeleton.title {
  height: 2.5rem;
  width: 40%;
  margin-bottom: 1.5rem;
}
.line-skeleton.text {
  width: 80%;
  height: 0.9em;
}
.line-skeleton.text.short {
  width: 60%;
}
</style>
