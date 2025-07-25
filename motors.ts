namespace Robotrix {
    export enum directions2 {
        //% block="Straight"
        //% block.loc.cs="Rovně"
        STRAIGHT = "00",
        //% block="Slide"
        //% block.loc.cs="Do boku"
        SLIDE = "01",
        //% block="Turn around"
        //% block.loc.cs="Otáčej se na místě"
        TURN_AROUND = "02",
        //% block="Turn at rear"
        //% block.loc.cs="Otáčej se zadkem"
        TURN_REAR = "03",
        //% block="Turn at front"
        //% block.loc.cs="Otáčej se předkem"
        TURN_FRONT = "04",
        //% block="Diagonal Left"
        //% block.loc.cs="Diagonálně vlevo"
        DIAG_LEFT = "05",
        //% block="Diagonal right"
        //% block.loc.cs="Diagonálně vpravo"
        DIAG_RIGHT = "06"
    };

    /**
     *  Enable motors function.
     */
    //% subcategory="Movement"
    //% blockId=robotrix_expander_enable_motors
    //% block="enable motors"
    //% block.loc.cs="Zapni motory"
    export function enableMotors(): void {
        sendDataToExpander("0x10010000");
    }

    //% subcategory="Movement"
    //% blockId=robotrix_expander_disable_motors
    //% block="disable motors"
    //% block.loc.cs="Vypni motory"
    export function disableMotors(): void {
        sendDataToExpander("0x10000000");
    }

    /**
     * Stop all movement of motors
     */
    //% subcategory="Movement"
    //% blockId=robotrix_expander_stop
    //% block="Stop"
    //% block.loc.cs="Zastav se na místě"
    export function stop(): void {
        sendDataToExpander("0x20000000");
    }


    /**
     * Move in direction
     * @param d direction where we want to go, eg: directions2.STRAIGHT
     * @param speedPercent speed in percent at with we want to go, eg: 100 or -100 to go in oposite direction
     */
    //% subcategory="Movement"
    //% blockId=robotrix_expander_move2
    //% block="move in direction $d at speed $speedPercent %"
    //% speedPercent.min=-100 speedPercent.max=100
    //% block.loc.cs="Jeď ve směru $d  rychlostí $speedPercent %"
    export function carMoveSimple(d: directions2, speedPercent: number = 0): void {
        //let s = speed.toString(16);   dont work in makercode
        let speed = Math.map(speedPercent, -100, 100, -127, 127);
        let speedHex = intToSignedHex(speed);

        sendDataToExpander("0x" + "21" + "0" + d + speedHex + "00");

    }

    //% subcategory="Test"
    //% blockId=robotrix_expander_motor_run
    //% block="run motor $mot at speed $speed"
    export function motorRun(mot: number, speed: number): void {
        let motHex = intToSignedHex(Math.map(speed, -100, 100, -127, 127));
        pins.i2cWriteNumber(85, stringToInt("0x11" + intToHex(mot) + motHex + "00"), NumberFormat.UInt32BE, false);
    }

    //% subcategory="Test"
    //% blockId=robotrix_expander_motors_run
    //% block="run motor1 $m1 motor2 $m2 motor3 $m3 motor4 $m4"
    export function motorsRun(m1: number, m2: number, m3: number, m4: number): void {
        let m1Hex = intToSignedHex(Math.map(m1, -100, 100, -127, 127));
        let m2Hex = intToSignedHex(Math.map(m2, -100, 100, -127, 127));
        let m3Hex = intToSignedHex(Math.map(m3, -100, 100, -127, 127));
        let m4Hex = intToSignedHex(Math.map(m4, -100, 100, -127, 127));

        pins.i2cWriteNumber(85, stringToInt("0x12" + m1Hex + m2Hex + m3Hex), NumberFormat.UInt32BE, false);

        //sendDataToExpander("0x" + "12" + m1Hex + m2Hex + m3Hex + m4Hex);
    }



    // Functions
    export function intToSignedHex(input: number): string {
        let hex = '';
        const hexChars = '0123456789abcdef';

        // Handle negative numbers
        if (input < 0) input = 128 + Math.abs(input); // Convert to unsigned 32-bit integer

        while (input > 0) {
            const remainder = input % 16;
            hex = hexChars[remainder] + hex;
            input = Math.floor(input / 16);
        }

        if (hex.length == 1) hex = '0' + hex; 

        return hex || '00'; // Return '0' if the number is 0
    }

    export function intToHex(input: number): string {
        let hex = '';
        const hexChars = '0123456789abcdef';

        // Handle negative numbers
        if (input < 0) return '00';

        while (input > 0) {
            const remainder = input % 16;
            hex = hexChars[remainder] + hex;
            input = Math.floor(input / 16);
        }

        if (hex.length == 1) { hex = '0' + hex; }

        return hex || '00'; // Return '0' if the number is 0
    }


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
}