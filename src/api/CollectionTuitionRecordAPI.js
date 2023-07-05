import { DB_API, COLLECTION_NAME } from './database'
import { TUITION_SET_ATTRIBUTES } from './CollectionTuitionSetAPI'
import { CLASS_FORM_ATTRIBUTES } from './CollectionClassAPI'
import { CollectionStudentAPI, STUDENT_ATTRIBUTES } from './CollectionStudentAPI'

export const TUITION_RECORD_STATE = {
    NORMAL: 'normal',
    POSEPONED: 'poseponed',
    SUSPEND: 'suspend'
}

export const TUITION_RECORD_ATTRIBUTES = {
    DUE_DATE: 'dueDate',
    PAY_DATE: 'payDate',
    IS_PAID: 'isPaid',
    STATE: 'state',
    STUDENT_KEY: 'studentKey',
    STUDENT_NAME: 'studentName',
    LESSON_REMAIN: 'lessonRemain',
    TUITION_VALUE: TUITION_SET_ATTRIBUTES.PRICE,
    AMOUNT_OF_LESSON: TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS,
    CLASS_KEY: 'classKey',
    CREATE_DATE: 'createDate'
}

export class CollectionTuitionRecordAPI extends DB_API {
    constructor() {
        super(COLLECTION_NAME.TUITION_RECORD)
        this.db_student = new CollectionStudentAPI();
    }

    async getRecordByClassKey(classKey) {
        let result = []
        await this.getCollection().then(res => {
            if (res) {
                result = res.filter(item => item.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey)
            }
        })
        return result;
    }

    setTerminateTuition(classKey, studentKey) {
        if (!classKey) { console.log('Error: setTerminateTuition : no class key'); return }
        if (!studentKey) { console.log('Error: setTerminateTuition : no student key'); return }

        this.getCollection().then(allTuitionRecords => {
            let record = allTuitionRecords.find(tuitionRecord =>
                tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === studentKey
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STATE] === TUITION_RECORD_STATE.NORMAL
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false
            )

            console.log("get the tuition record need to be terminated: ", record);

            if (record) {
                this.updateDocument(record.key, { 
                    [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.SUSPEND
                    , [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: null 
                })
            }
        })
    }

    setTerminateTuitionByClassKeys(classKey) {
        console.log('Terminate tuition by class key:', classKey)
        this.getCollection().then(allTuitionRecords => {
            let records = allTuitionRecords.filter(tuitionRecord => tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STATE] === TUITION_RECORD_STATE.NORMAL
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false
            )

            console.log("Got the terminate tuition record: ", allTuitionRecords);

            records.forEach(selectedRecord => {
                this.updateDocument(selectedRecord.key, { [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.SUSPEND, [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: null })
            })
        })
    }

    setTerminateTuitionByStudentKeys(studentKey) {
        console.log('Terminate tuition by student key:', studentKey)
        this.getCollection().then(allTuitionRecords => {
            let records = allTuitionRecords.filter(tuitionRecord => tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === studentKey
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STATE] === TUITION_RECORD_STATE.NORMAL
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false
            )

            console.log("Got the terminate tuition record: ", allTuitionRecords);

            records.forEach(selectedRecord => {
                this.updateDocument(selectedRecord.key, { [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.SUSPEND, [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: null })
            })
        })
    }

    setSuspendAllTuition(classKey) {
        this.getCollection().then(allTuitionRecords => {
            let records = allTuitionRecords.filter(tuitionRecord => tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false)

            if (records.length > 0) {
                records.forEach(record => {
                    this.updateDocument(record.key, { [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.SUSPEND, [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: null })
                })
            }
        })
    }

    createRecordByClassRecord(classRecord) {
        // iterate the student list from the class Record.
        classRecord.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].forEach(studentInClass => {

            // get the student by the student key and name;
            let studentKey = studentInClass.key;
            let studentName = studentInClass[STUDENT_ATTRIBUTES.STUDENT_NAME]

            this.db_student.getDocument(studentKey).then(student => {
                // get the student information
                if (!student) { console.log('Error: createRecordByClassRecord') }

                this.addDocument({
                    [TUITION_RECORD_ATTRIBUTES.STUDENT_KEY]: studentKey,
                    [TUITION_RECORD_ATTRIBUTES.STUDENT_NAME]: studentName,
                    [TUITION_RECORD_ATTRIBUTES.TUITION_VALUE]: student[STUDENT_ATTRIBUTES.TUITION_VALUE],
                    [TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON]: student[STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS],

                    // [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE_TIME],
                    [TUITION_RECORD_ATTRIBUTES.CLASS_KEY]: classRecord.key, // to access the 'key' property from promise
                    [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.NORMAL,
                    [TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]: 0,
                    [TUITION_RECORD_ATTRIBUTES.PAY_DATE]: null,
                    [TUITION_RECORD_ATTRIBUTES.IS_PAID]: false,
                    [TUITION_RECORD_ATTRIBUTES.CREATE_DATE]: new Date()
                })
            })


        }
        )
    }

    createRecordByStudentKey(studentKey, classKey) {
        if (!studentKey) { console.log('Error: createRecordByStudentKey : Missing student Key'); return }

        if (!classKey) { console.log('Error: createRecordByStudentKey : Missing class Key'); return }

        this.db_student.getDocument(studentKey).then(student => {
            // get the student information
            if (!student) { console.log('Error: createRecordByStudentKey : No student found with the key'); return }

            this.addDocument({
                [TUITION_RECORD_ATTRIBUTES.STUDENT_KEY]: studentKey,
                [TUITION_RECORD_ATTRIBUTES.STUDENT_NAME]: student[STUDENT_ATTRIBUTES.STUDENT_NAME],
                [TUITION_RECORD_ATTRIBUTES.TUITION_VALUE]: student[STUDENT_ATTRIBUTES.TUITION_VALUE],
                [TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON]: student[STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS],

                // FIXME: considering is the due needed?
                // [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: classRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE_TIME],
                [TUITION_RECORD_ATTRIBUTES.CLASS_KEY]: classKey, // to access the 'key' property from promise
                [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.NORMAL,
                [TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]: 0,
                [TUITION_RECORD_ATTRIBUTES.PAY_DATE]: null,
                [TUITION_RECORD_ATTRIBUTES.IS_PAID]: false,
            })

        })
    }

    payTuition(classKey, studentKey, userSetPayDate) {
        if (!studentKey) { console.log('Error: payTuition : Missing student Key'); return }
        if (!classKey) { console.log('Error: payTuition : Missing class Key'); return }

        //get the unpaid
        return this.getCollection().then((allTuitionRecord) => {
            return this.db_student.getDocument(studentKey).then((studentData) => {
                console.log('Value : payTuition(): studentData', studentData)
                let tuitionValue = studentData[STUDENT_ATTRIBUTES.TUITION_VALUE],
                    amountOfLessons = studentData[STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]

                let unpaidTuitionRecord = allTuitionRecord.find(tuitionRecord => (
                    tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === studentKey
                    && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey
                    && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STATE] === TUITION_RECORD_STATE.NORMAL
                    && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false // FIXME: set it to FALSE after test
                ))

                if (!unpaidTuitionRecord) { console.log('Error: payTuition(): unpaidTuitionRecord not found'); return }
                console.log('Value : payTuition(): unpaidTuitionRecord: ', unpaidTuitionRecord) // DEBUG

                return this.updateDocument(unpaidTuitionRecord.key, {
                    [TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]: amountOfLessons,
                    [TUITION_RECORD_ATTRIBUTES.PAY_DATE]: userSetPayDate,
                    [TUITION_RECORD_ATTRIBUTES.IS_PAID]: true,
                    [TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON]: amountOfLessons,
                    [TUITION_RECORD_ATTRIBUTES.TUITION_VALUE]: tuitionValue,
                })
            })
        })

    }

    updateRemainLessonSubtraction(classKey, studentKey, amountOfSubtraction = 1) {
        if (!classKey || !studentKey) {
            console.error('Error: CollectionTuitionRecordAPI : updateRemainLessonSubtraction : parameter missing')
            return null
        }

        return this.getCollection().then(async (allTuitionRecords) => {
            console.log('CollectionTuitionRecordAPI: updateRemainLessonSubtraction: allTuitionRecords:',allTuitionRecords)

            if(!Array.isArray(allTuitionRecords) || allTuitionRecords.length === 0) return 

            let selectedTuitionRecord = allTuitionRecords
                .find(record => record.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey
                    && record.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === studentKey
                    && record.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN] > 0)

            if (!selectedTuitionRecord) {
                console.error('Error: CollectionTuitionRecordAPI : updateRemainLessonSubtraction : Cannot find the tuition record by provide classKey & studentKey')
                return null
            }

            let newLessonRemain = parseInt(selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]) - parseInt(amountOfSubtraction);
            console.log('selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN] :', selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN], ', amountOfSubtraction:', amountOfSubtraction)
            return this.updateDocument(selectedTuitionRecord.key, { [TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]: newLessonRemain })
                .then(res => {
                    if (!res) {
                        console.error('Error: CollectionTuitionRecordAPI : updateRemainLessonSubtraction : failed to update the lesson remain');
                        return null
                    }

                    // After updating the lessonRemain, then the lesson remain 0, create a new tuition record.
                    if (newLessonRemain === 0) {
                        let initTuitionRecord = {
                            [TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON]: selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON],
                            [TUITION_RECORD_ATTRIBUTES.TUITION_VALUE]: selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.TUITION_VALUE],
                            [TUITION_RECORD_ATTRIBUTES.CLASS_KEY]: selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY],
                            [TUITION_RECORD_ATTRIBUTES.STUDENT_KEY]: selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY],
                            [TUITION_RECORD_ATTRIBUTES.STUDENT_NAME]: selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_NAME],
                            [TUITION_RECORD_ATTRIBUTES.IS_PAID]: false,
                            [TUITION_RECORD_ATTRIBUTES.PAY_DATE]: null,
                            [TUITION_RECORD_ATTRIBUTES.DUE_DATE]: null,
                            [TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]: 0,
                            [TUITION_RECORD_ATTRIBUTES.STATE]: TUITION_RECORD_STATE.NORMAL,
                            [TUITION_RECORD_ATTRIBUTES.CREATE_DATE]: new Date(),
                            [TUITION_RECORD_ATTRIBUTES.PAY_DATE]: null,
                        }

                         return this.addDocument(initTuitionRecord).then(res => {
                            if (!res) {
                                console.error('Error: CollectionTuitionRecordAPI : updateRemainLessonSubtraction : failed to create a new tuition record while the lesson remain is 0')
                            }
                        })
                    }
                }
                )

        })

    }

    deleteRecordByStudentKey = (studentKey)=>{
        return this.getCollection().then(allTuitionRecord=>{
            let selectedTuitionRecord = allTuitionRecord.filter(tuitionRecord=>tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === studentKey);
            selectedTuitionRecord.forEach(tuitionRecord=>{
                this.deleteDocument(tuitionRecord.key);
            })
        })
    }

    deleteRecordsByClassKey = (classKey)=>{
        return this.getCollection().then(allTuitionRecord=>{
            let selectedTuitionRecord = allTuitionRecord.filter(tuitionRecord=>tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === classKey);
            selectedTuitionRecord.forEach(tuitionRecord=>{
                this.deleteDocument(tuitionRecord.key);
            })
        })
    }



}