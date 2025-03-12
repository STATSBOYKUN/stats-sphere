interface DateFormatConfig {
    FORMAT: string;
    TYPE: string;
    WIDTH: number;
}

interface DateFormats {
    [key: string]: DateFormatConfig;
}

const DATE_FORMATS: DateFormats = {
    // Standard Date Formats
    DATE: {
        FORMAT: 'dd-MMM-yyyy',
        TYPE: 'DATE',
        WIDTH: 11
    },

    DATE_SHORT: {
        FORMAT: 'dd-MMM-yy',
        TYPE: 'DATE',
        WIDTH: 9
    },

    // American Date Formats (mm/dd)
    ADATE: {
        FORMAT: 'MM/dd/yyyy',
        TYPE: 'ADATE',
        WIDTH: 10
    },

    ADATE_SHORT: {
        FORMAT: 'MM/dd/yy',
        TYPE: 'ADATE',
        WIDTH: 8
    },

    // European Date Formats (dd.mm)
    EDATE: {
        FORMAT: 'dd.MM.yyyy',
        TYPE: 'EDATE',
        WIDTH: 10
    },

    EDATE_SHORT: {
        FORMAT: 'dd.MM.yy',
        TYPE: 'EDATE',
        WIDTH: 8
    },

    // ISO-style Date Formats (yyyy/mm/dd)
    SDATE: {
        FORMAT: 'yyyy/MM/dd',
        TYPE: 'SDATE',
        WIDTH: 10
    },

    SDATE_SHORT: {
        FORMAT: 'yy/MM/dd',
        TYPE: 'SDATE',
        WIDTH: 8
    },

    // Julian Date Formats
    JDATE: {
        FORMAT: 'yyddd',
        TYPE: 'JDATE',
        WIDTH: 5
    },

    JDATE_LONG: {
        FORMAT: 'yyyyddd',
        TYPE: 'JDATE',
        WIDTH: 7
    },

    // Quarter-Year Formats
    QYR: {
        FORMAT: 'q Q yyyy',
        TYPE: 'QYR',
        WIDTH: 8
    },

    QYR_SHORT: {
        FORMAT: 'q Q yy',
        TYPE: 'QYR',
        WIDTH: 6
    },

    // Month-Year Formats
    MOYR: {
        FORMAT: 'MMM yyyy',
        TYPE: 'MOYR',
        WIDTH: 8
    },

    MOYR_SHORT: {
        FORMAT: 'MMM yy',
        TYPE: 'MOYR',
        WIDTH: 6
    },

    // Week-Year Formats
    WKYR: {
        FORMAT: 'ww WK yyyy',
        TYPE: 'WKYR',
        WIDTH: 10
    },

    WKYR_SHORT: {
        FORMAT: 'ww WK yy',
        TYPE: 'WKYR',
        WIDTH: 8
    },

    // DateTime Formats
    DATETIME: {
        FORMAT: 'dd-MMM-yyyy HH:mm:ss',
        TYPE: 'DATETIME',
        WIDTH: 20
    },

    DATETIME_SHORT: {
        FORMAT: 'dd-MMM-yyyy HH:mm',
        TYPE: 'DATETIME',
        WIDTH: 17
    },

    DATETIME_PRECISE: {
        FORMAT: 'dd-MMM-yyyy HH:mm:ss.SS',
        TYPE: 'DATETIME',
        WIDTH: 23
    },

    DATETIME_ISO_SHORT: {
        FORMAT: 'my-MM-dd HH:mm',
        TYPE: 'DATETIME',
        WIDTH: 16
    },

    DATETIME_ISO: {
        FORMAT: 'my-MM-dd HH:mm:ss',
        TYPE: 'DATETIME',
        WIDTH: 19
    },

    DATETIME_ISO_PRECISE: {
        FORMAT: 'yyyy-MM-dd HH:mm:ss.SS',
        TYPE: 'DATETIME',
        WIDTH: 22
    },

    // Time Formats
    TIME_SHORT: {
        FORMAT: 'mm:ss',
        TYPE: 'TIME',
        WIDTH: 5
    },

    TIME_PRECISE: {
        FORMAT: 'mm:ss.SS',
        TYPE: 'TIME',
        WIDTH: 8
    },

    TIME_HOUR: {
        FORMAT: 'HH:mm',
        TYPE: 'TIME',
        WIDTH: 5
    },

    TIME: {
        FORMAT: 'HH:mm:ss',
        TYPE: 'TIME',
        WIDTH: 8
    },

    TIME_HOUR_PRECISE: {
        FORMAT: 'HH:mm:ss.SS',
        TYPE: 'TIME',
        WIDTH: 11
    },

    // Day-Time Formats
    DTIME_SHORT: {
        FORMAT: 'ddd HH:mm',
        TYPE: 'DTIME',
        WIDTH: 9
    },

    DTIME: {
        FORMAT: 'ddd HH:mm:ss',
        TYPE: 'DTIME',
        WIDTH: 12
    },

    DTIME_PRECISE: {
        FORMAT: 'ddd HH:mm:ss.SS',
        TYPE: 'DTIME',
        WIDTH: 15
    },

    // Day and Month Name Formats
    WEEKDAY_FULL: {
        FORMAT: 'EEEE', // Monday, Tuesday, ...
        TYPE: 'WKDAY',
        WIDTH: 9
    },

    WEEKDAY_SHORT: {
        FORMAT: 'EEE', // Mon, Tue, Wed, ...
        TYPE: 'WKDAY',
        WIDTH: 3
    },

    MONTH_FULL: {
        FORMAT: 'MMMM', // January, February, ...
        TYPE: 'MONTH',
        WIDTH: 9
    },

    MONTH_SHORT: {
        FORMAT: 'MMM', // Jan, Feb, Mar, ...
        TYPE: 'MONTH',
        WIDTH: 3
    }
};

export default DATE_FORMATS;

export type DateFormatKey = keyof typeof DATE_FORMATS;