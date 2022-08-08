const _ = require('lodash')
const { DateTime } = require('luxon')
const { getSecondsSinceOpen } = require('../Times')

// serverUpdated

const getTimeWhenFoundSinceOpen = (d) => {
  if(!d.tickerData || !d.tickerData.serverUpdated) {
    return 0
  }
  const secondsSinceOpen = getSecondsSinceOpen(d.tickerData.serverUpdated)
  return secondsSinceOpen
}

const getLongGain = (d) => {
  const buyPrice = _.get(d, 'tickerData.lastQuote.P')
  const sellPrice = _.get(d, 'tickerData.nextDay.o')
  let delta = ((sellPrice - buyPrice)/ buyPrice) * 100
  if(!delta || delta == Infinity || delta == NaN) {delta = 0}
  return _.round(delta, 2)
}

const getCalculatedAttrs = (stock, config) => {
    // _.get(stock, ''),
    // note that this object is purposefully missing
    // tickerData.day.v, because is always same as min.av
  const flatFields = {
    "ticker": _.get(stock, 'ticker'),
    "rankWhenFound": _.get(stock, 'rankWhenFound'),
    "meanAccumulatedVolume": _.get(stock, 'tickerData.meanAccumulatedVolume'),
    "todaysChangePerc": _.get(stock, 'tickerData.todaysChangePerc'),
    "serverUpdated": _.get(stock, 'tickerData.serverUpdated'),
    "meanMinVolumeInUSD": _.get(stock, 'tickerData.meanMinVolumeInUSD'),
    "meanAccumulatedVolumeInUSD": _.get(stock, 'tickerData.meanAccumulatedVolumeInUSD'),
    "meanMinVolume": _.get(stock, 'tickerData.meanMinVolume'),
    "dayOpenChangePerc": _.get(stock, 'tickerData.dayOpenChangePerc'),
    "updated": _.get(stock, 'tickerData.updated'),
    "meanChangePerc": _.get(stock, 'tickerData.meanChangePerc'),
    "todaysChange": _.get(stock, 'tickerData.todaysChange'),
    "prevDayVw": _.get(stock, 'tickerData.prevDay.vw'),
    "prevDayC": _.get(stock, 'tickerData.prevDay.c'),
    "prevDayL": _.get(stock, 'tickerData.prevDay.l'),
    "prevDayH": _.get(stock, 'tickerData.prevDay.h'),
    "prevDayO": _.get(stock, 'tickerData.prevDay.o'),
    "prevDayV": _.get(stock, 'tickerData.prevDay.v'),
    "dayC": _.get(stock, 'tickerData.day.c'),
    "dayL": _.get(stock, 'tickerData.day.l'),
    "dayO": _.get(stock, 'tickerData.day.o'),
    "dayVw": _.get(stock, 'tickerData.day.vw'),
    "dayH": _.get(stock, 'tickerData.day.h'),
    "minAv": _.get(stock, 'tickerData.min.av'),
    "minVw": _.get(stock, 'tickerData.min.vw'),
    "minO": _.get(stock, 'tickerData.min.o'),
    "minV": _.get(stock, 'tickerData.min.v'),
    "minH": _.get(stock, 'tickerData.min.h'),
    "minL": _.get(stock, 'tickerData.min.l'),
    "minC": _.get(stock, 'tickerData.min.c'),
    "lastQuoteBid": _.get(stock, 'tickerData.lastQuote.p'),
    "lastQuoteAsk": _.get(stock, 'tickerData.lastQuote.P'),
    "lastQuoteT": _.get(stock, 'tickerData.lastQuote.t'),
    "lastQuoteAskLot": _.get(stock, 'tickerData.lastQuote.S'),
    "lastQuoteBidLot": _.get(stock, 'tickerData.lastQuote.s'),
    "timeWhenFound": getTimeWhenFoundSinceOpen(stock)
  }

  if(config && config.longGain) {
    flatFields.longGain = getLongGain(stock)
  }
  
  return flatFields
}





const getPerc = (initialValue, endingValue) => {
  const delta = endingValue - initialValue
  if(delta == 0) {
    return 0
  }
  const perc = (delta/initialValue) * 100
  if (!perc || perc == 0 || perc < -1000000 || perc > 1000000) {
    return 0
  }
  return perc
}
const getAttrs = (s, config) => {
  const currentPrice = _.mean([s.lastQuoteAsk, s.lastQuoteBid])
  // const prevDayPrice = _.mean([s.prevDayO, prevDayC, prevDayH, prevDayL])
  // const prevDayVinUSD = prevDayV * prevDayPrice
  // doesn't include volumes
  const foo = {
    'rankWhenFound': s.rankWhenFound,
    //'prevDayVinUSD': prevDayVinUSD,
    'deltaCurPriceDayLow': getPerc(currentPrice, s.dayL),
    'deltaCurPriceDayOpen': getPerc(currentPrice, s.dayO),
    'deltaCurPriceDayVW': getPerc(currentPrice, s.dayVw),
    'deltaCurPriceLQAsk': getPerc(currentPrice, s.lastQuoteAsk),
    'deltaCurPriceLQBid': getPerc(currentPrice, s.lastQuoteBid),
    'deltaCurPriceMinC': getPerc(currentPrice, s.minC),
    'deltaCurPriceMinH': getPerc(currentPrice, s.minH),
    'deltaCurPriceMinL': getPerc(currentPrice, s.minL),
    'deltaCurPriceMinO': getPerc(currentPrice, s.minO),
    'deltaCurPriceMinVW': getPerc(currentPrice, s.minVw),
    'deltaCurPricePDC': getPerc(currentPrice, s.prevDayC),
    'deltaCurPricePDH': getPerc(currentPrice, s.prevDayH),
    'deltaCurPricePDL': getPerc(currentPrice, s.prevDayL),
    'deltaCurPricePDO': getPerc(currentPrice, s.prevDayO),
    'deltaCurPricePDVW': getPerc(currentPrice, s.prevDayVw),
    'deltaDayLDayO': getPerc(s.dayL, s.dayO),
    'deltaDayLDayVw': getPerc(s.dayL, s.dayVw),
    'deltaDayLLQA': getPerc(s.dayL, s.lastQuoteAsk),
    'deltaDayLLQB': getPerc(s.dayL, s.lastQuoteBid),
    'deltaDayLMinC': getPerc(s.dayL, s.minC),
    'deltaDayLMinH': getPerc(s.dayL, s.minH),
    'deltaDayLMinL': getPerc(s.dayL, s.minL),
    'deltaDayLMinO': getPerc(s.dayL, s.minO),
    'deltaDayLMinVW': getPerc(s.dayL, s.minVw),
    'deltaDayLPDC': getPerc(s.dayL, s.prevDayC),
    'deltaDayLPDH': getPerc(s.dayL, s.prevDayH),
    'deltaDayLPDL': getPerc(s.dayL, s.prevDayL),
    'deltaDayLPDO': getPerc(s.dayL, s.prevDayO),
    'deltaDayLPDVW': getPerc(s.dayL, s.prevDayVw),
    'deltaDayODVW': getPerc(s.dayO, s.dayVw),
    'deltaDayOLQA': getPerc(s.dayO, s.lastQuoteAsk),
    'deltaDayOLQB': getPerc(s.dayO, s.lastQuoteBid),
    'deltaDayOMinC': getPerc(s.dayO, s.minC),
    'deltaDayOMinH': getPerc(s.dayO, s.minH),
    'deltaDayOMinL': getPerc(s.dayO, s.minL),
    'deltaDayOMinO': getPerc(s.dayO, s.minO),
    'deltaDayOMinVW': getPerc(s.dayO, s.minVw),
    'deltaDayOPDC': getPerc(s.dayO, s.prevDayC),
    'deltaDayOPDH': getPerc(s.dayO, s.prevDayH),
    'deltaDayOPDL': getPerc(s.dayO, s.prevDayL),
    'deltaDayOPDO': getPerc(s.dayO, s.prevDayO),
    'deltaDayOPDVW': getPerc(s.dayO, s.prevDayVw),
    'deltaDayVWLQA': getPerc(s.dayVw, s.lastQuoteAsk),
    'deltaDayVWLQB': getPerc(s.dayVw, s.lastQuoteBid),
    'deltaDayVWMinC': getPerc(s.dayVw, s.minC),
    'deltaDayVWMinH': getPerc(s.dayVw, s.minH),
    'deltaDayVWMinL': getPerc(s.dayVw, s.minL),
    'deltaDayVWMinO': getPerc(s.dayVw, s.minO),
    'deltaDayVWMinVW': getPerc(s.dayVw, s.minVw),
    'deltaDayVWPDC': getPerc(s.dayVw, s.prevDayC),
    'deltaDayVWPDH': getPerc(s.dayVw, s.prevDayH),
    'deltaDayVWPDL': getPerc(s.dayVw, s.prevDayL),
    'deltaDayVWPDO': getPerc(s.dayVw, s.prevDayO),
    'deltaLQALQB': getPerc(s.lastQuoteAsk, s.lastQuoteBid),
    'deltaLQAMinC': getPerc(s.lastQuoteAsk, s.minC),
    'deltaLQAMinH': getPerc(s.lastQuoteAsk, s.minH),
    'deltaLQAMinL': getPerc(s.lastQuoteAsk, s.minL),
    'deltaLQAMinO': getPerc(s.lastQuoteAsk, s.minO),
    'deltaLQAMinVW': getPerc(s.lastQuoteAsk, s.minVw),
    'deltaLQAPDC': getPerc(s.lastQuoteAsk, s.prevDayC),
    'deltaLQAPDH': getPerc(s.lastQuoteAsk, s.prevDayH),
    'deltaLQAPDL': getPerc(s.lastQuoteAsk, s.prevDayL),
    'deltaLQAPDO': getPerc(s.lastQuoteAsk, s.prevDayO),
    'deltaLQAPDVW': getPerc(s.lastQuoteAsk, s.prevDayVw),
    'deltaLQBMinC': getPerc(s.lastQuoteBid, s.minC),
    'deltaLQBMinH': getPerc(s.lastQuoteBid, s.minH),
    'deltaLQBMinL': getPerc(s.lastQuoteBid, s.minL),
    'deltaLQBMinO': getPerc(s.lastQuoteBid, s.minO),
    'deltaLQBMinVW': getPerc(s.lastQuoteBid, s.minVw),
    'deltaLQBPDC': getPerc(s.lastQuoteBid, s.prevDayC),
    'deltaLQBPDH': getPerc(s.lastQuoteBid, s.prevDayH),
    'deltaLQBPDL': getPerc(s.lastQuoteBid, s.prevDayL),
    'deltaLQBPDO': getPerc(s.lastQuoteBid, s.prevDayO),
    'deltaLQBPDVW': getPerc(s.lastQuoteBid, s.prevDayVw),
    'deltaMinCMinH': getPerc(s.minC, s.minH),
    'deltaMinCMinL': getPerc(s.minC, s.minL),
    'deltaMinCMinO': getPerc(s.minC, s.minO),
    'deltaMinCMinVW': getPerc(s.minC, s.minVw),
    'deltaMinCPDC': getPerc(s.minC, s.prevDayC),
    'deltaMinCPDH': getPerc(s.minC, s.prevDayH),
    'deltaMinCPDL': getPerc(s.minC, s.prevDayL),
    'deltaMinCPDO': getPerc(s.minC, s.prevDayO),
    'deltaMinCPDVW': getPerc(s.minC, s.prevDayVw),
    'deltaMinHMinL': getPerc(s.minH, s.minL),
    'deltaMinHMinO': getPerc(s.minH, s.minO),
    'deltaMinHMinVW': getPerc(s.minH, s.minVw),
    'deltaMinHPDC': getPerc(s.minH, s.prevDayC),
    'deltaMinHPDH': getPerc(s.minH, s.prevDayH),
    'deltaMinHPDL': getPerc(s.minH, s.prevDayL),
    'deltaMinHPDO': getPerc(s.minH, s.prevDayO),
    'deltaMinHPDVW': getPerc(s.minH, s.prevDayVw),
    'deltaMinLMinO': getPerc(s.minL, s.minO),
    'deltaMinLMinVW': getPerc(s.minL, s.minVw),
    'deltaMinLPDC': getPerc(s.minL, s.prevDayC),
    'deltaMinLPDH': getPerc(s.minL, s.prevDayH),
    'deltaMinLPDL': getPerc(s.minL, s.prevDayL),
    'deltaMinLPDO': getPerc(s.minL, s.prevDayO),
    'deltaMinLPDVW': getPerc(s.minL, s.prevDayVw),
    'deltaMinOMinVW': getPerc(s.minO, s.minVw),
    'deltaMinOPDC': getPerc(s.minO, s.prevDayC),
    'deltaMinOPDH': getPerc(s.minO, s.prevDayH),
    'deltaMinOPDL': getPerc(s.minO, s.prevDayL),
    'deltaMinOPDO': getPerc(s.minO, s.prevDayO),
    'deltaMinOPDVW': getPerc(s.minO, s.prevDayVw),
    'deltaMinVWPDC': getPerc(s.minVw, s.prevDayC),
    'deltaMinVWPDH': getPerc(s.minVw, s.prevDayH),
    'deltaMinVWPDL': getPerc(s.minVw, s.prevDayL),
    'deltaMinVWPDO': getPerc(s.minVw, s.prevDayO),
    'deltaMinVWPDVW': getPerc(s.minVw, s.prevDayVw),
    'deltaPDCPDH': getPerc(s.prevDayC, s.prevDayH),
    'deltaPDCPDL': getPerc(s.prevDayC, s.prevDayL),
    'deltaPDCPDO': getPerc(s.prevDayC, s.prevDayO),
    'deltaPDCPDVW': getPerc(s.prevDayC, s.prevDayVw),
    'deltaPDHPDL': getPerc(s.prevDayH, s.prevDayL),
    'deltaPDHPDO': getPerc(s.prevDayH, s.prevDayO),
    'deltaPDHPDVW': getPerc(s.prevDayH, s.prevDayVw),
    'deltaPDLPDO': getPerc(s.prevDayL, s.prevDayO),
    'deltaPDLPDVW': getPerc(s.prevDayL, s.prevDayVw),
    'deltaPDOPDVW': getPerc(s.prevDayO, s.prevDayVw),
    'todaysChangePerc': s.todaysChangePerc,
    'meanChangePerc': s.meanChangePerc,
    'timeWhenFound': s.timeWhenFound
  }

  if(config && config.longGain) {
    flatFields.longGain = s.longGain
  }
  return foo
}

const getStockValues = (s, includeLongGain) => {
  s = getAttrs(s, includeLongGain)
  return s
}

module.exports = {
  getCalculatedAttrs,
  getTimeWhenFoundSinceOpen,
  getAttrs,
  getStockValues
}
