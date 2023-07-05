import { DB_API, COLLECTION_NAME } from './database'

export const BEFORE_AFTER = {
    BEFORE: 'before',
    AFTER: 'after'
}

export const FREQUENCY = {
    ONCE: "once",
    WEEKLY: "weekly",
    BIWEEKLY: "biweekly",
    TRIWEEKLY: "triweekly",
    MONTHLY: "monthly"
}

export const frequencyLabelMapping = [
    { label: 'Once', value: FREQUENCY.ONCE }
    , { label: 'Weekly', value: FREQUENCY.WEEKLY }
    , { label: 'Biweekly', value: FREQUENCY.BIWEEKLY }
    , { label: 'Triweekly', value: FREQUENCY.TRIWEEKLY }
    , { label: 'Monthly', value: FREQUENCY.MONTHLY }
]

export const PREFERENCE_ATTRIBUTES = {
    ATTENDANCE_POPUP: 'attendancePopup',
    ATTENDANCE_POPUP_BEFORE_AFTER: 'attendancePopupBeforeAfter',
    ATTENDANCE_POPUP_TIME_MIN: 'attendancePopupTimeMin',
    CLASS_DURATION_MIN: 'classDurationMin',
    CLASS_FREQUENCY: 'classFrequency',
    CURRENCY: 'currency',
    DAILY_REMINDER_PUSH: 'dailyReminderPush',
    DAILY_REMINDER_TIME: 'dailyReminderTime',
    FINANCE_REPORT: 'financeReport',
    PATH_ADVISOR: 'pathAdvisor',
    TUITION_NOTIFICATION: 'tuitionNotification',
    WEATHER_FORECASTING: 'weatherForecasting',

    // Not shown on preference page
    // FINANCE_TUITION_CATEGORY: 'financeTuitionCategory',  // for tuition record to finance

    CLASS_SCHEDULER_TIME_DISPLAY_FROM: 'classSchedulerTimeDisplayFrom',
    CLASS_SCHEDULER_TIME_DISPLAY_TO: 'classSchedulerTimeDisplayTo',
    DEFAULT_SCHEDULER_VIEW: 'defaultSchedulerView',

    E_BUSINESS_CARD_ID : 'eBusinessCardId',

}

export var presetPreference = {
    name: 'preference',
    [PREFERENCE_ATTRIBUTES.ATTENDANCE_POPUP]: true,
    [PREFERENCE_ATTRIBUTES.ATTENDANCE_POPUP_BEFORE_AFTER]: BEFORE_AFTER.AFTER,
    [PREFERENCE_ATTRIBUTES.ATTENDANCE_POPUP_TIME_MIN]: 5,
    [PREFERENCE_ATTRIBUTES.DAILY_REMINDER_PUSH]: true,
    [PREFERENCE_ATTRIBUTES.DAILY_REMINDER_TIME]: new Date(new Date().setHours(9)).setMinutes(0),
    [PREFERENCE_ATTRIBUTES.TUITION_NOTIFICATION]: true,
    [PREFERENCE_ATTRIBUTES.CURRENCY]: "HKD",
    [PREFERENCE_ATTRIBUTES.FINANCE_REPORT]: true,
    [PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY]: FREQUENCY.WEEKLY,
    [PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN]: 60,
    [PREFERENCE_ATTRIBUTES.WEATHER_FORECASTING]: true,
    [PREFERENCE_ATTRIBUTES.PATH_ADVISOR]: true,
    [PREFERENCE_ATTRIBUTES.DEFAULT_SCHEDULER_VIEW]: 'Week',
    [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]: '12',
    [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]: '20.5',

    [PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID]: null,
}

export class CollectionPreferenceAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.PREFERENCE)
    }

    async initialize() {
        // If there no preference collection is found;
        let isEmpty = await this.isCollectionEmpty()
        
        if (isEmpty === true) {
            console.log('No preference found, initializing...');
            return this.addDocument(presetPreference).then(res=> res.data.data);
        }else{
            return this.getCollection().then(res=> res[0].data)
        }
    }

    async getPreference() {
        return this.getCollection(false).then(res =>
            res[0]
        )
    }

    async setAttribute(attributeName, value) {
        return this.updateDocument({ name: 'preference' }, { [attributeName]: value })
    }

    async setAttributeByObject(attributesObject) {
        return this.updateDocument({ name: 'preference' }, {...attributesObject})
    }

    async getAttribute(attributeName) {
        return await this.getCollection(false).then(res =>
            res[0][attributeName]
        )
    }

    async getCurrency() {
        return await this.getCollection(false).then(item => item[0][PREFERENCE_ATTRIBUTES.CURRENCY])
    }

}