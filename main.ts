//% color=190 weight=100 icon="\uf1b9" block="RoboTriX Rover 1"
namespace Robotrix {
    const OBJECT_DETECTED_DISTANCE = 20

    // Basic functions 

    /**
     * Inicialises all functions of car. 
     */
    //% blockId="robotrix_turn_on_car"
    //% block="Turn on car"
    //% block.loc.cs="Nastartuj auto"
    //% weight=1000
    export function TurnOnCar() {
        enableMotors();
        connectUltrasonicDistanceSensor();
    }



    
    /**
     * 
     * @param direction where we want to detect object
     * @returns `true` if object is detected in OBJECT_DETECTED_DISTANCE range. `false` otherwise
     */
    //% blockId="robotrix_ultrasonic_detected"
    //% block="object is detected in $direction"
    //% block.loc.cs="překážka je detekována ve směru | $direction"
    //% weight=50
    export function isObjectDetected(direction: SonarDirections): boolean {
        if (getUltrasonicDistance(direction) < OBJECT_DETECTED_DISTANCE) return true;
        else return false;
    }

    /**
     * 
     * @param direction where we want to detect object
     * @returns `true` if object is not detected in OBJECT_DETECTED_DISTANCE range. `false` otherwise
     */
    //% blockId="robotrix_ultrasonic_not_detected"
    //% block="object is not detected in $direction"
    //% block.loc.cs="není detekována překážka ve směru $direction"
    //% weight=51
    export function isNotObjectDetected(direction: SonarDirections): boolean {
        if (getUltrasonicDistance(direction) < OBJECT_DETECTED_DISTANCE) return false;
        else return true;
    }


    /* OLD  */
    export enum directions_old {
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

    //% subcategory="Test"
    //% blockId=robotrix_expander_move_old
    //% block="old|move|in|direction $d at|speed $speed"
    export function carMoveSimpleOld(d: directions_old, speed: string = "A0"): void {  // TO-DO change speed from hex value to dec int 0-255/0-100%
        let a = d as string;
        if (a.length < 2) {
            a = "0" + a;
        }
        sendDataToExpander("0x" + "20" + a + speed + "00");
    }




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

    export class RLed {
        buf: Buffer;
        address: number;

        /**
         * Turning on LED
         */
        //% subcategory="Test"
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
        //% subcategory="Test"
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
    //% subcategory="Test"
    //% block="test modules $modules"
    //% block.loc.cs="otestovat moduly $modules"
    export function test(modules: ModuleType): void {
        basic.showNumber(modules)
    }

    /**
     * Create a new LED I2C connection / instance
     * @param address I2C address
     */
    //% subcategory="Test"
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
