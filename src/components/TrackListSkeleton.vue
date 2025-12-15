<template>
  <div class="track-list-skeleton">
    <div v-if="showTitle" class="title-skeleton"></div>
    <div v-for="n in count" :key="n" class="track-item-skeleton">
      <div class="artwork-skeleton"></div>
      <div class="details-skeleton">
        <div class="line-skeleton title"></div>
        <div class="line-skeleton artist"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 5,
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
.track-list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.title-skeleton {
  height: 1.5rem;
  width: 200px;
  background-color: var(--bg-elevation);
  border-radius: 4px;
  margin-bottom: 1rem;
}
.track-item-skeleton {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}
.artwork-skeleton {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  background-color: var(--bg-elevation);
  flex-shrink: 0;
}
.details-skeleton {
  flex-grow: 1;
}
.line-skeleton {
  height: 1em;
  border-radius: 4px;
  background-color: var(--bg-elevation);
}
.line-skeleton.title {
  width: 60%;
  margin-bottom: 0.5rem;
}
.line-skeleton.artist {
  width: 40%;
  height: 0.9em;
}
</style>
