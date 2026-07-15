namespace Robotrix {
    const device_address = 0;


    /**
     * sendTelemetry
     */
    //% subcategory="Tests"
    //% blockId="robotrix_send_Telemetry"
    //% block="send telemetry $payload as type $telemetry_type"
    //% block.loc.cs="pošli telemetrii $payload as typ $telemetry_type"
    //% deprecated=true
    //% weight=80
    // Prepare packet and send it using callback
    export function sendTelemetry(payload: Buffer, telemetry_type: number): void {
        let buf = [];
        let i = 0;

        buf[i++] = device_address;

        let len_index = i++;  // Reserve length (fill later)

        buf[i++] = telemetry_type;  // custom telemetry type

        if (payload.length > 60) return;  // Exit if payload len is > 60 bytes

        for (let y = 0; y < payload.length; y++) {  // Add payload
            buf[i++] = payload.getUint8(y);
        }

        let data_len = i - 2;       // type + payload
        buf[len_index] = data_len + 1;  // + CRC

        buf[i++] = crc8(buf.slice(2, data_len), data_len + 1);  // Add CRC

        let TelemetryBuffer = pins.createBufferFromArray(buf);

        serial.writeBuffer(TelemetryBuffer);

        basic.pause(10);
    }


    let rxBuf: number[] = []

    /**
     * onReceiveTelemetry
     */
    //% subcategory="Tests"
    //% blockId="robotrix_on_receiveTelemetry"
    //% block="decode telemetry"
    //% block.loc.cs="dekóduj telemetrii"
    //% deprecated=true
    //% weight=80
    export function onReceiveTelemetry() {
        // Read all available bytes
        let data = serial.readBuffer(serial.readBuffer(0)[0])

        for (let i = 0; i < data.length; i++) {
            if (rxBuf.length < 128) {
                rxBuf.push(data[i])
            }
        }

        while (rxBuf.length >= 2) {

            let packetLen = rxBuf[1]

            // Invalid packet length
            if (packetLen > 60 || packetLen < 2) {
                rxBuf.shift() // discard one byte
                continue
            }

            let totalLen = packetLen + 2

            // Wait for complete packet
            if (rxBuf.length < totalLen) {
                break
            }

            /*
            // Debug output
            let msg = "bytes: " + totalLen + ", data:"
            for (let i = 0; i < totalLen; i++) {
                let h = rxBuf[i].toString(16)
                if (h.length < 2) h = "0" + h
                msg += " " + h
            }
            serial.writeLine(msg)
            */
            // Extract packet
            let data = rxBuf.slice(0, totalLen)

            let packet = parseData(data);
            parsePacket(packet);

            // Remove processed packet
            rxBuf.splice(0, totalLen)
        }
    }



    function parseData(data: number[]): packetObject {
        let output = {
            address: 0,
            data_len: 0,
            telemetry_type: 0,
            payload: [0],
            crc8: 0
        }
        let i = 0;

        output.address = data[i++];
        output.data_len = data[i++];
        output.telemetry_type = data[i++];

        for (let s = 0; s < output.data_len; s++) {
            output.payload[s] = data[i++];
        }

        output.crc8 = data[i++];

        return output;
    }


    interface packetObject {
        address: Number;
        data_len: Number;
        telemetry_type: Number;
        payload: number[];
        crc8: Number;
    };

    function parsePacket(packet: packetObject) {
        let payload = packet.payload;
        switch (packet.telemetry_type) {

            case 0x08:
                telemetry.batteryVoltage = (payload[0] << 8) | payload[1];
                telemetry.batteryVoltage = telemetry.batteryVoltage / 10;

                telemetry.current = (payload[2] << 8) | payload[3];
                telemetry.current = telemetry.current / 10;

                telemetry.batteryRemaining = payload[5];

                break;
            
            case 0x32:
                let i = 0;

                for (let s = 0; s < 6; s++) {
                    const val = (payload[i] << 8) | payload[i + 1];
                    telemetry.sonars[i] = val;
                    i += 2;
                }

                break;
            
            
        }
    }

    export function crc8(buf: number[], len: number) {
        let crc = 0;
        let y = 0;
        while (len--) {
            crc ^= buf[y++];
            for (let i = 0; i < 8; i++) {
                if (crc & 0x80)
                    crc = (crc << 1) ^ 0xD5;
                else
                    crc <<= 1;
            }
        }
        return crc;
    }
}