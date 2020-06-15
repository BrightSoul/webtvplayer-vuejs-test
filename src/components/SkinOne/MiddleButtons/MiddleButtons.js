export default {
  name: 'middleButtons',
  props: {
    inPlaying: Boolean
  },
  data() {
    return { }
  },
  mounted() { },
  methods: {
    play() {
      this.$emit('playingEvent', true)
    },
    pause() {
      this.$emit('playingEvent', false)
    },
    go(qta) {
      this.$emit('go', qta)
    },
  }
}