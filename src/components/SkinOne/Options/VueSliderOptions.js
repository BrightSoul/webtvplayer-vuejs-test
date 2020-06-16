class VueSliderOptions {
    static get default() {
        return Object.assign({}, {
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
            fixed: false
        });
    }
}

export default VueSliderOptions;