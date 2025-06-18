//% color=190 weight=100 icon="\uf1b9" block="RoboTriX Rover 1"
namespace Robotrix {
    export enum DistanceUnit {
        //% block="cm"
        CM = 58, // Duration of echo round-trip in Microseconds (uS) for two centimeters, 343 m/s at sea level and 20°C
        //% block="inch"
        INCH = 148, // Duration of echo round-trip in Microseconds (uS) for two inches, 343 m/s at sea level and 20°C
    }

    const SONAR_ECHO_PIN = DigitalPin.P14;  // Change to DigitalPin.P0 when on PCB
    const SONARS_N = 4;
    const MICROBIT_MAKERBIT_ULTRASONIC_OBJECT_DETECTED_ID = 798;
    const MAX_ULTRASONIC_TRAVEL_TIME = 300 * DistanceUnit.CM;
    const ULTRASONIC_MEASUREMENTS = 3;

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

    export enum directions {
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

    export enum SonarDirections {
        FRONT = 0,
        FRONT_LEFT = 1,
        FRONT_RIGHT = 2,
        LEFT = 3,
        RIGHT = 4,
        BACK = 5
    }


    /*  Bloky   */
    //% subcategory="Movement"
    //% blockId=robotrix_expander_enable_motors
    //% block="enable|motors"
    export function enableMotors(): void {
        sendDataToExpander("0x10010000");
    }

    //% subcategory="Movement"
    //% blockId=robotrix_expander_disable_motors
    //% block="disable|motors"
    export function disableMotors(): void {
        sendDataToExpander("0x10000000");
    }

    //% subcategory="Movement"
    //% blockId=robotrix_expander_stop
    //% block="stop"
    export function stop(): void {
        sendDataToExpander("0x20000000");
    }

    //% subcategory="Movement"
    //% blockId=robotrix_expander_move
    //% block="move|in|direction $d at|speed $speed"
    export function carMoveSimple(d: directions, speed: string = "A0"): void {  // TO-DO change speed from hex value to dec int 0-255/0-100%
        let a = d as string;
        if (a.length < 2) {
            a = "0" + a;
        }
        sendDataToExpander("0x" + "20" + a + speed + "00");
    }

    // Functions
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

    /* 
        Insired by https://github.com/arielnh56/OctoSonar 
        Code for sonar modified from https://github.com/1010Technologies/pxt-makerbit-ultrasonic
    */
    
    let _currentSonar = 0;

    interface UltrasonicRoundTrip {
        ts: number;
        rtt: number;
    }

    interface UltrasonicDevice {
        roundTrips: UltrasonicRoundTrip[];
        medianRoundTrip: number;
        travelTimeObservers: number[];
    }
    let ultrasonicState: UltrasonicDevice[] = [];

    /**
     * Configures the ultrasonic distance sensor and measures continuously in the background.
     */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_connect"
    //% block="connect ultrasonic distance sensor"
    //% weight=80
    export function connectUltrasonicDistanceSensor(): void {
        for (let i = 0; i < 8; i++) {
            ultrasonicState.push({
                roundTrips: [{ ts: 0, rtt: MAX_ULTRASONIC_TRAVEL_TIME }],
                medianRoundTrip: MAX_ULTRASONIC_TRAVEL_TIME,
                travelTimeObservers: [],
            });
        }

        sendDataToSonar("0xff");

        pins.onPulsed(SONAR_ECHO_PIN, PulseValue.High, () => {
            if (
                pins.pulseDuration() < MAX_ULTRASONIC_TRAVEL_TIME &&
                ultrasonicState[_currentSonar].roundTrips.length <= ULTRASONIC_MEASUREMENTS
            ) {
                ultrasonicState[_currentSonar].roundTrips.push({
                    ts: input.runningTime(),
                    rtt: pins.pulseDuration(),
                });
            }
        });

        control.inBackground(measureInBackground);
    }

    /**
     * Do something when an object is detected the first time within a specified range.
     * @param distance distance to object, eg: 20
     * @param unit unit of distance, eg: DistanceUnit.CM
     * @param handler body code to run when the event is raised
     */
    //% subcategory="Ultrasonic"
    //% blockId=robotrix_ultrasonic_on_object_detected
    //% block="on object detected once within | %distance | %unit at direction %direction"
    //% weight=69
    export function onUltrasonicObjectDetected(
        direction: SonarDirections,
        distance: number,
        unit: DistanceUnit,
        handler: () => void
    ) {
        if (distance <= 0) {
            return;
        }

        if (!ultrasonicState[direction]) {
            ultrasonicState[direction] = {
                roundTrips: [{ ts: 0, rtt: MAX_ULTRASONIC_TRAVEL_TIME }],
                medianRoundTrip: MAX_ULTRASONIC_TRAVEL_TIME,
                travelTimeObservers: [],
            };
        }

        const travelTimeThreshold = Math.imul(distance, unit);

        ultrasonicState[direction].travelTimeObservers.push(travelTimeThreshold);

        control.onEvent(
            MICROBIT_MAKERBIT_ULTRASONIC_OBJECT_DETECTED_ID,
            travelTimeThreshold,
            () => {
                handler();
            }
        );
    }

    /**
     * Returns the distance to an object in a range from 1 to 300 centimeters or up to 118 inch.
     * The maximum value is returned to indicate when no object was detected.
     * -1 is returned when the device is not connected.
     * @param unit unit of distance, eg: DistanceUnit.CM
     */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_distance"
    //% block="ultrasonic %direction distance in %unit"
    //% weight=60
    export function getUltrasonicDistance(direction: SonarDirections, unit: DistanceUnit): number {
        if (!ultrasonicState) {
            return -1;
        }
        basic.pause(0); // yield to allow background processing when called in a tight loop
        return Math.idiv(ultrasonicState[direction].medianRoundTrip, unit);
    }

    /**
* Returns the distance to an object in a range from 1 to 300 centimeters or up to 118 inch.
* The maximum value is returned to indicate when no object was detected.
* -1 is returned when the device is not connected.
* @param unit unit of distance, eg: DistanceUnit.CM
* @param sonar what sensor is used for measuring distance
*/
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_distance_all"
    //% block="distance measured by sonars in %unit"
    //% weight=60
    export function getUltrasonicDistanceAll(unit: DistanceUnit): string {
        if (!ultrasonicState) {
            return "-1";
        }
        basic.pause(0); // yield to allow background processing when called in a tight loop
        let a = "";
        for (let i = 0; i < SONARS_N; i++) {
            a += Math.idiv(ultrasonicState[i].medianRoundTrip, unit);
            a += ", ";
        }
        return a;
    }


    /**
     * Returns `true` if an object is within the specified distance. `false` otherwise.
     *
     * @param distance distance to object, eg: 20
     * @param unit unit of distance, eg: DistanceUnit.CM
     */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_less_than"
    //% block="ultrasonic %direction distance is less than | %distance | %unit"
    //% weight=50
    export function isUltrasonicDistanceLessThan(
        direction: SonarDirections,
        distance: number,
        unit: DistanceUnit
    ): boolean {
        if (!ultrasonicState) {
            return false;
        }
        basic.pause(0); // yield to allow background processing when called in a tight loop
        return Math.idiv(ultrasonicState[direction].medianRoundTrip, unit) < distance;
    }

    function triggerPulse(sonar: number) {
        // Reset trigger pin
        //pins.setPull(ultrasonicState.trig, PinPullMode.PullNone);
        //pins.digitalWritePin(ultrasonicState.trig, 0);
        sendDataToSonar("0x00");

        control.waitMicros(2);

        // Trigger pulse
        //pins.digitalWritePin(ultrasonicState.trig, 1);
        let a = 1 << sonar;
        sendDataToSonarDec(a);
        control.waitMicros(10);
        sendDataToSonar("0x00");
        //pins.digitalWritePin(ultrasonicState.trig, 0);
    }

    function getMedianRRT(roundTrips: UltrasonicRoundTrip[]) {
        const roundTripTimes = roundTrips.map((urt) => urt.rtt);
        return median(roundTripTimes);
    }

    // Returns median value of non-empty input
    function median(values: number[]) {
        values.sort((a, b) => {
            return a - b;
        });
        return values[(values.length - 1) >> 1];
    }

    function measureInBackground() {
        //const TIME_BETWEEN_PULSE_MS = 145;
        const TIME_BETWEEN_PULSE_MS = 5;
        _currentSonar = 0;



        while (true) {
            const trips = ultrasonicState[_currentSonar].roundTrips;
            for (let trip = 0; trip < ULTRASONIC_MEASUREMENTS; trip++) {


                const now = input.runningTime();

                if (trips[trips.length - 1].ts < now - TIME_BETWEEN_PULSE_MS - 10) {
                    ultrasonicState[_currentSonar].roundTrips.push({
                        ts: now,
                        rtt: MAX_ULTRASONIC_TRAVEL_TIME,
                    });
                }

                while (trips.length > ULTRASONIC_MEASUREMENTS) {
                    trips.shift();
                }

                ultrasonicState[_currentSonar].medianRoundTrip = getMedianRRT(
                    ultrasonicState[_currentSonar].roundTrips
                );

                for (let i = 0; i < ultrasonicState[_currentSonar].travelTimeObservers.length; i++) {
                    const threshold = ultrasonicState[_currentSonar].travelTimeObservers[i];
                    if (threshold > 0 && ultrasonicState[_currentSonar].medianRoundTrip <= threshold) {
                        control.raiseEvent(
                            MICROBIT_MAKERBIT_ULTRASONIC_OBJECT_DETECTED_ID,
                            threshold
                        );
                        // use negative sign to indicate that we notified the event
                        ultrasonicState[_currentSonar].travelTimeObservers[i] = -threshold;
                    } else if (
                        threshold < 0 &&
                        ultrasonicState[_currentSonar].medianRoundTrip > -threshold
                    ) {
                        // object is outside the detection threshold -> re-activate observer
                        ultrasonicState[_currentSonar].travelTimeObservers[i] = -threshold;
                    }
                }
                //sonars[_currentSonar] = ultrasonicState.medianRoundTrip;


                triggerPulse(_currentSonar);


                basic.pause(TIME_BETWEEN_PULSE_MS);
            }
            if (_currentSonar == SONARS_N - 1) _currentSonar = 0;
            else _currentSonar++;
        }
    }




    export function sendDataToSonar(input: string) {
        pins.i2cWriteNumber(
            0x20,
            stringToInt(input),
            NumberFormat.UInt32LE,
            false
        )
    }
    export function sendDataToSonarDec(input: number) {
        pins.i2cWriteNumber(
            0x20,
            input,
            NumberFormat.UInt32LE,
            false
        )
    }















    /* OLD  */
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
