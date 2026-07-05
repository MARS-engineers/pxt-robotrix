namespace Robotrix {
    const device_address = 0;

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

        switch (sendTelemetryUsing) {
            case TelemetryTransportTypes.I2C:
                pins.i2cWriteBuffer(EXPANDER_ADRESS, TelemetryBuffer, false);

            case TelemetryTransportTypes.UART:
                serial.writeBuffer(TelemetryBuffer);
        }
        basic.pause(10);
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