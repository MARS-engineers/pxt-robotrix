namespace Robotrix {
    /**
     * Set Hardware version
     * @param v version eq. V01 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_set_board_version"
    //% block="set HW version $v"
    //% block.loc.cs="nastav HW verzi $v"
    //% weight=80
    export function setBoardVersion(v: BoardVersion): void {
        RobotrixHWVersion = v;
    }

    /**
     * Set Firmware version
     * @param v version eq. V01 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_set_firmware_version"
    //% block="set FW version $v"
    //% block.loc.cs="nastav FW verzi $v"
    //% weight=70
    export function setFirmwareVersion(v: FirwareVersion): void {
        RobotrixFWVersion = v;
    }

    /**
    * Get Firmware version
    * @param v version eq. V01 
    */
    //% subcategory="Settings"
    //% blockId="robotrix_get_firmware_version"
    //% block="get FW version"
    //% block.loc.cs="přečti FW verzi"
    //% weight=60
    export function getFirmwareVersion(): string {
        if (RobotrixFWVersion <= FirwareVersion.V01) return "NaN";
        pins.i2cWriteNumber(EXPANDER_ADRESS, Math.trunc(parseInt("0x03010000")), NumberFormat.UInt32BE, false);

        let buf = pins.i2cReadBuffer(EXPANDER_ADRESS, 4, false) // čti 4 bajty
        return convertBytesToString(buf);
    }

    /**
     * Get Hardware version
     * @param v version eq. V01 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_get_Hardware_version"
    //% block="get HW version"
    //% block.loc.cs="přečti HW verzi"
    //% weight=50
    export function getHardwareVersion(): string {
        if (RobotrixFWVersion <= FirwareVersion.V01) return "NaN";
        pins.i2cWriteNumber(EXPANDER_ADRESS, Math.trunc(parseInt("0x03020000")), NumberFormat.UInt32BE, false);

        let buf = pins.i2cReadBuffer(EXPANDER_ADRESS, 4, false) // čti 4 bajty
        return convertBytesToString(buf);
    }

    /**
     * Get MEDI
     * @returns string eq. 2110240003 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_get_medi"
    //% block="get MEDI"
    //% block.loc.cs="přečti MEDI"
    //% weight=50
    export function getMEDI(): string {
        if (RobotrixFWVersion <= FirwareVersion.V01) return "NaN";
        pins.i2cWriteNumber(EXPANDER_ADRESS, Math.trunc(parseInt("0x03030000")), NumberFormat.UInt32BE, false);

        let buf = pins.i2cReadBuffer(EXPANDER_ADRESS, 11, false) // čti 4 bajty
        return convertBytesToString(buf);
    }

    function convertBytesToString(buf: Buffer): string {
        let text = "";
        for (let i = 0; i < buf.length; i++) {
            let c = buf[i];
            if (c == 0) break // konec C-řetězce
            text += String.fromCharCode(c);
        }
        return text;
    }
}