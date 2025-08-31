namespace Robotrix {

    //% subcategory="Pins"
    //% subcategory.loc.cs="Piny"
    //% block="Pin Outs"
    //% block.loc.cs="Pin výstupy"
    export enum PinOuts {   // Only for version v0.1
        //% block="RP0"
        RP0 = DigitalPin.P4,
        //% block="RP1"
        RP1 = DigitalPin.P5,
        //% block="RP2"
        RP2 = DigitalPin.P6,
        //% block="RP3"
        RP3 = DigitalPin.P7,
        //% block="RP4"
        RP4 = DigitalPin.P1,
        //% block="RP5"
        RP5 = DigitalPin.P11,
        //% block="RP6"
        RP6 = DigitalPin.P13,
        //% block="RP7"
        RP7 = DigitalPin.P14,
        //% block="SONAR IRQ"
        SONAR_IRQ = DigitalPin.P0,
        //% block="RGB"
        RGB = DigitalPin.P10,
    }

    /**
 * Does not do anythink
 */
    //% subcategory="Pins"
    //% blockId="robotrix_RP_to_pin"
    //% block="Converet RP $RPpin to pin"
    //% block.loc.cs="převeď RP $RPpin na pin"
    //% weight=80
    export function RPtoPin(RPpin: PinOuts): DigitalPin {
        return RPpin as any as DigitalPin;
        //return DigitalPin.P0;
    }


}