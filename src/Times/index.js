const { DateTime } = require('luxon')
const _ = require('lodash')

const holidays = ['2022-05-30', '2022-06-20', '2022-07-04', '2022-09-05', '2022-11-24', '2022-12-26']
// @TODO
const shortDays = ['2022-11-25']

// in eastern America/New_York time.
const openingTime = {
  hours: 9,
  minutes: 30
}
const closingTime = {
  hours: 16,
  minutes: 0
}

const getDateInNewYork = (time) => {
  time = time || ''
  const date = DateTime.now(time).setZone('America/New_York')
  return date
}

const getReadableTime = () => {
  const date = getDateInNewYork()
  const readableTime = date.toISO()
  return readableTime
}

const getYear = () => {
  const year = getDateInNewYork().year.toString()
  return year
}

const getDayDate = () => {
  const dayDate = getDateInNewYork().toFormat('MM-dd')
  return dayDate
}

const getDayDateFromLuxonDate = (date) => {
  return date.toFormat('MM-dd')
}

const getTimeStamp = () => {
  const timeStamp = getDateInNewYork().valueOf().toString()
  return timeStamp
}

const getTimeStampInt = () => {
  const timeStamp = getDateInNewYork().valueOf()
  return timeStamp
}

const isValidWorkingDay = (date) => {
  // day of the week, as number from 1-7 (Monday is 1, Sunday is 7)
  const isWeekDay = date.toFormat('E') < 6
  const isHoliday = _.includes(holidays, date.toFormat('y-MM-dd'))
  return isWeekDay && !isHoliday
}

const isValidWorkingHours = (date) => {
  const hours = date.toFormat('H')
  const minutes = date.toFormat('m')

  const workingHours = hours >= openingTime.hours && hours <= closingTime.hours
  if (workingHours) {
    if(hours == closingTime.hours && minutes > closingTime.minutes){
      return false
    }
    if(hours == openingTime.hours && minutes < openingTime.minutes){
      return false
    }
    return true
  }
  return false
}

const isMarketOpen = () => {
  const date = getDateInNewYork();
  const isWorkingDay = isValidWorkingDay(date)
  const isWorkingHours = isValidWorkingHours(date)
  return isWorkingDay && isWorkingHours
}

const getNextWorkingDay = (date) => {
  date = date || getDateInNewYork()
  let newDate = date.plus({days: 1})
  if(isValidWorkingDay(newDate)) {
    return newDate
  } else {
    return getNextWorkingDay(newDate)
  }
}

const getNextWorkingDayReadable = (date) => {
  if(typeof(date) == 'string') {
    date = getLuxonDateFromDateString(date)
  }
  return getNextWorkingDay(date).toFormat('MM-dd')
}

const getNextWorkingDayAmeritradeFormat = (date) => {
  if(typeof(date) == 'string') {
    date = getLuxonDateFromDateString(date)
  }
  return getNextWorkingDay(date).toFormat('yyyy-MM-dd')
}

const getIsBeforeMarketOpens = (date) => {
  const isValidDay = isValidWorkingDay(date)
  const isBeforeHour = date.toFormat('H') < openingTime.hours
  const isAtHour = date.toFormat('H') == openingTime.hours
  const isBeforeMinute = date.toFormat('m') <= openingTime.minutes
  if(isValidDay && isBeforeHour) {
    return true
  }
  if(isValidDay && isAtHour && isBeforeMinute) {
    return true
  }
  return false
}

const getIsBeforeMarketCloses = (date) => {
  const isValidDay = isValidWorkingDay(date)
  const isBeforeHour = date.toFormat('H') < closingTime.hours
  const isAtHour = date.toFormat('H') == closingTime.hours
  const isBeforeMinute = date.toFormat('m') <= closingTime.minutes
  if(isValidDay && isBeforeHour) {
    return true
  }
  if(isValidDay && isAtHour && isBeforeMinute) {
    return true
  }
  return false
}

const marketOpensInMs = () => {
  const date = getDateInNewYork()
  const isBeforeMarketOpens = getIsBeforeMarketOpens(date)
  if(isBeforeMarketOpens) {
    return date.until(date.set({hours: openingTime.hours, minute: openingTime.minutes})).length() + (1000 * 60 * 2)
  }
  const nextWorkingDay = getNextWorkingDay(date)
  const nextWorkingTime = nextWorkingDay.set({
    hour: openingTime.hours,
    minute: openingTime.minutes
  })
  // time until open plus 2 minutes, since it could fire up and teardown before the open.
  const openInMs = date.until(nextWorkingTime).length() + (1000 * 60 * 2)
  return openInMs
}

const marketClosesInMs = () => {
  const date = getDateInNewYork()
  const isBeforeMarketCloses = getIsBeforeMarketCloses(date)
  if(isBeforeMarketCloses) {
    return date.until(date.set({hours: closingTime.hours, minute: closingTime.minutes})).length() + (1000 * 60 * 2)
  }
  const nextWorkingDay = getNextWorkingDay(date)
  const nextWorkingTime = nextWorkingDay.set({
    hour: closingTime.hours,
    minute: closingTime.minutes
  })
  // time until open plus 2 minutes, since it could fire up and teardown before the open.
  const openInMs = date.until(nextWorkingTime).length() + (1000 * 60 * 2)
  return openInMs
}

const getHoursFromMs = (ms) => {
  const seconds = ms / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  return hours
}

const getLuxonDateFromDateString = (date) => {
  const [newMonth, newDay] = _.split(date, '-')
  const dateNow = getDateInNewYork()
  const newDate = dateNow.set({month: newMonth, day: newDay})
  return newDate
}

const getCurrentYear = () => {
  const date = getDateInNewYork()
  const year = date.toFormat('yyyy')
  return year
}

const getSecondsSinceOpen = (timeStamp) => {
  // timestamp format is in Milliseconds: 1659706326159
  const updatedStamp = DateTime.fromMillis(timeStamp)
  const dateUpdatedStamp = updatedStamp.toFormat('LL-dd')
  const openTime = DateTime
    .fromFormat(`${dateUpdatedStamp}-09:30-America/New_York`, 'LL-dd-HH:mm-z')
  return updatedStamp.diff(openTime, 'seconds').seconds
}

module.exports = {
  isMarketOpen,
  marketOpensInMs,
  marketClosesInMs,
  getYear,
  getDayDate,
  getTimeStamp,
  getHoursFromMs,
  getReadableTime,
  getNextWorkingDay,
  getNextWorkingDayReadable,
  getLuxonDateFromDateString,
  getDayDateFromLuxonDate,
  getCurrentYear,
  getNextWorkingDayAmeritradeFormat,
  getTimeStampInt,
  getSecondsSinceOpen
}
