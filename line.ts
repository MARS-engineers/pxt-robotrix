namespace Robotrix {
    export enum lineDirection {
        //% block="Straight"
        //% block.loc.cs="Rovně"
        STRAIGHT,
        //% block="Left"
        //% block.loc.cs="Doleva"
        LEFT,
        //% block="Left hard"
        //% block.loc.cs="Ostře doleva"
        LEFT_HARD,
        //% block="Left Soft"
        //% block.loc.cs="Mírně doleva"
        LEFT_SOFT,
        //% block="Right"
        //% block.loc.cs="Doprava"
        RIGHT,
        //% block="Right hard"
        //% block.loc.cs="Ostře doprava"
        RIGHT_HARD,
        //% block="Right soft"
        //% block.loc.cs="Mírně doprava"
        RIGHT_SOFT,
        //% block="No line"
        //% block.loc.cs="Žádná čára"
        NOLINE,
        //% block="Empty"
        //% block.loc.cs="Nic/Hrana stolu"
        EMPTY
    }

    let pin_L1: RobotrixPins, pin_L2: RobotrixPins, pin_S: RobotrixPins, pin_R1: RobotrixPins, pin_R2: RobotrixPins;

    /**
     * Setup line sensor
     */
    //% subcategory="line"
    //% blockId="robotrix_line_setup"
    //% block="Setup line sensor at pins | Left1 $L1 Left2 $L2 Middle $M Right1 $R1 Right2 $R2"
    //% block.loc.cs="Nastav senzor čáry na piny | Levá1 $L1 Levá2 $L2 Uprostřed $M Pravá1 $R1 Pravá2 $R2"
    //% weight=80
    export function setupLine(L1?: RobotrixPins, L2?: RobotrixPins, M?: RobotrixPins, R1?: RobotrixPins, R2?: RobotrixPins): void {
        pin_L1 = L1;
        pin_L2 = L2;
        pin_S = M;
        pin_R1 = R1;
        pin_R2 = R2;
    }

    /**
     * Is line detected?
     */
    //% subcategory="line"
    //% blockId="robotrix_line_is_detected"
    //% block="Is line detected in direction %direction"
    //% block.loc.cs="Je čára detekována ve směru %direction"
    //% weight=80
    export function isLineDetected(direction: lineDirection): Boolean {
        switch (direction) {
            case lineDirection.STRAIGHT:
                if (readBol(pin_L1) && readBol(pin_L2) && !readBol(pin_S) && readBol(pin_R1) && readBol(pin_R2)) return true;
                else return false;

            case lineDirection.LEFT:
                if (!readBol(pin_L1) || !readBol(pin_L2) && readBol(pin_R1) && readBol(pin_R2)) return true;
                else return false;
            case lineDirection.LEFT_HARD:
                if (!readBol(pin_L1) || readBol(pin_L2) && readBol(pin_R1) && readBol(pin_R2)) return true;
                else return false;
            case lineDirection.LEFT_SOFT:
                if (readBol(pin_L1) || !readBol(pin_L2) && readBol(pin_R1) && readBol(pin_R2)) return true;
                else return false;

            case lineDirection.RIGHT:
                if (readBol(pin_L1) && readBol(pin_L2) && !readBol(pin_R1) || !readBol(pin_R2)) return true;
                else return false;
            case lineDirection.RIGHT_HARD:
                if (readBol(pin_L1) && readBol(pin_L2) && readBol(pin_R1) || !readBol(pin_R2)) return true;
                else return false;
            case lineDirection.RIGHT_SOFT:
                if (readBol(pin_L1) && readBol(pin_L2) && !readBol(pin_R1) || readBol(pin_R2)) return true;
                else return false;

            case lineDirection.NOLINE:
                if (!readBol(pin_L1) && readBol(pin_L2) && readBol(pin_S) && readBol(pin_R1) && readBol(pin_R2)) return true;
                else return false;
            case lineDirection.EMPTY:
                if (!readBol(pin_L1) && !readBol(pin_L2) && !readBol(pin_S) && !readBol(pin_R1) && !readBol(pin_R2)) return true;
                else return false;
        }
        return false;

    }

}