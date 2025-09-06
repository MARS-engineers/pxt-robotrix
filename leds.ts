/**
 * adapted from:
 * microsoft — pxt-neopixel
 * https://github.com/microsoft/pxt-neopixel
 * Licensed under the MIT License. See https://github.com/microsoft/pxt-neopixel/blob/master/LICENSE.txt
 *
 * Modifications by [matej2005], September 2025:
 * - added animations
 * - adapted to RP pin system
 * - removed LED types
 * - color selection changed to build in color picker
 */
namespace Robotrix {
    export enum LedAnimations {
        //% block="Blink"
        //% block.loc.cs="Blinkr"
        BLINK,
        //% block="BLink left"
        //% block.loc.cs="Blinkr vlevo"
        BLINK_LEFT,
        //% block="Blink right"
        //% block.loc.cs="Blinkr doprava"
        BLINK_RIGHT,
        //% block="BLink left 2"
        //% block.loc.cs="Blinkr vlevo 2"
        BLINK_LEFT2,
        //% block="Blink right 2"
        //% block.loc.cs="Blinkr doprava 2"
        BLINK_RIGHT2,
        //% block="Knight rider"
        //% block.loc.cs="Knight rider"
        KNIGHT_RIDER,
        //% block="Loading"
        //% block.loc.cs="Načítání"
        LOADING,
        //% block="Police"
        //% block.loc.cs="Policie"
        POLICE,
        //% block="Light"
        //% block.loc.cs="Světlo"
        LIGHT,
        //% block="Off"
        //% block.loc.cs="Vypnuto"
        OFF
    }

    export enum Colors {
        WHITE = 0xffffff,
        OFF = 0x000000,
        RED = 0xff0000,
        GREEN = 0x00ff00,
        BLUE = 0x0000ff,
        ORANGE = 0xff8000,
        DEFAULT = 0xfffffe
    }

    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        pin: RobotrixPins;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number; // start offset in LED strip
        _length: number; // number of LEDs
        ledAnimationRunning: boolean;
        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% blockId="robotrix_led_set_strip_color"
        //% block="%strip|show color %rgb=neopixel_colors"
        //% block.loc.cs="%strip|Ukaž barvu %rgb=neopixel_colors"
        //% strip.defl=strip
        //% rgb.shadow="colorNumberPicker"
        //% weight=85 blockGap=8
        //% subcategory="LEDS"
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Shows a rainbow pattern on all LEDs.
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% blockId="robotrix_led_set_strip_rainbow" block="%strip|show rainbow from %startHue|to %endHue"
        //% strip.defl=strip
        //% weight=85 blockGap=8
        //% subcategory="LEDS"
        showRainbow(startHue: number = 1, endHue: number = 360) {
            if (this._length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = this._length;
            const direction = HueInterpolationDirection.Clockwise;

            //hue
            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStepCW = Math.idiv((hDistCW * 100), steps);
            const hDistCCW = ((h1 + 360) - h2) % 360;
            const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
            let hStep: number;
            if (direction === HueInterpolationDirection.Clockwise) {
                hStep = hStepCW;
            } else if (direction === HueInterpolationDirection.CounterClockwise) {
                hStep = hStepCCW;
            } else {
                hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
            }
            const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //sat
            const s1 = saturation;
            const s2 = saturation;
            const sDist = s2 - s1;
            const sStep = Math.idiv(sDist, steps);
            const s1_100 = s1 * 100;

            //lum
            const l1 = luminance;
            const l2 = luminance;
            const lDist = l2 - l1;
            const lStep = Math.idiv(lDist, steps);
            const l1_100 = l1 * 100

            //interpolate
            if (steps === 1) {
                this.setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
            } else {
                this.setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    const s = Math.idiv((s1_100 + i * sStep), 100);
                    const l = Math.idiv((l1_100 + i * lStep), 100);
                    this.setPixelColor(i, hsl(h, s, l));
                }
                this.setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            this.show();
        }

        /**
         * Displays a vertical bar graph based on the `value` and `high` value.
         * If `high` is 0, the chart gets adjusted automatically.
         * @param value current value to plot
         * @param high maximum value, eg: 255
         */
        //% weight=84
        //% subcategory="LEDS"
        //% blockId=robotrix_led_show_bar_graph block="%strip|show bar graph of %value|up to %high"
        //% strip.defl=strip
        //% icon="\uf080"
        //% value.min=0 value.max=255
        //% high.min=0 high.max=255
        showBarGraph(value: number, high: number): void {
            if (high <= 0) {
                this.clear();
                this.setPixelColor(0, 0xFFFF00);
                this.show();
                return;
            }

            value = Math.abs(value);
            const n = this._length;
            const n1 = n - 1;
            let v = Math.idiv((value * n), high);
            if (v == 0) {
                this.setPixelColor(0, 0x666600);
                for (let i = 1; i < n; ++i)
                    this.setPixelColor(i, 0);
            } else {
                for (let i = 0; i < n; ++i) {
                    if (i <= v) {
                        const b = Math.idiv(i * 255, n1);
                        this.setPixelColor(i, Robotrix.rgb(b, 0, 255 - b));
                    }
                    else this.setPixelColor(i, 0);
                }
            }
            this.show();
        }

        /**
         * Set LED to a given color (range 0-255 for r, g, b).
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="robotrix_led_set_pixel_color"
        //% block="%strip|set pixel color at %pixeloffset|to %rgb"
        //% block.loc.cs="%strip|nastav barvu pixelu %pixeloffset|na %rgb"
        //% rgb.shadow="colorNumberPicker"
        //% strip.defl=strip
        //% blockGap=8
        //% weight=80
        //% subcategory="LEDS"
        setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="robotrix_led_show" block="%strip|show" blockGap=8
        //% strip.defl=strip
        //% block.loc.cs="%strip|Ukaž"
        //% weight=79
        //% subcategory="LEDS"
        show() {
            // only supported in beta
            // ws2812b.setBufferMode(this.pin, this._mode);
            ws2812b.sendBuffer(this.buf, RPtoPin(this.pin));
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="robotrix_led_clear" 
        //% block="%strip|clear"
        //% block.loc.cs="%strip|Vymaž"
        //% strip.defl=strip
        //% subcategory="LEDS"
        //% weight=76
        clear(): void {
            const stride = 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }

        /**
         * Gets the number of pixels declared on the strip
         */
        //% blockId="robotrix_led_length" 
        //% block="%strip|length" blockGap=8
        //% block.loc.cs="%strip|Délka"
        //% strip.defl=strip
        //% subcategory="LEDS"
        length() {
            return this._length;
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% blockId="robotrix_led_set_brightness"
        //% block="%strip|set brightness %brightness" blockGap=8
        //% block.loc.cs="%strip|nastav jas %brightness"
        //% strip.defl=strip
        //% weight=59
        //% subcategory="LEDS"
        //% brightness.min=0 brightness.max=255
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /**
         * Apply brightness to current colors using a quadratic easing function.
         **/
        //% blockId="robotrix_led_each_brightness" block="%strip|ease brightness" blockGap=8
        //% strip.defl=strip
        //% weight=58
        //% subcategory="LEDS"
        easeBrightness(): void {
            const stride = 3;
            const br = this.brightness;
            const buf = this.buf;
            const end = this.start + this._length;
            const mid = Math.idiv(this._length, 2);
            for (let i = this.start; i < end; ++i) {
                const k = i - this.start;
                const ledoffset = i * stride;
                const br = k > mid
                    ? Math.idiv(255 * (this._length - 1 - k) * (this._length - 1 - k), (mid * mid))
                    : Math.idiv(255 * k * k, (mid * mid));
                const r = (buf[ledoffset + 0] * br) >> 8; buf[ledoffset + 0] = r;
                const g = (buf[ledoffset + 1] * br) >> 8; buf[ledoffset + 1] = g;
                const b = (buf[ledoffset + 2] * br) >> 8; buf[ledoffset + 2] = b;
            }
        }

        /**
         * Create a range of LEDs.
         * @param start offset in the LED strip to start the range
         * @param length number of LEDs in the range. eg: 4
         */
        //% weight=89
        //% blockId="robotrix_led_range" block="%strip|range from %start|with %length|leds"
        //% strip.defl=strip
        //% blockSetVariable=range
        //% subcategory="LEDS"
        range(start: number, length: number): Strip {
            start = start >> 0;
            length = length >> 0;
            let strip = new Strip();
            strip.buf = this.buf;
            strip.pin = this.pin;
            strip.brightness = this.brightness;
            strip.start = this.start + Math.clamp(0, this._length - 1, start);
            strip._length = Math.clamp(0, this._length - (strip.start - this.start), length);
            return strip;
        }

        /**
         * Shift LEDs forward and clear with zeros.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to shift forward, eg: 1
         */
        //% blockId="robotrix_led_shift" block="%strip|shift pixels by %offset" blockGap=8
        //% strip.defl=strip
        //% subcategory="LEDS"
        //% weight=40
        shift(offset: number = 1): void {
            offset = offset >> 0;
            const stride = 3;
            this.buf.shift(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Rotate LEDs forward.
         * You need to call ``show`` to make the changes visible.
         * @param offset number of pixels to rotate forward, eg: 1
         */
        //% blockId="robotrix_led_rotate" block="%strip|rotate pixels by %offset" blockGap=8
        //% strip.defl=strip
        //% subcategory="LEDS"
        //% weight=39
        rotate(offset: number = 1): void {
            offset = offset >> 0;
            const stride = 3;
            this.buf.rotate(-offset * stride, this.start * stride, this._length * stride)
        }

        /**
         * Set the pin where the neopixel is connected, defaults to P0.
         */
        //% weight=10
        //% subcategory="LEDS"
        setPin(pin: RobotrixPins): void {
            this.pin = pin;
            pins.digitalWritePin(RPtoPin(this.pin), 0);
            // don't yield to avoid races on initialization
        }

        /**
         * Show animation at led
         * @param animation selected animation
         */
        //% subcategory="LEDS"
        //% blockId="robotrix_led_animate"
        //% block="%strip|Set animation $animation || color $rgb"
        //% block.loc.cs="%strip|Nastav animaci $animation || s barvou $rgb"
        //% rgb.defl=0xfffffe
        //% rgb.shadow="colorNumberPicker"
        //% weight=80
        //% strip.defl=strip
        ledAnimation(animation: LedAnimations, rgb?: number): void {
            this.ledAnimationRunning = false;
            this.clear();
            this.show();
            control.inBackground(() => this.animateInBackground(animation, rgb));
        }

        animateInBackground(animation: LedAnimations, rgb: number) {
            let color = rgb;
            this.ledAnimationRunning = true;
            switch (animation) {
                case LedAnimations.LIGHT:
                    if (rgb == Colors.DEFAULT) color = Colors.WHITE;  //if color is not picked eq. is equal to 0xfffffe use default color
                    this.showColor(rgb);
                    break;

                case LedAnimations.BLINK:
                    if (rgb == Colors.DEFAULT) color = Colors.ORANGE;
                    while (this.ledAnimationRunning) {
                        this.showColor(color);
                        basic.pause(500);
                        this.showColor(0x000000);
                        basic.pause(500);
                    }
                    break;

                case LedAnimations.BLINK_LEFT:
                    if (rgb == Colors.DEFAULT) color = Colors.ORANGE;;
                    while (this.ledAnimationRunning) {
                        this.clear();
                        for (let i = 0; i <= 1; i++) {
                            this.setPixelColor(i, color);
                        }
                        this.show();
                        basic.pause(1000);
                        this.clear();
                        this.show();
                        basic.pause(1000);
                    }
                    break;

                case LedAnimations.BLINK_RIGHT:
                    if (rgb == Colors.DEFAULT) color = Colors.ORANGE;
                    while (this.ledAnimationRunning) {
                        this.clear();
                        for (let i = this.length()-2; i <= this.length(); i++) {
                            this.setPixelColor(i, color);
                        }
                        this.show();
                        basic.pause(1000);
                        this.clear();
                        this.show();
                        basic.pause(1000);
                    }
                    break;
                case LedAnimations.BLINK_LEFT2:
                    if (rgb == Colors.DEFAULT) color = Colors.ORANGE;;
                    while (this.ledAnimationRunning) {
                        this.clear();
                        for (let i = 1; i <= this.length(); i++) {
                            this.setPixelColor(i, color);
                            basic.pause(100);
                            this.show();
                        }
                        this.show();
                        basic.pause(1000);
                        this.clear();
                        this.show();
                        basic.pause(1000);
                    }
                    break;

                case LedAnimations.BLINK_RIGHT2:
                    if (rgb == Colors.DEFAULT) color = Colors.ORANGE;;
                    while (this.ledAnimationRunning) {
                        this.clear();
                        for (let i = 1; i >= 0; i--) {
                            this.setPixelColor(i, color);
                            basic.pause(100);
                            this.show();
                        }
                        this.show();
                        basic.pause(1000);
                        this.clear();
                        this.show();
                        basic.pause(1000);
                    }
                    break;

                case LedAnimations.KNIGHT_RIDER:
                    if (rgb == Colors.DEFAULT) color = Colors.RED;
                    while (this.ledAnimationRunning) {
                        for (let i = 0; i <= this.length() - 1; i++) {
                            this.clear();
                            this.setPixelColor(i, color);
                            this.show();
                            basic.pause(200);
                        }
                        for (let i = this.length() - 1; i >= 0; i--) {
                            this.clear();
                            this.setPixelColor(i, color);
                            this.show();
                            basic.pause(200);
                        }
                    }
                    break;

                case LedAnimations.LOADING:
                    if (rgb == Colors.DEFAULT) color = Colors.BLUE;
                    while (this.ledAnimationRunning) {
                        for (let i = 0; i <= this.length() - 1; i++) {
                            this.setPixelColor(i, color);
                            this.show();
                            basic.pause(1000);
                        }
                        this.clear();
                        this.show();
                        basic.pause(1000);
                    }
                    break;

                case LedAnimations.POLICE:
                    while (this.ledAnimationRunning) {
                        this.showColor(Colors.BLUE);
                        basic.pause(500);
                        this.showColor(Colors.RED);
                        basic.pause(500);
                    }
                    break;

                case LedAnimations.OFF:
                    this.showColor(Colors.OFF);
                    break;
            }
            this.ledAnimationRunning = false;
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            this.buf[offset + 0] = green;
            this.buf[offset + 1] = red;
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }

        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }
    }

    /**
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 8,24,30,60,64
     */
    //% blockId="robotrix_led_create"
    //% block="NeoPixel at pin %pin|with %numleds|leds"
    //% block.loc.cs="Nastav světlo na %pin|s %numleds| LED"
    //% weight=100 blockGap=8
    //% trackArgs=0,2
    //% blockSetVariable=strip
    //% subcategory="LEDS"
    //% numleds.min=0 numleds.max=255
    export function create(pin?: RobotrixPins, numleds?: number): Strip {
        let strip = new Strip();
        let stride = 3;
        strip.buf = pins.createBuffer(numleds * stride);
        strip.start = 0;
        strip._length = numleds;
        strip.setBrightness(128)
        strip.setPin(pin)
        return strip;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=1
    //% blockId="robotrix_led_rgb"
    //% block="red %red|green %green|blue %blue"
    //% block.loc.cs="barva červená %red|zelená %green|modrá %blue"
    //% subcategory="LEDS"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% subcategory="LEDS"
    //% blockId=robotrix_ledHSL block="hue %h|saturation %s|luminosity %l"
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }
}
