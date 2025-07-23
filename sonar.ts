namespace Robotrix {
    /* 
        Inspired by https://github.com/arielnh56/OctoSonar 
        Code for sonar modified from https://github.com/1010Technologies/pxt-makerbit-ultrasonic
    */

    export enum DistanceUnit {
        //% block="cm"
        //% block.loc.cs="Centimetry"
        CM = 58, // Duration of echo round-trip in Microseconds (uS) for two centimeters, 343 m/s at sea level and 20°C
        //% block="inch"
        //% block.loc.cs="Palce"
        INCH = 148, // Duration of echo round-trip in Microseconds (uS) for two inches, 343 m/s at sea level and 20°C
    }

    export enum SonarDirections {
        //% block="Front"
        //% block.loc.cs="Předek"
        FRONT = 0,
        //% block="Left front"
        //% block.loc.cs="Levá vepředu"
        FRONT_LEFT = 1,
        //% block="Right front"
        //% block.loc.cs="Prvá vepředu"
        FRONT_RIGHT = 2,
        //% block="Left side"
        //% block.loc.cs="Levý bok"
        LEFT = 3,
        //% block="Right side"
        //% block.loc.cs="Pravý bok"
        RIGHT = 4,
        //% block="Back side"
        //% block.loc.cs="Zadek"
        BACK = 5
    };

    export enum SonarModes {
        //% block="Ultra fast"
        //% block.loc.cs="Velká rychlost"
        ULTRA_FAST,
        //% block="Fast"
        //% block.loc.cs="Rychlost"
        FAST,
        //% block="Default"
        //% block.loc.cs="Defaultní"
        NORMAL,
        //% block="Precision"
        //% block.loc.cs="Precizní"
        PRECISION
    };
    let SonarMode = SonarModes.NORMAL;


    const SONAR_ECHO_PIN = DigitalPin.P0;
    const SONARS_N = 6;
    const MICROBIT_MAKERBIT_ULTRASONIC_OBJECT_DETECTED_ID = 798;
    const MAX_ULTRASONIC_TRAVEL_TIME = 300 * DistanceUnit.CM;
    let ULTRASONIC_MEASUREMENTS = 3;

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

    const TIME_BETWEEN_PULSE_MS = 5;

    /**
     * Configures the ultrasonic distance sensor and measures continuously in the background.
     */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_connect"
    //% block="connect ultrasonic distance sensor"
    //% block.loc.cs="Zapni ultrazvukové senzory"
    //% weight=80
    export function connectUltrasonicDistanceSensor(): void {
        for (let i = 0; i < SONARS_N; i++) {
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
     * Set sonar operating mode
     * @param mode distance to object, eg: SonarModes.FAST
     */
    //% subcategory="Test"
    //% blockId=robotrix_ultrasonic_set_mode
    //% block="Set ultrasonic mode to | $mode"
    //% block.loc.cs="Nastav mód ultrazvukových senzorů na &mode"
    export function setUltrasonicSensorsMode(mode: SonarModes) {
        SonarMode = mode;
        switch (mode) {
            case SonarModes.NORMAL:
                ULTRASONIC_MEASUREMENTS = 4;
                break;
            case SonarModes.FAST:
                ULTRASONIC_MEASUREMENTS = 2;
                break;
            case SonarModes.ULTRA_FAST:
                ULTRASONIC_MEASUREMENTS = 1;
                break;
            case SonarModes.PRECISION:
                ULTRASONIC_MEASUREMENTS = 6;
                break;
            default:
                break;
        }
    }

    /**
     * Do something when an object is detected the first time within a specified range.
     * @param distance distance to object, eg: 20
     * @param direction direction where we want to detect object, eg: SonarDirections.FRONT
     * @param handler body code to run when the event is raised
     */
    //% subcategory="Ultrasonic"
    //% blockId=robotrix_ultrasonic_on_object_detected
    //% block="On object detected once within | $distance | at direction $direction"
    //% block.loc.cs="Když detekuješ překážku do vzdálenosti | $distance | ve směru | $direction |"
    //% weight=69
    export function onUltrasonicObjectDetected(
        distance: number,
        direction: SonarDirections,
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

        const travelTimeThreshold = Math.imul(distance, DistanceUnit.CM,);

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
     */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_distance"
    //% block.loc.cs="Vzdálenost detekované překažky ve směru | &direction"
    //% block="ultrasonic $direction distance"
    //% weight=60
    export function getUltrasonicDistance(direction: SonarDirections): number {
        if (!ultrasonicState) {
            return -1;
        }
        basic.pause(0); // yield to allow background processing when called in a tight loop
        return Math.idiv(ultrasonicState[direction].medianRoundTrip, DistanceUnit.CM);
    }

    /**
    * Returns the distance to an object in a range from 1 to 300 centimeters or up to 118 inch.
    * The maximum value is returned to indicate when no object was detected.
    * -1 is returned when the device is not connected.
    * @param sonar what sensor is used for measuring distance
    */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_distance_all"
    //% block="distance measured by sonars"
    //% weight=60
    export function getUltrasonicDistanceAll(): string {
        if (!ultrasonicState) {
            return "-1";
        }
        basic.pause(0); // yield to allow background processing when called in a tight loop
        let a = "";
        for (let i = 0; i < SONARS_N; i++) {
            a += Math.idiv(ultrasonicState[i].medianRoundTrip, DistanceUnit.CM);
            a += ", ";
        }
        return a;
    }


    /**
     * Returns `true` if an object is within the specified distance. `false` otherwise.
     *
     * @param distance distance to object, eg: 20
     */
    //% subcategory="Ultrasonic"
    //% blockId="robotrix_ultrasonic_less_than"
    //% block="ultrasonic %direction distance is less than | %distance"
    //% block.loc.cs="Je překážka detekována ve směru | %direction | do vzdálenosti | %distance |?|"
    //% weight=50
    export function isUltrasonicDistanceLessThan(
        direction: SonarDirections,
        distance: number,
    ): boolean {
        if (!ultrasonicState) {
            return false;
        }
        basic.pause(0); // yield to allow background processing when called in a tight loop
        return Math.idiv(ultrasonicState[direction].medianRoundTrip, DistanceUnit.CM) < distance;
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

}