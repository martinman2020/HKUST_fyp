import { DB_API, COLLECTION_NAME } from './database'
import { STUDENT_ATTRIBUTES } from './CollectionStudentAPI'
import moment from 'moment'
import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from './CollectionClassAPI'
import { FREQUENCY } from './CollectionPreferenceAPI'
import { asyncForEach } from '../common/asyncForEach'

export const ATTENDANCE_STATE = {
    TICKET: 'ticket',
    NORMAL: 'normal',
    POSTPONED: 'postponed',
    VOID: 'void'
}

export const BEFORE_AFTER = {
    BEFORE: 'before',
    AFTER: 'after'
}

export const ATTENDANCE_ATTRIBUTES = {
    CLASS_NAME: 'className',
    CLASS_KEY: 'classKey',
    START_DATE_TIME: 'startDateTime',
    END_DATE_TIME: 'endDateTime',
    IS_BY_DEFAULT: 'isByDefault',    // bool: check the record whether modified by users 
    ATTENDANCE_STATE: 'attendanceState',
    STUDENT_LIST: STUDENT_ATTRIBUTES.STUDENT_LIST,
    CREATED_DATE: 'createdDate',
    LAST_MODIFY_DATE: 'lastModifyDate',

    // FOR STUDENT
    STUDENT_KEY: 'studentKey',
    IS_PRESENCE: 'isPresence',
    IS_LATE: 'isLate',
    IS_CANCELLED: 'isCancelled',
    PROGRESS_NOTE: 'progressNote',
    ATTENDANCE_NOTE: 'attendanceNote',
}

const ticketInitObj = {
    [ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT]: true
    , [ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE]: ATTENDANCE_STATE.TICKET
    , [ATTENDANCE_ATTRIBUTES.CREATED_DATE]: new Date()
    , [ATTENDANCE_ATTRIBUTES.LAST_MODIFY_DATE]: null
    , [ATTENDANCE_ATTRIBUTES.ATTENDANCE_NOTE]: ''
    , [ATTENDANCE_ATTRIBUTES.STUDENT_LIST]: []
}

const weeklyModeMapping = {
    [FREQUENCY.WEEKLY]: 0,
    [FREQUENCY.BIWEEKLY]: 1,
    [FREQUENCY.TRIWEEKLY]: 2,
    // [FREQUENCY.MONTHLY]: 3,
}

export class CollectionAttendanceAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.ATTENDANCE)
    }


    deleteTicket(classKey, beforeAfter = null, date = null, onlyDeleteBydefault = true) {
        console.log('the ticket need to be delete with class key:', classKey)
        return this.getCollection().then(allAttendances => {
            console.log('get all the attendance', allAttendances)

            let thisTickets;
            if (onlyDeleteBydefault) {
                thisTickets = allAttendances.filter(attendance => attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classKey
                    && attendance.data[ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT] === true
                    && attendance.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] === ATTENDANCE_STATE.TICKET
                )
            } else {
                thisTickets = allAttendances.filter(attendance => attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classKey
                    && attendance.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] === ATTENDANCE_STATE.TICKET
                )
            }

            if (thisTickets && thisTickets.length === 0) return console.log('Error: CollectionAttendanceAPI: deleteTicket: Cannot find the attendance')

            console.log('Deleting Ticket...')
            console.log('the ticket need to delete: ', thisTickets)
            if (!beforeAfter) {
                // thisTickets.forEach(ticket => this.deleteDocument(ticket.key))
                return asyncForEach(thisTickets, ticket => this.deleteDocument(ticket.key))
            } else if (beforeAfter === BEFORE_AFTER.BEFORE) {
                let needTohandleTickets = thisTickets.filter(attendance => moment(attendance.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]) <= moment(date))
                // .forEach(ticket => this.deleteDocument(ticket.key))
                return asyncForEach(needTohandleTickets, ticket => this.deleteDocument(ticket.key))
            } else if (beforeAfter === BEFORE_AFTER.AFTER) {
                let needTohandleTickets = thisTickets.filter(attendance => moment(attendance.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]) >= moment(date))
                // .forEach(ticket => this.deleteDocument(ticket.key))
                return asyncForEach(needTohandleTickets, ticket => this.deleteDocument(ticket.key))
            }
            console.log('Finish deleting ticket...')
        })
    }

    replaceTicketByPeriod(classRecord, start, end) {
        let startDateInMoment = start ? moment(start).set({ 'hour': 0, 'minute': 0, 'second': 0 }) : moment(classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE]);
        let lastDateInMoment = end ? moment(end).set({ 'hour': 23, 'minute': 59, 'second': 59 }) : (classRecord.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] ? moment(classRecord.data[CLASS_FORM_ATTRIBUTES.LAST_DATE]) : moment(start).add(1, 'y').set({ 'hour': 23, 'minute': 59 }));

        // delete the ticket in the period between start and end
        return this.getCollection().then(allAttendances => {

            let thisTickets = allAttendances.filter(attendance =>
                attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classRecord.key
                && attendance.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] === ATTENDANCE_STATE.TICKET
                && attendance.data[ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT] === true
                && moment(attendance.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]) > moment(startDateInMoment)
                && moment(attendance.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME] < moment(lastDateInMoment)
                ));
            //delete specific ticket
            return asyncForEach(thisTickets, ticket => this.deleteDocument(ticket.key)).then(() => {

                // console.log('allAttendances', allAttendances)
                // create a array of date of exsited class
                let dateFormat = "YYYYMMDD"
                let arrOfAvailbleDates = allAttendances.filter(attendance => (
                    attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classRecord.key
                    && attendance.data[ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT] === false
                    // && moment(attendance.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]) > moment(startDateInMoment)
                    // && moment(attendance.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME]) < moment(lastDateInMoment)
                )).map(attendance => moment(attendance.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]).format(dateFormat))

                let startDate = classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE];
                let lessonStartHour = moment(classRecord.data[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]).hour();
                let lessonStartMin = moment(classRecord.data[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]).minute();
                let classDurationInMin = parseInt(classRecord.data[CLASS_FORM_ATTRIBUTES.DURATION_MIN]);

                console.log('arrOfAvailbleDates', arrOfAvailbleDates)

                let attendanceTicket = {
                    ...ticketInitObj
                    , [ATTENDANCE_ATTRIBUTES.CLASS_KEY]: classRecord.key
                    , [ATTENDANCE_ATTRIBUTES.CLASS_NAME]: classRecord.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]
                }

                console.log('arrOfAvailbleDates: ', arrOfAvailbleDates)

                let selectedDay = [];


                switch (classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY]) {
                    case FREQUENCY.ONCE:
                        let lessonStartDateTime = new Date(moment(startDate).set({ 'hour': lessonStartHour, 'minute': lessonStartMin }));
                        let lessonEndDateTime = new Date(moment(lessonStartDateTime).add(classDurationInMin, 'm'));

                        return this.addDocument({
                            ...attendanceTicket
                            , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: lessonStartDateTime
                            , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: lessonEndDateTime
                        });
                    // break;


                    case FREQUENCY.WEEKLY:
                    case FREQUENCY.BIWEEKLY:
                    case FREQUENCY.TRIWEEKLY:
                        let startDay = moment(startDate).day();
                        let interval = 0, workdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].filter(ele => ele >= startDay).length

                        for (let i = startDateInMoment; i <= lastDateInMoment; i.add(1, 'd')) {

                            if (classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].includes(i.get('day').toString())  // if the weekday is match
                                && !arrOfAvailbleDates.includes(moment(i).format(dateFormat))) {   // if there are no ticket with this class key modified by user



                                if (interval === 0 && workdays > 0) {
                                    selectedDay.push(new Date(i))

                                    workdays--;
                                    if (workdays === 0) {
                                        if (classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.WEEKLY) {
                                            workdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length
                                        }
                                        interval = weeklyModeMapping[classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY]] * classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length;
                                    }
                                } else if (interval > 0 && workdays === 0) {
                                    interval--;
                                    if (interval === 0) {
                                        workdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length;
                                    }
                                }
                            }
                        }

                        return asyncForEach(selectedDay, day => {
                            let lessonStartDateTime = moment(day).set({ 'hour': lessonStartHour, 'minute': lessonStartMin });
                            let lessonEndDateTime = moment(lessonStartDateTime).add(classDurationInMin, 'm');

                            this.addDocument({
                                ...attendanceTicket
                                , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(lessonStartDateTime)
                                , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(lessonEndDateTime)
                            })

                        })

                    // break;

                    case FREQUENCY.MONTHLY:
                        for (var i = startDateInMoment; i <= lastDateInMoment; i.add(1, 'M')) {
                            // console.log('FREQUENCY.MONTHLY -> i : ', i.toLocaleString());
                            selectedDay.push(new Date(i));
                        }

                        // console.log('selectedDay',selectedDay)

                        return asyncForEach(selectedDay, day => {
                            let lessonStartDateTime = moment(day).set({ 'hour': lessonStartHour, 'minute': lessonStartMin });
                            let lessonEndDateTime = moment(lessonStartDateTime).add(classDurationInMin, 'm');

                            this.addDocument({
                                ...attendanceTicket
                                , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(lessonStartDateTime)
                                , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(lessonEndDateTime)
                            })
                        })
                    // break;

                    default:
                        break;
                }

            })

        })
    }


    createTicketFromLast(classRecord) {
        // get the date of last ticket 
        return this.getCollection().then(allAttendanceRecord => {
            let selectedAttendance = allAttendanceRecord.filter(attendance => attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classRecord.key)
            let weekdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS]
            let frequency = classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY]
            let lastDate = moment.max(selectedAttendance.map(rec => moment(rec.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME])))
            let nextDateOfLastDate = moment(lastDate).add(1, 'd');

            console.log('the last day is, ', lastDate)
            console.log('weekdays', weekdays)
            console.log('frequency', frequency)
            console.log('nextDateOfLastDate', nextDateOfLastDate)



            let weeklastDay = Math.max(...weekdays);

            console.log('moment(lastDate).day', lastDate.day())
            console.log('weeklastDay', weeklastDay)

            console.log('weeklyModeMapping[frequency]:', weeklyModeMapping[frequency])
            console.log('weekdays.length:', weekdays.length)

            let interval = 0;

            if (lastDate.day() === weeklastDay) {
                interval = weeklyModeMapping[frequency] * weekdays.length
            }

            let isCreated = false
            let current = nextDateOfLastDate;

            console.log('current', current)
            console.log('weekdays', weekdays)
            console.log('current.day()', current.day().toString())
            console.log('weekdays.includes(current.day())', weekdays.includes(current.day().toString()))

            let lessonStartTime = classRecord.data[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME];
            let duration = classRecord.data[CLASS_FORM_ATTRIBUTES.DURATION_MIN];

            if(classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.MONTHLY){
                //  If the frequency is monthly.
                let attendanceStartTime = moment(lastDate).add(1,'M').set({
                    'hours': moment(lessonStartTime).hour(),
                    'minutes': moment(lessonStartTime).minute()
                })

                let attendanceEndTime = moment(attendanceStartTime).add(duration, 'minute')
                
                this.addDocument({
                    ...ticketInitObj,
                    [ATTENDANCE_ATTRIBUTES.CLASS_KEY]: classRecord.key
                    , [ATTENDANCE_ATTRIBUTES.CLASS_NAME]: classRecord.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]
                    , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(attendanceStartTime)
                    , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(attendanceEndTime)
                })
                isCreated = true
            }else{
                //  If the frequency is other.
                do {
                    console.log(current.toISOString())
                    if (weekdays.includes(current.day().toString())) {
                        if (interval > 0) {
                            interval--;
                        } else {
                            let attendanceStartTime = moment(current).set({
                                'hours': moment(lessonStartTime).hour(),
                                'minutes': moment(lessonStartTime).minute()
                            })
    
                            let attendanceEndTime = moment(attendanceStartTime).add(duration, 'minute')
    
                            console.log('attendanceStartTime: ', attendanceStartTime.toISOString())
                            console.log('The date need to create attendance: ', attendanceStartTime.toLocaleString())
                            console.log('End: ', attendanceEndTime.toLocaleString())
                            console.log('The day need to create attendance: ', current.day())
    
                            this.addDocument({
                                ...ticketInitObj,
                                [ATTENDANCE_ATTRIBUTES.CLASS_KEY]: classRecord.key
                                , [ATTENDANCE_ATTRIBUTES.CLASS_NAME]: classRecord.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]
                                , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(attendanceStartTime)
                                , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(attendanceEndTime)
                            })
                            isCreated = true
                        }
                    }
                    current.add(1, 'd')
                } while (isCreated === false)
            }
        })

    }

    // createAttendanceByClassRecord(classRecord) {
    //     let attendanceTicket = {
    //         ...ticketInitObj
    //         , [ATTENDANCE_ATTRIBUTES.CLASS_KEY]: classRecord.key
    //         , [ATTENDANCE_ATTRIBUTES.CLASS_NAME]: classRecord.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]
    //         , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE_TIME]
    //         , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(moment(startDateTime).add(classRecord.data[CLASS_FORM_ATTRIBUTES.DURATION_MIN], 'm')).getTime()
    //     }

    //     let lastDate = classRecord.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] ? classRecord.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] : new Date(moment(classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE_TIME]).add(1, 'year'))

    //     switch (classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY]) {
    //         case FREQUENCY.ONCE:
    //             this.addDocument(attendanceTicket);
    //             break;

    //         case FREQUENCY.WEEKLY:
    //         case FREQUENCY.BIWEEKLY:
    //         case FREQUENCY.TRIWEEKLY:
    //             let weeklyModeMapping = {
    //                 [FREQUENCY.WEEKLY]: 0,
    //                 [FREQUENCY.BIWEEKLY]: 1,
    //                 [FREQUENCY.TRIWEEKLY]: 2
    //             }

    //             let interval = 0, workdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length

    //             for (let i = classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE_TIME]; i <= lastDate; i = i.add(1, 'd')) {
    //                 if (classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].includes(i.get('day').toString())) {
    //                     if (interval === 0 && workdays > 0) {
    //                         this.addDocument({
    //                             ...attendanceTicket
    //                             , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(i)
    //                             , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(moment(i).add(classRecord.data[CLASS_FORM_ATTRIBUTES.DURATION_MIN], 'm'))
    //                         })
    //                         workdays--;
    //                         if (workdays === 0) {
    //                             if (classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.WEEKLY) {
    //                                 workdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length
    //                             }
    //                             interval = weeklyModeMapping[classRecord.data[CLASS_FORM_ATTRIBUTES.FREQUENCY]] * classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length;
    //                         }

    //                     } else if (interval > 0 && workdays === 0) {
    //                         interval--;
    //                         if (interval === 0) {
    //                             workdays = classRecord.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].length;
    //                         }
    //                     }

    //                 }
    //             }
    //             break;

    //         case FREQUENCY.MONTHLY:
    //             for (var i = classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE_TIME]; i <= lastDate; i = i.add(1, 'M')) {
    //                 console.log('FREQUENCY.MONTHLY -> i : ', i);
    //                 this.addDocument({
    //                     ...attendanceTicket
    //                     , [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(i)
    //                     , [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(i.add(classRecord.data[CLASS_FORM_ATTRIBUTES.DURATION_MIN], 'm'))
    //                 })
    //             }
    //             break;

    //         default:
    //             break;

    //     }

    // }

    fromCurrentDeleteTickets(classKey) {
        this.getCollection().then(allAttendances => {
            console.log("allAttendances = ", allAttendances)
            let thisTickets = allAttendances.filter(attendance =>                                        // select the attendance,
                attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classKey                           // with the same class key
                && attendance.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] === ATTENDANCE_STATE.TICKET  // and the state is TICKET
                && moment(attendance.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]) > moment()            // and the date beond today
            )
            console.log("thisTickets from fromCurrentDeleteTickets : ", thisTickets)
            thisTickets.forEach(ticket => {
                this.deleteDocument(ticket.key)
            })
        })
    }

    changeClassNameInAttenance() {

    }

    deleteRecordsByClassKey(classKey) {
        return this.getCollection().then(allAttendances => {
            let selectedAttendances = allAttendances.filter(attendance => attendance.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === classKey)
            selectedAttendances.forEach(attendance => {
                this.deleteDocument(attendance.key);
            })
        })
    }

    // TODO:    Check time collision
    // getTimeCollisionArray(classStartDateTime,classEndDateTime){
    //     let resArray = [];
    //     this.getCollection().then(attendanceRecords=>{
    //         attendanceRecords.forEach(attendanceRecord=>{
    //             console.log(attendanceRecord)
    //         })
    //     })
    // }
}