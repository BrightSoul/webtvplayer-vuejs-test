import MiddleButtons from './MiddleButtons/MiddleButtonsComponent';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  name: 'skinOne',
  data() {
    return {
      isHover: false,
      inPlaying: false,
      needToLeave: false,
      loaded: false,
      position: 0,
      options: {
        dotSize: 14,
        width: 'auto',
        height: 4,
        contained: true,
        direction: 'ltr',
        data: null,
        min: 0,
        max: 100,
        interval: 0.1,
        disabled: false,
        clickable: true,
        duration: 0.5,
        adsorb: false,
        lazy: false,
        tooltip: 'none',
        useKeyboard: false,
        keydownHook: null,
        dragOnClick: true,
        enableCross: true,
        fixed: false,
      },
    };
  },
  components: {
    MiddleButtons,
    VueSlider,
  },
  props: {
    webTvPlayer: Object,
  },
  mounted() {
    this.webTvPlayer.on('position', (position) => {
      this.position = position;
    });

    this.webTvPlayer.on('load', () => {
      this.options.max = Math.floor(this.webTvPlayer.duration);
      this.loaded = true;
    });
  },
  methods: {
    mouseOverIn() {
      this.isHover = true;
    },
    mouseOverOut() {
      this.isHover = false;
      this.needToLeave = false;
    },
    managePlay(inPlaying) {
      this.inPlaying = inPlaying;
      if (inPlaying) {
        this.webTvPlayer.play();
        this.needToLeave = true;
      } else {
        this.webTvPlayer.pause();
      }
    },
    go(qta) {
      this.webTvPlayer.position += qta;
    },
    getPosition() {
      return this.webTvPlayer?.position || 0;
    },
    change(n) {
      this.webTvPlayer.position = n;
    },
  },
};
