namespace Robotrix {
    /**
     * Restart Board
     */
    //% subcategory="Settings"
    //% blockId="robotrix_restart_board"
    //% block="restart board"
    //% block.loc.cs="restartuj desku"
    //% weight=80
    export function restartBoard(): void {
        let b = pins.createBuffer(1);
        b.setUint8(0, 0x01);
        sendTelemetry(b, 0x02);
    }

    /**
     * Set Hardware version
     * @param v version eq. V01 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_set_board_version"
    //% block="set HW version $v"
    //% block.loc.cs="nastav HW verzi $v"
    //% deprecated=true
    //% weight=80
    export function setBoardVersion(v: BoardVersion): void {
        RobotrixHWVersion = v;

        // Set defaults for board
        switch (v) {
            case BoardVersion.V01:
                setComunicationType(TelemetryTransportTypes.I2C);
                setSonarsConnection(SonarConnectedToTypes.MicroBit);

            case BoardVersion.V02:
                setComunicationType(TelemetryTransportTypes.UART);
                setSonarsConnection(SonarConnectedToTypes.MainBoard);

            default:
                setComunicationType(TelemetryTransportTypes.UART);
                setSonarsConnection(SonarConnectedToTypes.MicroBit);

        }
    }

    /**
     * Set Communication type
     * @param type type of communication eq. UART
     */
    //% subcategory="Settings"
    //% blockId="robotrix_set_comm"
    //% block="set communication type $type"
    //% block.loc.cs="nastav styl komunikace na $type"
    //% weight=75
    export function setComunicationType(type: TelemetryTransportTypes): void {
        sendTelemetryUsing = type;
    }

    /**
     * Set where are connected sonars
     * @param conn type of communication eq. MainBoard
     */
    //% subcategory="Settings"
    //% blockId="robotrix_set_sonar_con"
    //% block="set sonar connected to $conn"
    //% block.loc.cs="nastav sonary připojeny na $conn"
    //% weight=74
    export function setSonarsConnection(conn: SonarConnectedToTypes): void {
        SonarConnectedTo = conn;
    }

    /**
     * Set Firmware version
     * @param v version eq. V01 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_set_firmware_version"
    //% block="set FW version $v"
    //% block.loc.cs="nastav FW verzi $v"
    //% deprecated=true
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
    //% deprecated=true
    //% weight=60
    export function getFirmwareVersion(): string {
        return "";
    }

    /**
     * Get Hardware version
     * @param v version eq. V01 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_get_Hardware_version"
    //% block="get HW version"
    //% block.loc.cs="přečti HW verzi"
    //% deprecated=true
    //% weight=50
    export function getHardwareVersion(): string {
        return "";
    }

    /**
     * Get MEDI
     * @returns string eq. 2110240003 
     */
    //% subcategory="Settings"
    //% blockId="robotrix_get_medi"
    //% block="get MEDI"
    //% block.loc.cs="přečti MEDI"
    //% deprecated=true
    //% weight=50
    export function getMEDI(): string {
        return "";
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