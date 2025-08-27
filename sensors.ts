/**
 * Original code (adapted from):
 * KitronikLtd — pxt-kitronik-air-quality
 * https://github.com/KitronikLtd/pxt-kitronik-air-quality
 * Licensed under the MIT License. See https://github.com/KitronikLtd/pxt-kitronik-air-quality/blob/master/LICENSE
 *
 * Modifications by [matej2005], August 2025:
 * - CS translations
 * - Removed temperature and pressure units for simplicity for kids
 */


namespace Robotrix {

    //Global variables used for storing one copy of value, these are used in multiple locations for calculations
    let bme688InitialiseFlag = false
    let gasInitialise = false

    // Initialise the BME688, establishing communication, entering initial T, P & H oversampling rates, setup filter and do a first data reading (won't return gas)
    export function bme688Init(): void {
        kitronik_BME688.initialise()    // Call BME688 setup function in bme688-base extension

        bme688InitialiseFlag = true

        // Do an initial data read (will only return temperature, pressure and humidity as no gas sensor parameters have been set)
        measureData()
    }

    /**
    * Setup the gas sensor ready to measure gas resistance.
    */
    //% subcategory="Sensors"
    //% group="Setup"
    //% blockId=robotrix_sensors_setup_gas
    //% block="setup gas sensor"
    //% weight=100 blockGap=8
    export function setupGasSensor(): void {
        if (bme688InitialiseFlag == false) {
            bme688Init()
        }

        kitronik_BME688.initGasSensor()     // Call BME688 gas sensor setup function in bme-688 base extension

        gasInitialise = true
    }

    /**
    * Run all measurements on the BME688: Temperature, Pressure, Humidity & Gas Resistance.
    */
    //% subcategory="Sensors"
    //% group="Measure"
    //% blockId=robotrix_sensor_bme688_measure_all
    //% block="measure all data readings"
    //% block.loc.cs="Proveď měření sensorů"
    //% weight=100 blockGap=8
    export function measureData(): void {
        if (bme688InitialiseFlag == false) {
            bme688Init()
        }

        kitronik_BME688.readDataRegisters()     // Call function in bme-688 base extension to read out all the data registers

        // Calculate the compensated reading values from the the raw ADC data
        kitronik_BME688.calcTemperature(kitronik_BME688.tRaw)
        kitronik_BME688.intCalcPressure(kitronik_BME688.pRaw)
        kitronik_BME688.intCalcHumidity(kitronik_BME688.hRaw, kitronik_BME688.tRead)
        kitronik_BME688.intCalcGasResistance(kitronik_BME688.gResRaw, kitronik_BME688.gasRange)
    }

    // A baseline gas resistance is required for the IAQ calculation - it should be taken in a well ventilated area without obvious air pollutants
    // Take 60 readings over a ~5min period and find the mean
    /**
    * Establish the baseline gas resistance reading and the ambient temperature.
    * These values are required for air quality calculations.
    */
    //% subcategory="Sensors"
    //% group="Setup"
    //% blockId=robotrix_sensor_establish_baselines
    //% block="establish gas baseline & ambient temperature"
    //% weight=85 blockGap=8
    export function calcBaselines(): void {
        if (bme688InitialiseFlag == false) {
            bme688Init()
        }
        if (gasInitialise == false) {
            setupGasSensor()
        }
        // A baseline gas resistance is required for the IAQ calculation - it should be taken in a well ventilated area without obvious air pollutants
        // Take 60 readings over a ~5min period and find the mean
        // Establish the baseline gas resistance reading and the ambient temperature.
        // These values are required for air quality calculations.
        kitronik_BME688.setAmbTempFlag(true)

        let burnInReadings = 0
        let burnInData = 0
        let ambTotal = 0
        while (burnInReadings < 60) {               // Measure data and continue summing gas resistance until 60 readings have been taken
            kitronik_BME688.readDataRegisters()
            kitronik_BME688.calcTemperature(kitronik_BME688.tRaw)
            kitronik_BME688.intCalcGasResistance(kitronik_BME688.gResRaw, kitronik_BME688.gasRange)
            burnInData += kitronik_BME688.gRes
            ambTotal += kitronik_BME688.tAmbient
            basic.pause(5000)
            burnInReadings++
        }
        kitronik_BME688.setGBase(Math.trunc(burnInData / 60))             // Find the mean gas resistance during the period to form the baseline
        kitronik_BME688.tAmbient = Math.trunc(ambTotal / 60)    // Calculate the ambient temperature as the mean of the 60 initial readings

        kitronik_BME688.setAmbTempFlag(true)

        basic.pause(2000)
    }

    /**
    * Read Temperature from the sensor as a number.
    * Units for temperature are in °C (Celsius).
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="robotrix_sensor_read_temperature"
    //% block="Read Temperature"
    //% block.loc.cs="Naměřená teplota"
    //% weight=100 blockGap=8
    export function readTemperature(): number {
        let temperature = kitronik_BME688.tRead
        return temperature
    }

    /**
    * Read Pressure from the sensor as a number.
    * Units for pressure are in Pa (Pascals).
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="robotrix_sensor_read_pressure"
    //% block="Read Pressure"
    //% block.loc.cs="Naměřený tlak"
    //% weight=95 blockGap=8
    export function readPressure(): number {
        let pressure = kitronik_BME688.pRead

        return pressure
    }

    /**
    * Read Humidity from the sensor as a number.
    * Humidity is output as a percentage.
    */
    //% subcategory="Sensors"
    //% group="Climate"
    //% blockId="robotrix_sensor_read_humidity"
    //% block="Read Humidity"
    //% block.loc.cs="Naměřená vlhkost"
    //% weight=80 blockGap=8
    export function readHumidity(): number {
        return kitronik_BME688.hRead
    }

    /**
    * Read eCO2 from sensor as a Number (250 - 40000+ppm).
    * Units for eCO2 are in ppm (parts per million).
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId="robotrix_sensor_read_eCO2"
    //% block="Read eCO2"
    //% block.loc.cs="Naměřené množství eCO2"
    //% weight=95 blockGap=8
    export function readeCO2(): number {
        if (gasInitialise == false) {
            return 0
        }
        kitronik_BME688.calcAirQuality()

        let eCO2 = kitronik_BME688.eCO2Value

        return eCO2
    }

    /**
    * Return the Air Quality rating as a percentage (0% = Bad, 100% = Excellent).
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=robotrix_sensor_iaq_percent
    //% block="get IAQ \\%"
    //% block.loc.cs="Naměřená kvalita vzduchu"
    //% weight=85 blockGap=8
    export function getAirQualityPercent(): number {
        if (gasInitialise == false) {
            return 0
        }
        kitronik_BME688.calcAirQuality()

        return kitronik_BME688.iaqPercent
    }

    /**
    * Return the Air Quality rating as an IAQ score (500 = Bad, 0 = Excellent).
    * These values are based on the BME688 datasheet, Page 11, Table 6.
    */
    //% subcategory="Sensors"
    //% group="Air Quality"
    //% blockId=robotrix_sensor_iaq_score
    //% block="get IAQ Score"
    //% block.loc.cs="Skóre kvality vzduchu"
    //% weight=100 blockGap=8
    export function getAirQualityScore(): number {
        if (gasInitialise == false) {
            return 0
        }
        kitronik_BME688.calcAirQuality()

        return kitronik_BME688.iaqScore
    }
}