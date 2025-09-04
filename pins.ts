namespace Robotrix {

    //% subcategory="Pins"
    //% subcategory.loc.cs="Piny"
    //% block="Pin Outs"
    //% block.loc.cs="Pin výstupy"
    export enum RobotrixPins {
        //% block="RP0"
        RP0,
        //% block="RP1"
        RP1,
        //% block="RP2"
        RP2,
        //% block="RP3"
        RP3,
        //% block="RP4"
        RP4,
        //% block="RP5"
        RP5,
        //% block="RP6"
        RP6,
        //% block="RP7"
        RP7,
        //% block="RP8"
        RP8,
        //% block="RP9"
        RP9,
        //% block="SONAR IRQ"
        SONAR_IRQ,
        //% block="RGB"
        RGB,
    }

    /**
     * Converts RP to Pin
     * @param rp pin on Robotrix board
     * @returns DigitalPin
    */
    //% subcategory="Pins"
    //% blockId="robotrix_RP_to_pin"
    //% block="Converet RP $rp to pin"
    //% block.loc.cs="převeď RP $rp na pin"
    //% weight=80
    export function RPtoPin(rp: RobotrixPins): DigitalPin {
        switch (RobotrixHWVersion) {
            case BoardVersion.V01:
                switch (rp) {
                    case RobotrixPins.RP0: return DigitalPin.P4;
                    case RobotrixPins.RP1: return DigitalPin.P5;
                    case RobotrixPins.RP2: return DigitalPin.P6;
                    case RobotrixPins.RP3: return DigitalPin.P7;
                    case RobotrixPins.RP4: return DigitalPin.P1;
                    case RobotrixPins.RP5: return DigitalPin.P11;
                    case RobotrixPins.RP6: return DigitalPin.P13;
                    case RobotrixPins.RP7: return DigitalPin.P14;
                    case RobotrixPins.SONAR_IRQ: return DigitalPin.P0;
                    case RobotrixPins.RGB: return DigitalPin.P10;
                    default:
                        console.log("Pin not supported in V0.1, value=" + rp);
                        return DigitalPin.P0;
                }
            case BoardVersion.V02:
                switch (rp) {
                    case RobotrixPins.RP0: return DigitalPin.P4;
                    case RobotrixPins.RP1: return DigitalPin.P5;
                    case RobotrixPins.RP2: return DigitalPin.P6;
                    case RobotrixPins.RP3: return DigitalPin.P7;
                    case RobotrixPins.RP4: return DigitalPin.P8;
                    case RobotrixPins.RP5: return DigitalPin.P2;
                    case RobotrixPins.RP6: return DigitalPin.P13;
                    case RobotrixPins.RP7: return DigitalPin.P14;
                    case RobotrixPins.RP8: return DigitalPin.P15;
                    case RobotrixPins.RP9: return DigitalPin.P16;
                    case RobotrixPins.SONAR_IRQ: return DigitalPin.P0;
                    case RobotrixPins.RGB: return DigitalPin.P1;
                    default:
                        console.log("Pin not supported in V0.2, value=" + rp);
                        return DigitalPin.P0;
                }
            case BoardVersion.NOBOARD:  // If not using Robotrix board map RP directly to microbit pinsS
                switch (rp) {
                    case RobotrixPins.RP0: return DigitalPin.P0;
                    case RobotrixPins.RP1: return DigitalPin.P1;
                    case RobotrixPins.RP2: return DigitalPin.P2;
                    case RobotrixPins.RP3: return DigitalPin.P3;
                    case RobotrixPins.RP4: return DigitalPin.P4;
                    case RobotrixPins.RP5: return DigitalPin.P5;
                    case RobotrixPins.RP6: return DigitalPin.P6;
                    case RobotrixPins.RP7: return DigitalPin.P7;
                    case RobotrixPins.RP8: return DigitalPin.P8;
                    case RobotrixPins.RP9: return DigitalPin.P9;
                    case RobotrixPins.SONAR_IRQ: return DigitalPin.P10;
                    case RobotrixPins.RGB: return DigitalPin.P11;
                    default:
                        console.log("Pin not supported in NOBOARD, value=" + rp);
                        return DigitalPin.P0;
                }
            default:
                control.fail("Unknown board version");
                return DigitalPin.P0;
        }
    }

}