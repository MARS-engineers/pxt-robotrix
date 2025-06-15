//% color=190 weight=100 icon="\uf1b9" block="RoboTriX Rover 1 matej2005 test"
namespace Robotrix {

    export enum ModuleType {
        //% block="All"
        //% block.loc.cs="Všechny"
        All = 0,
        //% block="LEDs"
        //% block.loc.cs="LEDky"
        Leds = 1,
        //% block="Sensors"
        //% block.loc.cs="Senzory"
        Sensors = 2
    }


    export enum directions {
        STOP,
        FORWARD,
        BACKWARD,
        LEFT_SLIDE,
        RIGHT_SLIDE,
        ROTATE_CLOCKWISE,
        ROTATE_COUNTER_CLOCKWISE,
        TURN_LEFT_F,
        TURN_RIGHT_F,
        TURN_LEFT_B,
        TURN_RIGHT_B,
        ROT_POINT_LEFT_F,
        ROT_POINT_RIGHT_F,
        ROT_POINT_LEFT_B,
        ROT_POINT_RIGHT_B,
        SLIDE_DIAG_LEFT_F,
        SLIDE_DIAG_RIGHT_F,
        SLIDE_DIAG_LEFT_B,
        SLIDE_DIAG_RIGHT_B,
    };
    /*  Bloky   */

    //% blockId=device_show_number
    //% block="show|number|test $v"
    export function showNumber(v: number, interval: number = 150): void {

    }

    //% blockId=robotrix_expander_enable_motors
    //% block="enable|motors"
    export function enableMotors(): void {
        sendDataToExpander("0x10010000");
    }

    //% blockId=robotrix_expander_disable_motors
    //% block="disable|motors"
    export function disableMotors(): void {
        sendDataToExpander("0x10000000");
    }


    //% blockId=robotrix_expander_move
    //% block="move|in|direction $d at|speed $speed"
    export function carMoveSimple(d: directions, speed: number = 150): void {
        let a = 0x00;
        switch (d) {
            case directions.STOP:
                a = 0x00;
                break;
            case directions.FORWARD:
                a = 0x01;
                break;
        }
        sendDataToExpander("0x20" + a + speed + "0x00");

    }

    // Functions
    export function stringToInt(input: string): number {
        return round2Zero(parseInt(input));
    }

    export function round2Zero(input: number): number {
        return Math.trunc(input);
    }

    export function sendDataToExpander(input: string) {
        pins.i2cWriteNumber(
            85,
            stringToInt(input),
            NumberFormat.UInt32BE,
            false
        )
    }













    /* OLD  */



    export class RLed {
        buf: Buffer;
        address: number;

        /**
         * Turning on LED
         */
        //% blockId="robotrix_led_on" block="%led|turn on the LED"
        //% block.loc.cs="%led|zapni LEDku"
        //% led.defl=led
        //% weight=85 blockGap=8
        //% parts=led
        turnOnLED() {
            basic.showNumber(this.address)
        }

        /**
         * Turning off LED
         */
        //% blockId="robotrix_led_off" block="%led|turn off the led"
        //% block.loc.cs="%led|vypni LEDku"
        //% led.defl=led
        //% weight=85 blockGap=8
        //% parts=led
        turnOffLED() {
            basic.showNumber(0)
        }

        setAddress(address: number) {
            this.address = address;
        }

    }
    /**
     * Otestuje vybrané moduly
     * @param module typ modulu
     */
    //% block="test modules $modules"
    //% block.loc.cs="otestovat moduly $modules"
    export function test(modules: ModuleType): void {
        basic.showNumber(modules)
    }

    /**
     * Create a new LED I2C connection / instance
     * @param address I2C address
     */
    //% blockId="robotrix_create_led" block="New LED on address %address"
    //% block.loc.cs="Nová LEDka na adrese %address"
    //% weight=90 blockGap=8
    //% blockSetVariable=led
    //% parts=led
    export function createLED(address: number): RLed {
        let led = new RLed();
        led.setAddress(address);
        return led;
    }



}
