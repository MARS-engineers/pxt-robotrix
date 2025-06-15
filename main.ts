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
        STOP = "00",
        FORWARD = "01",
        BACKWARD = "02",
        LEFT_SLIDE = "03",
        RIGHT_SLIDE = "04",
        ROTATE_CLOCKWISE = "05",
        ROTATE_COUNTER_CLOCKWISE = "06",
        TURN_LEFT_F = "07",
        TURN_RIGHT_F = "08",
        TURN_LEFT_B = "09",
        TURN_RIGHT_B = "0A",
        ROT_POINT_LEFT_F = "0B",
        ROT_POINT_RIGHT_F = "0C",
        ROT_POINT_LEFT_B = "0D",
        ROT_POINT_RIGHT_B = "0E",
        SLIDE_DIAG_LEFT_F = "0F",
        SLIDE_DIAG_RIGHT_F = "10",
        SLIDE_DIAG_LEFT_B = "11",
        SLIDE_DIAG_RIGHT_B = "12",
    };
    /*  Bloky   */

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
    export function carMoveSimple(d: directions, speed: string = "A0"): void {  // TO-DO change speed from hex value to dec int 0-255/0-100%
        let a = d.toString().padStart(2, "0");
        sendDataToExpander("0x" + "20" +  a + speed + "00");
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
