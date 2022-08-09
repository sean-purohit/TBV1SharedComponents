const _ = require('lodash')

const GetPredictedAttrs = (s) => {
  const predictedGain = _.get(s, 'predictedGain')
  const pIntervalStart = _.get(s, 'pIntervalStart')
  const pIntervalEnd = _.get(s, 'pIntervalEnd')
  const importantFeature2 = _.get(s, 'importantFeatures[0].featureImportance')
  const importantFeature = _.get(s, 'importantFeatures[1].featureImportance')

  const deltaInterval = pIntervalEnd - pIntervalStart
  const meanInterval = _.mean([pIntervalStart, pIntervalEnd])
  const deltaScoreMeanInterval = predictedGain - meanInterval
  const deltaScoreStart = predictedGain - pIntervalStart
  const deltaScoreEnd = predictedGain - pIntervalEnd
  const deltaFeature = importantFeature - importantFeature2
  const sumFeature = importantFeature + importantFeature2


  return {
    longGain: _.get(s, 'longGain'),
    ticker: _.get(s, 'ticker'),
    predictedGain,
    pIntervalStart,
    pIntervalEnd,
    deltaInterval,
    meanInterval,
    deltaScoreMeanInterval,
    deltaScoreStart,
    deltaScoreEnd,
    deltaFeature,
    sumFeature,
    importantFeature,
    importantFeature2
  }
}

const NormalizeOnlinePrediction = (p) => {

  const baselineScore = _.round(_.get(p, 'baselineScore'), 4)
  const score = _.round(_.get(p, 'score'), 4)
  const predictedGain = _.round(_.get(p, 'value.numberValue'), 4)
  const pIntervalStart = _.round(_.get(p, 'predictionInterval.start'), 4)
  const pIntervalEnd = _.round(_.get(p, 'predictionInterval.end'), 4)
  const importantFeatures = _.chain(p)
    .get('tablesModelColumnInfo')
    .sortBy('featureImportance')
    .takeRight(2)
    .map(({columnDisplayName, featureImportance}) => ({
      columnDisplayName,
      featureImportance: _.round(featureImportance, 4)
    }))
    .value()

  return {
    baselineScore,
    score,
    predictedGain,
    pIntervalStart,
    pIntervalEnd,
    importantFeatures
  }

}

const NormalizeBatchPrediction = (r) => {

  const predictionTable = _.get(r, 'predicted_longGain[0].tables')
  const baselineScore = 0
  const score = 0
  const predictedGain = _.round(_.get(predictionTable, 'value'), 4)
  const pIntervalStart = _.round(_.get(predictionTable, 'prediction_interval.start'), 4)
  const pIntervalEnd = _.round(_.get(predictionTable, 'prediction_interval.end'), 4)
  const importantFeatures = _.chain(r)
    .get('feature_importance')
    .map((val, key) => ({
        columnDisplayName: key,
        featureImportance: _.round(val, 4)
    }))
    .sortBy('featureImportance')
    .takeRight(2)
    .value()
  const ticker = _.get(r, 'ticker')
  const longGain = _.round(_.get(r, 'longGain'), 4)

  return {
    baselineScore,
    score,
    predictedGain,
    pIntervalStart,
    pIntervalEnd,
    importantFeatures,
    ticker,
    longGain
  }
}

module.exports = {
  NormalizeBatchPrediction,
  NormalizeOnlinePrediction,
  GetPredictedAttrs
}

    // Sample Important Feature Array.
    // [
    //   {
    //       "columnDisplayName": "meanChangePerc",
    //       "featureImportance": 0.689878523349762
    //   },
    //   {
    //       "columnDisplayName": "deltaDayOPDC",
    //       "featureImportance": 1.076863169670105
    //   }
    // ]
