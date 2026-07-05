namespace Robotrix {

    export enum CarMoveDirections {
        //% block="Diagonal forward left"
        //% block.loc.cs="Diagonálně vpřed vlevo"
        DIAG_FWD_LEFT = 5,

        //% block="Forward"
        //% block.loc.cs="Dopředu"
        FORWARD = 1,

        //% block="Diagonal forward right"
        //% block.loc.cs="Diagonálně vpřed vpravo"
        DIAG_FWD_RIGHT = 6,

        //% block="Slide right"
        //% block.loc.cs="Posuň se doprava"
        SLIDE_RIGHT = 3,

        //% block="Stop"
        //% block.loc.cs="Zastav"
        STOP = 0,

        //% block="Slide left"
        //% block.loc.cs="Posuň se doleva"
        SLIDE_LEFT = 4,

        //% block="Diagonal backward left"
        //% block.loc.cs="Diagonálně vzad vlevo"
        DIAG_BACK_LEFT = 7,

        //% block="Backward"
        //% block.loc.cs="Dozadu"
        BACKWARD = 2,

        //% block="Diagonal backward right"
        //% block.loc.cs="Diagonálně vzad vpravo"
        DIAG_BACK_RIGHT = 8,
    }

    /**
     *  Enable motors function.
     */
    //% subcategory="Movement"
    //% blockId=robotrix_expander_enable_motors
    //% block="enable motors"
    //% block.loc.cs="Zapni motory"
    export function enableMotors(): void {
        let b = pins.createBuffer(1);
        b.setUint8(0, 1);
        sendTelemetry(b, 0x10);
    }

    //% subcategory="Movement"
    //% blockId=robotrix_expander_disable_motors
    //% block="disable motors"
    //% block.loc.cs="Vypni motory"
    export function disableMotors(): void {
        let b = pins.createBuffer(1);
        b.setUint8(0, 0);
        sendTelemetry(b, 0x10);
    }

    /**
     * Stop all movement of motors
     */
    //% subcategory="Movement"
    //% blockId=robotrix_expander_stop
    //% block="Stop"
    //% block.loc.cs="Zastav se na místě"
    export function stop(): void {
        sendTelemetry(pins.createBuffer(0), 0x21);
    }

    /**
     * Move in direction
     * @param direction direction where we want to go, eg: directions2.STRAIGHT
     * @param speedPercent speed in percent at with we want to go, eg: 100 or -100 to go in oposite direction
     */
    //% subcategory="Movement"
    //% blockId=robotrix_motors_move
    //% block="move in direction $direction at speed $speedPercent"
    //% speedPercent.min=-100 speedPercent.max=100
    //% block.loc.cs="Jeď ve směru 2 $direction  rychlostí $speedPercent"
    //% speedPercent.shadow="speedPicker"
    //% direction.fieldEditor="gridpicker"
    //% direction.fieldOptions.width=220
    //% direction.fieldOptions.columns=3
    export function moveInDirection(direction: CarMoveDirections, speedPercent: number = 0): void {
        //let s = speed.toString(16);   dont work in makercode
        let speed = Math.map(speedPercent, -100, 100, -127, 127);

        let b = pins.createBuffer(2);
        b.setUint8(0, direction);
        b.setUint8(1, speed);
        sendTelemetry(b, 0x31);
    }
}