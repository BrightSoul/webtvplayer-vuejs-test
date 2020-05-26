<template>
  <div style="padding: 2px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1">
    <button type="button" data-action="play">play</button>
    <button type="button" data-action="pause">pause</button>
    <button type="button" data-action="stop">stop</button>
    <span data-output="position" style="background-color: black; color: white; padding: 2px; margin-right: 2px;">0.0s</span>
    <span data-output="buffer" style="background-color: black; color: white; padding: 2px;">0.0%</span>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
